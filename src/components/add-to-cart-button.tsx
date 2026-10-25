"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";
import { cn } from "@/lib/cn";

export function AddToCartButton({
  productId,
  disabled,
  fullWidth,
}: {
  productId: string;
  disabled?: boolean;
  fullWidth?: boolean;
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
      className={cn("btn-primary", fullWidth && "w-full", added && "animate-soft-pulse")}
    >
      {disabled ? "Sold out" : added ? "Added to bag" : "Add to bag"}
    </button>
  );
}
