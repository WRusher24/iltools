# BLOCKERS & open items (Agent 6)

Legend — **Owner**: OWNER = site owner · ATTY = Israeli attorney · A2/A3 = research/content follow-up · ENG = engineering.
Build/CI is green with all of these open; items marked **LAUNCH** must be closed before real-world launch.

## A. Owner facts that fill the legal `[...]` blanks — LAUNCH-BLOCKING (LEGAL_COMPLIANCE.md §12.1)
The pages ship as clearly-marked drafts (blanks highlighted in yellow + a "טיוטה" banner). Fill them in **`data/legal/owner-facts.json`** (key = the exact blank string; no code change, no re-extraction needed) — the banner disappears when a page has no blanks left.

| # | Blank (as it appears) | Text(s) | Needed fact (§12.1 id) | Owner |
|---|---|---|---|---|
| A-1 | `[שם הישות המשפטית]`, `[מספר]` (ח.פ./ע.מ.), `[כתובת]` | LEGAL-PRIVACY | legal entity, registration number, address (O-01) | OWNER |
| A-2 | `[כתובת אימייל לפרטיות]` (×3) | LEGAL-PRIVACY | privacy contact email (O-01) | OWNER |
| A-3 | `[כתובת אימייל לפניות משפטיות]` | LEGAL-TERMS | legal contact email (O-01) | OWNER |
| A-4 | `[להשלמה — למשל fra1/arn1]` | LEGAL-PRIVACY | hosting regions of Vercel/Neon/Supabase (O-06). The repo pins Vercel functions to `fra1` (`vercel.json`) | OWNER |
| A-5 | `[להשלמה — למשל 24 חודשים]` | LEGAL-PRIVACY | retention period (O-07) — also set `LEAD_RETENTION_DAYS` so the cron enforces it | OWNER + ATTY |
| A-6 | `[להשלמה — מומלץ תל-אביב]` | LEGAL-TERMS | governing-law court district (O-08) | ATTY |
| A-7 | `[שם]`, `[accessibility@il-tools.co.il]`, `[להשלמה]` (phone), `[להשלמה — לאחר בדיקת נגישות]`, `[להשלמה — תאריך ביקורת נגישות אחרונה]` | LEGAL-ACCESSIBILITY | accessibility coordinator name/email/phone, limitations list, last audit date (O-04). An actual IS 5568 audit is also required | OWNER |
| A-8 | (no blank, but a fact) | DISC-FULL / DISC-AFFILIATE-FULL | O-02 licences held? O-03 positions/compensation from providers? O-09 which affiliate programs exist? — texts currently state "no licence / affiliate relationships may exist" | OWNER + ATTY |
| A-9 | attorney sign-off of LEGAL_COMPLIANCE.md (status → approved), DPO/registration decision (O-05), processor agreements Vercel/Neon/email/Google | governance | ATTY / OWNER |

## B. Engineering / data gaps (nothing invented — each is a graceful "לא זמין" or user-entered input)
| # | Gap | Effect | Owner |
|---|---|---|---|
| B-1 | **Only ONE calculator spec + ONE fixture exist (atzmai-net).** K2–K12 and the 7 extra tools: **"spec/fixture missing"** (derived from `data/rates/2026.json` + content copy; own hand-computed tests; details `docs/engineering/CALC_NOTES.md`) | accuracy of K2–K12 not independently reconciled | A2 |
| B-2 | **K1 fixture contradicts the rates file and itself** (expects tax 800 / NI 400 / health 200 / net 6,500 on 8,000 profit; 8,000−800−400−200 = 6,600; the rates file gives ≈295.10 / 365.06 / net ≈7,339.84). Recorded in `KNOWN_FIXTURE_DISCREPANCIES` (test asserts it still differs and that the calculator equals the hand computation; it fails when the fixture is fixed so the entry gets removed) | fixture cannot be used as ground truth | A2 |
| B-3 | Self-employed NI + health rates are **not in the rates file** (only employee/employer). K1/K11/K2 use the employee reduced/full rates as a *combined* proxy, health tax shown "לא זמין", disclosed in every result | K1 net is an approximation | A2 |
| B-4 | Missing in `/data`: official advance-payment (מקדמות) rates, severance tax-exempt ceiling, unemployment formula/parameters, business-setup cost items, bank-fee benchmark, company-tax data, official filing deadlines | K9/K10/tax-calendar/setup-cost/bank-fee/structure-quiz take user-entered values or show "לא זמין" (no deadline day is hard-coded; ICS built from the user's days) | A2 |
| B-5 | `keren_hishtalmut` and `pension` rates are `confidence: "low"` (Agent 2) | shown with a visible caveat; `pnpm rates:check` reports them | A2 |
| B-6 | `data/internal/affiliate_programs.json` is **empty** → no verified commission facts; `/go/<provider>` redirects to the official site (no commission params) until programs are configured | affiliate revenue = 0 until configured | OWNER |
| B-7 | No verified licensed lead partners (O-10) → all three lead pages show the "בקרוב" variant; nothing is stored or routed | lead revenue = 0 until a partner is inserted into `lead_partners` (active + licence number + verified_on ≤12 months + lead_types) | OWNER |
| B-8 | **No editorial sub-scores exist in `/data`** → the 30/30/15/15/10 scoring engine is implemented/tested but no scores are displayed; comparison tables show published data only (sortable by name/price, filter by feature) | no "score" column | A2/A3 |
| B-9 | Provider pricing is quote-only for banks/pension/payroll/etc.; clearing providers with only quote-only fees are excluded from K3 (listed with reason); Stripe (EUR) and Fireberry (USD) excluded from K3/K4 | K3/K4 coverage limited | A2 |
| B-10 | `/tax-year/[year]` and `/news/[slug]` have no content → **not generated** (404). `seo/redirects.json` rule `/tax-year/current → /tax-year/2026` is not emitted | per url-map | A3 |
| B-11 | **legal-lint 0 BLOCKER / 14 HIGH** (newsletter issues + methodology lack `{{updated}}`/`{{sources}}`; one "חינם" in green-invoice-vs-morning). Not build-failing, content not edited (per instructions). Also open Agent-4 register items L-006…L-018 (content wording; owner A3) | recorded only | A3/ATTY |
| B-12 | Newsletter **sending** is not built (subscription, double opt-in, unsubscribe + one-click endpoint are). When a sender is added it must label every message "פרסומת" and include the unsubscribe link (LEGAL-NEWSLETTER-TERMS) | no campaigns | ENG |
| B-13 | Newsletter/lead/consent **database paths were not exercised against a live Postgres** in this environment (no DB available). Covered by unit tests (schema, encryption, CSRF, rate limit, routing guard); migration SQL generated (`drizzle/0000_*.sql`) but not applied | run `pnpm db:migrate` + a smoke submit after connecting Neon | OWNER/ENG |
| B-14 | Not verified here: Lighthouse CI thresholds (needs Chrome headless run in CI — configured in `.github/workflows/ci.yml` + `lighthouserc.json`), live AdSense/GA behaviour after consent (no ids), email delivery, Turnstile, Upstash | verify post-deploy (DEPLOY_VERCEL.md checklist) | OWNER |
| B-15 | Manual keyboard-only walkthrough, screen-reader test and the formal IS 5568 audit are **not done** (automated axe WCAG 2.1 AA on 17 templates × 2 viewports passes) | LEGAL-ACCESSIBILITY blanks stay open | OWNER |
| B-16 | `/lead/*/thanks` is disallowed in robots but no thanks route exists (the form confirms in place) | none | — |
| B-17 | Calculator query-string states cannot be marked `noindex` server-side on static pages (canonical → base path + robots.txt parameter disallows used instead) | minor SEO residual | ENG |
| B-18 | CSP is report-only (tightening plan in ARCHITECTURE.md) | — | ENG |
| B-19 | Agent 2's scratch folder `tmp/` and `legal-lint-report.txt` were removed from the git index and are git-ignored (files left on disk) | — | — |
