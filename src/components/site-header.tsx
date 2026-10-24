"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-provider";
import { cn } from "@/lib/cn";

const links = [
  { href: "/shop/", label: "Shop" },
  { href: "/size-chart/", label: "Size chart" },
  { href: "/how-to-apply/", label: "How to apply" },
];

export function SiteHeader({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "absolute inset-x-0 top-0 z-40",
        !isHome && "relative bg-paper/80 backdrop-blur-sm border-b border-ink/5",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight text-ink transition-opacity hover:opacity-70 md:text-[1.65rem]"
        >
          {storeName}
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-ink/75 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-ink",
                pathname.startsWith(link.href) && "text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart/"
          className="group relative inline-flex items-center gap-2 rounded-full border border-ink/15 bg-foam/70 px-4 py-2 text-sm text-ink backdrop-blur-sm transition hover:border-ink/30 hover:bg-foam"
        >
          Bag
          <span
            className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-petal px-1.5 text-[11px] font-medium text-foam transition-transform",
              ready && count > 0 && "scale-110",
            )}
          >
            {ready ? count : 0}
          </span>
        </Link>
      </div>
    </header>
  );
}
