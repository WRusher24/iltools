# IL-Tools — il-tools.co.il

אתר עברית (RTL) להשוואות, מחשבונים ומדריכים לעצמאים ולעסקים קטנים. Hebrew-native comparison & calculator platform: Next.js 16 (App Router) · TypeScript strict · Tailwind 4 (logical properties only) · Drizzle/Postgres (optional) · Vercel.

> **Not financial advice.** The site is an information/comparison service; legal texts are a draft pending attorney review (see `LEGAL_COMPLIANCE.md`, `docs/engineering/BLOCKERS.md`).

## Quick start
```bash
pnpm install
pnpm dev                 # http://localhost:3000 — works with NO env vars and NO database
pnpm typecheck && pnpm lint && pnpm test
pnpm content:validate && pnpm content:tokens && pnpm legal:lint && pnpm seo:lint && pnpm rates:check
pnpm build && pnpm start
pnpm test:e2e            # Playwright + axe (needs `pnpm exec playwright install chromium`)
```
Database (optional): set `DATABASE_URL` + `ENCRYPTION_KEY` (see `.env.example`), then `pnpm db:generate` (already committed in `drizzle/`), `pnpm db:migrate`, `pnpm db:seed`.

## Layout
| Path | What |
|---|---|
| `content/` | Hebrew MDX (Agent 3) — tokens `{{slot:…}} {{aff:…}} {{link:…}} {{chart:…}} {{sources:[…]}} {{updated:…}}` |
| `data/` | rates (`rates/<year>.json`), providers, sources, **legal texts**, `legal/owner-facts.json` (owner fills legal blanks), `internal/affiliate_programs.json` |
| `seo/` | url-map, redirects, internal links, schema templates, robots/llms templates (Agent 5) |
| `src/lib/calc/` | pure-TS calculators (no React) · `src/components/calc/` UI (`CalcShell`, disclaimer modal) |
| `src/lib/` · `src/components/` · `src/app/` | loaders, markdown/token pipeline, SEO, legal; UI; routes + API |
| `src/server/` · `src/db/` | env validation, crypto, rate limit, email; Drizzle schema/seed |
| `scripts/` | content-qa, legal-extract/lint, seo-lint (Agents 3–5, wired into CI) + prebuild, validate-tokens, rates-check, check-affiliate-links, gen-vercel-json, lint-logical-css, take-screenshots |
| `docs/engineering/` | ARCHITECTURE, BLOCKERS, BUILD_REPORT, COMPLIANCE_TRACE, ENV_VARS, DEPLOY_VERCEL, RUNBOOK_RATES_ROLLOVER, CALC_NOTES, screenshots |

## Commands
`dev` `build` `start` `typecheck` `lint` `test` `test:e2e` `content:validate` `content:tokens` `legal:extract` `legal:lint` `seo:lint` `rates:check` `affiliate:check` `db:generate` `db:migrate` `db:seed` `lhci`.

## Deploy
Import the repo in Vercel, set variables per `docs/engineering/ENV_VARS.md`, Deploy — see `docs/engineering/DEPLOY_VERCEL.md`.
