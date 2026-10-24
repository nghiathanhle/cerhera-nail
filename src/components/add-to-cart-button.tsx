"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        addItem(productId, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
      className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-sm font-medium text-foam transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {disabled ? "Sold out" : added ? "Added to bag" : "Add to bag"}
    </button>
  );
}
