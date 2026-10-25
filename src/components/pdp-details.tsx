"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Section = {
  id: string;
  title: string;
  body: React.ReactNode;
};

export function PdpDetails({
  description,
  collectionName,
  collectionHref,
}: {
  description: string;
  collectionName?: string;
  collectionHref?: string;
}) {
  const [open, setOpen] = useState<string>("description");

  const sections: Section[] = [
    {
      id: "description",
      title: "Description",
      body: (
        <div className="space-y-3 text-sm leading-relaxed text-ink/65">
          <p>{description}</p>
          <p>
            Ten-piece ready set · adhesive tabs included. Handmade feel,
            reusable with care.
          </p>
          {collectionName && collectionHref && (
            <p>
              From the{" "}
              <Link
                href={collectionHref}
                className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
              >
                {collectionName}
              </Link>{" "}
              collection.
            </p>
          )}
        </div>
      ),
    },
    {
      id: "shipping",
      title: "Shipping & delivery",
      body: (
        <div className="space-y-3 text-sm leading-relaxed text-ink/65">
          <p>We ship within the United States only.</p>
          <p>
            Flat-rate US shipping at checkout. Free shipping applies when your
            order meets the threshold shown in the announcement bar.
          </p>
          <p>
            <Link
              href="/shipping/"
              className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
            >
              Full shipping details
            </Link>
          </p>
        </div>
      ),
    },
    {
      id: "apply",
      title: "How to apply",
      body: (
        <div className="space-y-3 text-sm leading-relaxed text-ink/65">
          <p>
            Clean, file, and press — most sets take about ten minutes. Start
            with the size chart if you’re new to press-ons.
          </p>
          <p>
            <Link
              href="/how-to-apply/"
              className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
            >
              Step-by-step guide
            </Link>
            {" · "}
            <Link
              href="/size-chart/"
              className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
            >
              Size chart
            </Link>
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-10 border-t border-ink/10">
      {sections.map((section) => {
        const isOpen = open === section.id;
        return (
          <div key={section.id} className="border-b border-ink/10">
            <button
              type="button"
              className="flex w-full items-center justify-between py-4 text-left text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ink"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? "" : section.id)}
            >
              {section.title}
              <span className="text-ink/40" aria-hidden>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">{section.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
