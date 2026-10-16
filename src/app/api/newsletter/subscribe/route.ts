import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db/client';
import { csrfCheck, ERR, jsonError, jsonOk, readJson, clientIp } from '@/server/http';
import { rateLimit } from '@/server/rate-limit';
import { hashWithSalt, randomToken } from '@/server/crypto';
import { verifyCaptcha } from '@/server/turnstile';
import { newsletterConfirmMail, sendMail } from '@/server/email';
import { getLegal } from '@/lib/legal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const body = z.object({
  email: z.string().trim().toLowerCase().email('כתובת אימייל לא תקינה').max(120),
  consent: z.literal(true, { error: 'יש לסמן את תיבת ההסכמה כדי להירשם' }),
  website: z.string().max(0).optional(),
  turnstile: z.string().nullish(),
});

export async function POST(req: Request) {
  if (!csrfCheck(req)) return jsonError(403, ERR.forbidden);
  const ip = clientIp(req);
  if (!(await rateLimit(`nl:${hashWithSalt(ip)}`, 5, 3600)).ok) return jsonError(429, ERR.rateLimited);
  const raw = await readJson(req);
  if (!raw || typeof raw !== 'object') return jsonError(400, ERR.badRequest);
  if (typeof (raw as { website?: unknown }).website === 'string' && (raw as { website: string }).website) return jsonOk(); // honeypot
  const parsed = body.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0] ?? 'form')] ??= i.message;
    return jsonError(400, ERR.badRequest, fields);
  }
  if (!(await verifyCaptcha(parsed.data.turnstile, ip))) return jsonError(400, ERR.spam);
  const db = getDb();
  if (!db) return jsonError(503, ERR.unavailable);

  const { email } = parsed.data;
  const version = getLegal('LEGAL-NEWSLETTER-TERMS').version;
  const existing = (await db.select().from(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.email, email)).limit(1))[0];
  // Never reveal whether an address is already subscribed; never re-send to an unsubscribed address without a fresh confirmation.
  if (existing?.confirmedAt && !existing.unsubscribedAt) return jsonOk();
  const token = randomToken();
  if (existing) {
    await db.update(schema.newsletterSubscribers).set({ doubleOptInToken: token, unsubscribedAt: null, consentTextVersion: version }).where(eq(schema.newsletterSubscribers.id, existing.id));
  } else {
    await db.insert(schema.newsletterSubscribers).values({ email, doubleOptInToken: token, unsubscribeToken: randomToken(), consentTextVersion: version });
  }
  await sendMail(newsletterConfirmMail(email, token)); // subscribed ONLY after the confirmation link is used (double opt-in)
  return jsonOk();
}
