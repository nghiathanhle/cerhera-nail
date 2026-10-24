import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { resolveImageUrl } from "@/lib/images";
import { formatUsd } from "@/lib/money";
import { getActiveProducts, getProductBySlug } from "@/lib/products";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Style" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = product.product_images;
  const primary = images[0];

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:gap-14 md:px-8 md:py-20">
      <div className="space-y-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-blush/25">
          {primary && (
            <Image
              src={resolveImageUrl(primary.storage_path)}
              alt={primary.alt || product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-3 gap-3">
            {images.slice(1, 4).map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-2xl bg-mist"
              >
                <Image
                  src={resolveImageUrl(img.storage_path)}
                  alt={img.alt || product.name}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col md:pt-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-petal">
          Style
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          {product.name}
        </h1>

        <div className="mt-5 flex items-baseline gap-3">
          <p className="text-lg text-ink">{formatUsd(product.price_cents)}</p>
          {product.compare_at_cents != null &&
            product.compare_at_cents > product.price_cents && (
              <p className="text-sm text-ink/40 line-through">
                {formatUsd(product.compare_at_cents)}
              </p>
            )}
        </div>

        <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/70 md:text-base">
          {product.description}
        </p>

        <p className="mt-4 text-sm text-ink/55">
          {product.stock > 0
            ? `${product.stock} sets in stock`
            : "Currently sold out"}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <AddToCartButton
            productId={product.id}
            disabled={product.stock <= 0}
          />
          <Link
            href="/size-chart/"
            className="text-sm text-ink/65 underline decoration-ink/20 underline-offset-4 hover:text-ink"
          >
            Size chart
          </Link>
        </div>

        <ul className="mt-10 space-y-2 border-t border-ink/10 pt-8 text-sm text-ink/60">
          <li>Ten-piece ready set · adhesive tabs included</li>
          <li>US shipping only for now</li>
          <li>
            <Link href="/how-to-apply/" className="underline decoration-ink/20">
              How to apply
            </Link>{" "}
            ·{" "}
            <Link href="/care/" className="underline decoration-ink/20">
              Care tips
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((p) => ({ slug: p.slug }));
}
