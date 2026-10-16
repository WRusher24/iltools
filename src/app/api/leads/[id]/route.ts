import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db/client';
import { env } from '@/server/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Deletion endpoint (privacy-policy data-subject right). Authorised by ADMIN_DELETE_TOKEN (operator acts on a verified request
 * received via /contact). Soft-deletes immediately (payload overwritten); the retention cron purges the row after 30 days.
 */
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const e = env();
  if (!e.ADMIN_DELETE_TOKEN || req.headers.get('authorization') !== `Bearer ${e.ADMIN_DELETE_TOKEN}`) return new NextResponse('unauthorized', { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ ok: false }, { status: 400 });
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: 'no database' }, { status: 503 });
  const res = await db.update(schema.leads).set({ deletedAt: new Date(), payloadJson: {}, ipHash: null, uaHash: null }).where(eq(schema.leads.id, id)).returning({ id: schema.leads.id });
  await db.insert(schema.auditLog).values({ actor: 'operator', action: 'lead.deleted', entity: 'lead', entityId: id });
  return NextResponse.json({ ok: res.length > 0 });
}
