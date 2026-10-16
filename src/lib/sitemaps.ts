import { allContent } from './content';
import { urlMapByPath } from './content';
import { absoluteUrl } from './seo';
import { siteUrl } from './site';
import { FOOTER_LEGAL } from '@/config/nav';
import { GUIDE_CLUSTERS } from './content';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

export interface Entry { path: string; lastmod: string; title?: string }

const maxDate = (ds: string[]) => ds.sort().at(-1) ?? new Date().toISOString().slice(0, 10);

export function contentEntries(): Entry[] {
  return allContent().filter((c) => ['article', 'guide', 'compare', 'best', 'review', 'category'].includes(c.fm.type)).map((c) => ({ path: c.path, lastmod: c.fm.updated }));
}
export function calculatorEntries(): Entry[] {
  return allContent().filter((c) => c.path.startsWith('/calculators/') || c.path.startsWith('/tools/')).map((c) => ({ path: c.path, lastmod: c.fm.updated }));
}
export function pageEntries(): Entry[] {
  const all = allContent();
  const pages = all.filter((c) => c.fm.type === 'page').map((c) => ({ path: c.path, lastmod: c.fm.updated }));
  const latest = maxDate(all.map((c) => c.fm.updated));
  const hubs = ['/compare', '/best', '/reviews', '/category', '/guides', '/articles', '/calculators', '/tools'].map((h) => ({
    path: h,
    lastmod: maxDate(all.filter((c) => c.path.startsWith(`${h}/`)).map((c) => c.fm.updated)),
  }));
  const clusters = Object.keys(GUIDE_CLUSTERS).map((k) => ({ path: `/guides/${k}`, lastmod: maxDate(all.filter((c) => c.path.startsWith(`/guides/${k}/`)).map((c) => c.fm.updated)) }));
  const legal = FOOTER_LEGAL.filter((l) => l.href.startsWith('/legal/')).map((l) => ({ path: l.href, lastmod: latest }));
  return [...pages, ...hubs, ...clusters, ...legal, { path: '/sitemap-html', lastmod: latest }];
}

export function urlset(entries: Entry[]): string {
  const rows = entries.map((e) => `  <url><loc>${esc(absoluteUrl(e.path))}</loc><lastmod>${e.lastmod}</lastmod></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

export function imageUrlset(): string {
  const map = urlMapByPath();
  const rows = allContent().map((c) => {
    const e = map.get(c.path);
    if (!e) return '';
    return `  <url><loc>${esc(absoluteUrl(c.path))}</loc><image:image><image:loc>${esc(`${siteUrl()}${e.og.image}`)}</image:loc><image:title>${esc(e.title)}</image:title><image:caption>${esc(e.description)}</image:caption></image:image></url>`;
  }).filter(Boolean).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${rows}\n</urlset>\n`;
}

export function sitemapIndex(): string {
  const all = allContent();
  const latest = maxDate(all.map((c) => c.fm.updated));
  const names = ['sitemap-content.xml', 'sitemap-calculators.xml', 'sitemap-pages.xml', 'sitemap-images.xml'];
  const rows = names.map((n) => `  <sitemap><loc>${siteUrl()}/${n}</loc><lastmod>${latest}</lastmod></sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</sitemapindex>\n`;
}

export const xml = (body: string) => new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600, s-maxage=86400' } });
export { esc };
