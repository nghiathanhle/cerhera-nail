import { formatUsd } from "@/lib/money";

export function AnnouncementBar({
  freeShippingThresholdCents,
}: {
  freeShippingThresholdCents: number | null;
}) {
  const message =
    freeShippingThresholdCents != null
      ? `Free US shipping on orders over ${formatUsd(freeShippingThresholdCents)}`
      : "US shipping only · Guest checkout";

  return (
    <div className="bg-ink text-center text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foam md:text-[0.7rem]">
      <p className="px-4 py-2.5">{message}</p>
    </div>
  );
}
