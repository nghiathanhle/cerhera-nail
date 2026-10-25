import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/lib/collections";

export function CollectionBanner({ collection }: { collection: Collection }) {
  return (
    <section className="relative isolate min-h-[58vh] overflow-hidden md:min-h-[64vh]">
      <Image
        src={collection.image}
        alt={collection.name}
        fill
        className="absolute inset-0 -z-10 object-cover object-center"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ink/70 via-ink/45 to-ink/25" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_30%,rgba(232,147,106,0.3),transparent_50%)]" />

      <div className="relative mx-auto flex min-h-[58vh] max-w-6xl flex-col justify-center px-5 py-20 md:min-h-[64vh] md:px-8">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-foam/70">
          Featured collection
        </p>
        <h2 className="mt-4 max-w-md font-display text-5xl lowercase leading-none text-foam md:text-6xl">
          {collection.name}
        </h2>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-foam/75">
          {collection.tagline}
        </p>
        <div className="mt-8">
          <Link
            href={`/collections/${collection.slug}/`}
            className="btn-primary bg-foam text-ink hover:bg-blush hover:text-ink"
          >
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  );
}
