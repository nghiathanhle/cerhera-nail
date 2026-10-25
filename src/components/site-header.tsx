"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [elevated, setElevated] = useState(false);
  const overHero = isHome && !elevated;

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const viewport = window.visualViewport;
    if (!header) return;

    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setElevated(window.scrollY > 12);
        if (!viewport) return;
        // Chrome on iPhone shifts the visual viewport down while its top
        // toolbar expands, and reports a negative offset during bounce.
        // Move the sticky edge with `top` only — a transform would pin
        // this bar to the layout viewport and let the toolbar cover it.
        const offset = Math.max(0, viewport.offsetTop);
        header.style.top = `${offset}px`;
      });
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    document.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("orientationchange", sync);
    viewport?.addEventListener("scroll", sync);
    viewport?.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", sync);
      document.removeEventListener("scroll", sync);
      window.removeEventListener("orientationchange", sync);
      viewport?.removeEventListener("scroll", sync);
      viewport?.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <header
      data-site-header
      className={cn(
        "site-header",
        overHero
          ? "bg-ink/50 text-foam"
          : "border-b border-ink/5 bg-paper text-ink",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:h-[4.5rem] md:px-8">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight transition-opacity hover:opacity-70 md:text-[1.65rem]"
        >
          {storeName}
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-7 text-sm md:flex",
            overHero ? "text-foam/80" : "text-ink/75",
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors",
                overHero ? "hover:text-foam" : "hover:text-ink",
                pathname.startsWith(link.href) &&
                  (overHero ? "text-foam" : "text-ink"),
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart/"
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm transition",
            overHero
              ? "border border-foam/40 bg-ink/55 text-foam hover:bg-ink/70"
              : "border border-ink/15 bg-foam text-ink hover:border-ink/30",
          )}
        >
          Bag
          <span
            className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-petal px-1.5 text-[11px] font-medium text-foam",
              ready && count > 0 && "font-semibold",
            )}
          >
            {ready ? count : 0}
          </span>
        </Link>
      </div>
    </header>
  );
}
