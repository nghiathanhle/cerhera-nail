import Link from "next/link";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { getActiveProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";

export default async function HomePage() {
  const [settings, featured] = await Promise.all([
    getSiteSettings(),
    getActiveProducts({ featuredOnly: true }),
  ]);

  const styles = featured.slice(0, 3);

  return (
    <>
      <Hero storeName={settings.store_name} />

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-petal">
              From Cerhera Nails
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">
              Featured styles
            </h2>
          </div>
          <Link
            href="/shop/"
            className="text-sm text-ink/70 underline decoration-ink/20 underline-offset-4 hover:text-ink"
          >
            View all styles
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {styles.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
