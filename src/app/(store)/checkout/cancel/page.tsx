import Link from "next/link";

export const metadata = {
  title: "Checkout cancelled",
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center md:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-petal">
        Checkout
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink">Saved for later</h1>
      <p className="mt-4 text-ink/60">
        No worries — your bag is still here whenever you’re ready.
      </p>
      <div className="mt-10 flex justify-center gap-3">
        <Link
          href="/cart/"
          className="inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm text-foam"
        >
          Back to bag
        </Link>
        <Link
          href="/shop/"
          className="inline-flex h-11 items-center rounded-full border border-ink/15 px-6 text-sm text-ink"
        >
          Shop styles
        </Link>
      </div>
    </div>
  );
}
