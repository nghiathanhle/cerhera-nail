import { ShopCatalog } from "@/components/shop-catalog";
import { getActiveProducts } from "@/lib/products";

export const metadata = {
  title: "Shop",
};

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ink/55">
          All press-on nails
        </h1>
        <p className="mt-4 font-display text-4xl lowercase text-ink md:text-5xl">
          Shop Cerhera styles
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink/60 md:text-base">
          Ready sets with an ethereal finish. Pick a style, check the size
          chart, and you’re halfway to dressed nails — US shipping only.
        </p>
      </div>

      <ShopCatalog products={products} />
    </div>
  );
}
