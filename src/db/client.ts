// Lazy Postgres client. Returns null when DATABASE_URL is not configured (static-only mode): callers must degrade gracefully.
import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { env } from '@/server/env';

export type Db = PostgresJsDatabase<typeof schema>;
let _db: Db | null | undefined;

export function getDb(): Db | null {
  if (_db !== undefined) return _db;
  const url = env().DATABASE_URL;
  if (!url) return (_db = null);
  // prepare:false keeps it compatible with PgBouncer transaction pooling (Neon pooled URL, Supabase pooler).
  const client = postgres(url, { max: 3, prepare: false, idle_timeout: 20, connect_timeout: 8, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : 'require' });
  _db = drizzle(client, { schema });
  return _db;
}

export { schema };
