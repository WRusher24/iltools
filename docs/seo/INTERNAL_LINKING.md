# INTERNAL LINKING & MONETIZATION-AWARE FLOW (Agent 5)

**Machine-readable:** `seo/internal-links.json` (hub→spoke map, per-page related modules, rules) · **Consumer:** Agent 6.

---

## 1. Topical-authority map (hub → spokes)

Every category is a hub with four spoke families: comparisons, best-of, reviews, guides (+ calculators/articles where present). The exact current graph is in `seo/internal-links.json` under `hubs`.

| Hub | Route | Spokes (families) |
|---|---|---|
| תוכנות חשבוניות | `/category/invoicing` | compare ×3, best ×2, reviews ×5, guides ×1, calc ×2 |
| סליקת אשראי | `/category/clearing` | compare ×4, best ×2, reviews ×9, guides ×2, calc ×1 |
| בנקים לעסקים | `/category/business-banking` | best ×1, reviews ×2, guides ×3, articles ×3 |
| CRM | `/category/crm` | compare ×2, best ×1, reviews ×6, guides ×1 |
| פנסיה (regulated) | `/category/pension` | compare ×1, guides ×2, calc ×2, articles ×4 |
| הנהלת חשבונות | `/best/best-accounting-software` | review ×1, guide ×1, lead ×1 |
| ניהול שכר | `/best/best-payroll-software` | reviews ×3, article ×1 |
| עסק אונליין | `/guides/ecommerce/selling-online-basics` | guide ×1, compare ×3, article ×1 |

## 2. Link-equity rules (must hold; lint-assisted)

- **Each guide → ≥ 1 calculator + ≥ 1 comparison.**
- **Each comparison → its calculator + 2 sibling versus pages + the category hub + 2 guides.**
- **Each calculator → its comparison + 2 guides.**
- **Each review → the versus pages featuring that provider** (e.g. `/reviews/cardcom` → `/compare/cardcom-vs-tranzila`).
- **Each article → ≥ 1 calculator + ≥ 1 comparison + 2 related items** (already in Agent 3's `## המשיכו משם` blocks).
- Category hubs link **down** to all spokes; every spoke links **up** to its hub.

The per-page `related[]` frontmatter is the source of truth; `seo/internal-links.json` exposes it as `links` keyed by path.

## 3. Hebrew anchor-text rules

- Descriptive, human, varied. Include morphological variants (ה/ב/ל prefixes, construct forms, plural) — **never** repeat the same anchor for the same target across a page.
- ❌ Banned anchors: "לחצו כאן", "כאן", "קרא עוד" as the only anchor, bare brand names as anchors where a descriptive phrase fits.
- ✅ Examples: "השוואת עמלות הסליקה", "איך בוחרים חברת סליקה", "מחשבון שכר נטו", "מדריך לתקרת עוסק פטור".
- Exact-match anchors are used **sparingly** (once per page where natural); most anchors are partial/phrase variants.

## 4. Density limits

- **≤ 10 internal links per 1,000 words** in body prose (excluding navigational chrome, breadcrumbs, tables and "related" modules).
- **≤ 1 affiliate link per 300 words outside tables**; affiliate CTAs inside comparison tables are exempt from the prose rule but capped at one row-CTA per provider.
- Tables are the preferred home for provider links (data, not prose).

## 5. CTA flow per page type (highest-value action first)

| Page type | Primary action | Secondary | Notes |
|---|---|---|---|
| compare | `AFF-1` Top Pick card → `/go/` provider | `AFF-2` table row CTAs | Ranking is methodology-driven; paid placement is a separate labelled module |
| best | `AFF-1` → provider | comparison links down-funnel | |
| review | `AFF-1` + `AFF-3` mobile sticky | versus pages | |
| calculator | `CALC-RESULT-CTA` (contextual: result → invoicing/accountant/pension-information) | share/WhatsApp | registration is the viral loop |
| guide | `LEAD-2` inline (accountant/pension) + affiliate where non-regulated | calculator + comparison | |
| article | display ads + soft CTA to calculator/comparison | newsletter | |
| category | `AFF-1` + speak-to-hub links | | |

## 6. Where AdSense must NOT interfere

Per blueprint §1.4.2 and Agent 4 disclosure proximity rules:
- **No ad above the H1.** No ad inside calculator input areas.
- ≤ 3 visible ad units per desktop viewport, ≤ 2 on mobile.
- ≥ 24px spacing between an ad and any clickable control; **≥ 150px from affiliate buttons** to avoid accidental clicks.
- Consent-gated serving (CMP), auto-ads OFF at launch, manual placement only.
- Never place an ad between the affiliate disclosure strip (`DISC-AFFILIATE-STRIP`) and the first affiliate CTA such that it visually separates them.

## 7. "Related modules" logic (data for Agent 6)

`seo/internal-links.json → related_modules`:
- **מדריכים קשורים** — `type=guide`, same `category`, ordered by the page's own `related[]` first.
- **כלים קשורים** — `type=calculator`, same `category`.
- **השוואות פופולריות** — `type=compare`, same `category`, ordered by `volume_tier` from `KEYWORD_MAP.csv`.
Explicit per-page overrides come from the `links` map (`related[]`).

## 8. Orphan & depth rules

- **Every page ≤ 3 clicks from `/`.** Paths: home → hub → spoke, or home → calculator index → calculator.
- **HTML sitemap** at `/sitemap-html`: lists all hubs, spokes, calculators, tools and legal pages as crawlable `<a>` links (RTL, Hebrew labels) — a crawl-depth safety net, `index, follow`.
- **No orphans:** with 133 route slugs across `categories/`, `calculators/`, `tools/`, `compare/`, `best/`, `reviews/`, `guides/`, `articles/`, `pages/`, every slug must appear in at least one hub's spoke list or another page's `related[]`; `seo-lint` fails if any route slug is unreachable.
