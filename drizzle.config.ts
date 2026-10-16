import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  // db:generate works offline; db:migrate needs DATABASE_URL (Neon or Supabase).
  dbCredentials: { url: process.env.DATABASE_URL ?? 'postgres://user:pass@localhost:5432/iltools' },
});
