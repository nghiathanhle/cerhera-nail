import Link from "next/link";

export function SiteFooter({ storeName }: { storeName: string }) {
  return (
    <footer className="mt-auto border-t border-ink/8 bg-ink/[0.03]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-2xl text-ink">{storeName}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/65">
            Ready-to-wear press-on styles, made for soft days and little
            celebrations. Ships within the US.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink/70">
            <li>
              <Link href="/shop/" className="hover:text-ink">
                Shop styles
              </Link>
            </li>
            <li>
              <Link href="/care/" className="hover:text-ink">
                Care
              </Link>
            </li>
            <li>
              <Link href="/size-chart/" className="hover:text-ink">
                Size chart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
            Policies
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink/70">
            <li>
              <Link href="/shipping/" className="hover:text-ink">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="/returns/" className="hover:text-ink">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/privacy/" className="hover:text-ink">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/8 px-5 py-5 text-center text-xs text-ink/45 md:px-8">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
