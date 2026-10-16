# Runbook — yearly rates rollover (every January, and on any law change)

Rates live in `data/rates/<year>.json` (schema: `data/rates/schema.json`). A rollover is a **data PR, not a code change**.

1. Copy `data/rates/2026.json` → `data/rates/2027.json`; set `tax_year`, every `effective_from`, `accessed_on`, `source_id`, `confidence` from **primary sources** (רשות המסים, ביטוח לאומי, רשות שוק ההון). Never fill a gap with a guess — leave the feature in "לא זמין" and log it in `docs/research/OPEN_QUESTIONS.md`.
2. Update `data/sources.json` with the new sources (id, title, publisher, url, accessed_on).
3. `node scripts/prebuild.mjs` (regenerates `src/generated/rates-index.ts`; `getRates(date)` picks the newest year ≤ the current year, so the new file activates on 1 January automatically).
4. `pnpm rates:check` — fails on nulls, missing keys, or data older than 12 months; warns on `confidence: "low"` items (the UI shows a caveat for them — resolve them if you can).
5. Re-verify the calculator hand-computed tests in `tests/calc/*` against the new year (they read keys from the rates file; update expected numbers computed independently) and add fixtures to `docs/research/fixtures/`.
6. Update every page's `{{updated:YYYY-MM-DD}}` and the figures in content that quote the rates (`docs/content/DATA_REFERENCE.md` lists the allowed numbers; `pnpm content:validate` flags untraceable numerals).
7. `pnpm db:seed` (mirrors rates into `rates_versions` when a DB is configured).
8. Run the full chain (`pnpm typecheck && pnpm lint && pnpm test && pnpm content:validate && pnpm content:tokens && pnpm legal:lint && pnpm seo:lint && pnpm build`), merge, deploy.
9. The weekly cron `/api/cron/rates-freshness` logs a warning while the active rates year is older than the current year.
