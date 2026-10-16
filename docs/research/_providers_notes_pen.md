# Provider data notes — pension / keren hishtalmut / insurance / business finance

Agent: provider-research pass. Date: 2026-10-16. Language of this note: English.
Files produced:
- `data/providers/pension.json` (12 records)
- `data/providers/keren-hishtalmut.json` (12 records)
- `data/providers/insurance.json` (7 records)
- `data/providers/business-finance.json` (8 records)
- `data/internal/_sources_prov_pen.json` (28 sources)

All pension / keren-hishtalmut / insurance records carry `informational_only: true`
plus an `informational_only_note` disclaimer. No returns are recorded and no products
are ranked.

---

## 1. Pension & keren hishtalmut — management fees (CRITICAL GAP)

**Required primary source:** the official government comparison run by רשות שוק ההון,
ביטוח וחיסכון — גמל נט (`gemelnet.cma.gov.il`) and פנסיה נט / pensianet. The task states
that these are the ONLY acceptable source for `דמי ניהול מהפקדה` and `דמי ניהול מצבירה`.

**What was attempted:**
- `gemelnet.cma.gov.il` — reachable. It is a legacy ASP.NET app; the landing page
  (`/views/dafmakdim.aspx`) loads, and an interactive report UI (`gemelTsuot.aspx`,
  plus a "תחקור לפי פרמטרים" panel that filters by `שיעור דמי ניהול`) exists behind an
  entrance POST. Programmatic/agent extraction proved unreliable: the entrance button
  opens popup windows and the headless session repeatedly landed on unrelated pages.
  No stable, citable URL returning a per-fund fee table could be captured.
- `pensianet.cma.gov.il` — returns HTTP 404 (no such host/path).
- `gov.il` pension-comparison pages — HTTP 403 (Cloudflare-style block).
- Web search — the available provider returned irrelevant multilingual results for
  Hebrew queries; not usable.

**Result:** `management_fee_on_deposit_pct` and `management_fee_on_accumulation_pct`
are **null for all 24 pension/hishtalmut records**, `confidence: "low"`, `source_id: null`.
Per the task rules ("null beats a guess") no secondary/news figure was substituted.

**Exact gap to close (for OPEN_QUESTIONS):**
1. Obtain the official per-provider management fee (deposit + accumulation) from
   גמל נט / פנסיה נט. A working approach would be a real browser session with the
   gemelnet report export (ReportViewer → Excel/PDF), or the CMA's published
   comparison PDFs/tables.
2. Confirm which of the 12 groups actually offer *keren hishtalmut* vs *pension*
   (the two lists currently mirror each other by instruction).
3. Confirm the legal entity name per provider (all `legal_entity` are null).

---

## 2. Insurance — what is verified vs missing

**Verified product names** (from each provider's own site, Hebrew preserved):
- **Phoenix** — אחריות מקצועית, הרחבת צד ג', הרחבת חבות מוצר, אובדן כושר עבודה,
  ביטוח בריאות/אמבולטורי (`src_ins_phoenix_biz`, `src_ins_phoenix_health`).
- **Harel** — ביטוח עסק, אובדן כושר עבודה, בריאות, מחלות קשות, תאונות אישיות,
  סיעודי, בססח ביטוח אשראי (`src_ins_harel_home`).
- **Migdal** — אחריות כלפי צד ג' ואחריות מקצועית, אחריות מקצועית לעו"ד,
  אובדן כושר עבודה, בריאות, מחלות קשות, ביטוח לחברות ובתי עסק (`src_ins_migdal_biz`).
- **AIG Israel** — אחריות מקצועית, בריאות, AIG Medicare, Extra Care מחלות קשות
  (`src_ins_aig_health`).
- **Clal** — only the ביטוח עסק landing was reachable; no per-product names extracted.
- **Shirbit** (direct insurer, "שירביט מבית הראל חברה לביטוח בע\"מ") — public menu shows
  רכב / דירה only; no liability or health products listed publicly.

**Missing / unverified:**
- **Menora Mivtachim** — site sits behind a Radware/perfdrive bot challenge; product
  names NOT captured (set to empty rather than guessed).
- **Clal** — individual liability/health product names not extracted.
- No prices anywhere: all insurance pricing is `quote_only`, prices null (correct — Israeli
  insurers quote individually).

---

## 3. Business finance — what is verified vs missing

**Verified products:**
- **Peninsula (פנינסולה, מבית מיטב)** — הלוואות לעסקים, הלוואות גישור, ניכיון צ'קים
  מסחריים, מימון ציוד/ספקים, הלוואות מגובות נדל"ן, ערבויות (`src_fin_peninsula`).
  This covers the "non-bank credit", "factoring-like" and "supplier credit" buckets.
- **Blender (בלנדר)** — P2P lending + business channel (`src_fin_blender`).
- **Banks** (Leumi, Hapoalim, Discount, Mizrahi-Tefahot) — business credit exists but is
  negotiated; `quote_only`, no public rate tiers.

**Missing / unverified:**
- **Fundit (פונדיט)** — Cloudflare-blocked; product names unverified.
- **Factoring** — no single citable public rate range was verified; recorded as a generic
  factoring entry with no range. Bank of Israel average business-credit rate would be the
  ideal citable range and should be pulled from `boi.org.il` data (`src_fin_boi`) in a
  follow-up.
- No `rate_range_pct` is populated anywhere (all null) because no citable source was reached.

---

## 4. Regulatory-risk flags (for OPEN_QUESTIONS.md)

- **Returns = licensed-advice risk.** Presenting or comparing past returns (תשואות עבר) of
  pension/keren-hishtalmut products may constitute licensed investment advice/marketing under
  Israeli regulation. This dataset deliberately records NO returns. Do not add returns without
  legal review.
- **Ranking = advice risk.** Ordering providers by any performance metric would look like a
  recommendation. This data is unordered; `informational_only: true` is set on every record.
  Keep it unordered in the UI.
- **Insurance distribution.** Displaying insurance product/price info may require tying to a
  licensed insurance agent/broker (סוכן ביטוח מורשה) or an insurer's own permitted channel.
  All insurance pricing is `quote_only`; no quotes are shown.
- **Fee figures must be official-only.** Any management-fee number shown to users must be
  traceable to the government comparison (גמל נט / פנסיה נט). If the source is unavailable,
  the UI must show "not available" rather than a secondary figure.
- **Bank credit rates.** Quoting a specific business-loan rate would imply terms; keep
  `quote_only` unless a Bank of Israel published average is cited with a date.

## 5. Source reachability summary

| Source | Status |
|---|---|
| gemelnet.cma.gov.il | Reachable (legacy app); fee table not reliably extractable |
| pensianet.cma.gov.il | 404 |
| gov.il pension comparison | 403 (blocked) |
| kolzchut.org.il | Skipped (Cloudflare, per instructions) |
| Phoenix / Harel / Migdal / Clal / AIG / Shirbit sites | Reachable (product pages) |
| Menora site | Bot-blocked (Radware) |
| Fundit site | Cloudflare-blocked |
| Peninsula / Blender / BOI | Reachable |
