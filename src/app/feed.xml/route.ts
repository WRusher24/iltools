import { allContent } from '@/lib/content';
import { urlMapByPath } from '@/lib/content';
import { absoluteUrl } from '@/lib/seo';
import { siteUrl, SITE } from '@/lib/site';
import { esc } from '@/lib/sitemaps';

export const dynamic = 'force-static';

export function GET() {
  const map = urlMapByPath();
  const items = allContent()
    .filter((c) => ['article', 'guide'].includes(c.fm.type))
    .sort((a, b) => b.fm.updated.localeCompare(a.fm.updated) || a.path.localeCompare(b.path))
    .slice(0, 30)
    .map((c) => {
      const e = map.get(c.path);
      return `    <item><title>${esc(e?.title ?? c.fm.title)}</title><link>${esc(absoluteUrl(c.path))}</link><guid isPermaLink="true">${esc(absoluteUrl(c.path))}</guid><pubDate>${new Date(`${c.fm.updated}T08:00:00Z`).toUTCString()}</pubDate><description>${esc(e?.description ?? c.fm.description)}</description></item>`;
    })
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>\n    <title>${SITE.name} — מדריכים ומאמרים</title><link>${siteUrl()}</link><description>${esc(SITE.tagline)}</description><language>he-IL</language><atom:link href="${siteUrl()}/feed.xml" rel="self" type="application/rss+xml"/>\n${items}\n</channel></rss>\n`;
  return new Response(body, { headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, max-age=3600, s-maxage=86400' } });
}
