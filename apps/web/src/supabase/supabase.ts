import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import type { AuthClient } from "./authClient";
import { createLocalAuthClient } from "./localAuthClient";

const createSupabaseAuthClient = (): AuthClient => {
  const supabaseUrl = env.supabase.url;
  const supabaseAnonKey = env.supabase.anonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[Careseeker] Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY, or use VITE_AUTH_MODE=local.",
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

if (env.authMode === "local") {
  console.warn(
    "[Careseeker] Auth mode: local (offline shim). Sessions come from the API's /local-auth endpoint; Supabase is not used.",
  );
}

/**
 * Auth client used across the apps. Keeps the `supabase.auth.*` surface so
 * switching between Supabase and the offline local mode is config only.
 */
export const supabase: AuthClient =
  env.authMode === "local"
    ? createLocalAuthClient(env.apiBaseUrl)
    : createSupabaseAuthClient();

/**
 * Returns the URL to redirect to after auth (OAuth, magic link, etc.).
 *
 * Uses VITE_PUBLIC_BASE_URL when set; otherwise falls back to window.location.origin.
 */
export function getAuthRedirectBaseUrl(): string {
  return (
    env.publicBaseUrl ??
    (typeof window !== "undefined" ? window.location.origin : "")
  );
}
