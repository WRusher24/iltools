import { z } from 'zod';
import { getDb, schema } from '@/db/client';
import { csrfCheck, ERR, jsonError, jsonOk, readJson, clientIp } from '@/server/http';
import { rateLimit } from '@/server/rate-limit';
import { hashWithSalt } from '@/server/crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const body = z.object({
  anon_id: z.string().uuid().or(z.literal('unknown')),
  version: z.string().min(1).max(20),
  analytics: z.boolean(),
  advertising: z.boolean(),
  affiliate: z.boolean(),
});

/** Consent log: stores the anonymous id + choices only (no IP, no UA). Silently succeeds without a database. */
export async function POST(req: Request) {
  if (!csrfCheck(req)) return jsonError(403, ERR.forbidden);
  if (!(await rateLimit(`consent:${hashWithSalt(clientIp(req))}`, 30, 3600)).ok) return jsonError(429, ERR.rateLimited);
  const parsed = body.safeParse(await readJson(req, 2000));
  if (!parsed.success) return jsonError(400, ERR.badRequest);
  const db = getDb();
  if (db) {
    const { anon_id, version, ...cats } = parsed.data;
    await db.insert(schema.consentLog).values({ anonId: anon_id, version, categories: { necessary: true, ...cats } });
  }
  return jsonOk();
}
