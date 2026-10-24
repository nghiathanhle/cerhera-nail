export function getFunctionsBaseUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1`;
}

export async function callFunction<T>(
  name: string,
  init?: RequestInit & { query?: Record<string, string> },
): Promise<T> {
  const base = getFunctionsBaseUrl();
  if (!base) {
    throw new Error(
      "Supabase Functions are not configured. Set NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  const url = new URL(`${base}/${name}`);
  if (init?.query) {
    Object.entries(init.query).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { query: _q, ...rest } = init || {};
  const res = await fetch(url.toString(), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(anon ? { Authorization: `Bearer ${anon}`, apikey: anon } : {}),
      ...(rest.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Function ${name} failed`,
    );
  }
  return data as T;
}

/** Full public site URL including GitHub Pages base path when set. */
export function getPublicSiteUrl(): string {
  if (typeof window !== "undefined") {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    return `${window.location.origin}${base}`.replace(/\/$/, "");
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function checkoutRedirectUrls() {
  const site = getPublicSiteUrl();
  return {
    successUrl: `${site}/checkout/success/?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${site}/checkout/cancel/`,
  };
}
