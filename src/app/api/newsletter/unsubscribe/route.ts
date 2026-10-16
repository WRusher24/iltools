import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db/client';
import { siteUrl } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function unsubscribe(token: string): Promise<'unsubscribed' | 'invalid' | 'unavailable'> {
  const db = getDb();
  if (!db) return 'unavailable';
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return 'invalid';
  const res = await db.update(schema.newsletterSubscribers).set({ unsubscribedAt: new Date(), doubleOptInToken: null })
    .where(eq(schema.newsletterSubscribers.unsubscribeToken, token)).returning({ id: schema.newsletterSubscribers.id });
  return res.length ? 'unsubscribed' : 'invalid';
}

/** Link click from the email footer. */
export async function GET(req: Request) {
  const state = await unsubscribe(new URL(req.url).searchParams.get('token') ?? '');
  return NextResponse.redirect(`${siteUrl()}/newsletter/${state}`, { status: 303, headers: { 'cache-control': 'no-store' } });
}

/** RFC 8058 one-click unsubscribe (List-Unsubscribe-Post: List-Unsubscribe=One-Click). */
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const state = await unsubscribe(token);
  return NextResponse.json({ ok: state === 'unsubscribed', state }, { status: state === 'unavailable' ? 503 : 200, headers: { 'cache-control': 'no-store' } });
}
