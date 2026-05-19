/**
 * @file database/scripts/apply-migrations-remote.ts
 * @description Applies ordered SQL migrations from `database/migrations/` to a remote Postgres
 * instance using `DATABASE_URL` (Supabase session pooler or direct connection string).
 *
 * Prerequisites:
 *   - Add `DATABASE_URL` to `.env.local` from Supabase Dashboard → Project Settings → Database
 *     → Connection string → URI (use Session mode for pooler when running DDL).
 *   - The URL must match the same project as `NEXT_PUBLIC_SUPABASE_URL` / service role keys.
 *
 * Run: npm run db:migrate:remote
 *
 * This script does not print connection strings or passwords.
 */

import { existsSync, readFileSync } from 'fs';
import { resolve }                  from 'path';
import { parse as parseDotEnv }     from 'dotenv';
import pg                           from 'pg';

const MIGRATION_FILES: readonly string[] = [
  '001_initial_schema.sql',
  '002_auth_onboarding_helpers.sql',
  '003_booking_portal.sql',
] as const;

/**
 * Reads `DATABASE_URL` only from `.env.local` then `.env` (parsed), so a stray
 * `DATABASE_URL` in the parent shell cannot override the project connection string.
 */
function readDatabaseUrlFromEnvFiles(): string | undefined {
  for (const name of ['.env.local', '.env'] as const) {
    const filePath = resolve(process.cwd(), name);
    if (!existsSync(filePath)) {
      continue;
    }
    const parsed = parseDotEnv(readFileSync(filePath, 'utf8'));
    const raw    = parsed.DATABASE_URL?.trim();
    if (raw !== undefined && raw.length > 0) {
      return raw;
    }
  }
  return undefined;
}

/**
 * Loads `.env.local` / `.env`, connects with `pg`, and runs each migration file in order.
 */
async function main(): Promise<void> {
  const connectionString = readDatabaseUrlFromEnvFiles();
  if (!connectionString) {
    // eslint-disable-next-line no-console -- CLI script
    console.error(
      '[apply-migrations-remote] Missing DATABASE_URL in .env.local or .env. Copy the Session pooler URI from the Supabase Dashboard (Database settings) into .env.local.',
    );
    process.exitCode = 1;
    return;
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  // eslint-disable-next-line no-console -- CLI script
  console.info('[apply-migrations-remote] Connected. Applying', MIGRATION_FILES.length, 'migration file(s)...');

  try {
    for (const fileName of MIGRATION_FILES) {
      const filePath = resolve(process.cwd(), 'database/migrations', fileName);
      const sql      = readFileSync(filePath, 'utf8');
      // eslint-disable-next-line no-console -- CLI script
      console.info(`[apply-migrations-remote] Applying ${fileName} ...`);
      await client.query(sql);
      // eslint-disable-next-line no-console -- CLI script
      console.info(`[apply-migrations-remote] Applied ${fileName}`);
    }
  } finally {
    await client.end();
  }

  // eslint-disable-next-line no-console -- CLI script
  console.info('[apply-migrations-remote] Done. You can run npm run db:seed:demo next.');
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  // eslint-disable-next-line no-console -- CLI script
  console.error('[apply-migrations-remote] FAILED:', message);
  process.exitCode = 1;
});
