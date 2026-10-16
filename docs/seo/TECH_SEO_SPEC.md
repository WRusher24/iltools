# TECH_SEO_SPEC — Technical SEO (Agent 5 → Agent 6)

**Artifacts:** `seo/robots.txt.template`, `seo/llms.txt`, `seo/redirects.json`, `seo/url-map.json`, `seo/internal-links.json`, `seo/schema/*.json`.

---

## 1. Rendering

- **SSG/ISR** for content: articles, guides, compare, best, reviews, categories (revalidate on content commit; ISR tags per category).
- **Calculators/tools:** server-render the **shell** (H1, intro, FAQ, assumptions, disclaimer, data-source stamps) and hydrate the interactive part. **No content may be behind client-only JS.**
- **Query-string states** (`?income=…&type=…`) are client-side only, `noindex, follow`, canonical to the base calculator. Never server-render indexable state pages.
- Sitemaps and `lastmod` derive from the content `updated` field.

## 2. Core Web Vitals budget & ad tactics

| Metric | Budget |
|---|---|
| LCP (mobile) | < 2.0s |
| CLS | < 0.05 |
| INP | < 200ms |

- **Ad slots reserve height** (`min-height` per breakpoint) so lazy-loaded AdSense causes no CLS.
- **Lazy-load AdSense** below the fold; **auto-ads OFF**; manual placement only; consent-gated.
- **Defer affiliate widgets** and any third-party scripts until interaction/consent.
- `preconnect` to AdSense + analytics origins only after consent; **preload the Heebo subset** (Hebrew + Latin + digits), `font-display: swap`.
- Images: **AVIF/WebP** with width/height attributes; charts as inline SVG (no layout shift).
- **Consent banner must not shift layout** — reserve its space or overlay without reflow; document the chosen approach.

## 3. robots.txt

From `seo/robots.txt.template`:
- Allow public; **disallow** `/go/`, `/api/`, `/lead/*/thanks`, calculator query-param states, tracking params (`utm_*`), `/search`, `/_next/`.
- **Allow `Mediapartners-Google`** (AdSense crawler) explicitly.
- Optional opt-out of AI *training* crawlers (GPTBot/CCBot) while keeping AI *answer-engine* crawlers (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot) that cite the site.
- **Staging:** any non-production host serves `User-agent: *` + `Disallow: /` and an `X-Robots-Tag: noindex` header.

## 4. Sitemaps, feeds, discovery

- **Split sitemaps** with a `/sitemap.xml` index:
  `sitemap-content.xml` (articles, guides, compare, best, reviews, categories) · `sitemap-calculators.xml` · `sitemap-pages.xml` (static + legal) · `sitemap-images.xml` (image entries with Hebrew captions/titles) · `sitemap-news.xml` (optional, only once `/news` has content).
- **`lastmod`** from the page `updated` stamp. Never fake `lastmod`.
- **RSS** at `/feed.xml` (latest articles/guides). **`/llms.txt`** from `seo/llms.txt` (machine-readable summary + key URLs for AI answer engines).
- **`/sitemap-html`** crawlable HTML sitemap.

## 5. Canonicalisation & host

- HTTP → HTTPS (301); `www.il-tools.co.il` → `il-tools.co.il` (apex canonical, 301); trailing slash → none (301).
- `<link rel="canonical">` absolute, self-referencing on every indexable page.
- 404 for missing; **410 Gone** for permanently removed content; avoid soft-404s (return proper status).
- **Security headers:** HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a **CSP compatible with AdSense/GA** (nonce-based; start report-only then tighten).

## 6. Thin / programmatic page policy

- Programmatic pages (salary levels, turnover segments) ship **only** when each has unique computed numbers, a table and a recommendation rationale — otherwise `noindex`.
- Zero-value facets (`?topic=`, `?page=` beyond real pagination) → `noindex, nofollow`.
- `/tax-year/*` and `/news/*` → **not generated / `noindex`** until real content exists (thin-page threshold).

## 7. Hebrew-specific

- UTF-8 everywhere + `<meta charset="utf-8">`; `<html lang="he" dir="rtl">`.
- No bidi bugs in headings, tables or mixed Hebrew/English/digit strings — isolate numbers/₪/brand names with `<bdi>`.
- Number/currency formatting: `Intl.NumberFormat('he-IL', {style:'currency', currency:'ILS'})`; percentages formatted consistently.
- **Hebrew breadcrumbs** in both the visible trail and `BreadcrumbList`.
- **No keyword-stuffed Hebrew URLs** — URLs stay Latin slugs; Hebrew belongs in title/H1/body.

## 8. Analytics & measurement plan

- **Google Search Console:** domain property for `il-tools.co.il`; verify via DNS TXT; submit the sitemap index.
- **Bing Webmaster Tools:** import from GSC; submit sitemaps.
- **GA4 events** (consent-gated; consent-mode v2 semantics):
  `calculator_start`, `calculator_complete`, `affiliate_click {provider, slot, page_type}`, `lead_submit {type}`, `share_click`, `adslot_view`.
  First-party `/go/[slug]` click logging (no raw IP storage) backs affiliate measurement.
- **Looker Studio:** one dashboard — organic sessions by template, top-50 query positions, calculator start→complete rate, affiliate CTR by page type, lead conversion, RPM by template, CWV pass rate.
- **Consent:** all non-essential measurement/ad scripts load only after consent, per `LEGAL_COMPLIANCE.md` (cookie policy + CMP).

## 9. Definition of done for Agent 6

- Rendered pages: correct canonical, robots, OG (+ dynamic OG for calculator results with Hebrew RTL font), JSON-LD per `SCHEMA_SPEC.md`, Hebrew breadcrumbs.
- Sitemaps/robots/RSS/llms.txt served and validating; redirects from `seo/redirects.json` live.
- Lighthouse CI thresholds (perf ≥ 0.85, a11y ≥ 0.95, SEO ≥ 0.95, best-practices ≥ 0.9) enforced on key templates.
- `scripts/seo-lint.mjs` wired into CI and passing.
