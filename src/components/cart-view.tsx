"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useCart } from "@/components/cart-provider";
import { callFunction, checkoutRedirectUrls } from "@/lib/functions";
import { resolveImageUrl } from "@/lib/images";
import { formatUsd, shippingForSubtotal } from "@/lib/money";
import type { ProductWithImages, SiteSettings } from "@/lib/types";

export function CartView({
  products,
  settings,
}: {
  products: ProductWithImages[];
  settings: SiteSettings;
}) {
  const { items, setQuantity, removeItem, ready } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const lines = items
    .map((item) => {
      const product = byId.get(item.productId);
      if (!product) return null;
      return { item, product };
    })
    .filter(Boolean) as {
    item: (typeof items)[0];
    product: ProductWithImages;
  }[];

  const subtotal = lines.reduce(
    (sum, l) => sum + l.product.price_cents * l.item.quantity,
    0,
  );
  const shipping = shippingForSubtotal(
    subtotal,
    settings.flat_shipping_cents,
    settings.free_shipping_threshold_cents,
  );
  const total = subtotal + shipping;
  const threshold = settings.free_shipping_threshold_cents;
  const remaining =
    threshold != null ? Math.max(0, threshold - subtotal) : null;
  const progress =
    threshold != null && threshold > 0
      ? Math.min(100, (subtotal / threshold) * 100)
      : 100;

  function checkout() {
    setError(null);
    startTransition(async () => {
      try {
        const { successUrl, cancelUrl } = checkoutRedirectUrls();
        const result = await callFunction<{ url: string }>("create-checkout", {
          method: "POST",
          body: JSON.stringify({
            cart: items,
            successUrl,
            cancelUrl,
          }),
        });
        window.location.href = result.url;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Checkout isn’t available yet. Deploy Supabase Edge Functions and Stripe keys.",
        );
      }
    });
  }

  if (!ready) {
    return <p className="text-ink/55">Loading your bag…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="border border-dashed border-ink/15 bg-paper/40 px-8 py-16 text-center">
        <p className="font-display text-3xl lowercase text-ink">
          Your bag is empty
        </p>
        <p className="mt-2 text-sm text-ink/60">
          Pick a style and we’ll keep it soft from here.
        </p>
        <Link href="/shop/" className="btn-primary mt-8">
          Shop styles
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
      <div>
        {threshold != null && (
          <div className="mb-8 border border-ink/10 bg-paper/50 px-5 py-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink">
              {remaining === 0
                ? "You’ve unlocked free US shipping"
                : `You are ${formatUsd(remaining!)} away from free US shipping`}
            </p>
            <div className="mt-3 h-1 w-full bg-ink/10">
              <div
                className="h-full bg-ember transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <ul className="space-y-5">
          {lines.map(({ item, product }) => {
            const image = product.product_images[0];
            return (
              <li
                key={product.id}
                className="flex gap-4 border border-ink/8 bg-foam/80 p-4"
              >
                <div className="h-28 w-24 shrink-0 overflow-hidden bg-mist">
                  {image && (
                    <Image
                      src={resolveImageUrl(image.storage_path)}
                      alt={image.alt || product.name}
                      width={96}
                      height={112}
                      className="h-full w-full object-cover"
                      sizes="96px"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/shop/${product.slug}/`}
                        className="text-sm font-semibold uppercase tracking-[0.1em] text-ink hover:opacity-70"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink/60">
                        {formatUsd(product.price_cents)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="text-[0.65rem] uppercase tracking-[0.12em] text-ink/45 hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-auto flex items-center gap-3 pt-3">
                    <label
                      className="text-[0.65rem] uppercase tracking-[0.12em] text-ink/50"
                      htmlFor={`qty-${product.id}`}
                    >
                      Qty
                    </label>
                    <input
                      id={`qty-${product.id}`}
                      type="number"
                      min={1}
                      max={product.stock}
                      value={item.quantity}
                      onChange={(e) =>
                        setQuantity(product.id, Number(e.target.value) || 1)
                      }
                      className="h-9 w-16 border border-ink/15 bg-foam px-2 text-sm"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="h-fit border border-ink/10 bg-paper/40 p-6">
        <h2 className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ink">
          Summary
        </h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between text-ink/70">
            <dt>Subtotal</dt>
            <dd>{formatUsd(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink/70">
            <dt>US shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatUsd(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-3 text-base text-ink">
            <dt>Total</dt>
            <dd>{formatUsd(total)}</dd>
          </div>
        </dl>
        {error && (
          <p className="mt-4 bg-ember/15 px-3 py-2 text-sm text-ink">{error}</p>
        )}
        <button
          type="button"
          onClick={checkout}
          disabled={pending}
          className="btn-primary mt-6 w-full"
        >
          {pending ? "Redirecting…" : "Check out"}
        </button>
        <p className="mt-3 text-center text-xs text-ink/45">
          Guest checkout · US addresses only
        </p>
      </aside>
    </div>
  );
}
