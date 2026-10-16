import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db/client';
import { siteUrl } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const db = getDb();
  let state = 'invalid';
  if (db && /^[A-Za-z0-9_-]{16,64}$/.test(token)) {
    const res = await db.update(schema.newsletterSubscribers).set({ confirmedAt: new Date(), doubleOptInToken: null })
      .where(eq(schema.newsletterSubscribers.doubleOptInToken, token)).returning({ id: schema.newsletterSubscribers.id });
    state = res.length ? 'confirmed' : 'invalid';
  } else if (!db) state = 'unavailable';
  return NextResponse.redirect(`${siteUrl()}/newsletter/${state}`, { status: 303, headers: { 'cache-control': 'no-store' } });
}
