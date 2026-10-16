# CALC_NOTES — calculator layer report

Scope: `src/lib/calc/**` (pure TS), `src/components/calc/**` (client UI), `tests/calc/**`. All statutory figures come from `data/rates/2026.json` via the typed `RatesFile`; provider prices come from provider data passed as props. Nothing was invented. Where a datum does not exist, the calculator shows "לא זמין" or takes a user-entered value with a hint to verify at an official source.

## Public API

- `CalcLoader` (`src/components/calc/CalcLoader.tsx`, client): props `{ slug, rates, providers?, disclaimer: {id, version, title, content}, ratesUpdated, sourceLinks, resultCta?, initialValues? }`. `providers` keys are the basenames of `data/providers/*.json`: `invoicing`, `clearing`, `business-banking`. `initialValues` (optional, raw strings keyed by input name) lets the page pre-fill a shared-link state on the server. Each calculator is loaded with `next/dynamic` (code-split, `ssr` left on).
- `CALC_CLASS_BY_SLUG`, `CALC_SLUGS`, `calcPath(slug)`, `disclaimerIdForSlug(slug)` (`DISC-CALC-<CLASS>`) in `src/components/calc/classes.ts`. `COMPARE_LINKS` there holds the comparison links used by the setup-cost tool; all point at `/compare` because I do not know your final routes (change in one place).
- `src/lib/calc/index.ts` re-exports one namespace per calculator (`atzmaiNet`, `salaryNet`, ...), each with `INPUT_DEFAULTS`, `validate(inputs) -> {ok, errors}`, `calculate(inputs, rates, extra?)`, and `makeDefaults(rates)` for the calculators whose defaults come from rates. Also `CALC_META`, the tax engine (`incomeTaxByBrackets`, `incomeTaxAfterCredits`, `niMonthly`), `projectBalance`, provider readers.
- UI state: inputs are synced with the query string through `history.replaceState` (read in an effect; `useSearchParams` is not used). The payslip decoder disables URL sync entirely (sensitive data).

## Cross-cutting assumptions

1. Money outputs rounded to 2 decimals (`round2`, half away from zero). Intermediate values stay unrounded; `effective_rate` is rounded to 4 decimals.
2. Bracket bounds: the file lists the next bracket's `from_annual` as `to_annual + 1`. Brackets are treated as contiguous (lower bound = previous `to_annual`).
3. Surtax: `surtax.regular_income` (3% above 721,560) is added to income tax in K1/K2/K6 tools and shown as its own line when non-zero. Credit points reduce bracket tax only (floor 0), not surtax.
4. National insurance + health: the file only has **employee/employer** rates (reduced up to `reduced_rate_ceiling`, full up to `monthly_ceiling`). The `employee_rate` pair is used as a conservative proxy for both employees (K6) and the self-employed (K1, K2, hourly rate, quiz) and is displayed as a single combined line "ביטוח לאומי ומס בריאות". Separate health tax is `null` / "לא זמין". The assumption is disclosed in the UI (visible notice) and in every result's `assumptions`.
5. Self-employed minimum: `national_insurance.min_income` is applied as a floor on the NI base for self-employed income > 0 (employees: no floor). This is my reading of the key; it is flagged in a warning when it applies. No NI deduction from taxable income is applied (no key supports it).
6. Pension/keren hishtalmut keys have confidence `low`: every result using them shows the caveat "לפי הנתונים שפורסמו; יש לאמת מול מקור רשמי" (badge and/or `warnings`).
7. Personal choices not in data (credit points, pension %, etc.) are inputs. Credit points default to 2.25 (value appears in DATA_REFERENCE as the male base; hint states 2.75 for women). Money fields have no default (empty state on first render).
8. Calendar facts used as constants: 12 months/year, 52 weeks/year.

## Per calculator

Spec/fixture status: **"spec/fixture missing" for everything except `atzmai-net`.** Copy and inputs came from `content/calculators/*.mdx` and `content/tools/*.mdx`.

### K1 atzmai-net (spec + fixture exist)
- Inputs: revenue_monthly, expenses_monthly, status (פטור/מורשה), credit_points, pension_deposit, hishtalmut_deposit, marital_status, deductions (monthly ILS).
- Method: annual profit = (revenue - expenses) x 12 (floored at 0); taxable = profit - pension deduction - deductions x 12; pension deduction = min(annual deposit, `pension.tax_deduction_rate` x profit) (no ceiling key exists, warning shown when the deposit exceeds it); pension tax *credit* (`tax_credit_rate`) is not applied (no ceiling/base in data); hishtalmut: not deductible (no key), warned if above `annual_contribution_ceiling`; NI per note 4-5 on profit before deductions; net = profit - income tax - NI; `net_after_deposits` = net - pension - hishtalmut; effective_rate = (tax + NI) / profit (per the MDX wording); advance estimate = annual income tax / 12 (official advance rates are not in the data).
- Status and marital status do not change the maths (disclosed). Osek patur above `vat.osek_patur_ceiling_annual` triggers a warning.
- Missing data handled: separate health tax -> `null`/"לא זמין"; self-employed NI rates -> proxy (disclosed); official advance rates -> estimate (disclosed).

#### Fixture discrepancy analysis (Test Case 1)
Input: revenue 10,000, expenses 2,000, status מורשה, 2.25 credit points, no deposits.
Fixture expects: net 6,500; tax 800; NI 400; health 200; effective 0.14; advance 500.
Hand computation from `data/rates/2026.json`:
- profit 8,000/month = 96,000/year
- bracket tax = 84,120 x 0.10 + (96,000 - 84,120) x 0.14 = 8,412 + 1,663.2 = 10,075.2
- credits = 2.25 x 2,904 = 6,534 -> income tax = 3,541.2/year = **295.10/month** (fixture: 800)
- NI+health = 7,703 x 0.0427 + (8,000 - 7,703) x 0.1217 = 328.9181 + 36.1449 = **365.063 -> 365.06/month** (fixture: 400 NI + 200 health)
- net = 8,000 - 295.10 - 365.063 = 7,339.837 -> **7,339.84** (fixture: 6,500)
- effective = (3,541.2 + 365.063 x 12) / 96,000 = **0.0825** (fixture 0.14)
- advance = 3,541.2 / 12 = **295.10** (fixture 500)

Observations: the fixture values look like flat placeholder percentages (tax 10% of profit, NI 5%, health 2.5%, advance 5% of revenue) and are not derivable from the brackets/credit points/NI rates. The fixture is also **internally inconsistent**: 8,000 - 800 - 400 - 200 = 6,600, not 6,500; and 0.14 = 1,400/10,000 is relative to revenue, whereas the MDX defines effective rate relative to taxable income. The case therefore sits in `KNOWN_FIXTURE_DISCREPANCIES` (see `tests/calc/fixtures.test.ts`), which asserts (a) all six fields still differ, and (b) the calculator equals the hand-computed values above (plain arithmetic in the test, not a call into the calculator). If the fixture is corrected, test (a) fails and tells the maintainer to remove the entry.

### K2 employee-vs-freelancer-calculator
- Inputs: gross_offer, employer_extras_monthly (user-estimated value, not taxed), credit_points, pension_pct, hishtalmut_pct, freelancer_rate, billable_hours_month, business_expenses_monthly, freelancer_pension_monthly.
- Reuses the K6 and K1 engines. Compares cash net after savings deposits; break-even revenue/rate found by bisection (monotone), both vs net cash and vs net + extras.
- Missing: severance exempt ceiling (not computed), non-cash rights (not priced), freelancer NI (proxy).

### K3 clearing-fees
- Inputs: monthly_turnover, avg_basket. Providers with `pricing_model != quote_only` and a published `percent_per_transaction` are computed: % x turnover + fixed x transactions (max with `monthly_minimum` if present) + plan fee. Plan transaction limits exclude over-limit plans (listed with reason).
- Quote-only providers listed as "הצעת מחיר בלבד — לא נכלל בחישוב". Stripe is priced in EUR in the data, so it is excluded with a reason (no currency conversion invented). Cardcom's 1.2% is a "starting" rate and carries a low-confidence note. Grow's percent exists only at provider level in the data (the MDX table mentions plan-level rates that are not in the JSON); the row note says so.
- VAT: shown as an additional column only when `vat_included === false`.

### K4 invoicing-cost
- Inputs: docs_per_month, users, need_api, need_allocation. Filters by document limit (extra documents cost from `extra_document_cost`; plans over the limit with no published extra cost are rejected, not guessed), user limit, `features.api`, `features.allocation_number_integration` (unknown = rejected with reason). Annual cost = `price_annually` or `price_monthly x 12` (flagged "derived"). Sorted by annual cost only.
- Excluded with reason: usage-priced plans (iCount advanced/master), non-ILS providers (Fireberry, USD per user), plans with no price. Quote-only providers (Hashavshevet, Cardcom invoices) listed separately. Add-ons (API module, extra user) are not summed because their billing period is not stated.

### K5 vat
- Inputs: amount, mode (exclusive/inclusive), outputs_vat, inputs_vat, osek_patur. `net + vat = gross` exactly after rounding; round-trip tested within 1 agora.

### K6 salary-net
- Inputs: gross, car value (taxed, not paid in cash), credit points, employee pension %, hishtalmut % (defaults from rates, low confidence). No tax benefit is modelled for employee pension/hishtalmut deposits (no ceilings in data). Employer pension/hishtalmut shown as information only.

### K7 keren-hishtalmut
- Inputs: income, employee %, employer % (defaults from rates; set employer to 0 for self-employed), years, initial balance, **return % and fee % are required user inputs with no default**. Compares annual contribution with `annual_contribution_ceiling` and `tax_exempt_ceiling`; six-year rule shown as general information only; management fee benchmark = "לא זמין". Projection: net annual = return - fee, monthly compounding, deposit at month end; labelled an illustrative scenario, not an expectation.

### K8 pension-self-employed
- Inputs: annual income, deposit %, years, initial balance, return and fee (required, no defaults). Shows the 35% credit (upper illustration, no ceiling in data) and the 4.7% deduction (with estimated tax saving from the brackets, before credit points) side by side without recommending either.

### K9 severance
- Inputs: monthly salary, years, optional user-entered exempt monthly ceiling. Estimate = salary x years. Exempt ceiling is **not in data**: without the optional input, exempt/taxable show "לא זמין"; with it, exempt = min(salary, ceiling) x years. Tax on severance is not computed; general brackets displayed for context.

### K10 unemployment
- No benefit formula/replacement rate/duration in data. Shows insured wage (capped at `monthly_ceiling`) and reduced-rate threshold as context; benefit estimate "לא זמין" unless the user enters the published daily benefit and entitlement days (simple product). Age and months worked are collected but unused (disclosed).

### K11 osek-patur-threshold
- Inputs: monthly/annual turnover. Output: annual turnover, gap to `vat.osek_patur_ceiling_annual`, usage ratio, price multiplier (1 + VAT rate).

### K12 compound-interest-mortgage
- Modes: compound growth (initial + monthly deposit) and annuity loan (Spitzer) with yearly schedule. **Rate is always user-entered** (no prime/mortgage default). Conversion: nominal annual / 12 or effective annual -> equivalent monthly. Displayed monthly payment is rounded to the agora and totals are consistent with it. A bug found by the property tests (division by ~0 at denormal rates) was fixed using `expm1/log1p`.

### Tool: freelancer-hourly-rate
- Inputs: desired monthly net, billable hours per week, vacation/holiday/sick weeks, business expenses, pension, credit points. Inverts the K1 engine by bisection; hours/year = hours per week x (52 - weeks off). Also shows the rate including VAT.

### Tool: payslip-decoder (client-side only)
- Manual entry of payslip lines, explanations, simple flags (sum mismatch, no pension, no credit points, deductions > gross) and a reference estimate from the 2026 data when credit points are entered. Visible privacy notice; no upload, no fetch, no storage, **no query-string sync**, WhatsApp/copy-link share carries no amounts.

### Tool: business-setup-cost-calculator
- No cost data in `/data`. A checklist per business status where the user types one-time/monthly costs; totals only what is typed; untouched items are listed as "לא הוזן"; company costs flagged "לא זמין". Links to comparison pages via `COMPARE_LINKS` (currently `/compare`).

### Tool: business-structure-quiz
- Neutral, "מידע כללי בלבד". Uses the K1 engine for patur/murshe net simulation (identical for both; the VAT duty is the difference). Patur is marked unsuitable above the ceiling. Company: "לא זמין — אין נתוני מיסוי חברה בקבצי הנתונים".

### Tool: tax-calendar
- The data has **no deadline table**, so no legal day-numbers are hard-coded. The user enters the reporting day (per the tax authority/NI notice), cadence (monthly/bi-monthly) and first month for VAT, advances and NI, plus an annual-report date. Events are generated for 12 months (day clamped to month end) and exported as RFC 5545 `.ics` (CRLF, folded to 75 octets, escaped, optional VALARM). Documented gap: official deadlines are absent from `/data`.

### Tool: bank-fee-checker
- 8 manual fee lines (name, category, amount, monthly/annual). Totals by category, a review list sorted by annual cost with simple flags (unnamed line, repeated name). Comparison against `business-banking.json` `pricing.transaction_fees` (`monthly_minimum`, `setup_fee`) only when a value exists; currently all are null, so the page says "אין נתון ציבורי מאומת להשוואה".

### Tool: tax-refund-estimator
- Inputs: taxable annual income, deductions, tax paid, credit points, extra credits. Rough gap = tax paid - bracket tax after credits (+ surtax). Strong "בדיקה ראשונית בלבד" wording (intro notice, warning, row label "לבדיקה בלבד").

## UI notes

- `CalcShell`: form region, `role="region" aria-live="polite" aria-atomic="true"` result (`data-testid="calc-result"`, `data-status` empty|error|success), live recompute debounced 300 ms (so announcements are debounced), Calculate (reveals errors), Reset, WhatsApp (`wa.me` with title + summary + URL including query state), Print/PDF (`window.print()`), Copy link; "עודכן לאחרונה" + sources; persistent disclaimer `data-testid="calc-disclaimer-persistent"` renders `disclaimer.content` verbatim; optional `resultCta` rendered after the result, outside the inputs. `.no-print` is used for controls (the class exists in `globals.css`).
- `DisclaimerModal`: portal to `document.body`, `role="dialog" aria-modal="true" aria-labelledby`, focus trap, Esc = acknowledge, return focus, background `inert` + `aria-hidden`, scroll lock; not in the SSR output (opens in an effect). Persistence: `localStorage["il_calc_disc_<CLASS>"] = {version, date}` in try/catch; re-prompts on version change. The same `disclaimer.content` node is rendered in the modal and in the persistent line.
- No ads/affiliate/lead forms are rendered in or near the inputs.

## Tests (`pnpm exec vitest run tests/calc`: 6 files, 150 tests, all passing)

- `fixtures.test.ts` (5): loads every JSON in `docs/research/fixtures`, requires a runner per file, `KNOWN_FIXTURE_DISCREPANCIES` logic described above, stale-entry guard, fixture self-inconsistency check.
- `k1-atzmai-net.test.ts` (14), `calculators-a.test.ts` (K2, K5, K6, K9, K10, K11, hourly rate), `calculators-b.test.ts` (K3, K4, K7, K8, K12 and all tools incl. ICS), all with hand-computed values from rates keys (>= 3 per calculator, 14 for K1).
- `properties.test.ts` (9, fast-check): income tax monotonic and non-negative (also after credits + surtax), NI monotonic, K1 and K6 net monotonic in revenue/gross, VAT round-trip within 1 agora, compound interest monotonic in rate and years, loan pays back principal, ICS lines <= 75 octets.
- `ui.test.ts` (SSR via `react-dom/server`): class map and routes, `parseNum`, every calculator renders on the server in empty state and in success state (no `NaN`/`undefined`, region/aria-live markup, no open modal), error state, K1 disclosure, payslip notice, static guards (no physical Tailwind properties, no `fetch`/storage outside the disclaimer modal, no lorem ipsum).

## Known gaps / follow-ups

- Self-employed NI/health rates, official advance-payment rates, severance exempt ceiling, unemployment parameters, minimum wage, setup-cost items, bank fee benchmarks, company tax and official tax deadlines are absent from `/data`; see handling above. If any is added to `data/rates`, wire it in `src/lib/calc/*` (single place per calculator).
- Pension tax credit (35%) and hishtalmut deductions are not applied to K1/K6 results (no ceilings in data).
- Provider JSON "usage"-priced plans (iCount) and non-ILS providers are listed, not calculated.
- `COMPARE_LINKS` targets are placeholders (`/compare`).
- Interactive behaviour of the modal (focus trap, inert) and clipboard/WhatsApp buttons is not covered by automated tests (no DOM test environment is installed); only SSR output is tested. Recommend a Playwright check (`calc-disclaimer-modal`, `calc-result` test ids exist).
