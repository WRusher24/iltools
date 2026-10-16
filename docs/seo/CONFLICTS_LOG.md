# SEO ↔ LEGAL CONFLICTS LOG (Agent 5)

Where SEO work could touch legal rules, **legal wins** and the conflict is logged here. None of the SEO changes removed or hid a disclosure.

| # | Conflict | Severity | Resolution |
|---|---|---|---|
| 1 | `content/compare/pension-vs-management-insurance.mdx` is `regulated: true` (DISC-PENSION present) yet carries the affiliate token `{{slot:AFF-1}}`. | **HIGH** | SEO change: **no affiliate content goes on this page.** Agent 6 must render `{{slot:AFF-1}}` on regulated pages as a **non-affiliate module** (methodology link + lead to a licensed pension professional via `/lead/pension-information`), or suppress the slot. The token was **not** removed (token-preservation rule); its rendering is the legal-safe one. Logged for Agent 6 + Agent 4. |
| 2 | Review pages name providers and list "חולשות" (weaknesses). Risk of implying a paid/unfair ranking. | MEDIUM | Ranking follows the published formula on `/methodology`; paid placement is a separate labelled module. No `reviewRating`/`aggregateRating` markup is emitted (the site displays no star ratings). Disclosure badge (`DISC-AFFILIATE-STRIP`) required on every page with `{{aff:}}`. |
| 3 | Category `canonical` in frontmatter used `/categories/…` while the blueprint route is `/category/…`. | LOW (architecture, not legal) | Normalised all 5 category canonicals to `/category/…`; `/categories/:slug → /category/:slug` 301 added. No disclosure affected. |
| 4 | 15 review files linked `{{link:clearing-fees-calculator}}` / `{{link:invoicing-cost-calculator}}` — slugs that no longer exist after Agent 3's disambiguation. | LOW (SEO correctness) | Rewritten to `{{link:clearing-fees}}` / `{{link:invoicing-cost}}` in body and `related:`. No disclosure affected. |
| 5 | YMYL titles/descriptions must not promise outcomes. | MEDIUM | Verified: all titles/descriptions ≤ 60/155 chars, natural Hebrew, **no** banned phrases (מובטח, ללא סיכון, הכי טוב בישראל, הכי זול). No change needed; enforced by `content-qa` + `seo-lint`. |
| 6 | `/tax-year/*` and `/news/*` have no content. | LOW | Deferred and `noindex`/not generated — no thin pages, no disclosure risk. |
| 7 | Dynamic OG images for calculator results render user-entered numbers. | LOW | Image is generated server-side and ephemeral; no personal data stored, consistent with the calculators' "browser-only, nothing stored" privacy position. |

**Net:** zero legal disclosures weakened, hidden or removed. One HIGH item (#1) handed to Agent 6 with a required non-affiliate rendering for the regulated compare page.
