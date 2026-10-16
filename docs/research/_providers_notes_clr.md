# Credit-card clearing (סליקת אשראי) — provider research notes

Date: 2026-10-16 · Output: `data/providers/clearing.json` (11 records) · Sources: `data/internal/_sources_prov_clr.json` (also merged into `data/sources.json`).

## Providers covered
Cardcom, Tranzila, PayPlus, Grow (Meshulam), Pelecard, Yaad Sarig (iPay), Stripe (Israel), PayPal (Israel), and the three direct issuer-acquirers: Isracard, Max, Cal (which also covers the "Visa CAL" brand — same legal entity, Israel Credit Cards Ltd).

## Published rates vs quote-only
- **Published rates (usable numbers):**
  - **Grow (Meshulam)** — the only Israeli acquirer with a full public tariff. 0.75% per transaction + ₪59/mo (annual ₪708) or ₪69/mo; Grow Light 1% + ₪29/mo (annual ₪348). No setup fee. Tourist card 3.5%, Diners 1.5%, 3DS +₪2.5, refund ₪6.90, chargeback ₪55, min per-transaction ₪0.50, incoming bank transfer ₪1. Discount/installment fee P+5.5% + ₪29/mo. VAT excluded. `confidence: high`.
  - **PayPal** — full merchant-fee schedule: domestic 3.40% + ₪1.20 (VAT excl; 4.01% + ₪1.42 incl. 18% VAT); international add-on +1.00% / +2.00%; FX 2.5% above base; dispute ₪30 / ₪60. Refund fee **not listed**. `confidence: high`.
- **Partial / starting-rate only:**
  - **Cardcom** — no rate card; its own blog states the commission "starts at ~1.2%". Recorded as `1.2` with `confidence: low`; everything else null. `pricing_model: hybrid`.
  - **Tranzila** — only "mobile clearing plan from ₪29/month". No clearing %. `quote_only`.
  - **Stripe** — no Israel pricing page exists (all `/il` pricing URLs 404). Recorded Stripe's published **EEA (Ireland)** card rates (1.5% + €0.25 EEA; 2.8% premium EEA; 2.5% UK; 3.15% intl; +2% FX; €20 dispute). The mapping to Israeli merchants/ILS is an **inference**, `confidence: low`.
- **Quote-only (no published numbers):** PayPlus, Pelecard, Yaad Sarig, Isracard, Max, Cal. All fee fields set to `null`. (6 providers.)

Totals: **2 providers with full published rates, 3 with partial/starting-rate-only, 6 quote-only.**

## Verified company facts
- **Cardcom** — founded 1994; Bank of Israel **permanent acquirer licence** (4th acquirer in Israel, joining Cal/Max/Isracard); initial licence 2018, live clearing 2023. Legal entity: קארדקום סליקה בע"מ / Cardcom Acquiring Ltd.
- **Tranzila** — founded 2000 (official docs; part of Interspace). Certified acquirer (BoI/Visa/MC per a third-party profile). Legal entity: טרנזילה בע"מ.
- **Pelecard** — site claims "35+ years" (≈1989–1990) but a third-party DB says 1999 → `year_founded: null`. Legal entity: פלאקארד בע"מ; subsidiary Pelecard Finance Ltd (2022).
- **Isracard** — founded 1975 (Feb 23), ex-Bank Hapoalim, IPO 2019, Delek Group ~37% control (2025). TASE: ISCD.
- **Cal** — Israel Credit Cards Ltd, founded 1978 (site markets 1979); Discount Bank 71.8% / FIBI 28.2%; exclusive Diners Club franchise; "Visa CAL" is its Visa brand.
- **Max** — ex-Leumi Card; rebranded 2019; Clal Insurance since Mar-2023. `year_founded: null` (2000 as Leumi Card is commonly cited but unverified).
- **Grow** — legal entity "Grow Payments Ltd" (from terms page). Year founded unverified.
- **PayPal** founded 1998; **Stripe** founded 2010.

## Gaps for OPEN_QUESTIONS.md
1. **Cardcom** exact rate card (percent tiers by turnover, fixed fee, monthly minimum, setup fee, refund/chargeback fees, settlement T+n vs credit cycle). Only a "~1.2% starting" figure exists.
2. **Tranzila** clearing percentage and fee schedule; confirm founding year (2000 vs 1996/1999).
3. **PayPlus** — legal entity name and year founded are unverified; no pricing at all.
4. **Pelecard** — exact founding year (35+ yrs vs 1999) and any rate card.
5. **Yaad Sarig / iPay** — official site (`yaad.net`) unreachable from this environment; confirm legal entity, founding year and pricing by phone (09-8610338).
6. **Stripe Israel** — is there any Israel-specific ILS rate card? Confirm the onboarding entity (Stripe Payments Europe?) and IL rates.
7. **Isracard / Max / Cal** — merchant-discount ranges, monthly minimums, settlement terms. Current figures rely on secondary sources only.
8. **PayPal** — refund fee (not published); confirm VAT treatment wording for ILS amounts.

## Quote-only providers (explicit)
PayPlus, Pelecard, Yaad Sarig, Isracard, Max, Cal. (Cardcom and Tranzila are effectively quote-only too, with only a starting rate / a mobile plan published.)

## Confidence & sourcing cautions
- Primary sources used for every published number (Grow fees page; PayPal merchant-fees page; Stripe pricing page; Cardcom/Tranzila own sites).
- Secondary sources (Grokipedia, Olam, IsraelNonResident, MoneyWiki, Kurrant) used **only** for company facts and as leads — never as the sole source of a fee number.
- The **1.5%–3%** card-not-present merchant-discount range for direct acquirers is from a single secondary source (israelnonresident.com) about foreign-owned Israeli companies — a lead, not a verified tariff.
- All monetary figures: `accessed_on = 2026-10-16`.
