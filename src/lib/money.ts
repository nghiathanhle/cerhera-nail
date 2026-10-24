export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function shippingForSubtotal(
  subtotalCents: number,
  flatShippingCents: number,
  freeThresholdCents: number | null,
): number {
  if (freeThresholdCents != null && subtotalCents >= freeThresholdCents) {
    return 0;
  }
  return flatShippingCents;
}
