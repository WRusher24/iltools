# URL & Information Architecture — IL-Tools (Agent 5)

**Consumer:** Agent 6 (build) · **Machine-readable:** `seo/url-map.json`, `seo/redirects.json`
**Rule of the house:** existing committed slugs are authoritative. This document *refines* them; it never renames them.

---

## 1. Route structure (confirmed and refined)

| Route | Source folder | Template | Notes |
|---|---|---|---|
| `/` | `content/pages/home.mdx` | home | hero, popular tools, latest guides, trust bar |
| `/category/[slug]` | `content/categories/*.mdx` | hub | **folder is `categories/`, route is `/category/` (singular)** |
| `/compare/[slug]` | `content/compare/*.mdx` | compare | slug = `[a]-vs-[b]` |
| `/best/[slug]` | `content/best/*.mdx` | best | "הכי מתאים ל…" |
| `/reviews/[slug]` | `content/reviews/*.mdx` | review | one per provider |
| `/guides/[cluster]/[slug]` | `content/guides/<cluster>/*.mdx` | guide | clusters: setup, tax, pension, banking, ecommerce, tools |
| `/articles/[slug]` | `content/articles/*.mdx` | article | data-rich editorial (+ `.data.json` charts) |
| `/calculators/[slug]` | `content/calculators/*.mdx` | calculator | K1–K12 |
| `/tools/[slug]` | `content/tools/*.mdx` | tool | interactive tools (7) |
| `/lead/[type]` | `content/pages/lead-*.mdx` | lead | `accountant`, `pension-information`, `mortgage-information` |
| `/about` `/methodology` `/editorial-policy` `/advertise` `/contact` | `content/pages/*.mdx` | page | |
| `/legal/*` | legal texts | legal | disclaimer, terms, privacy, affiliate-disclosure, cookies, accessibility |
| `/tax-year/[year]` | — (deferred) | data hub | no content yet |
| `/news/[slug]` | — (deferred) | news | no content yet |
| `/go/[slug]` | — | redirect | tracked outbound; `noindex, nofollow`, robots-disallowed |
| `/sitemap.xml` (split), `/robots.txt`, `/llms.txt`, `/feed.xml`, `/sitemap-html` | generated | — | |

> The `category` and `tools` **folders are plural** (`content/categories/`, `content/tools/`) while the **routes are singular/plural per the blueprint**: `/category/` and `/tools/`. Frontmatter `canonical` has been normalised from `/categories/…` → `/category/…`.

## 2. Slug rules

- Lowercase English transliteration or English terms; hyphens; **≤ 5 words**; stable; **no dates** in evergreen slugs.
- Rationale: WhatsApp/Instagram shareability without percent-encoded Hebrew; Hebrew lives in `<title>`, H1 and body.
- Existing committed slugs are the canonical set (133 route slugs across 127 route files + newsletter data). The full map is `seo/url-map.json` (slug → path, title, description, canonical, robots, schema, OG).

## 3. A-vs-B canonical order

- **Forward convention:** comparison slugs use alphabetical `a-vs-b`.
- **Reality:** where a committed compare slug is *not* alphabetical, we **keep the committed slug** and emit a **301** from the reverse-order path (so both orders resolve to one URL). Non-alphabetical committed pairs and their 301s:

| Committed slug (authoritative) | Reverse path 301s to it |
|---|---|
| `icount-vs-green-invoice` | `/compare/green-invoice-vs-icount` |
| `payplus-vs-grow` | `/compare/grow-vs-payplus` |
| `rivhit-vs-green-invoice` | `/compare/green-invoice-vs-rivhit` |
| `monday-vs-fireberry` | `/compare/fireberry-vs-monday` |
| `zoho-vs-pipedrive` | `/compare/pipedrive-vs-zoho` |
| `osek-patur-vs-osek-murshe` | `/compare/osek-murshe-vs-osek-patur` |
| `pension-vs-management-insurance` | `/compare/management-insurance-vs-pension` |
| `isracard-vs-max` | (already alphabetical — no redirect) |
| `cardcom-vs-tranzila`, `grow-vs-paypal`, `employee-vs-freelancer` | (already alphabetical) |

Full list in `seo/redirects.json`.

## 4. The three resolved slug collisions (canonical table)

| # | Collision (original) | Final owner URLs | Rule |
|---|---|---|---|
| 1 | `income-tax-advance-payments` (article vs guide) | article `/articles/income-tax-advance-payments` **and** guide `/guides/tax/advance-payments-self-employed` | article keeps slug; guide renamed |
| 2 | `employee-vs-freelancer` (compare vs calculator) | compare `/compare/employee-vs-freelancer` **and** calculator `/calculators/employee-vs-freelancer-calculator` | compare keeps slug; calculator renamed |
| 3 | `business-setup-cost` (guide vs tool) | guide `/guides/setup/business-setup-cost` **and** tool `/tools/business-setup-cost-calculator` | guide keeps slug; tool renamed |

Legacy paths 301 to the current ones (in `redirects.json`):
`/guides/tax/income-tax-advance-payments → /guides/tax/advance-payments-self-employed`,
`/calculators/employee-vs-freelancer → /calculators/employee-vs-freelancer-calculator`,
`/tools/business-setup-cost → /tools/business-setup-cost-calculator`.

## 5. URL hygiene rules

| Concern | Rule |
|---|---|
| Trailing slash | **None.** `/foo/` 301 → `/foo`. (Already the natural Next.js form; add the redirect as a safety net.) |
| Case | Lowercase only. Any uppercase request 301 → lowercase. |
| Query params | Content URLs are always parameter-free. Calculator **state** params (`?income=15000&type=osek-patur`) are `noindex, follow` and canonicalise to the base calculator. Tracking params (`utm_*`, `gclid`) are ignored and disallowed in `robots.txt`. |
| Pagination | `rel="canonical"` to **self**; no infinite scroll without crawlable paginated links. `/articles?page=n` crawls via links, `noindex` never applied to paginated pages that are the only path to a page. |
| Facets/filters (`/articles?topic=…`) | `noindex, nofollow` for facet combinations; keep one clean hub crawlable. |
| `/go/[slug]` | `robots.txt` disallow, `X-Robots-Tag: noindex, nofollow`, 302 to destination, `rel="sponsored nofollow noopener"` on the linking anchor. |
| Staging/preview | Whole-site `noindex` (`robots.txt: Disallow: /` + `X-Robots-Tag: noindex`) on any non-production host. |
| Tax year | `/tax-year/2026` canonical; prior years kept and cross-linked; `/tax-year/current` 302 → latest. **Deferred:** no content yet, so `/tax-year/*` is not generated and stays `noindex`. |
| News | `/news/*` **deferred**, `noindex`, not generated until real news content exists. |
| HTML sitemap | `/sitemap-html` lists all hubs/spokes for crawl depth (see INTERNAL_LINKING.md). |

## 6. Deferred sections (do NOT create thin pages)

- `/tax-year/[year]` — planned for phase 2 with the annual tax tables; until then `/tax-year/*` is not built and is `noindex`. When built: unique computed tables + `Dataset` markup.
- `/news/[slug]` — no news content yet → not generated, `noindex`. Do not ship an empty news hub.

## 7. Redirects for Agent 6

`seo/redirects.json` is consumed by Agent 6 into `next.config` / `vercel.json`. It contains:
- reverse-order compare 301s,
- `/categories/:slug → /category/:slug`,
- the three disambiguation 301s,
- `/tax-year/current → /tax-year/2026` (302),
- trailing-slash and `/index.html` normalisation.
Host-level: `http → https`, `www → apex`.

## 8. Orphan & depth policy

Every route is reachable in ≤ 3 clicks from `/` via: home → category hub → spoke, or home → calculator index → calculator. `seo/internal-links.json` provides the hub→spoke graph; `seo-lint` fails on orphan pages.
