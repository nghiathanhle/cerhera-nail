import Image from "next/image";
import Link from "next/link";

export function Hero({ storeName }: { storeName: string }) {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1800&q=85"
        alt="Cerhera Nails press-on styles"
        fill
        priority
        className="absolute inset-0 -z-10 object-cover object-[center_35%]"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ink/55 via-ink/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_80%,rgba(232,145,163,0.28),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24 md:pt-20">
        <div className="max-w-xl animate-fade-up text-foam">
          <p className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
            {storeName}
          </p>
          <h1 className="mt-6 max-w-md font-display text-2xl leading-snug text-foam/95 md:text-3xl">
            Press-ons with a little daydream in them.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-foam/75 md:text-base">
            Ready Cerhera Nails styles you can wear tonight — soft finishes,
            whimsical details, shipped across the US.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop/"
              className="inline-flex h-12 items-center rounded-full bg-foam px-7 text-sm font-medium text-ink transition hover:bg-blush"
            >
              Shop styles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
