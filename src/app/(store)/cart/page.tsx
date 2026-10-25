import { CartView } from "@/components/cart-view";
import { getActiveProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";

export const metadata = {
  title: "Bag",
};

export default async function CartPage() {
  const [products, settings] = await Promise.all([
    getActiveProducts(),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <h1 className="font-display text-4xl lowercase text-ink md:text-5xl">
        Your bag
      </h1>
      <p className="mt-3 text-sm text-ink/60">
        Review your Cerhera Nails styles, then checkout securely with Stripe.
      </p>
      <div className="mt-10">
        <CartView products={products} settings={settings} />
      </div>
    </div>
  );
}
