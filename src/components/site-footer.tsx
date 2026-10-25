import Link from "next/link";
import { collections } from "@/lib/collections";

export function SiteFooter({ storeName }: { storeName: string }) {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-ink text-foam">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-4 md:gap-10 md:px-8">
        <div className="md:col-span-1">
          <p className="font-display text-3xl lowercase">{storeName.toLowerCase()}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-foam/60">
            Ethereal press-ons in a Sahara sunset mood. Ready styles, ships
            within the US.
          </p>
        </div>

        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foam/45">
            Shop
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-foam/75">
            <li>
              <Link href="/shop/" className="hover:text-foam">
                All styles
              </Link>
            </li>
            {collections.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}/`}
                  className="hover:text-foam"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foam/45">
            Help
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-foam/75">
            <li>
              <Link href="/size-chart/" className="hover:text-foam">
                Size chart
              </Link>
            </li>
            <li>
              <Link href="/how-to-apply/" className="hover:text-foam">
                How to apply
              </Link>
            </li>
            <li>
              <Link href="/care/" className="hover:text-foam">
                Care
              </Link>
            </li>
            <li>
              <Link href="/shipping/" className="hover:text-foam">
                Shipping
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foam/45">
            Policies
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-foam/75">
            <li>
              <Link href="/returns/" className="hover:text-foam">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/privacy/" className="hover:text-foam">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-foam/10 px-5 py-5 text-center text-[0.65rem] uppercase tracking-[0.14em] text-foam/40 md:px-8">
        © {new Date().getFullYear()} {storeName} · US only
      </div>
    </footer>
  );
}
