import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * How the API authenticates users and stores files.
 *
 * - `supabase` (default): Supabase Auth + Storage — needs network access and
 *   the `SUPABASE_*` variables.
 * - `local`: fully offline development mode. Credentials live in a JSON file
 *   (`.local/auth-users.json`), access tokens are HS256 JWTs signed with
 *   `LOCAL_AUTH_JWT_SECRET`, and uploads go to `.local/storage/`.
 *   **Never use in production** — it exists so the stack can run in a closed
 *   environment until the Supabase project is configured.
 */
export type AuthMode = 'supabase' | 'local';

const DEFAULT_LOCAL_AUTH_JWT_SECRET =
  'careseeker-local-dev-secret-change-me-0123456789abcdef';

export function getAuthMode(): AuthMode {
  const raw = process.env['AUTH_MODE']?.trim().toLowerCase();
  return raw === 'local' ? 'local' : 'supabase';
}

export function isLocalAuthMode(): boolean {
  return getAuthMode() === 'local';
}

export function getLocalAuthJwtSecret(): string {
  return (
    process.env['LOCAL_AUTH_JWT_SECRET']?.trim() ||
    DEFAULT_LOCAL_AUTH_JWT_SECRET
  );
}

/**
 * Directory for local-mode data (credentials + uploaded files). Defaults to
 * `apps/api/.local` regardless of whether the process was started from the
 * monorepo root or from `apps/api` (same approach as `load-env.ts`).
 */
export function getLocalDataDir(): string {
  const configured = process.env['LOCAL_AUTH_DIR']?.trim();
  if (configured) return resolve(configured);

  const fromRoot = resolve(process.cwd(), 'apps', 'api');
  const base = existsSync(fromRoot) ? fromRoot : process.cwd();
  return resolve(base, '.local');
}

/** Public origin of this API, used to build local-mode file URLs. */
export function getApiPublicUrl(): string {
  const configured = process.env['API_PUBLIC_URL']?.trim().replace(/\/+$/, '');
  if (configured) return configured;
  return `http://localhost:${process.env['PORT'] ?? 2000}`;
}
