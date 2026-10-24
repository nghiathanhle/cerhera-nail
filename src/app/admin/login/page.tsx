"use client";

import { FormEvent, useState } from "react";
import { isAdminEmail } from "@/lib/env";
import { getPublicSiteUrl } from "@/lib/functions";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const supabase = createBrowserSupabase();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Add NEXT_PUBLIC_SUPABASE_URL and ANON_KEY to enable admin.");
      return;
    }

    if (!isAdminEmail(email)) {
      setError("That email isn’t on the admin allowlist.");
      return;
    }

    setPending(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${getPublicSiteUrl()}/admin/`,
      },
    });
    setPending(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("Check your email for a magic link.");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-ink">Admin</h1>
      <p className="mt-2 text-sm text-ink/60">
        Magic link sign-in for allowlisted emails.
      </p>

      {message && (
        <p className="mt-6 rounded-xl bg-sage/20 px-4 py-3 text-sm">{message}</p>
      )}
      {error && (
        <p className="mt-6 rounded-xl bg-petal/15 px-4 py-3 text-sm">{error}</p>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="text-ink/60">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-foam px-3"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={pending || !supabase}
          className="h-11 w-full rounded-full bg-ink text-sm text-foam disabled:opacity-40"
        >
          {pending ? "Sending…" : "Email magic link"}
        </button>
      </form>
    </div>
  );
}
