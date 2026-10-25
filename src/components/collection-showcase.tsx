"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import {
  collections,
  productsInCollection,
  type Collection,
} from "@/lib/collections";
import type { ProductWithImages } from "@/lib/types";
import { cn } from "@/lib/cn";

export function CollectionShowcase({
  products,
}: {
  products: ProductWithImages[];
}) {
  const [activeSlug, setActiveSlug] = useState(collections[0]?.slug ?? "");
  const active: Collection | undefined = useMemo(
    () => collections.find((c) => c.slug === activeSlug) ?? collections[0],
    [activeSlug],
  );

  const list = useMemo(
    () => (active ? productsInCollection(active, products) : []),
    [active, products],
  );

  if (!active) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-label">Shop by collection</p>
          <h2 className="mt-3 font-display text-4xl lowercase text-ink md:text-5xl">
            Find your mood
          </h2>
        </div>
        <Link
          href="/collections/"
          className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink/55 underline decoration-ink/20 underline-offset-4 hover:text-ink"
        >
          View all collections
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-ink/10 pb-1">
        {collections.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActiveSlug(c.slug)}
            className={cn(
              "pb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors",
              active.slug === c.slug
                ? "border-b-2 border-ink text-ink"
                : "text-ink/45 hover:text-ink/75",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/60">
        {active.description}
      </p>

      {list.length === 0 ? (
        <p className="mt-12 text-ink/50">Styles coming soon for this collection.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href={`/collections/${active.slug}/`} className="btn-primary">
          Shop {active.name}
        </Link>
      </div>
    </section>
  );
}
