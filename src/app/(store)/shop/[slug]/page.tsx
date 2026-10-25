import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { PdpDetails } from "@/components/pdp-details";
import { collectionForProduct } from "@/lib/collections";
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
  const collection = collectionForProduct(product);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:gap-14 md:px-8 md:py-20">
      <div className="space-y-3">
        <div className="overflow-hidden bg-mist/50">
          {primary && (
            <Image
              src={resolveImageUrl(primary.storage_path)}
              alt={primary.alt || product.name}
              width={1200}
              height={1500}
              priority
              className="aspect-[4/5] h-auto w-full object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-2 gap-3">
            {images.slice(1, 5).map((img) => (
              <div key={img.id} className="overflow-hidden bg-mist/40">
                <Image
                  src={resolveImageUrl(img.storage_path)}
                  alt={img.alt || product.name}
                  width={600}
                  height={600}
                  className="aspect-square h-auto w-full object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col md:pt-4">
        {product.featured && (
          <span className="mb-4 inline-flex w-fit bg-ink px-2.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-foam">
            Featured
          </span>
        )}
        <h1 className="text-3xl font-semibold uppercase tracking-[0.08em] text-ink md:text-4xl">
          {product.name}
        </h1>

        <div className="mt-4 flex items-baseline gap-3">
          <p className="text-lg text-ink">{formatUsd(product.price_cents)}</p>
          {product.compare_at_cents != null &&
            product.compare_at_cents > product.price_cents && (
              <p className="text-sm text-ink/40 line-through">
                {formatUsd(product.compare_at_cents)}
              </p>
            )}
        </div>

        <p className="mt-4 text-sm text-ink/55">
          {product.stock > 0
            ? `${product.stock} sets in stock`
            : "Currently sold out"}
        </p>

        <div className="mt-8 space-y-4">
          <AddToCartButton
            productId={product.id}
            disabled={product.stock <= 0}
            fullWidth
          />
          <p className="text-center text-xs text-ink/45">
            Guest checkout · US addresses only
          </p>
          <Link
            href="/size-chart/"
            className="block text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/55 underline decoration-ink/20 underline-offset-4 hover:text-ink"
          >
            Size chart
          </Link>
        </div>

        <PdpDetails
          description={product.description}
          collectionName={collection?.name}
          collectionHref={
            collection ? `/collections/${collection.slug}/` : undefined
          }
        />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((p) => ({ slug: p.slug }));
}
