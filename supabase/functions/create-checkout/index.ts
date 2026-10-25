import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!stripeKey) {
      console.error("Missing STRIPE_SECRET_KEY");
      return json({ error: "Checkout failed." }, 500);
    }

    const body = await req.json();
    const cart = body.cart as { productId: string; quantity: number }[];
    const successUrl = body.successUrl as string;
    const cancelUrl = body.cancelUrl as string;

    if (!Array.isArray(cart) || cart.length === 0) {
      return json({ error: "Your bag is empty." }, 400);
    }
    if (!successUrl || !cancelUrl) {
      return json({ error: "Missing redirect URLs." }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: settings } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    const flatShipping = settings?.flat_shipping_cents ?? 595;
    const freeThreshold = settings?.free_shipping_threshold_cents ?? 7500;

    const ids = cart.map((c) => c.productId);
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price_cents, stock, active")
      .in("id", ids);

    if (error || !products) {
      console.error(error?.message ?? "products query returned no rows");
      return json({ error: "Could not load products." }, 500);
    }

    const byId = new Map(products.map((p) => [p.id, p]));
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotal = 0;

    for (const item of cart) {
      const product = byId.get(item.productId);
      if (!product || !product.active) {
        return json(
          { error: "A style in your bag is no longer available." },
          400,
        );
      }
      if (product.stock < item.quantity) {
        return json(
          { error: `${product.name} only has ${product.stock} left.` },
          400,
        );
      }
      subtotal += product.price_cents * item.quantity;
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            metadata: { product_id: product.id },
          },
          unit_amount: product.price_cents,
        },
        quantity: item.quantity,
      });
    }

    const shippingCents =
      freeThreshold != null && subtotal >= freeThreshold ? 0 : flatShipping;

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-12-18.acacia",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingCents, currency: "usd" },
            display_name:
              shippingCents === 0 ? "Free US shipping" : "US shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        subtotal_cents: String(subtotal),
        shipping_cents: String(shippingCents),
      },
    });

    if (!session.url) {
      console.error("Stripe checkout session had no URL");
      return json({ error: "Checkout failed." }, 500);
    }

    return json({ url: session.url });
  } catch (err) {
    console.error(err);
    return json({ error: "Checkout failed." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
