import Image from "next/image";
import Link from "next/link";

export function Hero({ storeName }: { storeName: string }) {
  return (
    <section className="relative isolate -mt-[var(--site-header-offset)] min-h-[100svh] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1800&q=85"
        alt="Cerhera Nails press-on styles"
        fill
        priority
        className="absolute inset-0 -z-10 object-cover object-[center_30%] scale-105 animate-[fade-up_1.4s_ease-out_both]"
        sizes="100vw"
      />
      {/* Sahara sunset wash — ethereal dusk, not flat overlay badges */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink/75 via-ink/35 to-ink/20" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_20%,rgba(232,147,106,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_80%,rgba(201,160,90,0.22),transparent_50%)]" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-5 pb-20 pt-28 text-center md:px-8 md:pb-24 md:pt-24">
        <div className="animate-fade-up text-foam">
          <p className="font-display text-5xl font-medium lowercase leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            {storeName.toLowerCase()}
          </p>
          <h1 className="mt-7 max-w-lg text-[0.8rem] font-semibold uppercase leading-relaxed tracking-[0.22em] text-foam/90 md:text-sm">
            Press-ons lit by a Sahara sunset
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-foam/70 md:text-base">
            Ready styles for soft days and golden hours — ethereal finishes,
            shipped across the US.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop/" className="btn-primary bg-foam text-ink hover:bg-blush hover:text-ink">
              Shop now
            </Link>
            <Link href="/collections/" className="btn-ghost">
              Shop collections
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
