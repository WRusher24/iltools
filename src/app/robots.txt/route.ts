import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isProductionSite, siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * robots.txt from seo/robots.txt.template with two deliberate changes (documented in docs/engineering/ARCHITECTURE.md):
 *  - `Disallow: /_next/` is NOT published (it would block render-critical JS/CSS from Googlebot);
 *  - `Allow: /api/og` so social crawlers can fetch OG images although /api/ is disallowed.
 * Non-production hosts serve a blanket Disallow.
 */
export function GET() {
  const headers = { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' };
  if (!isProductionSite()) return new Response('User-agent: *\nDisallow: /\n', { headers });
  const tpl = readFileSync(join(process.cwd(), 'seo/robots.txt.template'), 'utf8');
  const lines = tpl.split('\n').filter((l) => l.trim() !== 'Disallow: /_next/');
  const out: string[] = [];
  for (const l of lines) {
    out.push(l);
    if (l.trim() === 'Disallow: /api/') out.push('Allow: /api/og');
  }
  const body = out.join('\n').replace(/https:\/\/il-tools\.co\.il/g, siteUrl());
  return new Response(body, { headers });
}
