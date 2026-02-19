import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

const supabaseUrl = env.supabase.url;
const supabaseAnonKey = env.supabase.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[Careseeker] Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Returns the URL to redirect to after auth (OAuth, magic link, etc.).
 * Uses VITE_PUBLIC_BASE_URL when set; otherwise falls back to window.location.origin.
 */
export function getAuthRedirectBaseUrl(): string {
  return (
    env.publicBaseUrl ??
    (typeof window !== "undefined" ? window.location.origin : "")
  );
}
