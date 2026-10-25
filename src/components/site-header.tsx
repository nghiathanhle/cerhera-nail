"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart-provider";
import { collections } from "@/lib/collections";
import { cn } from "@/lib/cn";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/shop/", label: "Shop" },
  { href: "/collections/", label: "Collections" },
  { href: "/how-to-apply/", label: "How to apply" },
];

export function SiteHeader({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const isHome = pathname === "/";
  const [elevated, setElevated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const overHero = isHome && !elevated;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setElevated(window.scrollY > 12);
      });
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    document.addEventListener("scroll", sync, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", sync);
      document.removeEventListener("scroll", sync);
    };
  }, []);

  return (
    <div
      className={cn(
        overHero
          ? "bg-ink/45 text-foam"
          : "border-b border-ink/8 bg-foam/95 text-ink",
      )}
    >
      <div className="relative mx-auto grid h-[4.25rem] max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:h-[4.75rem] md:px-8">
        <nav
          className={cn(
            "hidden items-center gap-6 text-[0.7rem] font-medium uppercase tracking-[0.16em] lg:flex",
            overHero ? "text-foam/80" : "text-ink/70",
          )}
        >
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors",
                overHero ? "hover:text-foam" : "hover:text-ink",
                (link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)) &&
                  (overHero ? "text-foam" : "text-ink"),
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className={cn(
            "justify-self-start text-[0.7rem] font-medium uppercase tracking-[0.16em] lg:hidden",
            overHero ? "text-foam/90" : "text-ink/80",
          )}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <Link
          href="/"
          className="justify-self-center font-display text-[1.85rem] font-medium lowercase tracking-tight transition-opacity hover:opacity-75 md:text-[2.15rem]"
        >
          {storeName.toLowerCase()}
        </Link>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/cart/"
            className={cn(
              "inline-flex min-h-10 items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition",
              overHero
                ? "text-foam hover:text-foam/80"
                : "text-ink hover:opacity-70",
            )}
          >
            Bag
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center bg-ember px-1.5 text-[10px] font-semibold text-foam",
                ready && count > 0 && "animate-soft-pulse",
              )}
            >
              {ready ? count : 0}
            </span>
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav"
          className={cn(
            "border-t px-5 py-5 lg:hidden",
            overHero
              ? "border-foam/15 bg-ink/90 text-foam"
              : "border-ink/8 bg-foam text-ink",
          )}
        >
          <ul className="space-y-4 text-[0.75rem] font-medium uppercase tracking-[0.16em]">
            {primaryLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p
            className={cn(
              "mt-6 text-[0.65rem] uppercase tracking-[0.18em]",
              overHero ? "text-foam/50" : "text-ink/45",
            )}
          >
            Collections
          </p>
          <ul className="mt-3 space-y-3 text-sm">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}/`}
                  className="font-display text-lg lowercase"
                  onClick={() => setMenuOpen(false)}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
