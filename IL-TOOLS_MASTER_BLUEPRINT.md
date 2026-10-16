# IL-Tools — Master Architecture & Execution Blueprint
**il-tools.co.il · המרכז הישראלי להשוואת כלים פיננסיים ועסקיים**
Agent 1 output (Principal Architect). Pipeline: Agent 1 (this document) → 2 Research → 3 Content → 4 Legal → 5 SEO → 6 Build & Push.

> Reading guide: Sections 1–2 are strategy and scope. Section 3 holds the five copy-paste prompts. Section 4 is the shared contract (folders, file formats, schemas) that every agent must obey so the outputs fit together. Section 5 is the roadmap and KPIs.
> Any number in this document (tax brackets, fees, thresholds, prices) is a **placeholder or recollection and must be verified by Agent 2 against a primary source before it is published.** Nothing here is a source of truth for rates.

---

## 0. NON-NEGOTIABLE PRINCIPLES

1. **Hebrew-native and RTL-native.** `<html lang="he" dir="rtl">`. CSS logical properties only (`margin-inline-start`, `ps-*`/`pe-*`, `text-start`). No hard-coded `left`/`right`. Numbers, ₪ signs, English brand names and phone numbers are handled with `<bdi>` / `unicode-bidi: isolate`.
2. **Trust is the product.** Revenue in finance YMYL niches depends on E-E-A-T. Every number has a source and an "updated on" date. Every comparison has a visible methodology. Affiliate relationships are disclosed above the fold.
3. **Rates live in data, not code.** All tax and fee parameters sit in versioned JSON files with `effective_from`, `source_url`, `verified_on`. Calculators read them. A yearly rate change is a data PR, not a code change.
4. **Regulated-activity boundary.** The site is an *information and comparison* service. It does not give investment advice, pension marketing, or personalised recommendations of financial products (see Agent 4). Pension and insurance leads are passed only to licensed entities.
5. **Performance is revenue.** Target LCP < 2.0s, CLS < 0.05 (ads reserve space), INP < 200ms on mobile. Most Israeli traffic is mobile.

---

# SECTION 1 — EXECUTIVE VISION & MONETIZATION BLUEPRINT

## 1.1 Vision

IL-Tools becomes the default destination for an Israeli freelancer, small-business owner or employee who asks "which tool/provider should I use, and what will it cost me?" The site wins on three assets competitors rarely combine:

| Asset | What it is | Why it wins |
|---|---|---|
| **Calculators** | Accurate, shareable, updated each tax year | Dwell time, backlinks, repeat visits, ad impressions |
| **Honest comparisons** | Structured data tables with methodology | Rankings for "X או Y" queries, high affiliate CTR |
| **Guides tied to tools** | Step-by-step Hebrew guides ("איך פותחים עוסק פטור") | Top-of-funnel volume, internal links push to comparisons |

## 1.2 Audience Segments

| Segment | Hebrew label | Pain | Money intent |
|---|---|---|---|
| New/solo freelancers | עצמאיים | Opening a business, invoicing, pension, tax | Invoicing software, accountants, business account |
| Small businesses & e-commerce | עסקים קטנים | Clearing fees, CRM, bookkeeping | Clearing, accounting, CRM, business cards |
| Employees | שכירים | Payslip, net/gross, severance, hishtalmut | Pension and fund products, banks (lead gen), mortgage |
| Consumers | צרכנים | Credit cards, bank fees, cashback | Card and bank affiliate |
| Side-hustlers / career switchers | עצמאי במקביל | "Should I go freelance?" | Net comparison tool → invoicing and accountant leads |

## 1.3 Traffic Strategy (Capturing High-Intent Hebrew Search)

### 1.3.1 Four content pillars in funnel order

1. **Decision / commercial-investigation (money pages)** — "X או Y", "הכי טוב", "השוואת …", "מחיר …".
   Examples: `חשבונית ירוקה או מורנינג`, `השוואת תוכנות הנהלת חשבונות לעצמאים`, `השוואת עמלות סליקה`, `סליקת אשראי לעסק קטן`, `כרטיס אשראי עסקי הכי משתלם`, `חשבון בנק לעסק`.
2. **Calculators (traffic magnets + links)** — "מחשבון …": `מחשבון נטו לעצמאי`, `מחשבון מס הכנסה`, `מחשבון שכר נטו`, `מחשבון מע״מ`, `מחשבון קרן השתלמות`, `מחשבון פיצויים`, `מחשבון דמי אבטלה`.
3. **How-to guides (volume)** — `פתיחת תיק עוסק פטור`, `איך מפיקים חשבונית`, `עוסק פטור או עוסק מורשה`, `פנסיה לעצמאיים`, `הפקדה לקרן השתלמות לעצמאי`, `מס שבח`, `מקדמות מס הכנסה`.
4. **Programmatic / data pages (long tail at scale)** — generated from structured data: provider × provider comparisons, provider × business type (`סליקה לעסק אונליין`, `סליקה לחנות שופיפיי`), "calculator for salary X" (`שכר ברוטו 12,000 כמה נטו`), tax-year pages (`מדרגות מס 2026`).

### 1.3.2 Query-intent map (seed list, Agent 5 will expand to 400+)

| Intent cluster | Sample Hebrew queries | Target page type | Monetization |
|---|---|---|---|
| Invoicing | חשבונית ירוקה או מורנינג · תוכנה להפקת חשבוניות · תוכנת חשבוניות חינם | `/compare/…`, `/category/invoicing` | Affiliate CTA, free-trial |
| Business setup | פתיחת תיק עוסק פטור · עוסק פטור או מורשה · פתיחת עוסק מורשה אונליין | `/guides/…` | Accountant leads, invoicing affiliate |
| Clearing | השוואת עמלות סליקה · סליקה לעסק קטן · סליקה בלי עמלות חודשיות | `/compare/…`, calculator | Clearing affiliate and lead |
| Pension | פנסיה לעצמאיים · הפקדה מינימלית לפנסיה עצמאי · קרן פנסיה או ביטוח מנהלים | guides + calculators | Lead to licensed pension agent |
| Hishtalmut | קרן השתלמות לעצמאי · תקרת הפקדה קרן השתלמות · משיכת קרן השתלמות | guides + calculator | Lead to licensed agent |
| Banking & cards | חשבון בנק לעסק · כרטיס אשראי עסקי · עמלות בנק לעסק | `/compare/…` | Affiliate / lead |
| Net income | כמה נטו מקבל עצמאי · שכיר או עצמאי · מחשבון שכר נטו | calculators | Display ads, cross-sell |
| Accounting | רואה חשבון לעצמאי · מחיר רואה חשבון לעוסק פטור · תוכנת הנהלת חשבונות | `/compare/…`, lead form | Accountant lead (high value) |

### 1.3.3 Ranking tactics specific to Israel

- **Freshness cadence.** Publish "מדרגות מס 2026" / "נקודות זיכוי 2026" / "סכומי תקרות 2026" pages every January, plus update stamps. Israeli tax authority changes are a recurring spike.
- **Seasonal calendar.** Jan: tax tables and new-year thresholds. Mar–Apr: annual report prep (דוח שנתי). Jun: mid-year advance payment review (מקדמות). Sep–Oct: Jewish holidays slump in B2B, push consumer content. Nov (Black Friday): cards and clearing for e-commerce. Dec: year-end hishtalmut deposit deadline.
- **Link magnets.** Annual "דוח עמלות סליקה בישראל" and "מדד מחירי תוכנות חשבוניות" with original data; pitch to Calcalist, TheMarker, Globes, Ynet Calcalist, Bizportal, and freelancer communities (Facebook groups, Reddit r/Israel_finance-type communities).
- **Share loop.** Every calculator result has "שתפו בוואטסאפ" (WhatsApp deep link) with a pre-filled Hebrew message and an OG image generated for the result. WhatsApp is the dominant sharing channel in Israel.
- **Google Discover & Top Stories.** Evergreen + news-adjacent explainers on tax changes, with strong images and `NewsArticle`/`Article` markup.
- **Programmatic pages with real value.** Never thin. Each generated page must contain unique computed numbers, a table and a recommendation rationale, otherwise `noindex`.
- **Not neglected: Bing/ChatGPT/Perplexity visibility.** Clean data tables, FAQ markup, concise answer boxes at the top ("תשובה קצרה") so AI answer engines cite IL-Tools.

## 1.4 Monetization Architecture

### 1.4.1 Revenue stack and expected mix (steady-state target)

| Stream | Mechanism | Target mix | Notes |
|---|---|---|---|
| Affiliate CPA/CPL | Invoicing software, clearing, banks/cards, CRM, accounting software | 45–55% | Highest margin; depends on comparison pages |
| Lead generation | Accountants (רו״ח / יועצי מס), licensed pension agents, mortgage advisors | 25–35% | Highest value per conversion; strict compliance |
| Google AdSense | Display on guides/calculators | 10–20% | Israeli finance RPM is high but volatile; protect UX |
| Sponsored placements | "כלי מומלץ"/"ממומן" badges, featured slots, sponsored reviews | 5–10% | Always labelled; never alter ranking methodology |

### 1.4.2 Ad & monetization placement map

Page types: **H** home · **C** category · **V** versus/compare · **G** guide · **K** calculator · **R** review.

```
┌──────────────────────────────────────────────┐
│ Header (logo · mega-menu · search)           │
│ ── Disclosure strip (all pages) ──           │  "אנו עשויים לקבל עמלה… (גילוי נאות)"
├──────────────────────────────────────────────┤
│ H1 + "תשובה קצרה" answer box                 │
│ [AFF-1] Top Pick card (V, C, R)              │  Native Hebrew CTA, "ממומן"/"שותף" badge if applicable
│ [AD-1] Leaderboard 970×90 / 320×100 mobile   │  Only BELOW first content block, never above H1
├───────────────────────────┬──────────────────┤
│ Main content / calculator │ Sidebar (desktop)│
│  inline table + CTA rows  │ [AD-2] 300×600   │  sticky
│  [AFF-2] after table      │ [LEAD-1] Mini    │  lead form / "קבל הצעה"
│  [AD-3] in-article (after │  card            │
│    section 2)             │                  │
│  [CALC-RESULT-CTA] after  │                  │
│    calculator result      │                  │
│  [AD-4] in-article (mid)  │                  │
│  [LEAD-2] Inline lead form│                  │
│  [AD-5] before FAQ        │                  │
│  FAQ                      │                  │
│  [AFF-3] Sticky bottom bar│ (mobile only)    │
│          (dismissible)    │                  │
├───────────────────────────┴──────────────────┤
│ Related tools/guides (internal links)        │
│ Footer: disclaimers · policies · accessibility│
└──────────────────────────────────────────────┘
```

| Slot ID | Type | Appears on | Rules |
|---|---|---|---|
| `AFF-1` | Top Pick native card | V, C, R | Methodology link; shows disclosure badge; max 1 per page |
| `AFF-2` | Provider rows w/ CTA in comparison table | V, C | `rel="sponsored nofollow noopener"`, tracked redirect `/go/[slug]` |
| `AFF-3` | Mobile sticky CTA | V, R | Dismissible, not shown until 40% scroll; no covering of cookie/consent UI |
| `AD-1..5` | AdSense units | G, K, V, C (not H hero) | Reserved heights (CLS), lazy load below fold, max density rule below |
| `CALC-RESULT-CTA` | Contextual offer after result | K | E.g., net-income result → "השוו תוכנות חשבוניות" + "שוחחו עם רו״ח" |
| `LEAD-1/2` | Lead forms | G, K, V | Explicit consent checkbox, purpose text, link to privacy policy |
| `SPONSOR-BADGE` | "כלי ממומן" label | any | Visually distinct; never mixed into "אובייקטיבי" ranking without label |
| `EXIT-LEAD` | Exit-intent modal (desktop only) | K, V | Once per session; accessible; Escape closes |

**Ad density guardrails (AdSense compliance + UX):** ads never above the H1; ≤ 3 ad units visible in any one viewport on desktop, ≤ 2 on mobile; no ads inside the calculator input area; no ads adjacent to CTAs such that accidental clicks are likely (min 24px spacing, ≥ 150px from affiliate buttons); no "פרסומת" labels that mimic content. Auto-ads off at launch; manual placement only. Consent-gated (CMP) serving.

**Ranking integrity rule:** editorial ranking is computed by a published scoring formula (price 30%, features 25%, support 15%, reliability 15%, user rating 15% — Agent 3 finalises). Paid placement is a *separate labelled* module and never changes scores.

### 1.4.3 Affiliate program targets (Agent 2 to verify availability, commission, cookie window)

Direct programs or networks (e.g., Impact, CJ, Awin, PartnerStack, plus Israeli networks and direct deals):
- Invoicing: Green Invoice (חשבונית ירוקה / Morning), iCount, Rivhit (רווחית), Invoice4U, Hashavshevet (חשבשבת), Priority-based tools, Wix/QuickBooks-adjacent Israeli players.
- Clearing: Cardcom, Tranzila, PayPlus, Meshulam/Grow, Pelecard, Yaad Sarig, Bit/PayBox business tools, Stripe-IL / PayPal business.
- Banking & cards: Israeli banks' business accounts, Isracard, Max, Cal, Diners.
- CRM / ops: monday.com, Fireberry (פיירברי), Zoho, HubSpot, WhatsApp Business tools.
- Accountants / bookkeeping marketplaces and online accounting firms.
- Lead partners: licensed pension agencies / insurance agencies (must hold an Israeli licence — verify in the Capital Market Authority registry), mortgage advisors.

## 1.5 Revenue Model Sketch (for prioritisation only)

`Monthly revenue ≈ Sessions × (AdRPM/1000 × pages/session) + Sessions × affiliate-CTR × CVR × commission + Leads × payout`.
Order of build: calculators + invoicing/clearing comparisons first (fastest affiliate), then accountant leads, then pension/hishtalmut educational flows with licensed partners.

---

# SECTION 2 — COMPREHENSIVE FEATURE & TOPIC MATRIX

## 2.1 Tool & Service Categories

Each category = a hub page (`/category/[slug]`), 3–10 reviews (`/reviews/[slug]`), a set of versus pages (`/compare/[a]-vs-[b]`), a "best of" page and a guide cluster.

| # | Category (Hebrew) | slug | Providers to cover (Agent 2 verifies and expands) | Comparison dimensions |
|---|---|---|---|---|
| 1 | תוכנות חשבוניות | `invoicing` | Green Invoice/Morning, iCount, Rivhit, Invoice4U, Hashavshevet, Cardcom Invoices, EZcount, Fireberry-invoicing | Monthly price by tier, free plan limits, receipts, חשבוניות ישראל (allocation numbers), multi-currency, API, accountant access, app, support in Hebrew |
| 2 | סליקת אשראי | `clearing` | Cardcom, Tranzila, PayPlus, Meshulam/Grow, Pelecard, Yaad, Stripe, PayPal, bank clearing (Isracard/Max/Cal direct) | % per transaction, fixed per-transaction fee, monthly fee, setup fee, settlement days, installments (תשלומים) fee, currency, integrations (Shopify/WooCommerce/Wix), PCI, chargeback fee |
| 3 | בנקים לעסקים | `business-banking` | Leumi, Hapoalim, Discount, Mizrahi-Tefahot, Mercantile, FIBI, One Zero/other digital, Bank Yahav, etc. | Monthly account fee, per-action fees, checkbook, online fees, overdraft rate, business credit terms, digital onboarding |
| 4 | כרטיסי אשראי עסקיים | `business-cards` | Isracard, Max, Cal, Diners business cards | Annual fee, cashback/points, billing date, fuel/insurance benefits, interest rate |
| 5 | פנסיה (עצמאיים/שכירים) | `pension` | Clal, Harel, Migdal, Phoenix, Menora, Altshuler, Meitav, More, Analyst… | Management fees on deposit/accumulation, track variety, returns (historical, with warnings), service — **informational only; see legal** |
| 6 | קרן השתלמות | `keren-hishtalmut` | Same providers + Altshuler, Meitav, Analyst, IBI, Ayalon… | Fees, tracks, 6-year/3-year rules, tax-exempt ceilings |
| 7 | CRM וניהול לקוחות | `crm` | monday.com, Fireberry, Zoho, HubSpot, Salesforce Essentials, Pipedrive | Price/seat, Hebrew/RTL support, WhatsApp integration, invoicing integration |
| 8 | הנהלת חשבונות | `accounting` | Online accounting firms, bookkeeping software (Hashavshevet, Rivhit, Green Invoice accountant tier), Priority | Monthly price, services included (דוח שנתי, מע״מ, מקדמות), turnaround, reviews |
| 9 | ניהול שכר | `payroll` | Hilan, Synergy, Merav, Pay-it-Easy-type apps | Price per employee, payslips, attendance, pension integration |
| 10 | ביטוחים לעסק וליחיד | `insurance` (phase 3, licensed leads) | Business liability, income protection, health | Informational + lead to licensed agents |
| 11 | אשראי ומימון לעסקים | `business-finance` (phase 3) | Banks, non-bank credit, factoring, Fundit-type | Rate ranges, speed, requirements |
| 12 | כלי פרודוקטיביות ושיווק לעסק | `business-software` | Email marketing, WhatsApp automation, Canva-type, website builders (Wix/Elementor) | Price, Hebrew support |

## 2.2 Interactive Calculators Suite

All calculators: pure TypeScript functions in `packages/calc` (or `src/lib/calc`), 100% unit-tested with fixtures verified by Agent 2, config-driven rates, results shareable via URL query string (`?income=15000&type=osek-patur`), "ייצוא ל-PDF"/"שתפו בוואטסאפ" buttons, disclaimer modal on first run (Agent 4), no personal data stored by default.

### Tier 1 (launch)

| # | Calculator (Hebrew) | Route | Inputs → Outputs | Notes |
|---|---|---|---|---|
| K1 | **מחשבון נטו לעצמאי (מס הכנסה + ביטוח לאומי + מס בריאות)** | `/calculators/atzmai-net` | Monthly/annual revenue, expenses, status (עוסק פטור/מורשה), credit points, pension and hishtalmut deposits, marital status, deductions → Net, tax by bracket, BL, health, effective rate, advance-payment (מקדמה) estimate | Bracket chart; includes BL reduced/ceiling rates and the deduction of 52% of BL contributions (verify rule) |
| K2 | **מחשבון שכיר מול עצמאי** | `/calculators/employee-vs-freelancer` | Gross offer, employer extras, freelancer rate → net comparison + break-even hourly rate | Viral; key lead-in to invoicing/accountant CTA |
| K3 | **מחשבון עמלות סליקה** | `/calculators/clearing-fees` | Monthly turnover, avg ticket, transactions, share of installments, online/in-person, currency → total monthly cost per provider, savings vs. current | Each row has provider CTA; tracks lead intent |
| K4 | **מחשבון עלות תוכנת חשבוניות** | `/calculators/invoicing-cost` | Documents/month, users, features needed (API, multi-currency, inventory) → cheapest plan matching, annual cost, free-plan fit | Recommends by *feature fit*, not by commission |
| K5 | **מחשבון מע״מ (חישוב ופיצול, החזר מע״מ)** | `/calculators/vat` | Amount incl./excl. VAT, rate (from config), purchases (input VAT), sales (output VAT), exempt dealer → VAT due/refund, bi-monthly/monthly schedule hint | Includes "מע״מ על ציוד/רכב" partial-recovery rules (verify) |
| K6 | **מחשבון שכר נטו (שכיר)** | `/calculators/salary-net` | Gross, credit points, pension %, hishtalmut %, car benefit, etc. → net, deductions line by line | Evergreen high volume; programmatic pages for salary levels |
| K7 | **מחשבון קרן השתלמות** | `/calculators/keren-hishtalmut` | Salary/income, employee/employer % or self-employed deposit, fee, return, years → balance, tax benefit, ceilings | Self-employed deduction ceiling and tax-exempt ceiling from config |

### Tier 2 (month 2–3)

| # | Calculator | Route | Notes |
|---|---|---|---|
| K8 | מחשבון פנסיה לעצמאי (הפקדה מינימלית וזיכוי מס) | `/calculators/pension-self-employed` | Shows required deposit, tax credit/deduction under Sec. 47; **no product recommendations** |
| K9 | מחשבון פיצויים | `/calculators/severance` | Tax-exempt ceiling per year of service from config |
| K10 | מחשבון דמי אבטלה | `/calculators/unemployment` | Based on NII rules; heavy disclaimers |
| K11 | מחשבון עוסק פטור: האם כדאי לי להישאר פטור? | `/calculators/osek-patur-threshold` | Turnover vs. threshold (config), switch-to-murshe impact on net |
| K12 | מחשבון ריבית דריבית ומשכנתא בסיסי | `/calculators/compound-interest`, `/calculators/mortgage` | Lead-in to mortgage advisor leads |

## 2.3 Additional High-Traffic / Viral Modules (Recommended Expansion)

1. **מחשבון תעריף שעתי לפרילנסרים** — `/calculators/freelancer-hourly-rate`. Input desired net income, billable hours, vacation, expenses, taxes → minimum hourly rate and recommended quote. Highly shareable among designers, developers, consultants, therapists. Cross-sell: invoicing, accountant, pension for self-employed.
2. **פירוק תלוש שכר ("תלוש בשוק" / Tlush Decoder)** — `/tools/payslip-decoder`. User enters (manually; optional client-side OCR with no upload) the key payslip lines, tool explains each line in plain Hebrew, flags common issues (missing pension deposits, wrong credit points) and provides "בדקו אצל מומחה" CTA. Processing happens in browser; no payslip stored. Very high-intent, very viral.
3. **"כמה עולה לי לפתוח עסק?" — מחשבון עלות הקמת עסק** — `/tools/business-setup-cost`. Itemised: registration, accountant, software, insurance, clearing, business bank. Outputs a checklist plus shopping-list of comparison links (affiliate funnel).
4. **בוחן "איזה סוג עסק מתאים לך?" (עוסק פטור / מורשה / חברה בע״מ)** — `/tools/business-structure-quiz`. Interactive wizard with net-income simulation; strong lead-gen for accountants.
5. **לוח שנה פיננסי ישראלי לעצמאים** — `/tools/tax-calendar` (+ iCal/WhatsApp reminders opt-in): deadlines for מע״מ, מקדמות, ביטוח לאומי, דוח שנתי, deposit to hishtalmut before year-end. Email/WhatsApp reminder opt-in builds a first-party audience for newsletter monetization.
6. **סורק עמלות בנק** — `/tools/bank-fee-checker`: enter monthly bank statement fee lines (manually) and see a benchmark vs. market; funnel to bank/card comparisons.
7. **מחשבון החזר מס לשכירים (בדיקה ראשונית)** — `/tools/tax-refund-estimator`. Very high Israeli search volume (החזרי מס); lead-gen to licensed tax-refund firms; must be handled with strong accuracy disclaimers.
8. **מחשבון שכר דירה/ארנונה/כדאיות רכב חברה** — phase 3 niche traffic.
9. **Newsletter "הדוח השבועי של IL-Tools"** — Hebrew email + WhatsApp channel. Monetized by sponsored tools & affiliate links.

## 2.4 Site Map & Native RTL UI Layout

### 2.4.1 Hebrew navigation (right-to-left; the first item sits at the right edge)

```
[לוגו IL-Tools]  [השוואות ▾] [מחשבונים ▾] [מדריכים ▾] [קטגוריות ▾] [בלוג/חדשות] [אודות]     [🔍 חיפוש] [ניוזלטר]

השוואות ▾
  חשבונית ירוקה או מורנינג
  השוואת תוכנות חשבוניות
  השוואת סליקת אשראי
  בנקים לעסקים · כרטיסי אשראי עסקיים
  CRM · הנהלת חשבונות
מחשבונים ▾
  נטו לעצמאי · שכיר מול עצמאי · שכר נטו · עמלות סליקה
  מע״מ · קרן השתלמות · פנסיה · תעריף שעתי · פיצויים
מדריכים ▾
  פתיחת עסק · מיסים · פנסיה וחיסכון · בנקאות · עסק אונליין · כלי עבודה
```

### 2.4.2 Sitemap tree

```
/                                           דף הבית (hero search, popular tools, latest guides, trust bar)
/category/                                  כל הקטגוריות
  /category/invoicing                       תוכנות חשבוניות
  /category/clearing                        סליקת אשראי
  /category/business-banking                בנקים לעסקים
  /category/business-cards                  כרטיסי אשראי עסקיים
  /category/pension                         פנסיה
  /category/keren-hishtalmut                קרן השתלמות
  /category/crm · /category/accounting · /category/payroll · …
/compare/                                   מרכז השוואות
  /compare/green-invoice-vs-morning
  /compare/cardcom-vs-tranzila
  /compare/[a]-vs-[b]                       programmatic from DB
/best/                                      "הכי טוב" lists
  /best/invoicing-software-freelancers
  /best/clearing-small-business
/reviews/[provider-slug]                    ביקורת מלאה לכל ספק
/calculators/                               מרכז מחשבונים
  /calculators/[slug]                       K1…K12
/tools/                                     כלים אינטראקטיביים (payslip, quiz, calendar…)
/guides/                                    מרכז מדריכים
  /guides/[topic]/[slug]                    clusters: setup, tax, pension, banking, ecommerce
/articles/                                  מאמרים ונתונים (data-rich editorial, 20+ at launch)
  /articles/[slug]
/tax-year/2026/                             מדרגות מס, נקודות זיכוי, תקרות (evergreen hub, versioned)
/news/                                      עדכונים ושינויי חקיקה
/lead/[type]                                landing pages for leads (accountant, pension, mortgage)
/go/[provider]                              tracked outbound redirect (noindex, robots-disallowed)
/about  /methodology  /editorial-policy  /advertise  /contact
/legal/                                     disclaimer · terms · privacy · affiliate-disclosure · cookies · accessibility
/sitemap.xml  /robots.txt  /llms.txt  /feed.xml
```

### 2.4.3 RTL UI layout system

- **Type:** Heebo (UI/body) + Assistant or Rubik (headings), self-hosted via `next/font`, `font-display: swap`. Base 17–18px for Hebrew body, line-height 1.7.
- **Grid:** 12-col, content max 1200px; article column 720px; sidebar 320px on the *left* in RTL (logical `inline-end`).
- **Tables:** comparison tables are horizontally scrollable on mobile with a sticky first column (right edge). Card view fallback < 640px.
- **Icons:** mirror directional icons (arrows, chevrons, progress); do not mirror logos, check marks, phone numbers, clocks, media controls.
- **Number formatting:** `Intl.NumberFormat('he-IL', {style:'currency', currency:'ILS'})`; percentages and ₪ wrapped with `<bdi>`; dates with `he-IL` and optional Hebrew calendar for tax-year context.
- **Colors / brand:** trust-forward palette (deep navy + teal + warm accent for CTAs), high-contrast; AA contrast minimum (Israeli accessibility regulations).
- **Components (design-system inventory):** `DisclosureStrip`, `AnswerBox`, `ComparisonTable`, `ProviderCard`, `TopPickCard`, `ProsCons`, `ScoreBadge`, `CalcShell` (inputs, result, share, disclaimer modal), `BracketChart`, `LeadForm`, `AdSlot`, `AffiliateButton`, `SponsorBadge`, `FAQ`, `Breadcrumbs`, `TOC`, `UpdatedStamp`, `AuthorBox`, `ConsentBanner`, `AccessibilityWidget` (supplemental only), `Footer`.

---

# SECTION 3 — DOWNSTREAM AGENT PIPELINE & GENERATED PROMPTS

Hand-off order: **Agent 2 → Agent 3 → Agent 4 → Agent 5 → Agent 6.** Each agent reads the previous outputs from the repo and writes its own. The repository is initialised by Agent 2 (so the research files are version-controlled from the start) and finalised by Agent 6. All agents work on the same branch and commit in small logical commits. See Section 4 for the file contract.

**Placeholders to replace before running:** `<GITHUB_REPO_URL>` (e.g., `https://github.com/<you>/iltools`), `<BRANCH>` (e.g., `main`), `<DOMAIN>` = `il-tools.co.il`.

---

## PROMPT FOR AGENT 2 — Israeli Market & Financial Data Research Agent

````text
ROLE
You are Agent 2: Israeli Market & Financial Data Research Analyst for the project "IL-Tools" (il-tools.co.il), a Hebrew/RTL comparison and calculator platform for Israeli freelancers, small businesses, employees and consumers. You are the single source of truth for every number the site will ever show. Downstream agents (3 Content, 4 Legal, 5 SEO, 6 Engineering) will treat your files as authoritative, so accuracy, sourcing and honesty about uncertainty matter more than volume.

LANGUAGE
Write your working notes and field names in English. Store all user-facing strings (provider names, plan names, feature labels, notes meant for display) in Hebrew with an English key alongside. Preserve original Hebrew names exactly as the provider spells them.

INPUT
Read "IL-TOOLS_MASTER_BLUEPRINT.md" (Agent 1) in the repository root: sections 2 and 4 define the categories, the calculators (K1–K12 plus the extra modules) and the file contract you must follow. Do not deviate from the file contract.

TOOLS / PROCESS
Use web search and page fetching extensively. Prefer PRIMARY sources: gov.il, Israel Tax Authority (רשות המסים), National Insurance Institute (ביטוח לאומי / btl.gov.il), Capital Market, Insurance and Savings Authority (רשות שוק ההון), Bank of Israel, Knesset legislation database, provider official pricing pages and published fee tariffs (תעריפון), and official Gazette (רשומות). Use secondary sources (news, comparison blogs) only to find leads; never as the sole source for a number. Capture each source URL and the date you accessed it. If a provider hides pricing behind a quote, record "quote_only" and a realistic range with evidence — do not invent.

TASKS

A. TAX & STATUTORY PARAMETERS (current tax year, plus the previous year for comparison and any already-enacted changes for the next year)
Research and record, with exact legal citation, effective dates, and source URL:
 1. Income tax brackets and rates (מדרגות מס הכנסה) for individuals, monthly and annual thresholds.
 2. Credit point value (שווי נקודת זיכוי), default credit points by gender/status, extra points (new immigrants, parents, discharged soldiers, academics, residents of qualifying locales, etc.) — only include rules you can cite.
 3. Surtax / "מס יסף" thresholds and rates, including the capital-income component.
 4. National Insurance (ביטוח לאומי) and health tax (מס בריאות): employee rates, employer rates, self-employed rates, reduced/full brackets, minimum and maximum insured income, and the rule that allows a deduction of part of the NI contribution for self-employed income tax purposes.
 5. VAT (מע״מ) standard rate and any exemptions/zero-rate rules relevant to freelancers and e-commerce; filing periodicity thresholds (monthly vs. bi-monthly vs. annual); osek patur (עוסק פטור) annual turnover ceiling and the rules for crossing it; osek murshe obligations; חשבוניות ישראל / allocation number (מספר הקצאה) thresholds and their phase-in schedule.
 6. Advance payments (מקדמות מס הכנסה), tax-deduction-at-source (ניכוי במקור) rates for common freelance scenarios.
 7. Pension: mandatory employee/employer contribution percentages and breakdown (תגמולים, פיצויים), minimum self-employed pension deposit rules, and the tax benefit mechanism (Sec. 45a credit, Sec. 47 deduction) with the current ceilings and percentages.
 8. Keren hishtalmut (קרן השתלמות): employer/employee percentages, salary ceiling for tax-exempt employer deposits, self-employed deductible deposit ceiling and the percentage-of-income rule, withdrawal rules (6 years, 3 years, 'pension-purpose' 'שנת פרישה'), capital-gains tax exemption conditions.
 9. Severance (פיצויים): tax-exempt ceiling per year of service, and relevant ceiling for the year.
10. Unemployment benefits rules (only those needed for calculator K10), minimum-wage and average-wage constants used by NI formulas, the minimum wage (שכר מינימום) and the average wage (השכר הממוצע במשק) used by NI.
11. Any rule changes that took effect or were legislated within the past 12 months; mark with "change_alert": true.
For every parameter, write: value, unit, applies_to, effective_from, effective_to (nullable), legal_basis, source_url, accessed_on, confidence (high|medium|low), and notes. If two sources disagree, record both and explain which you trust and why. If you cannot verify a value from a primary source, set confidence "low" and list it in /docs/research/OPEN_QUESTIONS.md. NEVER fill a gap with a plausible-looking guess.

B. PROVIDER PRICING & FEATURES (each category in Blueprint §2.1)
For each provider, capture structured data on pricing (all plans and tiers, billing-cycle discounts, VAT included/excluded flag, promotional vs. list price), limits (documents/month, users, etc.), features (Hebrew support, חשבוניות ישראל allocation-number integration, API, integrations, app), contract terms (commitment, cancellation), support channels, and company facts (legal entity, year founded, licences e.g. for clearing/payment-service providers, pension/insurance licence status where relevant). Record "last_verified" per provider. Capture screenshots' text, not images.
 - Invoicing: Green Invoice/Morning, iCount, Rivhit, Invoice4U, Hashavshevet, Cardcom Invoices, EZcount, Fireberry, and any other credible provider you discover.
 - Clearing: Cardcom, Tranzila, PayPlus, Meshulam/Grow, Pelecard, Yaad, Stripe Israel, PayPal, direct issuer clearing. Capture the exact fee formula: percentage per transaction, fixed fee per transaction, monthly minimum, setup, installment (תשלומים/קרדיט) surcharge, foreign cards, refunds, chargebacks, settlement speed (T+n), min turnover requirements, bank-account requirements.
 - Business banking and business credit cards: public fee tariffs (תעריפון עמלות) from the banks and the card companies, and the official Bank of Israel fee-comparison data where available.
 - Pension and hishtalmut: management fees on deposits and on accumulation (דמי ניהול), ONLY from the official government comparison source (e.g., "גמל נט / פנסיה נט" by the Capital Market Authority). Do NOT rank products by returns and do NOT produce advice; record data and sources only, flagged "informational_only": true.
 - CRM, accounting software, payroll, accounting firms: pricing, seats, features, and Hebrew/RTL quality.
 - Affiliate and lead-gen program facts: does the provider run an affiliate/partner program, which network, the commission model (CPA/CPL/rev-share), indicative payout, cookie window, brand-bidding restrictions, disclosure requirements, and a contact path. Record only what you can verify; mark the rest "unknown". This goes in a separate file (affiliate_programs.json) that must NOT be exposed to the public site.

C. CALCULATOR SPECIFICATIONS
For each calculator K1–K12 and extra modules (hourly rate, payslip decoder, business setup cost, business structure quiz, tax calendar, bank fee checker, tax-refund estimator), write a precise spec in /docs/research/calculators/<slug>.md containing:
 - Purpose, user inputs (name, type, unit, default, min, max, validation), outputs.
 - The exact step-by-step formula in pseudo-code with every constant referencing a key in the rates files (never hard-code numbers in the formula text).
 - Rounding rules, monthly↔annual conversion rules, edge cases (income below the NI minimum, crossing brackets, mid-year start, multiple income sources, losses).
 - At least 8 worked test cases with inputs and expected outputs computed independently and double-checked (state how you checked them; where possible reconcile against the official Tax Authority/NII calculators). Save these as machine-readable fixtures in /docs/research/fixtures/<slug>.json for Agent 6's unit tests.
 - Known limitations and assumptions that the UI must disclose (Agent 4 will use these).

D. MARKET & KEYWORD INTELLIGENCE (supports Agents 3 and 5)
 - ARTICLE DATASETS: for each of the 24 launch article topics in Agent 3's brief (Blueprint, Prompt for Agent 3, item 3B), assemble at least 3 sourced, citable data points or a small time series (e.g., historical tax brackets and osek-patur ceilings by year, NI rates, clearing fee ranges from published tariffs, Bank of Israel payment-usage statistics, average-wage series from the CBS/NII). Save as /data/articles/<topic>.json using the same source_id/accessed_on/confidence fields. Mark gaps explicitly; do not estimate to fill them.
 - A prioritised list of 60+ topics for guides/comparisons with the Israeli search intent, estimated difficulty/volume tier (high/med/low — state how estimated), and the "money" angle. Include the example queries in the blueprint and extend them.
 - Top 10 Israeli competitor/aggregator sites per category: what they cover, what they miss, their monetization patterns. No copying of their content.
 - The Israeli sources most worth earning links from (media, communities, associations).

E. DATA QUALITY GATE
Before finishing: re-verify the 20 highest-impact numbers (bracket thresholds, NI rates, VAT rate, osek patur ceiling, hishtalmut ceilings, credit point value, the 5 most-viewed providers' base prices) with a second independent source or a fresh fetch. List the results in /docs/research/VERIFICATION_LOG.md.

OUTPUT (follow the repository file contract exactly)
 - /data/rates/<year>.json (+ /data/rates/schema.json) — all statutory parameters.
 - /data/providers/<category>.json — all provider records (public-safe fields only).
 - /data/internal/affiliate_programs.json — private; add to .gitignore ONLY IF it contains secrets; otherwise keep but never import into client code. Mark clearly in the README.
 - /data/sources.json — a registry of every source (id, title, publisher, url, accessed_on, language).
 - /docs/research/calculators/*.md and /docs/research/fixtures/*.json
 - /docs/research/TOPICS_AND_KEYWORDS.md, COMPETITORS.md, LINK_TARGETS.md
 - /docs/research/VERIFICATION_LOG.md, OPEN_QUESTIONS.md
 - /docs/research/HANDOFF_AGENT2.md — a one-page summary for Agents 3–6: what is solid, what is shaky, what to treat with caution, what changed recently.

GIT
Initialise the repository if it does not exist (git init), set remote to <GITHUB_REPO_URL>, create/use branch <BRANCH>, commit in logical chunks with clear messages, and push. Do not write application code.

QUALITY RULES
 - No fabricated figures. "Unknown" is an acceptable answer; a made-up number is a failure.
 - Every public-facing number has a source_id and accessed_on in the data. 
 - Use ISO dates, numeric values (not strings with ₪), and a "currency":"ILS" field.
 - JSON must validate against the schema you write. Run a validation script and include its output in VERIFICATION_LOG.md.
 - If a legal/regulatory aspect looks risky (e.g., comparing pension returns, ranking regulated products), flag it in OPEN_QUESTIONS.md for Agent 4 instead of resolving it yourself.

DEFINITION OF DONE
All files above exist, JSON validates, the data quality gate is done, the handoff note is written, and everything is pushed. End with a brief report: counts of providers per category, parameters verified/low-confidence, calculators specced, and the top 10 risks.
````

---

## PROMPT FOR AGENT 3 — Hebrew Content & Guide Writer Agent

````text
ROLE
You are Agent 3: Senior Hebrew Financial Content Writer & Editor for "IL-Tools" (il-tools.co.il). You write native, natural, professional Israeli Hebrew — not translated English. You combine the clarity of a good financial journalist (think: Calcalist/TheMarker explainers) with the practicality of a trusted freelancer-community expert. You produce content that ranks, converts and is legally safe.

INPUT (read first, in this order)
 1. IL-TOOLS_MASTER_BLUEPRINT.md — vision, monetization map, category and calculator matrix, file contract.
 2. /docs/research/HANDOFF_AGENT2.md, /docs/research/TOPICS_AND_KEYWORDS.md, /docs/research/COMPETITORS.md, /docs/research/OPEN_QUESTIONS.md
 3. /data/rates/*.json, /data/providers/*.json, /data/sources.json, /docs/research/calculators/*.md
You may cite numbers ONLY by referencing keys from the data files. Never type a tax rate, price, fee or threshold from memory. If the data is missing or low-confidence, write the sentence in a way that avoids the number, and list the gap in /docs/content/CONTENT_GAPS.md.

LANGUAGE & STYLE RULES (HEBREW)
 - Native, modern, concise Israeli Hebrew. Second person, gender-inclusive phrasing where practical (e.g., "עצמאי/ת", or neutral constructions such as "מי שעובד/ת כעצמאי/ת"); choose one convention and apply it site-wide. Avoid literal translations ("לעשות סנס", "בסוף של היום"), avoid heavy bureaucratic Hebrew, but keep accurate terms: עוסק פטור, עוסק מורשה, מע״מ, מקדמות, ניכוי במקור, דמי ניהול, קרן השתלמות, נקודות זיכוי.
 - Use proper Hebrew punctuation (״ for abbreviations like מע״מ, רו״ח, בע״מ), correct ₪ placement (e.g., "1,000 ₪" or "₪1,000" — pick one and apply consistently), and Hebrew date formats. Wrap numbers/English brand names so RTL rendering stays correct (write plain text; Agent 6 handles bidi isolation).
 - Short paragraphs (2–4 lines), descriptive H2/H3, bullet lists and tables where they help. Every article opens with a 40–60 word "תשובה קצרה" (direct answer) block.
 - Brand names stay in their official spelling (Green Invoice / חשבונית ירוקה — use the form people search for, with the English in parentheses on first mention where useful).
 - Readability: target roughly a grade-9 reading level in Hebrew; sentences under ~25 words; no stacked subordinate clauses; use concrete examples and numbers over abstractions; cut filler openings. Every piece must be to the point and easy to scan but complete enough to fully answer the query.
 - No clickbait, no guarantees ("מובטח", "הכי זול בישראל" without proof), no scare tactics, no pressure language.

DELIVERABLES (MDX files with frontmatter; schema in Blueprint §4)

1. COMPARISON PAGES (priority 1): minimum 25 at launch.
   - 12 head-to-head "A או B" pages (start with: חשבונית ירוקה או מורנינג [handle the brand relationship accurately from research], iCount או חשבונית ירוקה, Cardcom או Tranzila, PayPlus או Meshulam, עוסק פטור או עוסק מורשה, שכיר או עצמאי, קרן פנסיה או ביטוח מנהלים [educational, non-advisory]).
   - 8 "הכי טוב ל…" pages (e.g., best invoicing for freelancers, best clearing for small e-commerce, best business bank for startups).
   - 5 category hub pages with category intro + selection criteria.
   Structure for each: תשובה קצרה → טבלת השוואה מהירה (from data) → מי מתאים למי (use cases) → עלות בפועל (use calculator reference: link target to the relevant calculator) → יתרונות וחסרונות → שיטת הדירוג (link to /methodology) → שאלות נפוצות (5–8 FAQ) → "מה לעשות עכשיו" CTA block. Include a visible placement for the affiliate disclosure and for [AFF-1], [AFF-2], [AD-*], [LEAD-*] slots using the exact slot tokens from the blueprint, e.g. {{slot:AFF-1}}.

2. PROVIDER REVIEWS (priority 2): 30 reviews (each 900–1,400 words): who it is for, pricing table, real strengths, real weaknesses, setup experience, support quality, alternatives, verdict. Be fair. Never invent usage experience; write analysis of publicly verifiable features and state "בדקנו לפי מידע שפורסם באתר הספק ב-[date]" unless Agent 2's data includes hands-on testing.

3. HOW-TO GUIDES (priority 3): minimum 40 at launch, 1,200–2,200 words each, across clusters: פתיחת עסק, מיסים, פנסיה וחיסכון, בנקאות ואשראי, עסק אונליין, כלים ופרודוקטיביות. Must include: פתיחת תיק עוסק פטור, פתיחת עוסק מורשה, איך מפיקים חשבונית (ואיך עובד מספר הקצאה), מקדמות מס הכנסה, דוח שנתי לעצמאי, מע״מ לעצמאים, פנסיה לעצמאיים, הפקדה לקרן השתלמות לעצמאי, עלות הקמת עסק, איך בוחרים רואה חשבון, איך בוחרים חברת סליקה, איך מקטינים עמלות בנק, איך מתכוננים לסוף שנה מס. Each ends with a "סיכום ומה הלאה" block that links to the exact relevant tools/calculators.

3B. DATA-RICH EDITORIAL ARTICLES (priority 3, same level as guides): MINIMUM 20 at launch; target 24. These are NOT calculator/feature explainers. They are standalone, research-backed articles about the topics around the site (taxes, business setup, payments, banking, savings, freelancing economics, regulation changes) that earn links, Discover traffic and long-tail rankings, and that feed readers into calculators and comparisons.
   Length and style: 1,000–1,800 words each — to the point, easy to read, but substantive (never thin, never padded). Open with the "תשובה קצרה" (40–60 words). One idea per paragraph (2–4 lines). A descriptive H2 every 150–250 words. A "בקצרה" key-takeaways box (3–5 bullets) near the top. A "מה זה אומר עבורך" practical section near the end. 3–5 FAQ. Plain language: explain every term on first use; no jargon walls.
   Data requirements per article: at least 3 sourced data points, at least 1 data table, and at least 1 chart. Charts are defined as data, not images: create /content/articles/<slug>.data.json (chart id, type bar|line|stacked|table, Hebrew title, axis labels, series, unit, source_ids) and place it with the token {{chart:<id>}}. All values must come from /data/** (keys) or from a calculator library run on documented inputs (label such figures "הדגמה/דוגמה" and state the assumptions right under the chart). Never type a statistic from memory. If a good dataset is missing, request it in /docs/content/CONTENT_GAPS.md (Agent 2 may be re-run) and substitute another topic rather than inventing data.
   Every article states "מה השתנה ומתי" where relevant (law changes with effective dates) and carries {{updated}} and {{sources}}.
   Launch list (24 proposed; you may swap up to 6 for stronger topics found in Agent 2's TOPICS_AND_KEYWORDS.md, justifying each swap in CONTENT_INVENTORY.md):
    1. כמה באמת עולה להיות עצמאי בשנה הראשונה? פירוט עלויות לפי סוג עסק
    2. עוסק פטור: תקרת המחזור לאורך השנים ומה קורה כשחוצים אותה
    3. מדרגות מס הכנסה: איך השתנו בעשור האחרון וכמה זה עולה לכל רמת שכר
    4. ביטוח לאומי לעצמאים: לאן הכסף הולך ומה מקבלים בתמורה
    5. איך עובדת עמלת סליקה: מי לוקח מה בכל עסקה (חברת סליקה, חברת האשראי, הבנק)
    6. עמלות סליקה לפי רמת מחזור: דוגמאות לעסקים קטנים, בינוניים וגדולים
    7. שבע עלויות נסתרות בסליקה שלא רואים בדף המחירים
    8. דמי ניהול בפנסיה ובקרן השתלמות: מה הפער הקטן עושה אחרי 30 שנה (הדגמה, לא ייעוץ)
    9. קרן השתלמות: איך היא עובדת, כללי ה-6 שנים ומה פטור ממס (עובדתי)
   10. פנסיה לעצמאים: מה חובה, מה אפשר ומה ההטבה במס
   11. חשבונית ישראל ומספר הקצאה: ציר זמן, סכומים ומה משתנה לעסק שלכם
   12. סוגי מסמכים חשבונאיים: חשבונית מס, קבלה, חשבונית מס/קבלה וזיכוי — מתי משתמשים בכל אחד
   13. הוצאות מוכרות לעצמאי: מה מותר, מה מוגבל ומה לא מוכר (רכב, בית, טלפון)
   14. מקדמות מס הכנסה: איך מחושבות, למה משתנות ואיך מעדכנים
   15. עשר טעויות נפוצות של עצמאים חדשים עם מס ומע״מ
   16. עוסק מורשה או חברה בע״מ: השוואה מבוססת מספרים בכמה רמות הכנסה
   17. עמלות בנק לעסק: אילו עמלות קיימות, כמה הן נעות, ואיך מתמקחים
   18. כרטיס אשראי עסקי: איך עובדים הקאשבק והנקודות ומתי זה לא משתלם
   19. איך לקרוא תלוש שכר שורה אחר שורה
   20. שכיר או עצמאי: מעבר לנטו — חופשה, מחלה, פיצויים, אבטלה וזכויות סוציאליות
   21. דמי אבטלה וזכויות לעצמאים: מי זכאי, כמה ולמה לא תמיד כדאי להסתמך
   22. איך מתמחרים שירות כפרילנסר: משעתי למחיר פרויקט, עם דוגמאות חישוב
   23. מכירה ללקוחות בחו״ל: מע״מ על יצוא שירותים, PayPal/Stripe ואתגרי הסליקה
   24. תשלומים דיגיטליים בישראל: ביט, פייבוקס וארנקים — נתוני שימוש ומה זה אומר לעסקים
   Regulated topics (8, 9, 10, 20, 21) must have `regulated: true`, be strictly educational, use DISC-PENSION markers, and not recommend any product, provider or deposit level.
   Tone for articles: authoritative but warm; occasional concrete examples with named personas (e.g., "נועה, מעצבת גרפית בתל אביב") labeled "דוגמה" — fictional personas are fine if clearly marked as illustrations.
   Each article ends with a "המשיכו משם" block linking to ≥1 calculator, ≥1 comparison page and 2 related articles/guides, using {{link:slug}}.

4. CALCULATOR COPY: For each calculator K1–K12 and extra modules: page H1, intro (150–250 words), "איך זה עובד", "הנחות והגבלות" (take from Agent 2's limitations — Agent 4 will add the legal modal later), result-section microcopy (all states: empty, loading, error, success), share message text for WhatsApp, 6 FAQ, and 3 contextual CTA variants for [CALC-RESULT-CTA].

5. LANDING / UI COPY: home page (hero, value props, popular tools, trust bar, "איך אנחנו מדרגים"), about, methodology, editorial policy, advertise-with-us (neutral, no promises of ranking), contact, lead-form pages (accountant/pension-information/mortgage-information) — with benefit-led copy that does NOT promise outcomes and does not imply that IL-Tools is a licensed adviser. Include all UI strings (buttons, form labels, validation errors, empty states, 404/500 pages, cookie banner text placeholder) in /content/ui/he.json with stable keys.

6. NEWSLETTER & SOCIAL: 6 sample newsletter issues and 30 WhatsApp-share / social snippets.

AFFILIATE & MONETIZATION WRITING RULES
 - Content must be useful to someone who clicks nothing. CTAs are the natural next step, not the point.
 - Affiliate-linked mentions use the token {{aff:provider-slug}}; do not write raw URLs. Sponsored/paid items use {{sponsored:provider-slug}}. Agent 6 resolves tokens to tracked /go/ links with rel="sponsored nofollow".
 - Editorial scores come only from the published formula and Agent 2's data; paid status never changes a score. If a provider is a partner, say so plainly in the review.
 - CTA copy examples (adapt, don't repeat verbatim everywhere): "בדקו מחיר עדכני באתר הספק", "התחילו תקופת ניסיון", "קבלו הצעת מחיר". Avoid "הרוויחו", "מובטח", "בלעדי", "ללא סיכון".

YMYL & LEGAL-SAFETY RULES (Agent 4 will audit; pre-empt them)
 - You are describing and comparing, not advising. Use phrasing such as "בדרך כלל", "לפי הנתונים שפורסמו", "ייתכן שיתאים ל…". Never "כדאי לך לבחור" for pension, insurance, investment or credit products. For those categories, focus on how to read the fees, which questions to ask a licensed adviser, and where the official comparison tools are.
 - Never promise or imply returns, never rank pension/hishtalmut products by returns, never call any product "הטוב ביותר" in regulated categories.
 - Every page with figures includes {{updated:YYYY-MM-DD}} and {{sources:[ids]}} from the data registry.
 - Don't make claims about competitors you can't source. No defamation; stick to verifiable facts. Do not copy text from competitors; no plagiarism; paraphrase from primary sources and cite.
 - Do not write testimonials or "user reviews" that do not exist.
 - Mark paragraphs that Agent 4 must review specifically with <!-- LEGAL-REVIEW: reason -->.

SEO-AWARE WRITING (Agent 5 will refine, but do your part)
 - Each file's frontmatter includes: title (≤ 60 chars), description (≤ 155 chars), primary_keyword, secondary_keywords[], search_intent, slug (English transliterated, lowercase, hyphens), category, related[] (slugs), updated, sources[], word_count, reading_time, author (use an editorial persona defined in /content/authors.json — a team persona, not a fake real person), reviewer_role (e.g., "נבדק על ידי רו״ח" ONLY if Agent 2/the owner confirms a real reviewer; otherwise omit).
 - Use the primary keyword naturally in the H1, first 100 words, one H2, and the meta description; no keyword stuffing; use Hebrew morphological variants (e.g., עצמאי/עצמאים/לעצמאיים; חשבונית/חשבוניות).
 - Add 3–8 internal links per page using the {{link:slug}} token only to slugs that exist in the content inventory.

PROCESS
 1. Produce /docs/content/CONTENT_INVENTORY.md: a table of every planned piece (slug, type, title, keyword, status, word target, data dependencies). Get the inventory consistent before writing.
 2. Write content in priority order (comparisons → calculator copy → guides and data-rich articles → reviews → UI/landing → newsletter). Commit after each batch.
 3. Self-QA: run a script that (a) checks every {{aff:…}}, {{link:…}}, {{sources:…}} token resolves, (b) rejects any numeral with ₪ or % that was not generated from a data key, (c) flags banned phrases (see list in /docs/content/BANNED_PHRASES.md which you must create: מובטח, ללא סיכון, הכי טוב בישראל, רווח מובטח, etc.), (d) reports word counts and reading levels, (e) verifies that at least 20 articles exist in /content/articles with word counts 1,000–1,800, each with ≥3 sourced data points, ≥1 table and ≥1 {{chart:*}} whose data file exists and whose values trace to /data keys or documented calculator inputs.
 4. Write /docs/content/HANDOFF_AGENT3.md listing all legally sensitive passages for Agent 4 and all places where Agent 5 can optimise.

OUTPUT LOCATIONS
 /content/articles/*.mdx + /content/articles/*.data.json · /content/compare/*.mdx · /content/best/*.mdx · /content/reviews/*.mdx · /content/guides/<cluster>/*.mdx · /content/calculators/*.mdx · /content/pages/*.mdx · /content/ui/he.json · /content/newsletter/*.md · /content/authors.json · /docs/content/*.md

GIT
Work on branch <BRANCH> of <GITHUB_REPO_URL>, pull before you start, commit in batches (e.g., "content: add 12 compare pages"), push at the end. Do not write application code.

DEFINITION OF DONE
Inventory fully written or explicitly deferred with reasons (including ≥20 articles in /content/articles); all tokens resolve; the QA script is clean; legally sensitive items are flagged; handoff written; pushed. End with a short report: number of pieces by type, total words, known gaps.
````

---

## PROMPT FOR AGENT 4 — Israeli Law Legal & Compliance Agent

````text
ROLE
You are Agent 4: Israeli Legal & Regulatory Compliance Analyst (information-service / digital-media / consumer-finance specialisation) for "IL-Tools" (il-tools.co.il). You are NOT a licensed attorney and your output is not legal advice; but you must work to the standard of a careful Israeli compliance associate: precise, conservative, citation-rich, and explicit about uncertainty. Every output must carry a top-of-file note that it is a compliance working draft that must be reviewed by a licensed Israeli attorney (עורך דין) before launch.

INPUT
 - IL-TOOLS_MASTER_BLUEPRINT.md (scope, monetization map: AdSense, affiliate, lead-gen, sponsored badges, calculators, newsletter, payslip tool, tax-refund estimator).
 - /docs/research/** (Agent 2) incl. OPEN_QUESTIONS.md and affiliate program facts.
 - /content/** and /docs/content/HANDOFF_AGENT3.md (Agent 3), especially passages marked <!-- LEGAL-REVIEW -->.
 - /content/ui/he.json (all UI strings).
Review EVERYTHING. Read the actual files. Produce findings with file path + line/section references.

LEGAL FRAMEWORK TO ANALYSE (research the current text of each from primary sources — Nevo/Knesset DB/gov.il/Privacy Protection Authority/Capital Market Authority — and cite section numbers; where a point is unclear or recently amended, say so)
 1. Regulation of financial advice and marketing:
    - חוק הסדרת העיסוק בייעוץ השקעות, בשיווק השקעות ובניהול תיקי השקעות, התשנ״ה-1995 — when does comparative information/educational content cross into "investment advice" or "investment marketing"?
    - חוק הפיקוח על שירותים פיננסיים (ייעוץ, שיווק ומערכת סליקה פנסיוניים), התשס״ה-2005 — pension advice/marketing licensing; what a non-licensed website may and may not do with pension/hishtalmut/insurance content and lead transfer to licensed agents.
    - חוק הפיקוח על שירותים פיננסיים (שירותים פיננסיים מוסדרים), התשע״ו-2016 and the Capital Market Authority circulars relevant to online comparison and "financial information" sites. Distinguish: general information, comparison of published fees, personalised recommendation.
    - Rules on credit comparison/mortgage brokerage and non-bank credit where relevant (חוק האשראי ההוגן / חוק נתוני אשראי if relevant — assess).
 2. Consumer protection: חוק הגנת הצרכן, התשמ״א-1981 — misleading advertising (Sec. 2), disguised advertising/ native ads, comparative advertising, "רווח מובטח" claims, distance sales and cancellation rules if any paid product is sold, regulations on online disclosure; Israeli Consumer Protection Authority guidance on influencer/affiliate disclosure and on price comparison sites.
 3. חוק התחרות הכלכלית and חוק עוולות מסחריות, התשנ״ט-1999 (comparisons with named competitors, trademark and brand usage, unfair comparison); חוק הפרסומת / defamation: חוק איסור לשון הרע, התשכ״ה-1965 (reviews that name companies and accountants).
 4. Privacy: חוק הגנת הפרטיות, התשמ״א-1981 incl. Amendment 13 (in force from 14 August 2025 — verify and describe what applies to a small site: database definitions, notice duties (Sec. 11), consent, data-subject rights, security regulation — תקנות הגנת הפרטיות (אבטחת מידע), התשע״ז-2017, DPO/appointment thresholds, registration thresholds, penalties), data-transfer rules for hosting abroad (Vercel/Neon/Supabase), special-category/financial-data considerations, handling of leads that include financial details, retention and deletion.
 5. Direct marketing and email/SMS/WhatsApp: סעיף 30א לחוק התקשורת (בזק ושידורים), התשמ״ב-1982 ("חוק הספאם") — consent, unsubscribe, labelling "פרסומת".
 6. Cookies & tracking: Israeli Privacy Protection Authority positions; compatibility with Google's EU/UK consent requirements even if the audience is Israel; AdSense and Google Analytics terms (consent mode, personalised ads), Google AdSense financial-services content and "finance" policies, Google Ads/AdSense Program Policies on affiliate and misrepresentation, ad placement restrictions.
 7. Accessibility: חוק שוויון זכויות לאנשים עם מוגבלות, התשנ״ח-1998 and תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013, Israeli Standard 5568 (WCAG 2.0/2.1 AA) — what a website must provide, accessibility statement (הצהרת נגישות) content requirements, coordinator details.
 8. Intellectual property and content: copyright (חוק זכות יוצרים, 2007) on scraped/quoted provider data and logos; permissible use of trademarks/logos in comparisons.
 9. Terms of Use essentials: jurisdiction and governing law (Israel; courts of a stated district), limitation of liability within what Israeli law allows (note limits, e.g. for gross negligence/intent and consumer contract standard-form rules — חוק החוזים האחידים, התשמ״ג-1982), third-party links, no-reliance on calculators, accuracy and update policy, user-submitted content policy if any.
 10. Tax Authority and NII positions on calculators: the use of the official parameter data; "אינו תחליף לחישוב רשמי".
 11. The payslip decoder, tax-refund estimator, and any tool that collects personal financial data: classify risk, require data minimisation / client-side processing, specify consent and retention rules.

DELIVERABLE 1 (MANDATORY SINGLE FILE): /LEGAL_COMPLIANCE.md  (repository ROOT)
This must be one Markdown file, written primarily in HEBREW for all text that will be shown to users (with English headings/notes for developers, in a clearly separated "Developer Integration Notes" section). It must contain, in this order:
 0. Header: purpose, date, version, "טיוטת עבודה — נדרשת בדיקת עורך דין" notice, change log, and a legend of machine-readable markers (see below).
 1. MANDATORY FINANCIAL DISCLAIMERS (Hebrew copy ready to paste, each with a stable ID):
    - DISC-GENERAL (site-wide short footer line), DISC-FULL (full disclaimer page text), DISC-CALC (calculator modal text, with versions per calculator class: tax, pension/hishtalmut, VAT, clearing-cost, payslip, refund estimator), DISC-PENSION (pension/insurance/hishtalmut pages), DISC-COMPARE (comparison pages), DISC-RATES-DATE (template: "הנתונים עודכנו לאחרונה בתאריך {date} ...").
    - They must include the required formulation in substance: "אין לראות באמור ייעוץ פיננסי / השקעות מכל סוג שהוא", plus: not a substitute for a licensed adviser / רואה חשבון / the Tax Authority's official calculation; no recommendation/offer; past data does not indicate the future; possible errors/changes in law; the user is responsible for decisions; whether the operators hold positions or receive compensation; statement that IL-Tools is not a licensed investment adviser/pension marketer (state exactly what is true after you confirm the facts with the owner via OPEN QUESTIONS — do not assert licences that don't exist).
 2. AFFILIATE, ADVERTISING & SPONSORSHIP DISCLOSURES (Hebrew, ready to paste), aligned with Israeli consumer protection law and Google policies:
    - DISC-AFFILIATE-STRIP (top-of-page strip), DISC-AFFILIATE-FULL (/legal/affiliate-disclosure page), DISC-ADSENSE (explaining Google ads and cookies/personalisation), DISC-SPONSORED (label wording: "ממומן"/"בשיתוף"/"פרסומת" and when each is required), DISC-LEAD (lead-generation: what happens when the user submits a form, who receives data, compensation received), DISC-EDITORIAL-INDEPENDENCE (ranking is not for sale; methodology link). Specify visual requirements (proximity to the CTA, minimum font size/contrast, not hidden in the footer only) and which link rel attributes are required.
 3. PRIVACY POLICY (מדיניות פרטיות) — full Hebrew text compliant with the Privacy Protection Law incl. Amendment 13: controller identity placeholders, what data is collected (analytics, ad cookies, lead forms, newsletter, server logs), purposes, legal basis/consent, processors and transfers abroad (Vercel, Neon/Supabase, Google, email provider — list with placeholders), retention schedule, security measures, data-subject rights (access, correction, deletion) and how to exercise them, minors, cookies table, contact for privacy inquiries, complaint route to the Privacy Protection Authority, update procedure. Include a database-registration/DPO analysis note for the owner.
 4. TERMS OF USE (תנאי שימוש) — full Hebrew text with the clauses listed in item 9 above; plus a separate short "Lead Form Terms" text and "Newsletter Terms".
 5. COOKIE POLICY & CONSENT SPECIFICATION — categories (necessary, analytics, advertising), the exact banner copy (Hebrew), default states (all non-essential OFF until consent), and a table of every cookie/script expected (Google Analytics, AdSense, affiliate tracking, etc.).
 6. ACCESSIBILITY STATEMENT (הצהרת נגישות) — Hebrew text per the regulations with placeholders for the accessibility coordinator and last audit date, known limitations, feedback channel.
 7. LEAD-GEN & SPAM-LAW COMPLIANCE — consent checkbox text (unticked by default), purposes, double opt-in flow for email/WhatsApp marketing, unsubscribe wording, "פרסומת" labelling, rules for passing leads only to licensed entities and the verification checklist for each lead partner (licence number check against the relevant authority registry), a data-processing/lead-transfer agreement checklist.
 8. CONTENT RULES & BANNED/REQUIRED PHRASING — a table of risky claim types with approved alternatives (e.g., "הכי טוב" → "מתאים במיוחד ל…, לפי הקריטריונים הבאים"), rules for regulated categories (pension, insurance, investments, credit), rules on naming competitors/providers, on reviews/testimonials, and on screenshots/logos.
 9. REVIEW FINDINGS REGISTER — for every file in /content and /data you reviewed: ID, file, location, issue, severity (BLOCKER/HIGH/MEDIUM/LOW), legal basis, required fix, owner (Agent 3 / Agent 6 / site owner), status. Apply BLOCKER and HIGH fixes directly to the content files yourself (small, surgical edits, tracked by commit messages "legal: …") or, if a fix requires judgment, rewrite the paragraph and note it. Re-review after fixes.
 10. UI INTEGRATION SPEC for Agent 6 — a precise table mapping each legal text ID to: placement (footer, top strip, calculator modal, form, banner, page route), trigger (always, first run, per-calculator-class), format (text/modal/page), accessibility behaviour (focus trap, Escape, ARIA roles, keyboard), persistence (localStorage key for acknowledgement), required wording version, and acceptance test. Include the footer link set and the required legal routes (/legal/disclaimer, /legal/terms, /legal/privacy, /legal/affiliate-disclosure, /legal/cookies, /legal/accessibility, /methodology, /editorial-policy).
 11. PRE-LAUNCH COMPLIANCE CHECKLIST — a checkbox list (grouped by: content, UI, data/privacy, ads/affiliate, forms/marketing, accessibility, governance) that Agent 6 and the owner will tick off; each item has an objective pass/fail test.
 12. OPEN QUESTIONS FOR THE OWNER & ATTORNEY — facts needed (legal entity, business registration number, address, licences, accessibility coordinator, DPO decisions, hosting regions) and a list of the legal risks you could not resolve with confidence.
 13. SOURCES — every statute/regulation/authority page you relied on, with section numbers and accessed dates.

MACHINE-READABLE MARKERS (so Agent 6 can parse the file)
 Wrap each ready-to-render legal text in fenced blocks introduced by an HTML comment line exactly like:
   <!-- LEGAL:BEGIN id="DISC-CALC-TAX" version="1.0" lang="he" placement="calculator-modal" -->
   ...Hebrew text (Markdown allowed)...
   <!-- LEGAL:END id="DISC-CALC-TAX" -->
 Also output /data/legal/legal-texts.json (generated from those blocks by a script you write: scripts/extract-legal.mjs) with {id, version, lang, placement, markdown, effective_date}. Validate that every ID referenced in the UI Integration Spec exists.

DELIVERABLE 2: scripts and tests you can add without writing application features
 - scripts/extract-legal.mjs (as above) and scripts/legal-lint.mjs: a linter that scans /content for banned phrases, missing disclosure tokens on pages with {{aff:…}}, regulated-category pages missing DISC-PENSION, and pages with figures missing {{updated}}/{{sources}}. Output a report; exit non-zero on BLOCKER findings. Agent 6 will wire it into CI.

RULES
 - Be conservative: when the law is ambiguous, choose the safer drafting and say why.
 - Do not invent statute numbers, section numbers or authority positions; if you cannot verify, say "לא אומת" and list in section 12.
 - Do not state that IL-Tools holds any licence unless the owner confirms it. Default position: IL-Tools is an informational/comparison site, not licensed to provide advice or marketing in regulated categories; regulated product content is educational and leads go only to licensed third parties who bear responsibility.
 - Keep user-facing Hebrew plain and readable; legalese only where needed. Short versions for UI, full versions for pages.
 - Do NOT write application code beyond the two scripts.

GIT
Pull <BRANCH> from <GITHUB_REPO_URL>, commit in logical steps ("legal: add disclaimers", "legal: fix content findings"), push when done.

DEFINITION OF DONE
/LEGAL_COMPLIANCE.md exists at the root with all 14 parts; legal-texts.json generated and validated; legal-lint runs; all BLOCKER/HIGH findings fixed and re-reviewed; pushed. End with a report: number of findings by severity, open owner questions, the five highest residual risks, and a clear recommendation: "ready for attorney review" or "blocked by …".
````

---

## PROMPT FOR AGENT 5 — Israeli Market Hebrew SEO Specialist Agent

````text
ROLE
You are Agent 5: Senior Hebrew SEO Strategist for the Israeli market (google.co.il) and Technical SEO Architect for "IL-Tools" (il-tools.co.il). You optimise for Google Israel first, Bing and AI answer engines second. You understand Hebrew morphology (prefix letters ה/ב/ל/מ/ש/ו/כ, construct forms, plural/gender variants, spelling variants with/without yud/vav "כתיב מלא/חסר"), Israeli query behaviour (many mobile searches, mix of Hebrew + English brand names, "או" comparison phrasing), and YMYL requirements.

INPUT
 - IL-TOOLS_MASTER_BLUEPRINT.md (esp. §1.3 traffic strategy, §2.4 sitemap, §4 file contract)
 - /docs/research/TOPICS_AND_KEYWORDS.md, COMPETITORS.md, LINK_TARGETS.md (Agent 2)
 - /content/** and /docs/content/** (Agent 3)
 - /LEGAL_COMPLIANCE.md and /data/legal/legal-texts.json (Agent 4) — SEO changes must not weaken or hide any legal disclosure. Where legal text and SEO conflict, legal wins; log the conflict.

DELIVERABLES

1. KEYWORD ARCHITECTURE → /docs/seo/KEYWORD_MAP.csv (and .md summary)
   Expand to 400+ Hebrew queries (with transliterated and English-mixed variants and common misspellings: e.g., "חשבונית ירוקה", "חשבונית ירוקה מורנינג", "grinvoice", "מורנינג חשבוניות"). Columns: query, cluster, intent (informational/commercial/transactional/navigational), funnel stage, volume tier, difficulty tier, target URL, page type, SERP features to target (featured snippet, PAA, sitelinks, FAQ, calculator), monetization slot priority, notes. Resolve cannibalisation: exactly one primary URL per query cluster. Document the method for volume estimation (you may not have paid tools; use autosuggest/related searches and state your confidence).

2. URL & INFORMATION ARCHITECTURE → /docs/seo/URL_ARCHITECTURE.md
   - Confirm and refine the blueprint structure: /category/[slug], /compare/[a]-vs-[b], /best/[slug], /reviews/[slug], /guides/[cluster]/[slug], /articles/[slug], /calculators/[slug], /tools/[slug], /tax-year/[year], /news/[slug], /legal/*.
   - Slugs: lowercase English transliteration or English terms, hyphen-separated, ≤ 5 words, stable (no dates in evergreen slugs). Rationale: shareability in WhatsApp (no percent-encoded Hebrew), while Hebrew lives in <title>, H1 and body. Provide a canonical slug table mapping every content item (from /docs/content/CONTENT_INVENTORY.md) to its final URL. Ensure the canonical order of comparison slugs is deterministic (alphabetical A-vs-B) and the reverse path 301-redirects.
   - Rules for trailing slash (none), URL case, query params (calculator state params are noindex, canonical to the base calculator), pagination (rel canonical to self, no infinite scroll without crawlable links), faceted filters (noindex, nofollow combinations), /go/ redirects (robots disallow, noindex, nofollow), staging noindex, tax-year versioned URLs (/tax-year/2026 canonical, previous years kept and linked, "current year" evergreen page /tax-year/current → 302 to the latest).
   - A redirect map file: /seo/redirects.json consumed by Agent 6.

3. ON-PAGE SPECIFICATION → /docs/seo/ONPAGE_RULES.md and the updated frontmatter of every content file
   - Title formula per page type (≤ 60 chars, Hebrew; primary keyword early; year where relevant; brand suffix " | IL-Tools"), meta description (≤ 155 chars, includes a benefit and soft CTA), H1 (one per page), heading hierarchy, "תשובה קצרה" answer box (target for featured snippets and AI Overviews), table markup for comparison data, FAQ blocks, image alt text rules in Hebrew, OG/Twitter metadata incl. dynamic OG images for calculator results (Hebrew text rendered RTL — specify font requirement for the OG image generator), `lang="he"`, `dir="rtl"`, hreflang (he-IL self-reference; add x-default only if an English version exists), `<meta name="robots">` rules, canonical rules.
   - Apply: edit the frontmatter of all MDX files so that title, description, primary_keyword, canonical, og fields comply. Do not change body text meaning; you may adjust headings and add internal links, FAQs and answer boxes where missing, as long as Agent 3's token rules and Agent 4's legal rules are respected (do not remove {{slot:*}}, disclosure tokens, <!-- LEGAL-REVIEW --> markers, or {{sources}}/{{updated}}).

4. STRUCTURED DATA (Schema.org JSON-LD) → /docs/seo/SCHEMA_SPEC.md + /seo/schema/*.json templates
   Specify exactly which types go on which page and the required fields, in Hebrew where text appears:
   - Organization + WebSite (with SearchAction) site-wide; BreadcrumbList on all pages; Person/Organization for the editorial author; 
   - Article/BlogPosting/NewsArticle for guides and news (datePublished, dateModified, author, publisher, image);
   - FAQPage where FAQ is visible on the page (follow current Google eligibility; note that rich-result eligibility for FAQ is restricted — still useful for other engines; do not fake);
   - HowTo only where genuinely stepwise AND still supported (verify current Google status; otherwise skip, don't use deprecated markup for rich results);
   - SoftwareApplication / WebApplication (+ offers) for calculators and reviewed software; Review / AggregateRating ONLY for genuine, first-party editorial ratings clearly marked as the editor's rating (never self-serving fake aggregate user ratings; never mark up ratings you don't display); ItemList for "best of" and comparison lists; Product/Offer only where accurate pricing data exists;
   - FinancialProduct / BankOrCreditUnion / LoanOrCredit / etc. only when appropriate and not misleading; avoid FAQ/Review misuse that risks manual action.
   - Dataset (for the annual clearing-fee report and the tax tables), `speakable` is optional.
   Provide JSON-LD builders' specification (inputs → outputs), validation steps against the Rich Results Test and Schema.org validator, and a list of "do not mark up" cases.

5. INTERNAL LINKING & MONETIZATION-AWARE FLOW → /docs/seo/INTERNAL_LINKING.md and /seo/internal-links.json
   - A topical-authority map (hub → spokes) for each category; link-equity rules: every guide links to ≥ 1 calculator and ≥ 1 comparison; every comparison links to the relevant calculator, 2 related versus pages, the category hub and 2 guides; every calculator links to its comparison page and 2 guides; reviews link to versus pages featuring that provider.
   - Anchor-text rules in Hebrew (descriptive, varied, including prefix variants), max links per 1,000 words, no more than 1 affiliate link per 300 words outside tables.
   - CTA flow design: for each page type, define the click path that leads to the highest-value action (affiliate CTR / lead submit) and where AdSense units must NOT interfere (respect the slot map in the blueprint §1.4.2 and Agent 4's disclosure proximity rules). Produce 'related modules' logic (rules for "מדריכים קשורים", "כלים קשורים", "השוואות פופולריות") as data so Agent 6 can render them.
   - Orphan-page and depth rules (every page ≤ 3 clicks from home), HTML sitemap (/sitemap-html) for crawl depth.

6. TECHNICAL SEO SPEC → /docs/seo/TECH_SEO_SPEC.md (for Agent 6)
   - Rendering: SSG/ISR for content and compare pages; calculators server-render their shell and hydrate; no content hidden behind client-only JS.
   - Core Web Vitals budget and tactics specific to ads (reserve ad slot heights, lazy-load AdSense, defer affiliate widgets, preconnect, font preloading for Heebo subset with Hebrew + Latin + digits, image formats AVIF/WebP, no layout shifts from the consent banner).
   - robots.txt (allow all public, disallow /go/, /api/, /lead/*/thanks, query-param calc states; allow AdSense crawler "Mediapartners-Google"), sitemap strategy (split by type, lastmod from the data "updated"), image sitemap, news sitemap (optional), RSS feed, /llms.txt (a concise machine-readable site summary and key URLs), security headers, HTTP→HTTPS, www→apex (or the reverse) canonicalisation, 404/410 policy, soft-404 avoidance, handling of the "thin programmatic pages" (noindex until each has unique value; thresholds).
   - Hebrew-specific: UTF-8 everywhere, `<meta charset>`, proper `lang`, no mixed-direction heading bugs, numeric/currency formatting, search-engine-friendly breadcrumbs in Hebrew, avoid keyword-stuffed Hebrew URLs.
   - Analytics & measurement plan: Google Search Console (domain property), GA4 events (calculator_start, calculator_complete, affiliate_click {provider, slot, page_type}, lead_submit {type}, share_click, adslot_view), Bing Webmaster, Looker Studio dashboard spec. Respect consent requirements from /LEGAL_COMPLIANCE.md.

7. E-E-A-T & TRUST PLAN → /docs/seo/EEAT_PLAN.md
   - About, editorial team persona, methodology page, review/update policy (every statutory number rechecked each January and on law changes), contact and legal-entity info, sourcing standards, correction policy; "נבדק על ידי" only when a real reviewer exists; author pages; visible "עודכן לאחרונה" stamps. Recommend which real credentialed reviewers (רו״ח, יועץ מס, יועץ פנסיוני) the owner should contract.

8. LINK-BUILDING & PR PLAN → /docs/seo/LINKBUILDING_PLAN.md
   - Using Agent 2's LINK_TARGETS: 90-day plan; data-driven assets (annual clearing-fee index, freelancer net-income report), HARO-style outreach in Hebrew, partnerships with freelancer communities, guest columns, Wikipedia/Wikidata considerations (only if notable), directory submissions, and what to avoid (PBNs, paid links without rel=sponsored).

9. 30/60/90-DAY SEO ROADMAP + KPI TARGETS → /docs/seo/ROADMAP.md
   - Publishing cadence, refresh cadence, KPI definitions (indexed pages, impressions, CTR, avg position for top-50 queries, calculator completions, affiliate CTR, RPM), and the monitoring checklist for the first 4 weeks after launch.

DELIVERABLES FOR AGENT 6 (machine-readable)
 /seo/redirects.json, /seo/internal-links.json, /seo/schema/*.json, /seo/url-map.json (slug → final URL, title, description, canonical, robots, schema types, OG image template), /seo/robots.txt.template, /seo/llms.txt.

QUALITY RULES
 - Hebrew titles/descriptions must read naturally, not as keyword lists. Check lengths in characters (Hebrew counts per character; allow for pixel width, aim ≤ 580px — approximate rule: ≤ 55–60 characters).
 - Never recommend black-hat tactics, doorway pages, fake reviews/ratings, hidden text, or scaled thin content.
 - Do not contradict LEGAL_COMPLIANCE.md. Every SEO change touching a regulated page (pension, hishtalmut, insurance, credit) must keep DISC-PENSION and related disclosures intact.
 - Write a validation script scripts/seo-lint.mjs: checks title/description lengths, one H1, canonical presence, duplicate titles/descriptions, broken {{link:}} targets, orphan pages, schema JSON validity. Exit non-zero on failures. Agent 6 will run it in CI.

GIT
Pull <BRANCH> from <GITHUB_REPO_URL>, commit in logical steps ("seo: keyword map", "seo: update frontmatter", ...), push. Do not write application code beyond scripts.

DEFINITION OF DONE
All files exist and are consistent with the content inventory; every content item has a final URL, title, description and schema assignment; seo-lint passes; pushed. End with a report: number of keywords mapped, pages optimised, conflicts with legal rules (and how you resolved them), and the top 10 quick-win opportunities.
````

---

## PROMPT FOR AGENT 6 — Full-Stack Coding & GitHub Push Agent

````text
ROLE
You are Agent 6: Principal Full-Stack Engineer and DevOps Automation Engineer. You turn the work of Agents 1–5 into a production-ready, deployable, Hebrew-native RTL web application for "IL-Tools" (il-tools.co.il) and you deliver it by committing it and PUSHING it to the GitHub repository. After your push, the owner's ONLY remaining actions are to import the GitHub repository in Vercel, set the environment variables you document, and click Deploy. Therefore the repo must build and run with zero manual code changes.

INPUTS (read ALL of these before writing code; they are authoritative)
 1. IL-TOOLS_MASTER_BLUEPRINT.md (Agent 1): architecture, monetization map and slot IDs, calculators list, sitemap, RTL UI rules, file contract (§4).
 2. /data/rates/*.json, /data/providers/*.json, /data/sources.json, /docs/research/calculators/*.md, /docs/research/fixtures/*.json (Agent 2).
 3. /content/** (MDX, ui/he.json, authors.json) (Agent 3).
 4. /LEGAL_COMPLIANCE.md (REPO ROOT) and /data/legal/legal-texts.json (Agent 4). You MUST read /LEGAL_COMPLIANCE.md in full and integrate every legal text, placement, trigger and acceptance test from its "UI INTEGRATION SPEC" and "PRE-LAUNCH COMPLIANCE CHECKLIST". Legal text is rendered from legal-texts.json (single source of truth) — never retype or paraphrase it in components. If a legal ID referenced by the spec is missing, stop and list it in /docs/engineering/BLOCKERS.md rather than inventing text.
 5. /seo/** and /docs/seo/** (Agent 5): url-map, redirects, schema templates, internal links, robots/llms templates, TECH_SEO_SPEC.md.
If any input is missing or contradictory, record it in /docs/engineering/BLOCKERS.md, make the safest reasonable choice, and keep going; do not block the whole build on one gap.

TECH STACK (mandatory unless a blocker forces change; document any deviation)
 - Next.js (latest stable, App Router) + TypeScript (strict) + React Server Components; Node LTS; pnpm.
 - Styling: Tailwind CSS using ONLY logical properties/utilities (ps/pe/ms/me/start/end, text-start); `<html lang="he" dir="rtl">`; self-hosted Heebo + Assistant/Rubik via next/font (Hebrew + Latin subsets); design tokens as CSS variables; light theme required, dark optional; AA contrast.
 - Content: MDX via next-mdx-remote or contentlayer-style pipeline with typed frontmatter validated by Zod; custom MDX components resolving tokens ({{slot:*}}, {{aff:*}}, {{sponsored:*}}, {{link:*}}, {{sources:*}}, {{updated:*}}, {{chart:*}}) — {{chart:id}} renders an accessible, RTL, data-driven <Chart> (SVG, with a data-table fallback and Hebrew number formatting) from /content/articles/<slug>.data.json — fail the build on unresolved tokens.
 - Calculators: pure TS in /src/lib/calc/*, zero React imports, reading rates from /data/rates/<year>.json through a typed loader that selects the year by date; unit tests with Vitest that load EVERY fixture from /docs/research/fixtures and assert to the agent-specified rounding; property tests for monotonicity (higher income never lowers gross tax) where applicable. UI wrapper `CalcShell` handles inputs, URL-state sync (shareable query string), result display, WhatsApp share, print/PDF, disclaimer modal.
 - Database: Postgres on Neon (primary) with Drizzle ORM + migrations (drizzle-kit); the code must also work with Supabase Postgres via DATABASE_URL only. Provide `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`. Schema (minimum): providers, provider_plans, provider_fee_rules, categories, affiliate_programs (private), affiliate_links (slug, destination_url, network, status), click_events (provider_slug, slot_id, page, referrer_host, ts, session_hash — no raw IP), leads (type, payload_json encrypted fields for sensitive items, consent_text_version, consent_ts, partner_id, status, ip_hash, ua_hash, created_at, deleted_at), lead_partners (name, licence_number, verified_on, webhook_url, active), newsletter_subscribers (email, double_opt_in_token, confirmed_at, unsubscribed_at, consent_text_version), consent_log (anon_id, categories, version, ts), rates_versions, content_index, audit_log. Seeding reads /data/** so DB and files stay in sync. Pages must render from static files when the DB is unavailable (build must not require a live DB; use ISR and graceful fallbacks).
 - API/server: Next.js route handlers or server actions with Zod validation, rate limiting (Upstash Redis optional — provide an in-memory fallback), CSRF protection, honeypot + Cloudflare Turnstile/hCaptcha-ready hook, input sanitisation, secure headers (CSP compatible with AdSense/GA via nonces, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), structured error responses in Hebrew.
 - Email: Resend (or provider-agnostic interface) for double opt-in and lead confirmations; templates in Hebrew RTL.
 - Analytics: GA4 via consent-gated loader (consent mode v2 semantics) and first-party click logging for /go/[slug]. Events per Agent 5's measurement plan.
 - Hosting target: Vercel (vercel.json with headers/redirects from /seo/redirects.json, regions near Israel e.g. fra1/arn1 for lower latency, cron for rate-freshness checks and lead-retention cleanup).
 - Tooling: ESLint, Prettier, TypeScript strict, Vitest, Playwright (e2e + a11y via axe), Husky/lint-staged optional, GitHub Actions CI (install, typecheck, lint, unit tests, legal-lint, seo-lint, build, Playwright smoke + axe, Lighthouse CI budget check).

WHAT TO BUILD
1. App shell: RTL layout, header with the Hebrew mega-menu from the blueprint (first item at the right), mobile drawer (opens from the right), search (client-side index via Fuse/Pagefind over content + providers), breadcrumbs, footer containing the legal link set and DISC-GENERAL exactly per LEGAL_COMPLIANCE.md, skip-link, focus-visible styles, `prefers-reduced-motion` support.
2. All routes in the blueprint sitemap, generated from content + data: /, /category/[slug], /compare/[slug], /best/[slug], /reviews/[slug], /guides/[cluster]/[slug], /articles/[slug] (+ /articles index with topic filters), /calculators/[slug], /tools/[slug], /tax-year/[year], /news/[slug], /lead/[type], /go/[slug], /about, /methodology, /editorial-policy, /advertise, /contact, /legal/* (disclaimer, terms, privacy, affiliate-disclosure, cookies, accessibility), 404/500 in Hebrew, /sitemap.xml (split), /robots.txt, /llms.txt, /feed.xml. generateStaticParams everywhere possible; ISR with revalidate tags for data updates.
3. Calculators K1–K12 and the extra tools (hourly rate, payslip decoder [client-side only, no upload, no storage], business-setup cost, business-structure quiz, tax calendar with iCal export, bank-fee checker, tax-refund estimator) per Agent 2's specs. Display the "updated on" date and data sources from rates JSON. Show assumptions/limitations from the specs. Each calculator renders the correct disclaimer class (DISC-CALC-*) in a modal on first use per the UI Integration Spec (focus trap, Esc, ARIA dialog, acknowledgement persisted in localStorage with the legal text VERSION; re-prompt on version change) AND a persistent short disclaimer line near the result. Results must also be accessible (aria-live polite) and printable.
4. Comparison engine: data-driven ComparisonTable (sortable, filter by use-case, sticky first column on mobile, card fallback), scoring computed from the published methodology formula (shown on /methodology), TopPickCard, ProsCons, FAQ, "updated" stamps, and sponsored modules that are visibly separate from editorial scores.
5. Monetization layer (per blueprint §1.4.2):
   - <AdSlot id="AD-1…5"> with reserved min-height per breakpoint, lazy load, consent-gated, env-configured client ID (NEXT_PUBLIC_ADSENSE_CLIENT) and slot IDs map in /src/config/ads.ts; placement rules enforced in one layout component (no ads above the H1, density limits, none inside calculator inputs, spacing from CTAs); auto ads OFF; ads.txt served at /ads.txt from env; AdSense verification meta/script option; Mediapartners-Google allowed in robots.
   - Affiliate: tokens resolve to /go/[slug] tracked redirects (302) that log a click event (no IP storage), append network params/sub-ids (page, slot), and render links with rel="sponsored nofollow noopener" and visible DISC-AFFILIATE-STRIP above the fold plus per-card badges per the legal spec. Admin-free config via /data and DB; link health-check script (scripts/check-affiliate-links.mjs).
   - Lead forms: accessible multi-step forms for accountant/pension-information/mortgage-information leads; unticked consent checkbox with versioned consent text from legal-texts.json; server validation; spam protection; store lead; route ONLY to partners flagged active AND licence-verified (lead_partners) — if no verified partner exists for a type, show a "בקרוב" waitlist variant, never fake routing; confirmation email; retention job and deletion endpoint per the privacy policy; no logging of sensitive payloads in plain text.
   - Newsletter: double opt-in, unsubscribe link, one-click unsubscribe endpoint, "פרסומת" label rule from the legal spec.
   - Cookie/consent manager (CMP): banner copy and categories from LEGAL_COMPLIANCE.md; all non-essential scripts (GA4, AdSense personalised ads) blocked until consent; preference center link in the footer; consent logged (anon_id only).
6. SEO implementation per Agent 5: metadata API per page from /seo/url-map.json, canonical, robots, OG images (next/og with a bundled Hebrew font; verify RTL rendering for result images), JSON-LD builders with types validated, breadcrumbs, internal-link modules driven by /seo/internal-links.json, redirects from /seo/redirects.json in next.config/vercel.json, sitemaps with lastmod from content `updated`, RSS, llms.txt.
7. Accessibility: target WCAG 2.1 AA / Israeli Standard 5568: semantic landmarks, form labels and error association, keyboard-only operation of menus/modals/tables/calculators, visible focus, contrast, aria-live results, reduced motion, text resize to 200%, alt text, accessibility statement page rendered from legal texts; Playwright+axe tests on one page per template. (An accessibility overlay widget is NOT a substitute — do not rely on it.)
8. Security & privacy engineering: environment validation at boot (Zod; fail fast with clear errors), secrets only via env, field-level encryption (AES-GCM via ENCRYPTION_KEY) for sensitive lead fields, ip/ua hashing with a rotating salt, least-privilege DB roles guidance, dependency audit in CI, no third-party scripts except the consented ones, SRI where applicable, CSP report-only first with documented tightening step.
9. Performance: LCP < 2.0s on mobile budget, CLS < 0.05, INP < 200ms; image optimisation; code-split calculators; avoid layout shift from ads/consent banner; Lighthouse CI thresholds (perf ≥ 0.85, a11y ≥ 0.95, SEO ≥ 0.95, best practices ≥ 0.9) enforced in CI on key templates.
10. Content & data ops: scripts for `pnpm content:validate`, `pnpm legal:extract` (from LEGAL_COMPLIANCE.md → legal-texts.json), `pnpm legal:lint`, `pnpm seo:lint`, `pnpm rates:check` (flags rates files older than 12 months or with low-confidence items), `pnpm db:seed`. A yearly "rates rollover" runbook in /docs/engineering/RUNBOOK_RATES_ROLLOVER.md.
11. Docs: README.md (Hebrew-aware quick start, architecture, commands), /docs/engineering/ARCHITECTURE.md, ENV_VARS.md (every variable: name, purpose, required?, example, where to get it), DEPLOY_VERCEL.md (step-by-step: import repo, framework preset, env vars, Neon integration, domain, ads.txt, GSC verification, post-deploy smoke checklist), COMPLIANCE_TRACE.md (a table mapping each LEGAL_COMPLIANCE.md checklist item → implementing file/component → test), and .env.example with safe placeholders.

NON-NEGOTIABLE CONSTRAINTS
 - Everything user-facing is Hebrew and RTL. English only in code/identifiers/comments/docs. No lorem ipsum anywhere. No placeholder legal text.
 - Do not invent numbers, rates, prices, providers, ratings or testimonials. All figures come from /data. If a datum is missing, render a graceful "לא זמין" state and log it.
 - Do not weaken or omit any legal text; no dark patterns (no pre-ticked consents, no fake countdowns/scarcity, no disguised ads, no confirm-shaming).
 - Never commit secrets. Provide .env.example only. `.gitignore` must exclude .env*, node_modules, .next, coverage, playwright reports.
 - The repo must pass: `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm legal:lint && pnpm seo:lint && pnpm build` with NO database and NO network secrets present (use env fallbacks and static data). Fix failures; do not skip tests or lower thresholds to pass.

VERIFICATION (do it, don't just claim it)
 1. Run the full command chain above and capture the output summary in /docs/engineering/BUILD_REPORT.md.
 2. Start the app (`pnpm start`) and use Playwright to: confirm `html[lang=he][dir=rtl]`; screenshot (mobile + desktop) the home page, a compare page, a calculator, a guide, the legal page, and the lead form; verify no horizontal overflow at 360px; verify the legal footer, disclosure strip, calculator disclaimer modal and consent banner render with the exact texts from legal-texts.json; verify /go/ redirect logging; run axe on each template. Save screenshots in /docs/engineering/screenshots/ (compressed).
 3. Validate JSON-LD on 5 representative pages; validate sitemap and robots output.
 4. Walk through LEGAL_COMPLIANCE.md's pre-launch checklist and mark each item pass/fail with evidence in COMPLIANCE_TRACE.md. Any fail must be fixed or listed in BLOCKERS.md with an owner.

GIT & DELIVERY (CRITICAL)
 1. Ensure the repository exists locally: `git init` if needed; set the remote `origin` to <GITHUB_REPO_URL>; use branch <BRANCH> (default `main`). Fetch and rebase/merge existing commits from Agents 2–5 — never overwrite their work or force-push over it.
 2. Commit in a clean, logical sequence (e.g., "chore: scaffold Next.js app", "feat(calc): tax calculators + tests", "feat(ui): RTL layout & design system", "feat(monetization): ads, affiliate, leads, consent", "feat(seo): metadata, schema, sitemaps", "feat(legal): integrate LEGAL_COMPLIANCE texts", "ci: workflows", "docs: deployment & runbooks"). The final tree must be clean (`git status` empty).
 3. Push with `git push -u origin <BRANCH>`; on network failure retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s). Confirm the push by fetching and comparing HEAD hashes; print the commit hash and the repository URL.
 4. Add a `vercel.json` and make sure the Vercel "Import Project" flow needs nothing else: framework auto-detected, build command `pnpm build`, output default, Node version pinned in package.json "engines".
 5. Final message to the owner (in Hebrew AND English), explicitly stating: "הקוד נדחף ל-GitHub בהצלחה. הצעד היחיד שנותר: להתחבר ל-Vercel, לייבא את הריפוזיטורי, להגדיר את משתני הסביבה לפי ENV_VARS.md, וללחוץ Deploy." / "The code is pushed to GitHub. Your only remaining steps: import the repo in Vercel, set the environment variables per ENV_VARS.md, and click Deploy." Follow with: the list of env vars to set (names only), the 5 things the owner must supply (AdSense publisher ID after approval, affiliate IDs/links, Neon/Supabase connection string, email provider key, legal entity details from the attorney review), and any open BLOCKERS.

DEFINITION OF DONE
Build chain green; tests and a11y checks pass; compliance trace complete; docs written; repository pushed and verified; final owner message delivered. Report honestly anything not done or not verified — do not claim success for steps you did not run.
````

---

# SECTION 4 — SHARED CONTRACT (ALL AGENTS MUST OBEY)

## 4.1 Repository layout

```
/IL-TOOLS_MASTER_BLUEPRINT.md        (Agent 1)
/LEGAL_COMPLIANCE.md                 (Agent 4, root, single legal source)
/README.md                           (Agent 6)
/data/
  rates/<year>.json  + schema.json   (Agent 2)
  providers/<category>.json          (Agent 2)
  internal/affiliate_programs.json   (Agent 2, never imported client-side)
  sources.json                       (Agent 2)
  legal/legal-texts.json             (Agent 4, generated)
/content/
  compare/ best/ reviews/ guides/<cluster>/ articles/ (+ .data.json charts) calculators/ pages/ news/   (Agent 3, MDX)
  ui/he.json  authors.json                                              (Agent 3)
/seo/  redirects.json internal-links.json url-map.json schema/ robots.txt.template llms.txt   (Agent 5)
/docs/research/ /docs/content/ /docs/seo/ /docs/engineering/
/scripts/  extract-legal.mjs legal-lint.mjs seo-lint.mjs check-affiliate-links.mjs
/src/  (Agent 6: app, components, lib/calc, db, config)
/.github/workflows/ci.yml
```

## 4.2 Rates file shape (excerpt)

```json
{
  "tax_year": 2026,
  "currency": "ILS",
  "income_tax_brackets": [
    { "id": "b1", "from_annual": 0, "to_annual": null, "rate": null,
      "effective_from": "2026-01-01", "legal_basis": "…", "source_id": "src_ita_01",
      "accessed_on": "YYYY-MM-DD", "confidence": "high" }
  ],
  "credit_point_value_annual": null,
  "vat": { "standard_rate": null, "osek_patur_ceiling_annual": null },
  "national_insurance": {},
  "keren_hishtalmut": {},
  "pension": {}
}
```
(`null` here means "Agent 2 fills from a primary source"; do not ship nulls to production — `pnpm rates:check` fails on them.)

## 4.3 Content frontmatter

```yaml
---
title: "חשבונית ירוקה או מורנינג: מה ההבדל ומה כדאי לעצמאי?"
description: "…"
slug: green-invoice-vs-morning
type: compare            # compare|best|review|guide|article|calculator|page|news
category: invoicing
primary_keyword: "חשבונית ירוקה או מורנינג"
secondary_keywords: []
search_intent: commercial
related: [invoicing-cost-calculator, how-to-issue-invoice]
sources: [src_…]
updated: 2026-01-01
author: il-tools-editorial
monetization_slots: [AFF-1, AFF-2, AD-3, LEAD-1]
regulated: false         # true → DISC-PENSION required
---
```

## 4.4 Token vocabulary
`{{slot:AFF-1}}` · `{{aff:provider-slug}}` · `{{sponsored:provider-slug}}` · `{{link:slug}}` · `{{sources:[ids]}}` · `{{updated:YYYY-MM-DD}}` · `{{calc:slug}}` · `{{chart:id}}`. Unresolved token ⇒ build failure.

## 4.5 Recommended primary tech stack (decision record)
Next.js App Router + TypeScript + Tailwind (logical utilities) + MDX + Drizzle on Neon Postgres + Vercel. **Why:** static/ISR for SEO and Core Web Vitals, server actions for lead forms, one-click Vercel import, cheap to run, and everything content-heavy stays in git (reviewable by the legal agent).

---

# SECTION 5 — ROADMAP, RISKS & KPIs

## 5.1 Phasing

| Phase | Weeks | Scope | Exit criteria |
|---|---|---|---|
| 0 | 0–1 | Agents 2–4 run, legal draft sent to an Israeli attorney, domain + Search Console + AdSense application (AdSense needs live, content-rich site) | LEGAL_COMPLIANCE.md reviewed |
| 1 | 1–2 | Agent 5 and 6 run, deploy to Vercel | Build green, a11y green |
| 2 | 2–6 | Launch: K1–K7, 25 comparisons, 40 guides; apply to affiliate programs (provide live site) | 100+ indexed pages |
| 3 | 6–12 | Tier 2 calculators, viral modules (hourly rate, payslip decoder), first licensed lead partners | 5k–20k organic sessions/month |
| 4 | 12–24 | Programmatic pages, annual data reports, newsletter/WhatsApp channel, sponsored placements | Revenue diversified (no stream > 60%) |

## 5.2 Key risks and mitigations

| Risk | Mitigation |
|---|---|
| Regulated-activity breach (pension/insurance/investment "advice or marketing") | Agent 4 boundary rules; educational framing; leads only to verified licensed partners; attorney review before launch |
| Wrong tax numbers destroy trust | Rates-as-data, fixtures from independent calculations, annual rollover runbook, visible "updated" stamps |
| AdSense rejection / limited ads on finance content | Original depth content, clean policy pages, no auto-ads at start; keep affiliate and lead revenue as the primary engine |
| Affiliate bias accusation | Published scoring formula; labelled sponsored modules; ranking never paid |
| Privacy-law exposure (Amendment 13) | Data minimisation, client-side payslip decoding, encrypted lead fields, retention job, DPO assessment |
| Thin programmatic pages | Noindex until unique value threshold; computed-number requirement |
| Dependency on Google | WhatsApp sharing, newsletter, community, direct-brand calculators |

## 5.3 KPIs (first 6 months)
Indexed pages · impressions/clicks for the top-50 queries · calculator completion rate (> 35% of starts) · pages/session (> 2.2) · affiliate CTR on comparison pages (3–8%) · lead conversion (2–6% of form views) · RPM by template · share-click rate on calculators · newsletter growth · Core Web Vitals pass rate (> 90% URLs good).

---

## Open items the owner must decide before running Agent 2
1. GitHub repo URL and branch name (`<GITHUB_REPO_URL>`, `<BRANCH>`).
2. Legal entity / sole-proprietor details and whether any licence is held (affects Agent 4's disclaimers).
3. Whether a credentialed reviewer (רו״ח / יועץ מס) will be engaged for "נבדק על ידי" labels.
4. Hosting region and Neon vs. Supabase preference (default: Neon).
