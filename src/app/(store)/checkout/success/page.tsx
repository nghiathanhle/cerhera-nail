"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckoutSuccess } from "@/components/checkout-success";

function SuccessInner() {
  const params = useSearchParams();
  return <CheckoutSuccess sessionId={params.get("session_id")} />;
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <p className="py-24 text-center text-ink/60">Confirming your order…</p>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
