/**
 * App variant selection for multi-subdomain builds.
 * Build-time only: VITE_APP_VARIANT determines which app is bundled.
 *
 * Variants:
 * - core: root site (landing/about/login)
 * - client/provider/admin: portal apps
 */

export type AppVariant = "core" | "client" | "provider" | "admin";

const VALID_VARIANTS: AppVariant[] = ["core", "client", "provider", "admin"];

function parseVariant(raw: unknown): AppVariant | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().toLowerCase();
  return VALID_VARIANTS.includes(normalized as AppVariant)
    ? (normalized as AppVariant)
    : null;
}

/**
 * - Dev: if missing/invalid, defaults to "core" and logs a warning.
 * - Production: if missing/invalid, throws (fail deploy).
 */
function resolveVariant(): AppVariant {
  const raw = import.meta.env.VITE_APP_VARIANT;
  const isProd = import.meta.env.PROD;
  const parsed = parseVariant(raw);

  if (parsed) return parsed;

  if (isProd) {
    throw new Error(
      `[Careseeker] Invalid or missing VITE_APP_VARIANT in production build. ` +
        `Expected one of: ${VALID_VARIANTS.join(", ")}. ` +
        `Got: "${raw ?? "(undefined)"}"`
    );
  }

  console.warn(
    `[Careseeker] VITE_APP_VARIANT is missing or invalid. Defaulting to "core" in dev. ` +
      `Valid values: ${VALID_VARIANTS.join(", ")}`
  );

  return "core";
}

const APP_VARIANT = resolveVariant();

export const getAppVariant = (): AppVariant => APP_VARIANT;
export const isCoreApp = (): boolean => APP_VARIANT === "core";
export const isClientApp = (): boolean => APP_VARIANT === "client";
export const isProviderApp = (): boolean => APP_VARIANT === "provider";
export const isAdminApp = (): boolean => APP_VARIANT === "admin";
