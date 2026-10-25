import Link from "next/link";
import { CollectionBanner } from "@/components/collection-banner";
import { CollectionShowcase } from "@/components/collection-showcase";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { WhyCerhera } from "@/components/why-cerhera";
import { collections } from "@/lib/collections";
import { getActiveProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";

export default async function HomePage() {
  const [settings, products] = await Promise.all([
    getSiteSettings(),
    getActiveProducts(),
  ]);

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const bannerCollection = collections[0];

  return (
    <>
      <Hero storeName={settings.store_name} />

      <CollectionShowcase products={products} />

      {bannerCollection && <CollectionBanner collection={bannerCollection} />}

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-label">Featured styles</p>
            <h2 className="mt-3 font-display text-4xl lowercase text-ink md:text-5xl">
              Soft bestsellers
            </h2>
          </div>
          <Link
            href="/shop/"
            className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink/55 underline decoration-ink/20 underline-offset-4 hover:text-ink"
          >
            Shop all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <WhyCerhera />
    </>
  );
}
