import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getAuthMode } from '../auth/auth-mode';

/**
 * Which `FileStorage` adapter the API uses. Selected by `STORAGE_PROVIDER`:
 *
 * - `local`: files on the local filesystem under `UPLOADS_DIR` (offline
 *   development). Never exposed as a static folder — every read goes through
 *   an authenticated / signed API endpoint.
 * - `supabase`: private Supabase Storage buckets accessed with the service
 *   key (production). Missing configuration is a **boot-time error**; the API
 *   never silently falls back to local storage.
 *
 * When unset it follows `AUTH_MODE` (`local` → local, otherwise supabase).
 */
export type StorageProviderKind = 'local' | 'supabase';

export function getStorageProvider(): StorageProviderKind {
  const raw = process.env['STORAGE_PROVIDER']?.trim().toLowerCase();
  if (raw === 'local' || raw === 'supabase') return raw;
  if (raw) {
    throw new Error(
      `Invalid STORAGE_PROVIDER "${raw}". Use "local" or "supabase".`,
    );
  }
  return getAuthMode() === 'local' ? 'local' : 'supabase';
}

/**
 * Root directory for local storage (default `apps/api/uploads`, resolved the
 * same way whether the API starts from the monorepo root or from `apps/api`).
 * Objects live at `<UPLOADS_DIR>/<bucket>/<key>`; the directory is gitignored.
 */
export function getUploadsDir(): string {
  const configured = process.env['UPLOADS_DIR']?.trim();
  if (configured) return resolve(configured);

  const fromRoot = resolve(process.cwd(), 'apps', 'api');
  const base = existsSync(fromRoot) ? fromRoot : process.cwd();
  return resolve(base, 'uploads');
}

/** Throws a descriptive error when the Supabase storage adapter cannot work. */
export function assertSupabaseStorageConfig(): void {
  const missing = [
    ['SUPABASE_URL', process.env['SUPABASE_URL']],
    [
      'SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY)',
      process.env['SUPABASE_SECRET_KEY'] ??
        process.env['SUPABASE_SERVICE_ROLE_KEY'],
    ],
  ]
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `STORAGE_PROVIDER=supabase requires ${missing.join(' and ')}. ` +
        'Set them on the API, or use STORAGE_PROVIDER=local for offline development.',
    );
  }
}
