"use client";

import { useEffect } from "react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { SiteHeader } from "@/components/site-header";

/**
 * Sticky announcement + header as one unit so they don't overlap.
 * Keeps sticky (not fixed) for Chrome-on-iPhone toolbar behavior.
 */
export function SiteChrome({
  storeName,
  freeShippingThresholdCents,
}: {
  storeName: string;
  freeShippingThresholdCents: number | null;
}) {
  useEffect(() => {
    const chrome = document.querySelector<HTMLElement>("[data-site-chrome]");
    const viewport = window.visualViewport;
    if (!chrome) return;

    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!viewport) return;
        const offset = Math.max(0, viewport.offsetTop);
        chrome.style.top = `${offset}px`;
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
    <div data-site-chrome className="site-chrome">
      <AnnouncementBar
        freeShippingThresholdCents={freeShippingThresholdCents}
      />
      <SiteHeader storeName={storeName} />
    </div>
  );
}
