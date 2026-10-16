# Provider pricing research notes — invoicing / accounting / payroll / CRM

Access date for all sources: **2026-10-16**. Only official provider pages were used for numbers.
Files written: `data/providers/invoicing.json`, `data/providers/accounting.json`,
`data/providers/payroll.json`, `data/providers/crm.json`, `data/internal/_sources_prov_inv.json`.

## Method / tooling
- Static pages fetched with `curl` + browser UA; JS-rendered pricing tables captured with `agent-browser`
  (Invoice4U, Rivhit, PaySlips) or `WebFetch` (monday CRM, Pipedrive, Zoho, HubSpot, Salesforce).
- `gov.il` / `kolzchut.org.il` were not needed.

## What was verified (high confidence)
### Invoicing
- **Green Invoice / Morning** — Brand relationship CONFIRMED: `morning.co` 301-redirects to
  `greeninvoice.co.il/pricing/`; footer = "מורנינג של חשבונית ירוקה". Founded **2011** (About page; the
  pre-existing repo file said 2010 — corrected). 4 public tiers, prices **before VAT**:
  Basic 29 ₪/mo (348/yr, 20 docs), Best 54 ₪/mo (540/yr, 50 docs), Extra 89 ₪/mo (888/yr, 200 docs),
  Prime 155 ₪/mo (1,548/yr, 500 docs). Extra-doc cost 1.00/1.00/0.50/0.15 ₪. חשבוניות ישראל allocation number in all tiers.
- **iCount** — Express 276 ₪/yr (annual commitment, unlimited docs, no API); Advanced usage-based from 32 ₪/mo
  (32/59/85 ₪ then 0.30→0.14 ₪/doc); Master from 111 ₪/mo + 119 ₪ setup + 500 ₪ annual report. Prices before VAT.
- **Rivhit (ריווחית אונליין)** — Basic 1,200 ₪/yr, Plus 1,700 ₪/yr, Pro 2,400 ₪/yr (promo "12 months for 10";
  list 1,440/2,040/2,880). Before VAT. Allocation number from Plus.
- **Invoice4U** — Annual view: Pink 252 ₪, Green 372 ₪, Blue 528 ₪, Red 1,068 ₪ (50/100/200/500 docs). Setup 199 ₪.
  Before VAT. Clearing fee from 0.8%.
- **EZcount → HYP** — Brand change CONFIRMED: `ezcount.co.il/pricing` 301-redirects to `hyp.co.il/digital-invoice-pricing/`.
  Givol 24 ₪/mo (252/yr), Shtil 36 (348/yr), Mata 49 (480/yr), Pardes 79 ₪/mo (unlimited+clearing).
- **Fireberry** — Sales tiers in USD/user/mo (annual): Free $0, Standard $45, Professional $57, Enterprise $94.
- **Hashavshevet**, **Cardcom invoices** — **quote_only**, no public price list found (recorded as such).

### CRM
- **monday.com** — CRM (EUR/seat): Basic €18/mo (€12 annual), Standard €25/mo, Pro €41/mo, Enterprise quote.
  Work Management (USD/seat, annual): Free $0, Basic $9, Standard $12, Pro $19.
- **Zoho CRM** — USD/user/mo (monthly billing): Free (3 users), Standard $14, Professional $23, Enterprise $40, Ultimate $52.
- **Pipedrive** — EUR/seat/mo (annual): Lite €14, Growth €39, Premium €59, Ultimate €79.
- **Salesforce** — Starter Suite (ex-Essentials) $25/user/mo; higher Sales Cloud tiers quote-only.
- **Fireberry** — see above.
- **HubSpot** — Free (2 users) only; paid tiers are **region/currency-dependent**.

### Payroll / Accounting
- **Hilan**, **Michpal** — verified official sites; **quote_only** (Michpal exposes `PriceRequest.aspx`).
- **PaySlips** — digital payslip app; 3 tiers (≤50 / ≤200 / unlimited employees) all **quote_only**.
- **Accounting** — Rivhit / Hashavshevet / iCount / Green-Invoice-for-accountants re-documented; software tiers
  verified where public; the dedicated "מערכת למייצגים" price is not on the public list.

## What could NOT be verified (gaps)
1. **HubSpot per-seat prices** — official page returned **SGD** (Starter SGD 10/seat/mo) based on our access region;
   USD/ILS list prices not verified. `pricing_model` kept public_tiers with prices `null`.
2. **monday CRM annual prices for Standard/Pro** — page is interactive; only Basic (€18 monthly / €12 annual) captured.
3. **Zoho CRM annual prices** — page states "save up to 34%" but the annual per-user figures were not captured.
4. **Invoice4U monthly-billing prices** — annual toggle captured; the monthly toggle did not render.
5. **Green Invoice per-plan user counts, integrations list, support channels** — not enumerated on the pricing page.
6. **Legal entity + founding year** — unknown for iCount, Rivhit, Invoice4U, EZcount/HYP, Hashavshevet, Cardcom,
   Fireberry. Known: Green Invoice/Morning = 2011; monday 2012; Zoho 1996; Pipedrive 2010; Salesforce 1999; HubSpot 2006.
7. **Synergy (סינארג'י) payroll** — official site NOT located (`synergy.co.il` is an unrelated simulation company).
8. **Merav (מירב) payroll** — official site NOT located (`merav.co.il` does not resolve; `mirav.co.il` is a hosting placeholder).
9. **VAT treatment** — not explicitly stated on HYP, Hashavshevet, Cardcom, Fireberry, HubSpot pages (marked null).
10. **Fireberry** marketing product line + ILS add-on prices not fully captured; allocation-number integration unverified.

## Pricing that looked promotional (flag for display)
- **Rivhit** — "12 months for the price of 10" (list prices shown as "instead of"); `promotional: true`.
- **iCount** — 45-day free trial; Express requires 1-year prepay.
- **Rivhit** — 30-day trial; **Green Invoice** — free trial; **Invoice4U** — "חודשיים חינם" (2 free months).
- **Fireberry** — "Annual (Save 20%)"; **monday.com** — "Yearly SAVE 33%".
