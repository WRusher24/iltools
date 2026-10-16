# E-E-A-T & TRUST PLAN — IL-Tools (Agent 5)

YMYL finance content ranks on trust. This plan lists the trust surfaces, who owns them, and the rule that keeps the site honest while it has **no credentialed reviewer yet**.

---

## 1. Trust surfaces (required pages/content)

| Surface | Route / location | Content requirement |
|---|---|---|
| About | `/about` | Who we are, what we do and don't do; team persona ("צוות המערכת של IL-Tools"); the explicit "we are not advisers" statement. |
| Methodology | `/methodology` | The **full published scoring formula** (price 30%, capability fit 30%, support 15%, reliability 15%, transparency 10%) and the statement "הדירוג אינו למכירה". Paid placement is a separate labelled module. |
| Editorial policy | `/editorial-policy` | Sourcing standards, AI-use disclosure, correction policy, update cadence. |
| Contact | `/contact` | Real contact channel; the route for correction requests. |
| Legal set | `/legal/*` | Disclaimer, terms, privacy, affiliate disclosure, cookies, accessibility (Agent 4). |
| Author box | every content page | Team persona + link to `/about`; **no named individual**. |

## 2. Author identity

- Author is the **team persona** `il-tools-editorial` ("צוות המערכת של IL-Tools"), rendered as **Organization**, never `Person`.
- **Do NOT add `reviewer_role` / "נבדק על ידי"** until a real credentialed reviewer is contracted and named. Current truth: no reviewer exists.
- The author box explains the compilation method (official sources + provider publications) and links to `/methodology` and `/editorial-policy`.

## 3. Update policy (freshness = trust in finance)

- **Every statutory figure is rechecked each January** and on any law/rate change; the tax-year stamp on each page reflects it.
- Each page carries a visible **"עודכן לאחרונה: {updated}"** stamp rendered from the `{{updated:…}}` token.
- Rates live as versioned data (`/data/rates/<year>.json`); a yearly rollover runbook re-verifies and re-publishes.
- Correction policy: documented turnaround for reported errors, with a dated correction note where a figure changes.

## 4. Sourcing standards

- Every public number traces to a **`source_id`** in `/data/sources.json` (government/official sources preferred: רשות המסים, ביטוח לאומי, רשות שוק ההון, בנק ישראל).
- Where a value is low-confidence or unpublished, the page says so ("הצעת מחיר בלבד", "לפי הנתונים שפורסמו") and links to the official comparison tool (גמל נט / פנסיה נט) — it does **not** invent a number.
- Screenshots/logos used only for identification; no copied competitor text; no fake testimonials or user ratings.

## 5. Trust signals to display

- Affiliate disclosure strip above the fold on any page with affiliate links (`DISC-AFFILIATE-STRIP`).
- Regulated pages show `DISC-PENSION`; calculators show the correct `DISC-CALC-*` modal.
- "איך אנחנו מדרגים" link next to rankings; "הדירוג אינו למכירה" note.
- Sponsored/paid items labelled ("ממומן"/"בשיתוף"), never mixed into the objective ranking.

## 6. Recommended credentialed reviewers to contract (owner action)

Until one is engaged, no "reviewed by" claim appears. The owner should contract and name one or more of:
- **רו״ח ביקורת** (CPA) — for tax/accounting content accuracy.
- **יועץ מס מוסמך** — for tax-filing and advance-payment content.
- **יועץ/סוכן פנסיוני מורשה** (per חוק הפיקוח על שירותים פיננסיים) — for pension/hishtalmut educational content.
Once contracted, add `reviewer_role` to the relevant frontmatter and the author box, and only then may pages claim "נבדק על ידי".

## 7. Anti-patterns to avoid (trust killers)

- Fake star ratings or `AggregateRating` markup (none are displayed → none are marked up).
- Promising returns/guarantees; ranking products by pension returns.
- Hidden affiliate relationships; undisclosed paid placement.
- Invented providers, prices, testimonials or "user reviews".
- Thin programmatic pages published to look bigger than the site's real value.

## 8. Measurement of trust

Track in GSC/GA4: branded-search growth, returning-visitor rate, calculator completion rate, affiliate CTR by template, and manual-action/security-issue counts (should stay zero). Report quarterly in the roadmap review.
