import { ShopCatalog } from "@/components/shop-catalog";
import { getActiveProducts } from "@/lib/products";

export const metadata = {
  title: "Shop",
};

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <div className="max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-petal">
          Catalog
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          Styles
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/65 md:text-base">
          Ready sets with a soft finish. Pick a style, check the size chart, and
          you’re halfway to dressed nails.
        </p>
      </div>

      <ShopCatalog products={products} />
    </div>
  );
}
