# SCHEMA_SPEC — Schema.org JSON-LD (Agent 5)

**Templates:** `seo/schema/*.json` · **Consumer:** Agent 6 · **Validation:** Rich Results Test + Schema.org validator before launch.

Every page emits JSON-LD built from the page's frontmatter (`schema_types[]`) plus site-wide blocks from the root layout. Text is Hebrew where it is user-facing; structural values stay in English.

---

## 1. Page type → schema assignment

| Page type | JSON-LD types | Template |
|---|---|---|
| all pages | `Organization` + `WebSite` (SearchAction) + `BreadcrumbList` | `organization.json`, `website.json`, `breadcrumb-list.json` |
| home | the above + `CollectionPage`/`WebPage` | `webpage.json` |
| category hub | `CollectionPage` + `ItemList` + `BreadcrumbList` | `itemlist.json`, `webpage.json` |
| compare | `Article` + `ItemList` + `BreadcrumbList` | `article.json`, `itemlist.json` |
| best | `ItemList` + `BreadcrumbList` | `itemlist.json` |
| review | `Article` (+ optional secondary `SoftwareApplication` when it genuinely reviews a product) | `article.json`, `software-application.json` |
| guide | `Article` (`BlogPosting`) + `BreadcrumbList` | `article.json` |
| article | `Article` (`BlogPosting`) + `BreadcrumbList`; `Dataset` on data pages | `article.json`, `dataset.json` |
| calculator / tool | `WebApplication` (+ `offers` only with a real published price) + `BreadcrumbList` | `software-application.json` |
| static/legal/lead page | `WebPage` + `BreadcrumbList` | `webpage.json` |
| FAQ block (any) | `FAQPage` (only where a visible FAQ exists) | `faqpage.json` |
| `/tax-year/*` (deferred) | `Dataset` when built | `dataset.json` |

## 2. Builder spec (inputs → outputs)

**Site-wide (root layout):**
- `Organization` ← name, logo, contact email, legal entity (added later). `@id = …/#organization`.
- `WebSite` ← name, url, `inLanguage=he-IL`, `publisher → #organization`, `potentialAction` SearchAction targeting `/search?q={search_term_string}`.
- Every content page references `@id` values rather than duplicating Organization/WebSite.

**Per page:**
- `BreadcrumbList` ← the visible Hebrew breadcrumb trail (`דף הבית` → hub → page). Last item may omit `item`.
- `Article`/`BlogPosting` ← `headline`=title, `description`, `datePublished` (git first commit / launch date), `dateModified`=`updated`, `author`=`Organization` (team persona), `publisher → #organization`, `image`=absolute OG URL.
- `ItemList` ← the ordered visible list of spokes (best/category) with `position`.
- `WebApplication` ← name=title, `applicationCategory`, `offers` **only when `/data/providers/*.json` has a real published price**.
- `FAQPage` ← the exact visible Q&A.
- `Dataset` ← name/description/`dateModified`=`updated`/`temporalCoverage`=year/`distribution` for the tax tables and annual clearing-fee report.

## 3. Validation steps

1. Build JSON-LD in the page, then run the rendered URL through **Google Rich Results Test** (rich-result eligibility + errors) for one page per template.
2. Run the same URL through the **Schema.org validator** (full error/warning list).
3. Validate `seo/schema/*.json` (the `json` object within each template) as JSON and against schema.org vocab (`scripts/seo-lint.mjs` includes a JSON-validity gate).
4. Confirm **dates**: `dateModified` matches the page `updated` stamp.
5. Confirm **no fabricated ratings**: grep the emitted JSON for `aggregateRating`/`reviewRating` — must be zero.

## 4. "Do NOT mark up" list (manual-action risk)

- ❌ **`Review` / `AggregateRating` / `reviewRating`** — the site displays **no star ratings**, so no rating markup may be emitted. Reviews are typed as `Article` without rating properties. *(This is the single biggest risk; do not "add stars" to win snippets.)*
- ❌ **`HowTo`** — Google deprecated HowTo rich results; guides are `Article`. Do not use HowTo for rich results.
- ❌ **`FAQPage` where no visible FAQ exists** — only emit where the FAQ block renders.
- ❌ **`FinancialProduct` / `BankOrCreditUnion` / `LoanOrCredit` / investment-product types** on comparison or educational pages — the site is informational and holds no licence; markup must not imply a financial product offer or advisory relationship. Use `Article`/`ItemList`/`WebPage` instead.
- ❌ **`Product` / `Offer`** without accurate published pricing (many providers are `quote_only` — omit `offers`).
- ❌ **`Dataset`** on pages whose data is not actually published/traceable to `source_ids`.
- ❌ **`Person`** as author (no named individual; team persona only), and no `reviewedBy` (no credentialed reviewer yet).
- ❌ **`SearchAction`** unless a real crawlable `/search` route exists.

## 5. Notes for Agent 6

- Render JSON-LD server-side in the document (not client-injected) so crawlers see it.
- One `<script type="application/ld+json">` per logical entity is fine; a single `@graph` array is preferred for cleanliness.
- Keep `inLanguage: "he-IL"` on every text-bearing entity.
- Pull `schema_types[]` from `seo/url-map.json` (generated from frontmatter) — do not hard-code per page.
