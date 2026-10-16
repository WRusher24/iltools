import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { leadSchema, type LeadType } from '@/lib/lead-schema';
import { getLegal } from '@/lib/legal';
import { csrfCheck, ERR, jsonError, jsonOk, readJson, clientIp, sanitizeText } from '@/server/http';
import { rateLimit } from '@/server/rate-limit';
import { hashWithSalt } from '@/server/crypto';
import { verifyCaptcha } from '@/server/turnstile';
import { eligiblePartners, encryptPayload } from '@/server/leads';
import { leadConfirmMail, sendMail } from '@/server/email';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!csrfCheck(req)) return jsonError(403, ERR.forbidden);
  const ip = clientIp(req);
  const ua = req.headers.get('user-agent') ?? '';
  const rl = await rateLimit(`lead:${hashWithSalt(ip)}`, 5, 3600);
  if (!rl.ok) return jsonError(429, ERR.rateLimited);

  const raw = await readJson(req);
  if (!raw || typeof raw !== 'object') return jsonError(400, ERR.badRequest);
  const obj = raw as Record<string, unknown>;
  // honeypot: bots fill hidden fields — pretend success, store nothing
  if (typeof obj.website === 'string' && obj.website.length > 0) return jsonOk({ status: 'received' });

  const parsed = leadSchema.safeParse(obj);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0] ?? 'form')] ??= i.message;
    return jsonError(400, ERR.badRequest, fields);
  }
  const data = parsed.data;
  const legalVersion = getLegal('LEGAL-LEAD-TERMS').version;
  if (data.consentVersion !== legalVersion) return jsonError(409, 'נוסח ההסכמה התעדכן. רעננו את הדף ואשרו מחדש.');
  if (!(await verifyCaptcha(data.turnstile, ip))) return jsonError(400, ERR.spam);

  const db = getDb();
  if (!db) return jsonError(503, ERR.unavailable);

  const type = data.type as LeadType;
  const partners = await eligiblePartners(type);
  if (!partners.length) {
    // never fake routing: nothing is stored or forwarded when no verified licensed partner exists
    return NextResponse.json({ ok: false, status: 'waitlist', error: 'בקרוב: כרגע אין שותף מורשה מאומת לסוג פנייה זה, ולכן הפנייה לא נשלחה.' }, { status: 200, headers: { 'cache-control': 'no-store' } });
  }
  const partner = partners[0];

  const { type: _t, consent: _c, consentVersion, website: _w, turnstile: _ts, ...rest } = data as Record<string, unknown> & typeof data;
  void _t; void _c; void _w; void _ts;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) clean[k] = typeof v === 'string' ? sanitizeText(v, 300) : v;

  const [row] = await db.insert(schema.leads).values({
    type, payloadJson: encryptPayload(clean), consentTextVersion: String(consentVersion), consentTs: new Date(),
    partnerId: partner.id, status: 'queued', ipHash: hashWithSalt(ip), uaHash: hashWithSalt(ua),
  }).returning({ id: schema.leads.id });

  let status: 'sent' | 'failed' = 'failed';
  if (partner.webhookUrl) {
    try {
      const res = await fetch(partner.webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: row.id, type, fields: clean, consent: { textVersion: consentVersion, ts: new Date().toISOString() } }),
        signal: AbortSignal.timeout(6000),
      });
      status = res.ok ? 'sent' : 'failed';
    } catch {
      status = 'failed';
    }
  }
  await db.update(schema.leads).set({ status }).where(eq(schema.leads.id, row.id));
  const email = typeof clean.email === 'string' ? clean.email : '';
  if (email && status === 'sent') await sendMail(leadConfirmMail(email));
  await db.insert(schema.auditLog).values({ actor: 'system', action: 'lead.created', entity: 'lead', entityId: row.id, meta: { type, partnerId: partner.id, status } });
  // no payload is ever logged
  return jsonOk({ status: status === 'sent' ? 'sent' : 'queued' });
}
