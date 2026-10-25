"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminUser } from "@/lib/admin-guard";
import { isAdminEmail } from "@/lib/env";
import { getPublicSiteUrl } from "@/lib/functions";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const GENERIC_LOGIN_ERROR = "Email or password is incorrect.";
const GENERIC_LINK_MESSAGE =
  "If that address is an admin, a sign-in link was sent.";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [linkEmail, setLinkEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [linkPending, setLinkPending] = useState(false);
  const supabase = createBrowserSupabase();

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Admin sign-in is not configured.");
      return;
    }

    const normalized = email.trim().toLowerCase();
    if (!isAdminEmail(normalized)) {
      setError(GENERIC_LOGIN_ERROR);
      return;
    }

    setPending(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    });

    if (authError) {
      setPending(false);
      setError(GENERIC_LOGIN_ERROR);
      return;
    }

    const user = await getAdminUser();
    if (!user) {
      await supabase.auth.signOut();
      setPending(false);
      setError(GENERIC_LOGIN_ERROR);
      return;
    }

    setPassword("");
    router.replace("/admin/");
  }

  async function onMagicLink(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Admin sign-in is not configured.");
      return;
    }

    const normalized = linkEmail.trim().toLowerCase();
    setLinkPending(true);
    if (isAdminEmail(normalized)) {
      await supabase.auth.signInWithOtp({
        email: normalized,
        options: {
          emailRedirectTo: `${getPublicSiteUrl()}/admin/`,
          shouldCreateUser: false,
        },
      });
    }
    setLinkPending(false);
    setMessage(GENERIC_LINK_MESSAGE);
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-ink">Admin</h1>
      <p className="mt-2 text-sm text-ink/60">
        Sign in with the email and password for an allowlisted admin.
      </p>

      {message && (
        <p className="mt-6 rounded-xl bg-sage/20 px-4 py-3 text-sm">{message}</p>
      )}
      {error && (
        <p className="mt-6 rounded-xl bg-petal/15 px-4 py-3 text-sm">{error}</p>
      )}

      <form onSubmit={onPassword} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="text-ink/60">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-foam px-3"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/60">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-foam px-3"
          />
        </label>
        <button
          type="submit"
          disabled={pending || !supabase}
          className="h-11 w-full rounded-full bg-ink text-sm text-foam disabled:opacity-40"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <details className="mt-8 rounded-xl border border-ink/10 px-4 py-3">
        <summary className="cursor-pointer text-sm text-ink/70">
          Email a magic link instead
        </summary>
        <p className="mt-3 text-sm text-ink/55">
          Use this before you have set a password. Prod mail is not set up, so
          a link is only delivered when SMTP works or an operator issues one.
        </p>
        <form onSubmit={onMagicLink} className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="text-ink/60">Email</span>
            <input
              type="email"
              name="magic-link-email"
              required
              autoComplete="username"
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-foam px-3"
            />
          </label>
          <button
            type="submit"
            disabled={linkPending || !supabase}
            className="h-11 w-full rounded-full border border-ink/15 text-sm text-ink disabled:opacity-40"
          >
            {linkPending ? "Sending…" : "Email magic link"}
          </button>
        </form>
      </details>
    </div>
  );
}
