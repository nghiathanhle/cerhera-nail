import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import {
  collections,
  getCollection,
  productsInCollection,
} from "@/lib/collections";
import { getActiveProducts } from "@/lib/products";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Collection" };
  return {
    title: collection.name,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const products = await getActiveProducts();
  const list = productsInCollection(collection, products);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ember">
          Collection
        </p>
        <h1 className="mt-4 font-display text-5xl lowercase text-ink md:text-6xl">
          {collection.name}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60 md:text-base">
          {collection.description}
        </p>
        <Link
          href="/collections/"
          className="mt-6 inline-block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink/50 underline decoration-ink/20 underline-offset-4 hover:text-ink"
        >
          All collections
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="mt-16 text-center text-ink/55">
          Styles for this collection are coming soon.
        </p>
      ) : (
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}
