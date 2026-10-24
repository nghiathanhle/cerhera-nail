"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { callFunction, getFunctionsBaseUrl } from "@/lib/functions";

type Status =
  | "loading"
  | "pending"
  | "paid"
  | "shipped"
  | "error"
  | "unconfigured";

export function CheckoutSuccess({ sessionId }: { sessionId: string | null }) {
  const { clear } = useCart();
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    if (!getFunctionsBaseUrl()) {
      setStatus("unconfigured");
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const data = await callFunction<{
          status: string;
          email?: string;
        }>("order-status", {
          query: { session_id: sessionId! },
        });

        if (cancelled) return;

        if (data.status === "paid" || data.status === "shipped") {
          setStatus(data.status);
          setEmail(data.email || null);
          return;
        }

        setStatus("pending");
        if (attempts < 12) {
          window.setTimeout(poll, 1500);
        }
      } catch {
        if (!cancelled) {
          if (attempts < 8) {
            setStatus("pending");
            window.setTimeout(poll, 1500);
          } else {
            setStatus("error");
          }
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center md:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-petal">
        Checkout
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink">Thank you</h1>

      {status === "loading" && (
        <p className="mt-4 text-ink/60">Confirming your order…</p>
      )}
      {status === "pending" && (
        <p className="mt-4 text-ink/60">
          Payment received. We’re finishing your order confirmation — this can
          take a moment if the webhook is still catching up.
        </p>
      )}
      {(status === "paid" || status === "shipped") && (
        <p className="mt-4 text-ink/60">
          Your order is confirmed
          {email ? (
            <>
              {" "}
              and a receipt is on its way to <strong>{email}</strong>
            </>
          ) : null}
          . We’ll ship within the US shortly.
        </p>
      )}
      {status === "unconfigured" && (
        <p className="mt-4 text-ink/60">
          Payment may have succeeded, but order tracking isn’t wired yet. Deploy
          the Supabase Edge Functions and Stripe webhook.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-ink/60">
          We couldn’t look up this session. If you were charged, email us with
          your receipt.
        </p>
      )}

      <Link
        href="/shop/"
        className="mt-10 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm text-foam"
      >
        Keep browsing
      </Link>
    </div>
  );
}
