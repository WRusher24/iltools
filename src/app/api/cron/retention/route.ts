import { NextResponse } from 'next/server';
import { and, isNull, lt, sql, isNotNull } from 'drizzle-orm';
import { getDb, schema } from '@/db/client';
import { env } from '@/server/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Vercel Cron (Authorization: Bearer $CRON_SECRET). Lead retention + unconfirmed-subscriber cleanup per the privacy policy. */
export async function GET(req: Request) {
  const e = env();
  if (!e.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${e.CRON_SECRET}`) return new NextResponse('unauthorized', { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ ok: true, skipped: 'no database configured' });
  const out: Record<string, unknown> = {};

  // 1. soft-deleted leads are purged after 30 days
  const purged = await db.delete(schema.leads).where(and(isNotNull(schema.leads.deletedAt), lt(schema.leads.deletedAt, sql`now() - interval '30 days'`))).returning({ id: schema.leads.id });
  out.purgedSoftDeleted = purged.length;

  // 2. retention: only when the owner has set LEAD_RETENTION_DAYS (the retention period is an owner/attorney decision — see BLOCKERS.md)
  if (e.LEAD_RETENTION_DAYS) {
    const cutoff = new Date(Date.now() - e.LEAD_RETENTION_DAYS * 86_400_000);
    const gone = await db.delete(schema.leads).where(and(isNull(schema.leads.deletedAt), lt(schema.leads.createdAt, cutoff))).returning({ id: schema.leads.id });
    out.purgedExpiredLeads = gone.length;
  } else out.retention = 'LEAD_RETENTION_DAYS not configured — no expiry applied';

  // 3. subscribers that never confirmed within 7 days
  const stale = await db.delete(schema.newsletterSubscribers).where(and(isNull(schema.newsletterSubscribers.confirmedAt), lt(schema.newsletterSubscribers.createdAt, sql`now() - interval '7 days'`))).returning({ id: schema.newsletterSubscribers.id });
  out.purgedUnconfirmedSubscribers = stale.length;

  // 4. click events and consent logs keep 13 months
  await db.delete(schema.clickEvents).where(lt(schema.clickEvents.ts, sql`now() - interval '13 months'`));
  await db.delete(schema.consentLog).where(lt(schema.consentLog.ts, sql`now() - interval '13 months'`));
  await db.insert(schema.auditLog).values({ actor: 'cron', action: 'retention.run', meta: out });
  return NextResponse.json({ ok: true, ...out });
}
