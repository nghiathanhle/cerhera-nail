"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChangePasswordForm } from "@/components/change-password-form";
import { getAdminUser } from "@/lib/admin-guard";

export default function AdminAccountPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAdminUser().then((user) => {
      if (cancelled) return;
      if (!user) {
        router.replace("/admin/login/");
        return;
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return <p className="text-ink/55">Loading admin…</p>;
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl text-ink">Change password</h1>
      <p className="mt-2 text-sm text-ink/60">
        Use at least 12 characters. After a magic-link sign-in, this is how
        you set the password you will use next time.
      </p>
      <ChangePasswordForm />
    </div>
  );
}
