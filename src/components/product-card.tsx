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

  return (
    <Link
      href={`/shop/${product.slug}/`}
      className="group block animate-fade-up"
    >
      <div className="overflow-hidden rounded-[1.35rem] bg-blush/30">
        <Image
          src={src}
          alt={image?.alt || product.name}
          width={800}
          height={1000}
          sizes="(max-width: 768px) 50vw, 33vw"
          className="aspect-[4/5] h-auto w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3 px-1">
        <div>
          <h3 className="font-display text-xl text-ink">{product.name}</h3>
          {product.featured && (
            <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-petal">
              Featured
            </p>
          )}
        </div>
        <p className="text-sm text-ink/75">{formatUsd(product.price_cents)}</p>
      </div>
    </Link>
  );
}
