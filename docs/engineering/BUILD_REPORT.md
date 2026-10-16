# BUILD_REPORT — verification run (2026-10-16, Linux, Node 22.22, pnpm 10.28, Next 16.4.2)

Run with **no database and no secrets** (env empty). Raw results:

| Step | Command | Result |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | OK (lockfile committed) |
| Types | `pnpm typecheck` | OK (strict) |
| Lint | `pnpm lint` (ESLint 9 + `eslint-config-next` + logical-CSS guard) | 0 errors, 2 warnings (unused vars inside Agent 3/5 scripts, left untouched) |
| Unit/property tests | `pnpm test` (Vitest) | **8 files, 172 tests passed** — 150 calculator tests (fixtures, K1 hand computation, per-calculator cases, fast-check properties, server-render of all 19 UIs) + 22 lib/API tests (token scanner, scoring, legal placeholder substitution, lead schema/consent, CSRF, rate-limit, AES-GCM, `/go` logging without IP/UA, LeadForm SSR) |
| Content QA | `pnpm content:validate` (`scripts/content-qa.mjs`) | BLOCKERS: 0 (numeral warnings = documented examples) |
| Tokens | `pnpm content:tokens` | 127 pages, 0 unresolved tokens/sources/links/charts/slots/legal ids; 1 note (regulated AFF-1 → non-affiliate module) |
| Legal lint | `pnpm legal:lint` | **0 BLOCKER / 14 HIGH** (as expected; recorded in BLOCKERS B-11, not failing) |
| SEO lint | `pnpm seo:lint` | 0 failures, 0 warnings (1309 link targets) |
| Rates | `pnpm rates:check` | OK; 2 low-confidence sections reported (keren_hishtalmut, pension) |
| vercel.json | `node scripts/gen-vercel-json.mjs --check` | up to date (12 redirect rules, crons, `fra1`) |
| Build | `pnpm build` | OK — 165 pages prerendered (SSG/ISR), dynamic: `/go/[slug]`, `/api/*`, `/robots.txt`, `/ads.txt` |
| E2E + axe | `pnpm test:e2e` (Playwright, desktop 1280 + mobile 360) | **70 passed** |

## What the E2E suite asserts (against `next start`)
- `html[lang=he][dir=rtl]`, one `<h1>`, footer present, **no horizontal overflow at 360px**, **axe WCAG 2.0/2.1 A+AA with zero violations** on 17 templates × 2 viewports (home, compare, regulated compare, best, review, category, guide, article, 2 calculators, tool, lead, 2 legal pages, hub, search, 404).
- Footer contains the exact `DISC-GENERAL`; all 8 legal links + cookie-preferences link; affiliate strip above the fold with the exact `DISC-AFFILIATE-STRIP`; `DISC-COMPARE`, `DISC-EDITORIAL-INDEPENDENCE`, `DISC-PENSION`; real dates in the `DISC-RATES-DATE` stamp (no raw `{date}`/`{sources}`/`{{…}}`).
- Regulated compare page: no strip, no `rel=sponsored`, no top-pick card (rule L-UI-07 / CONFLICTS_LOG #1).
- Consent banner: exact `LEGAL-COOKIE-BANNER` text, all categories off, **zero Google requests before consent**, choice persisted, re-openable from the footer.
- Calculator modal: exact `DISC-CALC-TAX` text, `role=dialog aria-modal`, Esc closes, `il_calc_disc_TAX={version,date}`, persistent line near result, re-prompt on version change.
- 6 `/legal/*` routes verbatim; lead pages show "בקרוב" with no form when no verified partner exists.
- `/go/<provider>` → 302, `x-robots-tag: noindex`, `no-store`; unknown → 404. `/api/og` returns a PNG (visually verified: Hebrew shaped RTL — see `screenshots/og-compare.png`; Satori has no bidi engine, so text is converted to visual order in `src/app/api/og/route.tsx`).
- robots.txt (no `/_next/` block, `Allow: /api/og`, `Mediapartners-Google` allowed), split sitemaps with `lastmod` (no `/go/`, no `/tax-year/`), `llms.txt`, `feed.xml`, `ads.txt`; redirects (reversed compare slug → 301, trailing slash stripped); security headers + report-only CSP; deferred `/tax-year/*`, `/news/*` → 404.
- JSON-LD parsed on 5 pages (`/`, compare, calculator, guide, category): expected types present (Organization, WebSite, BreadcrumbList, BlogPosting, ItemList, FAQPage, WebApplication, CollectionPage) and **no** `aggregateRating`/`reviewRating`/`Review`.

Screenshots (JPEG, mobile 360 + desktop 1280): `docs/engineering/screenshots/` — home, compare, regulated compare, calculator (+ disclaimer modal), guide, article with chart, legal page, lead page, OG image. Regenerate with `node scripts/take-screenshots.mjs` (server on :3100).

## NOT done / NOT verified (honest list — full detail in BLOCKERS.md)
- Lighthouse CI thresholds were **not run** here (configured for CI). Core Web Vitals not measured.
- Database-backed paths (lead storage/routing, newsletter DOI, click DB, consent log) were **not exercised against a live Postgres**; migration SQL is generated but unapplied.
- AdSense/GA/Turnstile/Resend/Upstash behaviour not verified (no credentials).
- Manual keyboard-only and screen-reader walkthrough, and the formal IS 5568 audit: not done.
- Calculators K2–K12 and the extra tools have no research spec/fixture; the single K1 fixture contradicts the rates file (details B-1…B-4). Legal `[...]` blanks are unfilled (owner).
