# Architecture

**Stack:** Next.js 16 (App Router, RSC, Turbopack) · React 19 · TypeScript strict · Tailwind CSS 4 (logical properties only) · Zod 4 · Drizzle ORM + `postgres` driver (Neon primary, Supabase via `DATABASE_URL`) · Vitest · Playwright + axe · pnpm 10 · Node 22.

## Data flow
Everything public is **static**: `content/**/*.mdx` (Agent 3) + `data/**` (Agent 2) + `seo/**` (Agent 5) + `data/legal/legal-texts.json` (Agent 4) are read at build time (`src/lib/content.ts`, `src/lib/data.ts`). ISR (`revalidate`) is set on every template. The database is **optional** and holds operational data only (clicks, leads, consent, newsletter) plus a mirror of `/data` for querying (`pnpm db:seed`). No page needs the DB to render.

```
content/*.mdx ─▶ gray-matter + Zod ─▶ unified (remark-gfm + token plugin) ─▶ hast ─▶ React (server components)
                                              │ {{slot|aff|sponsored|link|chart|calc|sources|updated}} → il-token → src/components/content/Tokens.tsx
data/legal/legal-texts.json ─▶ src/lib/legal.ts (placeholder substitution, owner blanks) ─▶ <LegalBlock>/<AffiliateStrip>/…
seo/url-map.json ─▶ src/lib/seo.ts (metadata, JSON-LD) · seo/redirects.json ─▶ next.config.mjs + vercel.json · seo/internal-links.json ─▶ related links
src/lib/calc/* (pure TS) ◀── data/rates/<year>.json via src/generated/rates-index.ts (scripts/prebuild.mjs) ── src/components/calc/* (client UI)
```

## Deviations from the brief (all deliberate)
1. **Markdown pipeline instead of MDX compilation.** Content files are `.mdx` but contain no JSX — only Markdown + `{{tokens}}` + HTML-comment markers. MDX would treat `{{…}}` as JS expressions. We parse with remark (GFM), convert tokens to custom elements and render with server components. No content can execute code; unresolved tokens **throw at build** (`src/components/content/Tokens.tsx`, plus `pnpm content:tokens` which checks all 127 pages).
2. **CSP is Report-Only with `'unsafe-inline'` scripts.** Nonce-based CSP forces every page to render dynamically (kills static/ISR + Core Web Vitals). Phase 1: `Content-Security-Policy-Report-Only` (next.config.mjs) with host allow-lists for the consented Google endpoints; reports are logged by `/api/csp-report`. **Tightening step:** after a clean report period, add `proxy.ts` that issues a nonce + `'strict-dynamic'` for the few dynamic routes, and move static pages to hash-based script allow-listing (Next `experimental.sri`), then switch the header to enforcing.
3. **robots.txt:** the template's `Disallow: /_next/` is **not published** (blocks render-critical JS/CSS); `Allow: /api/og` is added so social crawlers can fetch OG images although `/api/` is disallowed. Non-production hosts serve `Disallow: /`.
4. **Redirects:** from `seo/redirects.json` into `next.config.mjs` and a generated `vercel.json` (`node scripts/gen-vercel-json.mjs`, CI `--check`). `permanent:false` ⇒ 302. The trailing-slash catch-all rule is **not** emitted (`trailingSlash:false` does it). `/tax-year/current → /tax-year/2026` is not emitted (that route is deferred; it would only create a 404 chain). `host_level`: www→apex is a host-conditional redirect; http→https is the platform's.
5. **Dark theme:** not shipped (optional in the brief); light theme only, AA contrast verified by axe.
6. **Query-string noindex for calculator states:** pages are static, so state URLs are not server-detectable. Mitigation: canonical is always the base path; robots.txt disallows the known state parameters. Residual: see BLOCKERS B-17.
7. **Scores:** the scoring engine (`src/lib/scoring.ts`, published 30/30/15/15/10 formula) exists and is tested, but **no sub-scores exist in `/data`**, so no editorial scores are displayed (nothing invented). Comparison tables show published data only.
8. **Fonts:** Heebo (+Assistant for headings) woff2 files are committed in `src/fonts` and loaded with `next/font/local` (no build-time network access to Google Fonts). OG images use the Heebo woff files in `src/assets`.

## Key modules
- `src/lib/markdown.tsx` – token plugin, section splitter · `src/components/content/ContentPage.tsx` – editorial template (legal blocks, AD placement rules, TOC, related links, JSON-LD) · `CalculatorPage.tsx` – calculator template (hides authoring scaffolding sections, extracts the 3 CALC-RESULT-CTA variants).
- **Legal:** `src/lib/legal.ts` (verbatim texts, `{date}`/`{sources}`/`{{לינק_…}}`/`{{תאריך_עדכון_אחרון}}` substitution, `data/legal/owner-facts.json` fills `[...]` blanks, unfilled blanks are highlighted and the page shows a draft banner) · `/legal/[doc]` built from each text's `placement`.
- **Monetisation:** `AdSlot` (consent-gated, lazy, reserved height; slots only render with `NEXT_PUBLIC_ADSENSE_*`), `Affiliate.tsx` (`/go/[slug]` links, `rel="sponsored nofollow noopener"`, in-card "שותף"/"ממומן" badge), `AffiliateStrip` (DISC-AFFILIATE-STRIP above the fold), regulated pages render a non-affiliate module instead of AFF-1 (CONFLICTS_LOG #1, rule L-UI-07). Ad placement rules are centralised in `ContentPage` + `src/config/ads.ts` (never above H1, none in calculator inputs, AD-3 only where the page declares it).
- **Affiliate config** (`data/internal/affiliate_programs.json`, currently empty): array (or `{programs: []}`) of `{provider_id, network, destination_url, params, status}`. Empty ⇒ `/go/<provider>` redirects (302, logged) to the provider's official website with no commission parameters.
- **Leads:** `/api/lead` — CSRF (origin + custom header + JSON), honeypot, Turnstile hook, rate limit, Zod, **routes only to `lead_partners` that are `active` AND licence-verified (≤12 months) AND cover the lead type**; otherwise the page shows the "בקרוב" variant and the API stores/forwards nothing. Personal fields are AES-GCM encrypted (`ENCRYPTION_KEY`); ip/ua are salted-hashed with a daily rotating salt; payloads are never logged. `DELETE /api/leads/:id` + `/api/cron/retention`.
- **Newsletter:** double opt-in (`/api/newsletter/subscribe|confirm|unsubscribe`, RFC 8058 one-click POST), subscriber is active only after confirmation.
- **Consent:** `ConsentManager` — categories necessary/analytics/advertising/affiliate, all OFF by default, stored in `localStorage["il_consent"]` (+cookie `il_consent`), Consent Mode v2, GA4 and AdSense scripts are injected only after consent, anonymous consent log via `/api/consent` (anon_id only).
- **SEO:** `src/lib/seo.ts` (title ≤60 + conditional brand suffix, canonical, robots, OG/Twitter, JSON-LD: Organization, WebSite+SearchAction, BreadcrumbList, BlogPosting, WebApplication, CollectionPage/WebPage, ItemList, FAQPage; **never** Review/AggregateRating/HowTo/Product). Sitemaps are split (`/sitemap.xml` index → content, calculators, pages, images), `/feed.xml`, `/llms.txt`, `/ads.txt`, `/sitemap-html`, `/search` (client-side Fuse over `/search-index.json`).

## Security checklist
Env validated at boot · secrets only from env · AES-GCM field encryption · salted ip/ua hashes · security headers (HSTS, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options, COOP) · CSP report-only · CSRF + honeypot + rate limit on every write endpoint · `/go` never takes a destination from the query string (no open redirect) · `pnpm audit` in CI · least-privilege DB: create a role with only `SELECT/INSERT/UPDATE/DELETE` on the app tables (no DDL); run `db:migrate` with a separate owner role.
