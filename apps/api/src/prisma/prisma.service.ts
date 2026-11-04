import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import pg from 'pg';
import { PrismaClient } from '../../generated/prisma/client.js';

/**
 * `prisma/migrations` for the running API, whether it was started from the
 * monorepo root or from `apps/api`. `null` when it cannot be found (e.g. a
 * trimmed production image), in which case the migration check is skipped.
 */
function findMigrationsDir(): string | null {
  const candidates = [
    resolve(process.cwd(), 'prisma', 'migrations'),
    resolve(process.cwd(), 'apps', 'api', 'prisma', 'migrations'),
  ];
  return candidates.find((path) => existsSync(path)) ?? null;
}

function listMigrationNames(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(join(dir, entry.name, 'migration.sql')),
    )
    .map((entry) => entry.name)
    .sort();
}

type MigrationRow = {
  migration_name: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
};

/** `postgresql://user@host:port/db` without the password, for log messages. */
function redactDatabaseUrl(connectionString: string | undefined): string {
  if (!connectionString) return '<unset>';
  try {
    const url = new URL(connectionString);
    url.password = url.password ? '***' : '';
    url.search = '';
    return decodeURIComponent(url.toString());
  } catch {
    return '<invalid URL>';
  }
}

/**
 * Hosted Postgres (Supabase) requires TLS, which stays the default. A local
 * database without TLS can opt out with `DATABASE_SSL=false` or by appending
 * `?sslmode=disable` to `DATABASE_URL`.
 */
function isDatabaseSslEnabled(connectionString: string): boolean {
  const flag = process.env['DATABASE_SSL']?.trim().toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'off') return false;
  if (flag === 'true' || flag === '1' || flag === 'on') return true;

  try {
    return new URL(connectionString).searchParams.get('sslmode') !== 'disable';
  } catch {
    return true;
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    const pool = new pg.Pool({
      connectionString,
      ssl: isDatabaseSslEnabled(connectionString)
        ? { rejectUnauthorized: false }
        : false,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  private readonly logger = new Logger(PrismaService.name);

  /**
   * Fails fast at boot when the database is unreachable or behind on
   * migrations. Without this the API starts happily and every request that
   * touches Prisma turns into a 500 (a mistyped `DATABASE_URL` host, or a
   * column the generated client expects but the database does not have yet).
   */
  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      // Prisma prefixes driver errors with "Invalid `...` invocation:"; the
      // useful part (e.g. "getaddrinfo ENOTFOUND host") is the last line.
      const reason = (error instanceof Error ? error.message : String(error))
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .pop();
      throw new Error(
        `Cannot connect to the database at ${redactDatabaseUrl(
          process.env['DATABASE_URL'],
        )}: ${reason ?? 'unknown error'} — check DATABASE_URL (and DATABASE_SSL) in apps/api/.env`,
      );
    }

    await this.assertMigrationsApplied();
  }

  /**
   * Compares `prisma/migrations` with `_prisma_migrations`. Pending migrations
   * abort the boot with the exact command to run. Set
   * `SKIP_MIGRATION_CHECK=true` to bypass (e.g. a DB managed outside Prisma).
   */
  private async assertMigrationsApplied(): Promise<void> {
    const skip = process.env['SKIP_MIGRATION_CHECK']?.trim().toLowerCase();
    if (skip === 'true' || skip === '1') return;

    const dir = findMigrationsDir();
    if (!dir) {
      this.logger.warn(
        'prisma/migrations not found next to the API; skipping the migration check.',
      );
      return;
    }

    let rows: MigrationRow[];
    try {
      rows = await this.$queryRaw<MigrationRow[]>`
        SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations"`;
    } catch {
      // No Prisma migration history at all (schema applied by other means).
      this.logger.warn(
        '_prisma_migrations table not found; cannot verify that the schema is up to date. ' +
          'Run `pnpm exec prisma migrate deploy` in apps/api to manage the schema with Prisma.',
      );
      return;
    }

    const applied = new Set(
      rows
        .filter((row) => row.finished_at && !row.rolled_back_at)
        .map((row) => row.migration_name),
    );
    const pending = listMigrationNames(dir).filter(
      (name) => !applied.has(name),
    );

    if (pending.length > 0) {
      throw new Error(
        `Database schema is out of date — ${pending.length} pending migration(s): ${pending.join(
          ', ',
        )}. Run \`pnpm exec prisma migrate deploy\` (or \`pnpm db:migrate\`) in apps/api, then start the API again.`,
      );
    }

    this.logger.log(
      `Database schema is up to date (${applied.size} migrations applied).`,
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
