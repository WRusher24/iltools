import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db/client';
import { affiliatePrograms, providerIndex } from '@/lib/data';
import { hashWithSalt } from '@/server/crypto';
import { clientIp } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SLOT_RE = /^[A-Za-z0-9-]{1,24}$/;

function safeUrl(u: string | null | undefined): URL | null {
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

/**
 * Tracked affiliate redirect (302). Destinations come ONLY from the affiliate config (DB or data/internal/affiliate_programs.json)
 * or the provider's official website — never from the query string (no open redirect). Logs a click without any IP.
 */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const sp = new URL(req.url).searchParams;
  const page = (sp.get('p') ?? '').startsWith('/') ? (sp.get('p') ?? '').slice(0, 200) : '';
  const slot = SLOT_RE.test(sp.get('s') ?? '') ? sp.get('s')! : 'unknown';
  const provider = providerIndex().get(slug);
  if (!provider || !/^[a-z0-9_-]+$/.test(slug)) {
    return new NextResponse('הקישור לא נמצא', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex, nofollow' } });
  }

  const db = getDb();
  let dest: URL | null = null;
  let network: string | undefined;
  let params: Record<string, string> = {};
  if (db) {
    try {
      const row = (await db.select().from(schema.affiliateLinks).where(eq(schema.affiliateLinks.slug, slug)).limit(1))[0];
      if (row && row.status === 'active') { dest = safeUrl(row.destinationUrl); network = row.network ?? undefined; }
    } catch { /* DB trouble must never break the redirect */ }
  }
  if (!dest) {
    const prog = affiliatePrograms().find((a) => a.provider_id === slug && (a.status ?? 'active') === 'active');
    if (prog) { dest = safeUrl(prog.destination_url); network = prog.network; params = prog.params ?? {}; }
  }
  const isAffiliate = !!dest;
  if (!dest) dest = safeUrl(provider.website); // no program configured → plain official site (no commission params)
  if (!dest) return new NextResponse('היעד אינו זמין', { status: 404, headers: { 'x-robots-tag': 'noindex, nofollow' } });

  if (isAffiliate) {
    for (const [k, v] of Object.entries(params)) dest.searchParams.set(k, v);
    // sub-id carries only page + slot (no user identifiers)
    dest.searchParams.set('sub_id', `${page || 'direct'}|${slot}`.slice(0, 120));
  }

  const ref = req.headers.get('referer');
  let referrerHost: string | null = null;
  try { referrerHost = ref ? new URL(ref).host : null; } catch { /* ignore */ }
  const click = { provider_slug: slug, slot_id: slot, page, referrer_host: referrerHost, network: network ?? null, affiliate: isAffiliate };
  if (db) {
    try {
      await db.insert(schema.clickEvents).values({
        providerSlug: slug, slotId: slot, page, referrerHost,
        sessionHash: hashWithSalt(`${clientIp(req)}|${req.headers.get('user-agent') ?? ''}`),
      });
    } catch { /* ignore */ }
  } else {
    console.info(JSON.stringify({ evt: 'affiliate_click', ...click, ts: new Date().toISOString() })); // structured, no IP/UA
  }
  return NextResponse.redirect(dest, { status: 302, headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } });
}
