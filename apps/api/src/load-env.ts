import { existsSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';

/**
 * `import 'dotenv/config'` only reads `process.cwd()/.env`. The API is often started
 * with cwd = monorepo root, so `apps/api/.env` is skipped and ES256 verification
 * fails (401) because `SUPABASE_URL` is unset.
 *
 * When several `.env` files exist (e.g. repo root + `apps/api/.env`), **`apps/api/.env`
 * is applied last** so API-specific vars win over a shared root file.
 */
function isAppsApiDotEnv(filePath: string): boolean {
  const dir = dirname(resolve(filePath));
  return basename(dir) === 'api' && basename(dirname(dir)) === 'apps';
}

const candidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), 'apps', 'api', '.env'),
  join(__dirname, '..', '.env'),
  join(__dirname, '..', '..', '.env'),
];

const existing = [...new Set(candidates)].filter((p) => existsSync(p));
existing.sort((a, b) => {
  const pa = isAppsApiDotEnv(a) ? 1 : 0;
  const pb = isAppsApiDotEnv(b) ? 1 : 0;
  return pa - pb;
});

for (const path of existing) {
  loadEnv({ path, override: true });
}
