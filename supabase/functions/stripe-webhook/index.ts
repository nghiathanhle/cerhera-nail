import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!stripeKey || !webhookSecret) {
    return new Response("Missing Stripe config", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-12-18.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return new Response(message, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (!existing) {
      const email =
        session.customer_details?.email ||
        session.customer_email ||
        "unknown@example.com";

      const subtotal = Number(session.metadata?.subtotal_cents || 0);
      const shipping = Number(session.metadata?.shipping_cents || 0);
      const total =
        typeof session.amount_total === "number"
          ? session.amount_total
          : subtotal + shipping;

      const address = session.customer_details?.address
        ? {
            name: session.customer_details.name || undefined,
            line1: session.customer_details.address.line1 || undefined,
            line2: session.customer_details.address.line2,
            city: session.customer_details.address.city || undefined,
            state: session.customer_details.address.state || undefined,
            postal_code:
              session.customer_details.address.postal_code || undefined,
            country: session.customer_details.address.country || undefined,
          }
        : null;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          stripe_session_id: session.id,
          email,
          status: "paid",
          subtotal_cents: subtotal,
          shipping_cents: shipping,
          total_cents: total,
          shipping_address: address,
        })
        .select("id")
        .single();

      if (orderError || !order) {
        console.error(orderError?.message);
        return new Response("Order insert failed", { status: 500 });
      }

      let cart: { productId: string; quantity: number }[] = [];
      try {
        cart = JSON.parse(session.metadata?.cart || "[]");
      } catch {
        cart = [];
      }

      if (cart.length > 0) {
        const ids = cart.map((c) => c.productId);
        const { data: products } = await supabase
          .from("products")
          .select("id, name, price_cents, stock")
          .in("id", ids);

        const byId = new Map((products || []).map((p) => [p.id, p]));
        const items = cart.flatMap((c) => {
          const product = byId.get(c.productId);
          if (!product) return [];
          return [
            {
              order_id: order.id,
              product_id: product.id,
              name: product.name,
              unit_price_cents: product.price_cents,
              quantity: c.quantity,
            },
          ];
        });

        if (items.length) {
          await supabase.from("order_items").insert(items);
        }

        for (const c of cart) {
          const product = byId.get(c.productId);
          if (!product) continue;
          await supabase
            .from("products")
            .update({ stock: Math.max(0, product.stock - c.quantity) })
            .eq("id", product.id);
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
