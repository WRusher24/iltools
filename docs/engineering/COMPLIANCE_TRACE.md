# COMPLIANCE_TRACE — LEGAL_COMPLIANCE.md §11 pre-launch checklist

Evidence = file/component + automated test. **PASS** = verified by a test or command run in this build; **PARTIAL** = implemented, not fully verifiable here; **FAIL/OWNER** = open (see BLOCKERS.md). E2E = `tests/e2e/*` (Playwright, desktop 1280 + mobile 360), UNIT = `tests/unit/*`.

## Content
| Item | Status | Evidence |
|---|---|---|
| `content-qa.mjs` → 0 BLOCKERS | PASS | `pnpm content:validate` → BLOCKERS: 0 (CI step) |
| `legal-lint.mjs` → 0 BLOCKERS, HIGH triaged | PASS (14 HIGH recorded) | `pnpm legal:lint` → 0 BLOCKER / 14 HIGH; listed in BLOCKERS B-11, not build-failing, content not edited |
| L-002/L-003 edits present; L-001/L-004/L-005 addressed in build | PASS | L-002/003 are Agent-4 content edits (committed). **L-001**: `Tokens.tsx` `SlotToken` → `RegulatedInfoModule` (E2E "regulated page…"). **L-004**: lead pages' text mock-up section "הטופס" is dropped and replaced by `LeadForm` with consent text from `LEGAL-LEAD-TERMS` (`src/app/lead/[type]/page.tsx`; UNIT forms-ssr). **L-005**: footer + 6 `/legal/*` routes implemented |
| No `regulated: true` page lacks `<!-- DISC-PENSION -->` | PASS | `scripts/validate-tokens.ts` (`pnpm content:tokens`) |

## UI
| Item | Status | Evidence |
|---|---|---|
| All 8 legal routes render `legal-texts.json` verbatim | PASS | 6 `/legal/*` routes built from `placement` (`src/app/legal/[doc]/page.tsx`); `/methodology`, `/editorial-policy` are content pages. E2E "every /legal/* route renders its texts verbatim" (no raw `{date}`/`{sources}`/`{{…}}`) |
| `DISC-AFFILIATE-STRIP` above the fold on pages with `{{aff:…}}` | PASS | `AffiliateStrip` (`role="note"`); E2E "affiliate strip…" asserts exact text + position < viewport height |
| Calculator modal (correct class) first run; re-prompt on version change; Esc + focus trap | PASS (focus-trap PARTIAL) | `DisclaimerModal.tsx`, class map `components/calc/classes.ts`; E2E "calculator disclaimer modal…" (text, `role=dialog aria-modal`, Esc, `il_calc_disc_TAX` {version,date}, re-prompt, persistent line). Focus trap implemented, only exercised via Esc/axe — manual keyboard test pending (B-15) |
| `DISC-PENSION` on every marker/`regulated` page | PASS | `ContentPage` renders once at top; E2E regulated page |
| Footer link set complete; `legal.footer.disclaimer` reconciled with `DISC-GENERAL` | PASS | `SiteChrome.tsx` renders `DISC-GENERAL` from JSON (he.json string unused); E2E footer tests (all 8 links + "העדפות עוגיות") |
| DISC-COMPARE / DISC-EDITORIAL-INDEPENDENCE / DISC-RATES-DATE | PASS | E2E "compare page shows…" (stamp has a real date) |

## Data / privacy
| Item | Status | Evidence |
|---|---|---|
| Privacy policy `[...]` placeholders filled | **FAIL/OWNER** | BLOCKERS A-1…A-5 (13 blank strings tracked; `unfilledBlanks()`); fill `data/legal/owner-facts.json` |
| Consent notice at every data-collection point; consent version stored with leads | PASS (DB path PARTIAL) | newsletter form + lead form render LEGAL-NEWSLETTER-TERMS / LEGAL-LEAD-TERMS / DISC-LEAD; server rejects stale `consentVersion` and stores `consent_text_version` + `consent_ts` (`/api/lead`); not run against a live DB (B-13) |
| No non-essential script loads before consent | PASS | E2E "consent banner…": no google/doubleclick/googletagmanager/googlesyndication request before consent; GA/AdSense injected only in `ConsentProvider` after consent |
| Lead fields encrypted at rest; least-privilege; retention job | PASS (period OPEN) | AES-GCM `server/crypto.ts` (UNIT round-trip/tamper), only sensitive fields (`SENSITIVE_FIELDS`); `/api/cron/retention` (+ `DELETE /api/leads/:id`); least-privilege guidance in ARCHITECTURE/DEPLOY. Retention period unset ⇒ **OWNER** A-5 |
| Processor agreements (Vercel/Neon/email/Google) documented | **FAIL/OWNER** | BLOCKERS A-9 |

## Ads / affiliate
| Item | Status | Evidence |
|---|---|---|
| No ads above H1; density limits; none in calculator inputs | PASS (by construction) | `ContentPage` places AD slots only after sections ≥1 and only when declared in `monetization_slots`; `CalculatorPage` renders no ad inside the form region; rules in `src/config/ads.ts`. Live AdSense rendering not verifiable without ids (B-14) |
| Affiliate links `rel="sponsored nofollow noopener"`, via `/go/[slug]`, `/go` noindex + robots-disallowed | PASS | E2E (rel/href), E2E `/go` 302 + `x-robots-tag`, robots test; UNIT click logging without IP/UA |
| Sponsored items carry an in-card label | PASS | `SponsorBadge` inside `AffiliateLink`, `TopPickCard`, `ProviderRows` |
| **No affiliate/paid module on `regulated: true` pages (L-UI-07)** | PASS | E2E: no strip, no `rel=sponsored`, no top-pick card on `/compare/pension-vs-management-insurance`; `{{aff}}`/`{{sponsored}}` on regulated pages render as plain names |
| `ads.txt` served; AdSense review post-launch | PASS (endpoint) / OWNER | `/ads.txt` from `ADSENSE_PUBLISHER_ID` (E2E responds); review is a post-launch owner step |

## Forms / marketing
| Item | Status | Evidence |
|---|---|---|
| Consent checkbox unticked; submission blocked without consent | PASS | UNIT lead schema (`consent: literal(true)`), forms-ssr (no `checked`), client validation |
| Newsletter double opt-in; unsubscribe; "פרסומת" labelling | PARTIAL | double opt-in + unsubscribe + RFC 8058 POST implemented (not run against a DB, B-13); no campaign sender exists yet (B-12) so the label rule is untestable |
| Lead routing only to licence-verified partners; else "בקרוב" | PASS | `eligiblePartners` (active + licence + verified ≤365d + type); E2E waitlist (no form rendered), `/api/lead` stores/forwards nothing without a partner |

## Accessibility
| Item | Status | Evidence |
|---|---|---|
| Statement published with coordinator details and audit date | **FAIL/OWNER** | `/legal/accessibility` renders LEGAL-ACCESSIBILITY with highlighted blanks (A-7) |
| axe/Lighthouse a11y on one page per template; keyboard walkthrough | PARTIAL | axe (WCAG 2.0/2.1 A+AA) passes on 17 templates × 2 viewports (E2E `templates.spec.ts`, incl. open calculator dialog). Lighthouse CI configured, not run here; manual keyboard/SR walkthrough pending (B-15) |
| `html[lang=he][dir=rtl]`; no horizontal overflow at 360px | PASS | E2E every template; overflow asserted on `mobile-360` |

## Governance
| Item | Status | Evidence |
|---|---|---|
| Attorney review/sign-off | **OWNER/ATTY** | A-9 |
| Owner confirmations from §12 recorded | **OWNER** | A-1…A-8 |
| `/methodology` and `/editorial-policy` published and linked | PASS | footer + nav; E2E footer links |
| Rate-freshness process | PASS | `RUNBOOK_RATES_ROLLOVER.md`, `pnpm rates:check`, weekly cron `/api/cron/rates-freshness` |

## Spec §10.2 class map (19 calculator/tool pages)
All 19 slugs map to `DISC-CALC-<CLASS>` in `src/components/calc/classes.ts` (copied from §10.2); `scripts/validate-tokens.ts` asserts all 9 `DISC-CALC-*` texts and every other referenced legal ID exist in `legal-texts.json` (none missing).
