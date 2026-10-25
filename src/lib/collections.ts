import type { ProductWithImages } from "./types";

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** Unsplash (or Storage) image for collection tiles / banners */
  image: string;
  productSlugs: string[];
};

/**
 * Curated collections for Cerhera Nails.
 * Grouped by vibe until a `collection` column exists in Postgres.
 * Slugs match demo + seeded product slugs.
 */
export const collections: Collection[] = [
  {
    slug: "sunset-soft",
    name: "Sunset Soft",
    tagline: "Blush, pearl, and warm gold light",
    description:
      "Soft cherry glosses, dusty rose shimmer, and foil lattice — styles that catch late-day light.",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1400&q=85",
    productSlugs: ["cherry-mist", "moonlit-blush", "petal-lattice"],
  },
  {
    slug: "dune-quiet",
    name: "Dune Quiet",
    tagline: "Creamy neutrals and coastal calm",
    description:
      "Warm cream clouds and pale seafoam satins — quiet sets for everyday wear.",
    image:
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1400&q=85",
    productSlugs: ["buttercream-cloud", "seafoam-whisper"],
  },
  {
    slug: "ink-garden",
    name: "Ink Garden",
    tagline: "Deep tips and hand-painted florals",
    description:
      "Ink fades into petal pink with floral accents — a little garden for your fingertips.",
    image:
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=1400&q=85",
    productSlugs: ["garden-ink"],
  },
];

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

export function productsInCollection(
  collection: Collection,
  products: ProductWithImages[],
): ProductWithImages[] {
  const order = new Map(
    collection.productSlugs.map((slug, i) => [slug, i]),
  );
  return products
    .filter((p) => order.has(p.slug))
    .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
}

export function collectionForProduct(
  product: ProductWithImages,
): Collection | undefined {
  return collections.find((c) => c.productSlugs.includes(product.slug));
}
