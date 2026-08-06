import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

for (const path of [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), 'apps', 'api', '.env'),
]) {
  if (existsSync(path)) {
    loadEnv({ path, override: true });
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
