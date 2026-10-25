"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { collections, productsInCollection } from "@/lib/collections";
import type { ProductWithImages } from "@/lib/types";
import { cn } from "@/lib/cn";

type Filter = "all" | "featured" | string;

export function ShopCatalog({ products }: { products: ProductWithImages[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => {
    if (filter === "all") return products;
    if (filter === "featured") return products.filter((p) => p.featured);
    const collection = collections.find((c) => c.slug === filter);
    return collection ? productsInCollection(collection, products) : products;
  }, [filter, products]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "featured", label: "Featured" },
    ...collections.map((c) => ({ id: c.slug, label: c.name })),
  ];

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-b border-ink/10">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "pb-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors",
              filter === f.id
                ? "border-b-2 border-ink text-ink"
                : "text-ink/45 hover:text-ink/75",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-16 text-ink/60">No styles yet — check back soon.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
