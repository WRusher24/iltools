// Boot-time environment validation (fail fast, clear Hebrew/English messages). Everything is OPTIONAL so the
// site builds and runs from static data with no secrets; features that need a variable degrade gracefully.
import { z } from 'zod';

const optionalString = z.string().trim().min(1).optional();
const emptyToUndef = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
const opt = <T extends z.ZodTypeAny>(s: T) => z.preprocess(emptyToUndef, s.optional());

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: opt(z.string().url()),
  NEXT_PUBLIC_ADSENSE_CLIENT: opt(z.string().regex(/^ca-pub-\d+$/, 'must look like ca-pub-1234567890123456')),
  ADSENSE_PUBLISHER_ID: opt(z.string().regex(/^pub-\d+$/, 'must look like pub-1234567890123456 (used for /ads.txt)')),
  NEXT_PUBLIC_GA_ID: opt(z.string().regex(/^G-[A-Z0-9]+$/, 'must look like G-XXXXXXXXXX')),
  DATABASE_URL: opt(z.string().regex(/^postgres(ql)?:\/\//, 'must be a postgres:// connection string (Neon or Supabase)')),
  ENCRYPTION_KEY: opt(z.string().regex(/^[A-Za-z0-9+/=_-]{43,}$/, 'must be a base64 32-byte key (openssl rand -base64 32)')),
  HASH_SALT_SECRET: opt(z.string().min(16)),
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: opt(z.string().min(3)),
  UPSTASH_REDIS_REST_URL: opt(z.string().url()),
  UPSTASH_REDIS_REST_TOKEN: optionalString,
  TURNSTILE_SECRET_KEY: optionalString,
  CRON_SECRET: opt(z.string().min(16)),
  ADMIN_DELETE_TOKEN: opt(z.string().min(16)),
  LEAD_RETENTION_DAYS: opt(z.coerce.number().int().min(30).max(3650)),
});
export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function validateEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => ` - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid environment configuration (see docs/engineering/ENV_VARS.md):\n${lines.join('\n')}`);
  }
  const env = parsed.data;
  // Cross-field rules: leads contain personal data → a database without an encryption key is refused.
  if (env.DATABASE_URL && !env.ENCRYPTION_KEY) {
    throw new Error('DATABASE_URL is set but ENCRYPTION_KEY is missing: lead payloads must be encrypted at rest. Generate one with `openssl rand -base64 32`.');
  }
  if (env.UPSTASH_REDIS_REST_URL && !env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('UPSTASH_REDIS_REST_URL is set but UPSTASH_REDIS_REST_TOKEN is missing.');
  }
  cached = env;
  return env;
}

export const env = (): Env => validateEnv();
