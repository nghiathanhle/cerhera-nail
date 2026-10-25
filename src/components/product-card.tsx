import Image from "next/image";
import Link from "next/link";
import { resolveImageUrl } from "@/lib/images";
import { formatUsd } from "@/lib/money";
import type { ProductWithImages } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithImages }) {
  const image = product.product_images[0];
  const src = image
    ? resolveImageUrl(image.storage_path)
    : "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80";
  const soldOut = product.stock <= 0;

  return (
    <Link
      href={`/shop/${product.slug}/`}
      className="group block animate-fade-up"
    >
      <div className="relative overflow-hidden bg-mist/60">
        {product.featured && !soldOut && (
          <span className="absolute left-0 top-0 z-10 bg-ink px-2.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-foam">
            Featured
          </span>
        )}
        {soldOut && (
          <span className="absolute left-0 top-0 z-10 bg-ink px-2.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-foam">
            Sold out
          </span>
        )}
        <Image
          src={src}
          alt={image?.alt || product.name}
          width={800}
          height={800}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="aspect-square h-auto w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
        />
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-ink">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm text-ink/60">
          {formatUsd(product.price_cents)}
        </p>
      </div>
    </Link>
  );
}
