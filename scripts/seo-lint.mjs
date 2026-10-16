#!/usr/bin/env node
// scripts/seo-lint.mjs — SEO validation for IL-Tools (Agent 5).
// Checks: title/description lengths, one H1, canonical presence, duplicate
// titles/descriptions, broken {{link:}} targets against the canonical slug set,
// orphan pages, and schema JSON validity. Exits non-zero on any failure.
//
// Usage: node scripts/seo-lint.mjs [--report]

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const SEO = join(ROOT, 'seo');
const ARG = (n) => process.argv.includes(n);

const TITLE_MAX = 60;
const DESC_MAX = 155;

const FAIL = [];
const WARN = [];
const INFO = [];

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};
const norm = (p) => relative(ROOT, p).split('\\').join('/');

// ---------------------------------------------------------------- load content
const files = walk(CONTENT).filter((f) => ['.mdx', '.md'].includes(extname(f)));
const parseFm = (raw) => {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (mm) fm[mm[1]] = mm[2].replace(/^"(.*)"$/s, '$1');
  }
  return { fm, fmRaw: m ? m[1] : '', body: m ? raw.slice(m[0].length) : raw };
};

const pages = [];
const allSlugs = new Set();
for (const f of files) {
  const rel = norm(f);
  const raw = readFileSync(f, 'utf8');
  const { fm, body } = parseFm(raw);
  if (fm.slug) allSlugs.add(fm.slug);
  const isRoute = !rel.startsWith('content/newsletter/') && !!fm.slug;
  pages.push({ rel, raw, body, fm, isRoute, slug: fm.slug || null });
}

// ---------------------------------------------------------------- per-page checks
const seenTitle = new Map();
const seenDesc = new Map();
for (const p of pages) {
  if (!p.isRoute) continue;
  const { title, description, canonical } = p.fm;

  if (!title) FAIL.push(`${p.rel}: missing title`);
  else if (title.length > TITLE_MAX) FAIL.push(`${p.rel}: title ${title.length} > ${TITLE_MAX} chars`);

  if (!description) FAIL.push(`${p.rel}: missing description`);
  else if (description.length > DESC_MAX) FAIL.push(`${p.rel}: description ${description.length} > ${DESC_MAX} chars`);

  if (!canonical) FAIL.push(`${p.rel}: missing canonical`);
  else if (!canonical.startsWith('/')) FAIL.push(`${p.rel}: canonical must be a root-relative path`);

  const h1 = (p.body.match(/^#\s+.+$/gm) || []).length;
  if (h1 !== 1) FAIL.push(`${p.rel}: expected exactly one H1, found ${h1}`);

  if (title) {
    const key = title.trim();
    if (seenTitle.has(key)) FAIL.push(`${p.rel}: duplicate title with ${seenTitle.get(key)} — "${key}"`);
    else seenTitle.set(key, p.rel);
  }
  if (description) {
    const key = description.trim();
    if (seenDesc.has(key)) FAIL.push(`${p.rel}: duplicate description with ${seenDesc.get(key)}`);
    else seenDesc.set(key, p.rel);
  }
}

// ---------------------------------------------------------------- links
const linkTargets = [];
for (const p of pages) {
  for (const m of p.raw.matchAll(/\{\{link:([^}]+)\}\}/g)) linkTargets.push({ from: p.rel, slug: m[1].trim() });
  const rm = (p.fm.related || '').match(/^\[?([^\]]*)\]?$/);
  if (p.fm.related) for (const s of p.fm.related.replace(/[[\]]/g, '').split(',').map((x) => x.trim()).filter(Boolean)) linkTargets.push({ from: p.rel, slug: s, related: true });
}
for (const t of linkTargets) if (!allSlugs.has(t.slug)) FAIL.push(`${t.from}: broken ${t.related ? 'related[]' : '{{link:}}'} target "${t.slug}" — not in the canonical slug set`);

// ---------------------------------------------------------------- orphans
// Reachable = BFS from home + the global nav/footer page set, following related[] and {{link:}}.
const NAV_PAGES = ['home', 'about', 'methodology', 'editorial-policy', 'contact', 'advertise'];
const edges = new Map(); // slug -> Set(target slug)
for (const p of pages) {
  if (!p.slug) continue;
  const set = new Set();
  for (const m of p.raw.matchAll(/\{\{link:([^}]+)\}\}/g)) set.add(m[1].trim());
  if (p.fm.related) for (const s of p.fm.related.replace(/[[\]]/g, '').split(',').map((x) => x.trim()).filter(Boolean)) set.add(s);
  edges.set(p.slug, set);
}
const reached = new Set();
const queue = [...NAV_PAGES];
while (queue.length) {
  const s = queue.shift();
  if (!allSlugs.has(s) || reached.has(s)) continue;
  reached.add(s);
  for (const t of edges.get(s) || []) if (!reached.has(t)) queue.push(t);
}
const routeSlugs = pages.filter((p) => p.isRoute).map((p) => p.slug);
const orphans = [...new Set(routeSlugs)].filter((s) => !reached.has(s));
for (const s of orphans) FAIL.push(`orphan page: "${s}" is not reachable from home/nav within the link graph`);
if (ARG('--report')) INFO.push(`reachable: ${reached.size} of ${new Set(routeSlugs).size} route slugs`);

// ---------------------------------------------------------------- schema JSON validity
const schemaDir = join(SEO, 'schema');
if (!existsSync(schemaDir)) FAIL.push('seo/schema/ directory is missing');
else {
  const schemaFiles = readdirSync(schemaDir).filter((f) => f.endsWith('.json'));
  if (schemaFiles.length === 0) FAIL.push('seo/schema/ has no templates');
  for (const f of schemaFiles) {
    const p = join(schemaDir, f);
    try {
      const j = JSON.parse(readFileSync(p, 'utf8'));
      const obj = j.json || j;
      if (!obj['@context']) FAIL.push(`seo/schema/${f}: missing @context`);
      if (!obj['@type']) FAIL.push(`seo/schema/${f}: missing @type`);
      // A review rating on a non-displayed page is a manual-action risk.
      const txt = JSON.stringify(obj);
      if (/aggregateRating|reviewRating/.test(txt)) WARN.push(`seo/schema/${f}: contains rating markup — confirm ratings are genuinely displayed`);
    } catch (e) {
      FAIL.push(`seo/schema/${f}: invalid JSON (${e.message})`);
    }
  }
}

// ---------------------------------------------------------------- machine-readable artifacts
for (const f of ['url-map.json', 'redirects.json', 'internal-links.json']) {
  const p = join(SEO, f);
  if (!existsSync(p)) { FAIL.push(`seo/${f} is missing`); continue; }
  try { JSON.parse(readFileSync(p, 'utf8')); } catch (e) { FAIL.push(`seo/${f}: invalid JSON (${e.message})`); }
}
for (const f of ['robots.txt.template', 'llms.txt']) if (!existsSync(join(SEO, f))) FAIL.push(`seo/${f} is missing`);

// ---------------------------------------------------------------- report
console.log('=== IL-Tools SEO lint ===');
console.log(`Content files: ${pages.length} · route pages: ${routeSlugs.length} · canonical slugs: ${allSlugs.size}`);
console.log(`Link targets checked: ${linkTargets.length}`);
console.log(`\nFAILURES: ${FAIL.length}`);
for (const f of FAIL) console.log('  ✗ ' + f);
console.log(`\nWARNINGS: ${WARN.length}`);
for (const w of WARN) console.log('  ! ' + w);
if (ARG('--report')) for (const i of INFO) console.log('  i ' + i);

process.exit(FAIL.length ? 1 : 0);
