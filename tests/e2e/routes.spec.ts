import { test, expect } from '@playwright/test';

test('/go/<provider> → 302 to the official site, noindex, no-store; unknown → 404', async ({ request }) => {
  const res = await request.get('/go/green_invoice?p=/compare/green-invoice-vs-morning&s=AFF-1', { maxRedirects: 0 });
  expect(res.status()).toBe(302);
  expect(res.headers()['location']).toMatch(/^https:\/\//);
  expect(res.headers()['x-robots-tag']).toContain('noindex');
  expect(res.headers()['cache-control']).toContain('no-store');
  expect((await request.get('/go/not_a_provider', { maxRedirects: 0 })).status()).toBe(404);
});

test('/api/og renders a PNG (Hebrew, RTL)', async ({ request }) => {
  const res = await request.get('/api/og?type=compare&slug=green-invoice-vs-morning');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
  expect((await res.body()).length).toBeGreaterThan(8000);
});

test('robots.txt: allows render assets, disallows /go/ & /api/, allows Mediapartners-Google, no /_next/ block', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).not.toMatch(/Disallow:\s*\/_next/);
  expect(txt).toContain('Disallow: /go/');
  expect(txt).toContain('Disallow: /api/');
  expect(txt).toContain('Allow: /api/og');
  expect(txt).toMatch(/User-agent: Mediapartners-Google\s+Allow: \//);
  expect(txt).toContain('Sitemap:');
});

test('sitemap index + split sitemaps are valid XML with lastmod', async ({ request }) => {
  const idx = await (await request.get('/sitemap.xml')).text();
  expect(idx).toContain('<sitemapindex');
  for (const name of ['sitemap-content.xml', 'sitemap-calculators.xml', 'sitemap-pages.xml', 'sitemap-images.xml']) {
    expect(idx).toContain(name);
    const res = await request.get(`/${name}`);
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('<urlset');
    expect((xml.match(/<loc>/g) ?? []).length).toBeGreaterThan(3);
    if (name !== 'sitemap-images.xml') expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  }
  const content = await (await request.get('/sitemap-content.xml')).text();
  expect(content).not.toContain('/go/');
  expect(content).not.toContain('/tax-year/');
});

test('llms.txt, feed.xml, ads.txt respond', async ({ request }) => {
  expect((await request.get('/llms.txt')).status()).toBe(200);
  const feed = await (await request.get('/feed.xml')).text();
  expect(feed).toContain('<rss');
  expect(feed).toContain('<language>he-IL</language>');
  expect((await request.get('/ads.txt')).status()).toBe(200);
});

test('redirects from seo/redirects.json: reversed compare slug → 301; trailing slash stripped', async ({ request }) => {
  const r = await request.get('/compare/green-invoice-vs-icount', { maxRedirects: 0 });
  expect(r.status()).toBe(301);
  expect(r.headers()['location']).toContain('/compare/icount-vs-green-invoice');
  const t = await request.get('/about/', { maxRedirects: 0 });
  expect([307, 308]).toContain(t.status());
});

test('security headers present; CSP is report-only', async ({ request }) => {
  const h = (await request.get('/')).headers();
  expect(h['strict-transport-security']).toBeTruthy();
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['permissions-policy']).toBeTruthy();
  expect(h['content-security-policy-report-only']).toBeTruthy();
});

test('deferred routes are not generated (no thin pages)', async ({ request }) => {
  expect((await request.get('/tax-year/2026')).status()).toBe(404);
  expect((await request.get('/news/anything')).status()).toBe(404);
});

test('JSON-LD on representative pages parses and has no rating markup', async ({ page }) => {
  for (const [path, expectTypes] of [
    ['/', ['Organization', 'WebSite']],
    ['/compare/green-invoice-vs-morning', ['BlogPosting', 'BreadcrumbList', 'ItemList', 'FAQPage']],
    ['/calculators/vat', ['WebApplication', 'BreadcrumbList', 'FAQPage']],
    ['/guides/setup/open-osek-patur', ['BlogPosting', 'BreadcrumbList']],
    ['/category/invoicing', ['CollectionPage', 'ItemList', 'BreadcrumbList']],
  ] as [string, string[]][]) {
    await page.goto(path);
    const blocks = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => e.textContent ?? ''));
    const parsed = blocks.map((b) => JSON.parse(b) as { '@type': string });
    const types = parsed.map((p) => p['@type']);
    for (const t of expectTypes) expect(types, `${path} ${t}`).toContain(t);
    expect(blocks.join('')).not.toMatch(/aggregateRating|reviewRating|"Review"/);
  }
});
