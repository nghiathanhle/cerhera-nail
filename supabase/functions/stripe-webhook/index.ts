import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!stripeKey || !webhookSecret) {
    console.error("Missing Stripe config");
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
    // Sync constructEvent throws on this runtime:
    // "SubtleCryptoProvider cannot be used in a synchronous context".
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (err) {
    console.error(err);
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
      let cart: { productId: string; quantity: number }[] = [];
      try {
        cart = await lineItemsToCart(stripe, session.id);
      } catch (err) {
        console.error(err);
        return new Response("Could not read checkout line items", {
          status: 500,
        });
      }

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

      if (cart.length > 0) {
        const ids = [...new Set(cart.map((c) => c.productId))];
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id, name, price_cents")
          .in("id", ids);

        if (productsError) {
          console.error(productsError.message);
        }

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
          const { error: itemsError } = await supabase
            .from("order_items")
            .insert(items);
          if (itemsError) {
            console.error(itemsError.message);
          }
        }

        for (const c of cart) {
          const product = byId.get(c.productId);
          if (!product) continue;
          const { data: remaining, error: stockError } = await supabase.rpc(
            "decrement_stock",
            { product_id: product.id, qty: c.quantity },
          );
          if (stockError) {
            console.error(
              "decrement_stock failed",
              product.id,
              c.quantity,
              stockError.message,
            );
          } else if (remaining == null) {
            console.error(
              "decrement_stock skipped (missing product or not enough stock)",
              product.id,
              c.quantity,
            );
          }
        }
      } else {
        console.error("checkout session had no product line items", session.id);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

function productIdFromLineItem(item: Stripe.LineItem): string | null {
  const price = item.price;
  if (!price || typeof price === "string") return null;
  const product = price.product;
  if (!product || typeof product === "string") return null;
  if ("deleted" in product && product.deleted) return null;
  const productId = product.metadata?.product_id?.trim() ?? "";
  if (!UUID_RE.test(productId)) return null;
  return productId;
}

async function lineItemsToCart(
  stripe: Stripe,
  sessionId: string,
): Promise<{ productId: string; quantity: number }[]> {
  const cart: { productId: string; quantity: number }[] = [];
  let startingAfter: string | undefined;

  for (let page = 0; page < 20; page++) {
    const listed = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 100,
      expand: ["data.price.product"],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const line of listed.data) {
      const productId = productIdFromLineItem(line);
      const quantity = line.quantity ?? 0;
      if (!productId || quantity <= 0) continue;
      cart.push({ productId, quantity });
    }

    if (!listed.has_more || listed.data.length === 0) break;
    startingAfter = listed.data[listed.data.length - 1]?.id;
    if (!startingAfter) break;
  }

  return cart;
}
