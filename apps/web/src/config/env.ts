/**
 * Environment configuration for Careseeker web app.
 * All values come from Vite env vars (no hardcoded secrets).
 */

export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as
      | string
      | undefined,
  },
  apiBaseUrl: (() => {
    const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (configured && configured.trim().length > 0) {
      return configured.trim().replace(/\/+$/, "");
    }

    if (
      typeof window !== "undefined" &&
      window.location.hostname.includes("localhost")
    ) {
      return "http://localhost:2000";
    }

    return "";
  })(),
  /**
   * Public base URL for the current deployment (e.g. https://client.careseeker.com).
   * Used for auth redirect URLs. Falls back to window.location.origin in browser.
   */
  publicBaseUrl:
    (import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) ??
    (typeof window !== "undefined" ? window.location.origin : undefined),
} as const;
