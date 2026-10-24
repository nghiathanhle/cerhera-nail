import { createClient } from "@supabase/supabase-js";
import { demoSettings } from "./demo-data";
import { hasSupabaseEnv } from "./env";
import type { SiteSettings } from "./types";

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasSupabaseEnv()) return demoSettings;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return demoSettings;
    return data as SiteSettings;
  } catch {
    return demoSettings;
  }
}
