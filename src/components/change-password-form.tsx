"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const MIN_PASSWORD_LENGTH = 12;

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }

    const supabase = createBrowserSupabase();
    if (!supabase) {
      setError("Admin sign-in is not configured.");
      return;
    }

    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError("Could not update the password. Try again.");
      return;
    }

    setPassword("");
    setConfirm("");
    setMessage("Password updated. You can sign in with it next time.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {message && (
        <p className="rounded-xl bg-sage/20 px-4 py-3 text-sm">{message}</p>
      )}
      {error && (
        <p className="rounded-xl bg-petal/15 px-4 py-3 text-sm">{error}</p>
      )}
      <label className="block text-sm">
        <span className="text-ink/60">New password</span>
        <input
          type="password"
          name="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-foam px-3"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/60">Confirm password</span>
        <input
          type="password"
          name="confirm-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-foam px-3"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-full bg-ink px-6 text-sm text-foam disabled:opacity-40"
      >
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
