import Image from "next/image";
import Link from "next/link";
import { collections } from "@/lib/collections";

export const metadata = {
  title: "Collections",
};

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ink/55">
          Collections
        </h1>
        <p className="mt-4 font-display text-4xl lowercase text-ink md:text-5xl">
          Shop by mood
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink/60 md:text-base">
          Organized like a sunset — soft blush, quiet dunes, and inked gardens.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}/`}
            className="group block"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-mist">
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-foam">
                <p className="font-display text-3xl lowercase">
                  {collection.name}
                </p>
                <p className="mt-2 text-sm text-foam/75">{collection.tagline}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
