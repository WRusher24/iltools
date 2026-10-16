# KEYWORD_MAP — Hebrew keyword architecture (Agent 5)

**Owner:** Agent 5 (SEO) · **Consumer:** Agent 6 (build) and the editorial team · **Data:** `docs/seo/KEYWORD_MAP.csv`

434 Hebrew queries mapped to **exactly one primary URL per cluster**. Written for google.co.il first, Bing/AI answer engines second.

---

## 1. Columns

| Column | Meaning |
|---|---|
| `query` | The search phrase as a Hebrew user would type it (incl. transliterations, English-mixed, misspellings). |
| `cluster` | Topic/intent cluster — the cannibalisation unit. One cluster ⇒ one primary URL. |
| `intent` | `informational` · `commercial` · `transactional` · `navigational`. |
| `funnel_stage` | `tofu` (awareness) · `moz` (middle / commercial investigation) · `bofu` (decision). |
| `volume_tier` | `high` · `med` · `low` — estimated relative tier (see §4 for method). |
| `difficulty_tier` | `high` · `med` · `low` — estimated ranking difficulty. |
| `target_url` | The single canonical URL that must own this query. |
| `page_type` | Template that serves it (marked `(regulated)` where DISC-PENSION applies). |
| `serp_features` | Features to target: featured snippet, PAA, sitelinks, calculator, table snippet, video, local pack. |
| `monetization_slot_priority` | Ordered slot priority from the blueprint §1.4.2. Regulated pages carry **no affiliate**. |
| `notes` | Cannibalisation notes, morphology notes, programmatic eligibility. |

## 2. Cluster → primary URL (cannibalisation resolution)

Exactly one primary URL per cluster. Query clusters that could compete are merged under one owner:

| Cluster | Primary URL |
|---|---|
| invoicing (head) | `/category/invoicing` |
| invoicing brand/price | `/reviews/<provider>` (e.g. `/reviews/green-invoice`) |
| invoicing-compare | `/compare/<committed-slug>` |
| clearing (head) | `/category/clearing` |
| clearing-explainer | `/articles/how-clearing-fee-works` |
| clearing-calc | `/calculators/clearing-fees` |
| business-banking | `/category/business-banking` (brand → `/reviews/<bank>`) |
| business-cards | `/guides/banking/business-credit-card-guide` |
| crm | `/category/crm` (brand → `/reviews/<provider>`) |
| accounting | `/best/best-accounting-software` (lead → `/lead/accountant`) |
| payroll | `/best/best-payroll-software` |
| pension | `/category/pension` (regulated) |
| keren-hishtalmut | `/guides/pension/hishtalmut-deposit-self-employed` (regulated) |
| self-employed-setup | `/guides/setup/open-osek-patur` |
| tax | `/guides/tax/vat-for-self-employed` (data articles under `/articles/*`) |
| calculators | `/calculators/<slug>` (per device) |

### The three resolved slug collisions
Agent 3 disambiguated three slugs; the map uses the **final** committed slugs:

| Cluster | Owner URL (final) | Rival that must NOT target it |
|---|---|---|
| advance payments (article copy) | `/articles/income-tax-advance-payments` | guide `/guides/tax/advance-payments-self-employed` |
| employee-vs-freelancer (comparison) | `/compare/employee-vs-freelancer` | calculator `/calculators/employee-vs-freelancer-calculator` |
| business-setup-cost (guide) | `/guides/setup/business-setup-cost` | tool `/tools/business-setup-cost-calculator` |

## 3. Cannibalisation rules (enforced)

1. **One primary URL per cluster.** Secondary pages target *different* modifiers (e.g. the article owns "מקדמות מס הכנסה"; the guide owns "מקדמות מס הכנסה לעצמאי" with an intent split, and the guide canonicalises within its own route).
2. **Brand head terms → review page.** "חשבונית ירוקה", "cardcom", "monday crm" point to `/reviews/<provider>`, not the hub.
3. **"X או Y" → the committed compare slug.** Reverse-order variants ("tranzila או cardcom") resolve to the same page via a 301 (see `URL_ARCHITECTURE.md`).
4. **Calculator queries → the calculator**, with query-string states `noindex` and canonical to the base calculator (never indexed as separate pages).
5. **Year modifiers** ("מדרגות מס הכנסה 2026") point to the evergreen article, **not** a separate 2026 page, until `/tax-year/2026` ships with unique value.
6. **Regulated clusters** (pension, hishtalmut) never target affiliate/product-selection intent; they target educational informational intent only.

## 4. Volume-estimation method (no paid tools — stated honestly)

No paid keyword tool was used. Tiers are **relative estimates**, not absolute volumes, and must be re-validated in Google Search Console after launch.

- **Sources used:** Google autosuggest and "related searches" behaviour for the seed list; SERP shape (does Google show a calculator / featured snippet / PAA / local pack — a strong proxy for intent and demand); the breadth of Google's "searches related to" clusters; and the presence of the term in the competitor set from `docs/research/COMPETITORS.md`.
- **Tier definitions:** `high` = head term that appears as a Google suggestion root and drives many long-tail children (e.g. "מחשבון מע״מ", "עוסק פטור או עוסק מורשה"); `med` = clear commercial-investigation term with PAA present; `low` = long-tail/morphological variant or brand-name query with clear intent but narrow audience.
- **Confidence:** **medium** for head terms, **low** for long-tail and brand-modified variants. Tiers are directional; the roadmap uses GSC impressions to reclassify.
- **Difficulty:** `high` where a strong incumbent (a provider's own site, a major aggregator, or a gov.il page) owns the SERP; `low` where the SERP is thin or occupied by low-quality pages.

## 5. Morphology & Israeli search behaviour captured

- **Prefix letters** ה/ב/ל/מ/ש/ו: e.g. "החשבונית הירוקה", "לעמלות סליקה", "בחשבונית ירוקה".
- **Plural / gender variants:** "חשבוניות", "קרנות השתלמות", "תוכנות חשבוניות".
- **Construct forms:** "עמלות הסליקה", "תקרת העוסק הפטור".
- **כתיב מלא/חסר**: both acronym styles — the proper "מע״מ / רו״ח / בע״מ" **and** the ASCII-quote misspelling "מע\"מ" etc.
- **Hebrew + English brand mix:** "חשבונית ירוקה מורנינג", "green invoice מחיר", "monday.com crm", "stripe israel".
- **Transliterations & mashups:** "grinvoice", "meshulam", "rivhit", "ezcount".
- **"או"/"מול"/"השוואת" comparison phrasing** and reverse-order forms.
- **Question long-tail:** "איך…", "מה זה…", "כמה עולה…", "האם כדאי…".
- **Programmatic-eligible:** salary levels ("שכר נטו 12000") and turnover segments — flagged in `notes`; these generate pages only when each has unique computed value (else `noindex`).

## 6. Counts

| Intent | Rows |
|---|---|
| informational | 181 |
| commercial | 167 |
| navigational | 48 |
| transactional | 38 |
| **Total** | **434** across 27 clusters |
