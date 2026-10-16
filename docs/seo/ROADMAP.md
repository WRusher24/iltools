# SEO ROADMAP — IL-Tools (30 / 60 / 90 days + KPIs)

Owner: Agent 5 (hands to the owner/editorial team). This plan assumes the site launches with the 127 committed pages.

---

## 1. Publishing cadence

- **Launch (week 0–2):** all 127 committed pages live; sitemaps/robots/RSS/llms.txt/HTML-sitemap served; GSC + Bing verified; `seo-lint` in CI.
- **Months 1–3:** 2 new data-rich articles/month (from the 24 written + planned swaps), 1 refreshed rate page each January, monthly newsletter; deferred sections (`/tax-year/2026`, `/news`) built **only** with real unique content.
- **Refresh cadence:** every page's `{{updated:…}}` surfaced; **statutory figures rechecked each January** and on any law change; broken-link and cannibalisation audit monthly.

## 2. KPI definitions & targets

| KPI | Definition | 30-day target | 60-day | 90-day |
|---|---|---|---|---|
| Indexed pages | Pages "Valid" in GSC | ≥ 90 | ≥ 120 | ≥ 127 |
| Impressions | GSC impressions / month | baseline | +50% MoM | +100% MoM |
| CTR | GSC clicks / impressions | ≥ 1.5% | ≥ 2.5% | ≥ 3.5% |
| Avg position (top-50 queries) | Mean position of queries ranking ≤ 50 | measure | ≤ 30 | ≤ 20 |
| Calculator completions | GA4 `calculator_complete` / month | ≥ 500 | ≥ 2,000 | ≥ 5,000 |
| Calculator completion rate | `complete` / `start` | ≥ 35% | ≥ 40% | ≥ 45% |
| Affiliate CTR (compare pages) | `affiliate_click` / compare sessions | ≥ 1.5% | ≥ 3% | ≥ 5% |
| Lead conversion | `lead_submit` / form views | ≥ 1% | ≥ 2% | ≥ 3% |
| Pages / session | GA4 | ≥ 1.8 | ≥ 2.0 | ≥ 2.2 |
| RPM by template | revenue / 1,000 sessions | measure | benchmark | benchmark |
| CWV pass rate | URLs rated "Good" | ≥ 80% | ≥ 90% | ≥ 95% |
| Referring domains (earned) | new quality links | baseline | +5 | +15 |

(Volume tiers in `KEYWORD_MAP.csv` are estimates; GSC impressions reclassify them.)

## 3. First-4-weeks monitoring checklist

- [ ] GSC domain property verified (DNS); sitemap index submitted; coverage errors triaged weekly.
- [ ] Bing Webmaster connected; sitemaps submitted.
- [ ] Rich Results Test run on one page per template; zero errors; **zero rating markup**.
- [ ] Dynamic OG image for a calculator result renders Hebrew RTL correctly (visual check).
- [ ] `robots.txt` live and matches the template; `/go/*` returns `noindex` + blocked.
- [ ] Redirects live: reverse-order compares, `/categories/*`, the three disambiguations, trailing slash.
- [ ] Canonicals self-referencing on a sample of 10 pages across types; calculate state params `noindex`.
- [ ] Consent banner blocks GA4/AdSense until consent; no CLS from the banner.
- [ ] Core Web Vitals: LCP/CLS/INP within budget on a mid-range Android over 4G.
- [ ] Hebrew bidi sanity on tables, prices and mixed brand names (no reordered digits/₪).
- [ ] GA4 events firing: `calculator_start`, `calculator_complete`, `affiliate_click{provider,slot,page_type}`, `lead_submit{type}`, `share_click`, `adslot_view`.
- [ ] `scripts/seo-lint.mjs` green in CI; orphan check green.
- [ ] Regulated pages show `DISC-PENSION`; calculators show correct `DISC-CALC-*` modal.

## 4. Workstream owner map

| Workstream | Owner |
|---|---|
| Keyword/target map upkeep | Agent 5 → editorial |
| Frontmatter/title/description hygiene | editorial (lint-enforced) |
| Structured data correctness | Agent 6 (build) + validation |
| Rate freshness (January rollover) | editorial + data |
| Link-building/PR | owner/PR |
| Redirects/sitemaps/CWV | Agent 6 |

## 5. Risks watch-list

Thin programmatic pages (noindex until unique), AdSense limits on finance (keep affiliate/leads primary), and the regulated-activity boundary (educational framing; leads only to licensed partners). Any SEO change touching a regulated page must keep `DISC-PENSION` intact — see conflicts log in `docs/seo/CONFLICTS_LOG.md`.
