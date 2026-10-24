"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { ProductWithImages } from "@/lib/types";

export function ShopCatalog({ products }: { products: ProductWithImages[] }) {
  const [filter, setFilter] = useState<"all" | "featured">("all");

  const list = useMemo(
    () =>
      filter === "featured" ? products.filter((p) => p.featured) : products,
    [filter, products],
  );

  return (
    <>
      <div className="mt-8 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={
            filter === "all"
              ? "rounded-full bg-ink px-4 py-2 text-sm text-foam"
              : "rounded-full border border-ink/15 bg-foam/60 px-4 py-2 text-sm text-ink/70 hover:border-ink/30"
          }
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("featured")}
          className={
            filter === "featured"
              ? "rounded-full bg-ink px-4 py-2 text-sm text-foam"
              : "rounded-full border border-ink/15 bg-foam/60 px-4 py-2 text-sm text-ink/70 hover:border-ink/30"
          }
        >
          Featured
        </button>
      </div>

      {list.length === 0 ? (
        <p className="mt-16 text-ink/60">No styles yet — check back soon.</p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
