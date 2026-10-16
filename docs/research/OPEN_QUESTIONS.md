# OPEN_QUESTIONS (Agent 2)

## BLOCKER-1 — No access to primary sources (status 2026-10-16)
The research container's network policy rejects every Israeli host tried (curl: HTTP 403 on CONNECT; WebFetch: DNS failure).
Hosts needed: `www.gov.il`, `taxes.gov.il`, `www.btl.gov.il`, `fs.knesset.gov.il`, `main.knesset.gov.il`, `www.boi.org.il`,
`www.cbs.gov.il`, `www.kolzchut.org.il`, `pensiynet.mof.gov.il`, `gemelnet.mof.gov.il`, `data.gov.il`, `www.nevo.co.il`, plus provider
pricing pages (greeninvoice/morning, icount, rivhit, invoice4u, cardcom, tranzila, payplus, grow, pelecard, yaad, bank and card-company tariffs).
Only WebSearch works, and it returns snippets/summaries from commercial blogs. Per the brief ("secondary sources never the sole source"),
no statutory value has been written to `/data/rates/*.json`. Nothing is estimated to fill the gap.

## Unverified leads (NOT data — do not publish)
- 2026 income-tax brackets: search summaries disagree. One set says brackets were frozen at 2024 values through 2027
  (monthly 7,010 / 10,060 / 16,150 / 22,440 / 46,690 / 60,130); others say lower brackets were widened retroactively from Jan 2026
  (20% up to 19,000; 31% up to 25,100 monthly). A Knesset committee draft (Feb 2026) shows the old figures.
  Needs Tax Authority / Rashumot confirmation. Likely `change_alert`.
- Credit point value 2026: summaries say 242 ILS/month (2,904/year), frozen. Unverified.

## Flags for Agent 4 (legal) — decided by them, not me
- Pension/hishtalmut fee data: record from Pensia-Net/Gemel-Net only, `informational_only: true`; no return-based ranking.
- Lead-gen to pension/insurance agents requires licence check in the Capital Market Authority registry.
- Tax-refund estimator and payslip decoder: accuracy disclaimers; payslip processing client-side only.
