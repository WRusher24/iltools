#!/usr/bin/env node
// scripts/legal-lint.mjs — Agent 4 (legal). Companion to scripts/content-qa.mjs.
//
// Scans /content and:
//   1. flags banned phrases by PARSING /docs/content/BANNED_PHRASES.md (no second hardcoded list);
//      section A => BLOCKER, section B => HIGH.
//   2. {{aff:…}} pages are considered compliant if they contain {{slot:AFF-1}} — the site-wide
//      DISC-AFFILIATE-STRIP is rendered separately, so a per-page disclosure token is NOT required.
//      A page with {{aff:…}} and no AFF slot is a BLOCKER.
//   3. `regulated: true` frontmatter without `<!-- DISC-PENSION -->` => BLOCKER.
//   4. pages containing ₪ / % figures without {{updated:…}} and {{sources:[…]}} => HIGH.
//   5. token forms are matched as they actually appear (colon/bracket forms; underscore {{aff:}} ids).
//
// Exits non-zero on any BLOCKER. Writes a report to legal-lint-report.txt at the repo root.

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const BANNED = join(ROOT, 'docs', 'content', 'BANNED_PHRASES.md');
const REPORT = join(ROOT, 'legal-lint-report.txt');

const BLOCKERS = [];
const HIGHS = [];
const FILE_REPORTS = [];

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

// ---------- 1. Banned phrases parsed from BANNED_PHRASES.md ----------
const bannedBlocker = [];
const bannedHigh = [];
if (!existsSync(BANNED)) {
  BLOCKERS.push('docs/content/BANNED_PHRASES.md not found — cannot check banned phrases');
} else {
  const md = readFileSync(BANNED, 'utf8').split(/\r?\n/);
  let section = null;
  for (const line of md) {
    if (/^##\s*A\./.test(line)) { section = 'A'; continue; }
    if (/^##\s*B\./.test(line)) { section = 'B'; continue; }
    if (/^##\s*C\./.test(line)) { section = 'C'; continue; }
    if (!/^\s*\|/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    const first = cells[0];
    if (/^[-:\s]+$/.test(first) || /ביטוי אסור|להימנע מ|^ביטוי$/.test(first)) continue; // header/separator
    let phrases = [];
    const quoted = [...first.matchAll(/"([^"]+)"/g)].map((m) => m[1].trim());
    if (quoted.length) phrases = quoted;
    else phrases = first.split('/').map((s) => s.trim()).filter(Boolean);
    phrases = phrases.map((s) => s.replace(/^["']|["']$/g, '').trim()).filter((s) => s.length > 1);
    if (section === 'A') bannedBlocker.push(...phrases);
    else if (section === 'B') bannedHigh.push(...phrases);
  }
}
const uniq = (a) => [...new Set(a)];

// ---------- scan ----------
const files = walk(CONTENT).filter((f) => ['.mdx', '.md'].includes(extname(f)));

for (const f of files) {
  const r = rel(f);
  const raw = readFileSync(f, 'utf8');
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm = fmMatch ? fmMatch[1] : '';
  const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;

  // 1. banned phrases
  for (const p of uniq(bannedBlocker)) if (raw.includes(p)) BLOCKERS.push(`${r}: banned phrase (A) "${p}"`);
  for (const p of uniq(bannedHigh)) if (raw.includes(p)) HIGHS.push(`${r}: risky phrase (B) "${p}"`);

  // 2. affiliate + slot
  const hasAff = /\{\{aff:[^}]+\}\}/.test(raw);
  const hasAffSlot = /\{\{slot:AFF-[^}]+\}\}/.test(raw);
  if (hasAff && !hasAffSlot) {
    BLOCKERS.push(`${r}: contains {{aff:…}} but no {{slot:AFF-*}} (site-wide DISC-AFFILIATE-STRIP is rendered separately; the page must still carry the slot)`);
  }

  // 3. regulated => DISC-PENSION
  const regulated = /regulated:\s*true/.test(fm);
  const hasDiscPension = /<!--\s*DISC-PENSION\s*-->/.test(raw);
  if (regulated && !hasDiscPension) {
    BLOCKERS.push(`${r}: regulated: true but missing <!-- DISC-PENSION -->`);
  }

  // 4. figures => {{updated}} + {{sources:[…]}
  const hasFigure = /(\d[\d,]*\.?\d*)\s*(₪|%)/.test(body);
  const hasUpdated = /\{\{updated:\d{4}-\d{2}-\d{2}\}\}/.test(raw);
  const hasSources = /\{\{sources:\[[^\]]*\]\}\}/.test(raw);
  if (hasFigure && !hasUpdated) HIGHS.push(`${r}: ₪/% figures present but no {{updated:YYYY-MM-DD}}`);
  if (hasFigure && !hasSources) HIGHS.push(`${r}: ₪/% figures present but no {{sources:[…]}}`);

  // 5. token-form sanity (must match the repo conventions; catches bare/wrong tokens)
  for (const m of raw.matchAll(/\{\{updated:([^}]*)\}\}/g)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(m[1].trim())) HIGHS.push(`${r}: {{updated:${m[1]}}} is not the colon/ISO form {{updated:YYYY-MM-DD}}`);
  }
  for (const m of raw.matchAll(/\{\{sources:(?!\[)([^}]*)\}\}/g)) {
    HIGHS.push(`${r}: {{sources:${m[1]}}} is not the bracket form {{sources:[id, …]}}`);
  }
  for (const m of raw.matchAll(/\{\{aff:([^}]+)\}\}/g)) {
    const id = m[1].trim();
    if (/[A-Z]/.test(id) || / /.test(id) || id.includes('-')) HIGHS.push(`${r}: {{aff:${id}}} is not an underscored provider id from /data/providers`);
  }

  FILE_REPORTS.push({ r, regulated, hasAff, hasAffSlot });
}

// ---------- report ----------
const lines = [];
lines.push('=== IL-Tools legal lint (Agent 4) ===');
lines.push(`Files scanned: ${files.length}`);
lines.push(`Banned phrases parsed from BANNED_PHRASES.md: ${uniq(bannedBlocker).length} BLOCKER + ${uniq(bannedHigh).length} HIGH`);
lines.push(`Regulated pages: ${FILE_REPORTS.filter((x) => x.regulated).length} · pages with {{aff:}}: ${FILE_REPORTS.filter((x) => x.hasAff).length}`);
lines.push('');
lines.push(`BLOCKERS: ${BLOCKERS.length}`);
for (const b of BLOCKERS) lines.push('  ✗ ' + b);
lines.push('');
lines.push(`HIGH: ${HIGHS.length}`);
for (const h of HIGHS) lines.push('  ! ' + h);
const out = lines.join('\n') + '\n';
console.log(out);
try { writeFileSync(REPORT, out, 'utf8'); } catch { /* report is best-effort */ }

process.exit(BLOCKERS.length ? 1 : 0);
