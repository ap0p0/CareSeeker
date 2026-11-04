/**
 * CareSeeker web (Vite) — canonical env for staging/production (e.g. Vercel):
 * `VITE_PUBLIC_BASE_URL`, `VITE_APP_VARIANT`, `VITE_SUPABASE_URL`,
 * `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.
 *
 * Optional: `VITE_API_BASE_URL` / `VITE_API_URL` for API origin (see apiBaseUrl below),
 * `VITE_AUTH_MODE=local` to force the offline auth shim (see authMode below).
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string | undefined;

/**
 * `supabase` (default when the Supabase vars are set) or `local`.
 *
 * `local` talks to the API's offline auth shim (`AUTH_MODE=local` on the API)
 * instead of Supabase. It is selected explicitly with `VITE_AUTH_MODE=local`,
 * or automatically when no Supabase config is present so the apps can run in
 * a closed environment.
 */
const resolveAuthMode = (): "supabase" | "local" => {
  const configured = (import.meta.env.VITE_AUTH_MODE as string | undefined)
    ?.trim()
    .toLowerCase();
  if (configured === "local" || configured === "supabase") return configured;
  return supabaseUrl && supabaseAnonKey ? "supabase" : "local";
};

export const env = {
  authMode: resolveAuthMode(),
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  },
  apiBaseUrl: (() => {
    const defaultProductionApiBaseUrl = "https://backend.careseeker.app";
    const configured =
      (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
      (import.meta.env.VITE_API_URL as string | undefined);
    if (configured && configured.trim().length > 0) {
      return configured.trim().replace(/\/+$/, "");
    }

    if (
      typeof window !== "undefined" &&
      window.location.hostname.includes("localhost")
    ) {
      return "http://localhost:2000";
    }

    return defaultProductionApiBaseUrl;
  })(),
  /**
   * Public base URL for the current deployment (e.g. https://client.careseeker.com).
   * Used for auth redirect URLs. Falls back to window.location.origin in browser.
   */
  publicBaseUrl:
    (import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) ??
    (typeof window !== "undefined" ? window.location.origin : undefined),
  /**
   * Core / marketing site for “back to home” from admin. Dev proxy serves it on :3000;
   * production uses the public CareSeeker URL.
   */
  mainPlatformUrl: (() => {
    if (typeof window === "undefined") {
      return "https://careseeker.app";
    }
    const h = window.location.hostname;
    if (h === "127.0.0.1") {
      return "http://127.0.0.1:3000";
    }
    if (h === "localhost" || h.endsWith(".localhost")) {
      return "http://localhost:3000";
    }
    return "https://careseeker.app";
  })(),
} as const;
