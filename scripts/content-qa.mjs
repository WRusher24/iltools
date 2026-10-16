#!/usr/bin/env node
// scripts/content-qa.mjs — Self-QA for IL-Tools Hebrew content (Agent 3).
// Checks: token resolution, unsourced currency/percent numerals, banned phrases,
// word counts + reading level, and the article chart/table/source requirements.
// Exits non-zero on any BLOCKER.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const DATA = join(ROOT, 'data');

const BLOCKERS = [];
const WARNINGS = [];
const FILE_REPORTS = [];

const arg = (name) => process.argv.includes(name);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function collectJsonNumbers(node, acc) {
  if (typeof node === 'number') acc.push(node);
  else if (typeof node === 'string') { for (const m of node.matchAll(/\d[\d,]*\.?\d*/g)) acc.push(Number(m[0].replace(/,/g, ''))); }
  else if (Array.isArray(node)) node.forEach((n) => collectJsonNumbers(n, acc));
  else if (node && typeof node === 'object') Object.values(node).forEach((n) => collectJsonNumbers(n, acc));
  return acc;
}

// ---------- Build allowed-number set ----------
const allowedNumbers = new Set();
const addNum = (raw) => {
  const s = String(raw).replace(/,/g, '').trim();
  if (!s || !/^-?\d+(\.\d+)?$/.test(s)) return;
  allowedNumbers.add(s);
  const n = Number(s);
  if (Number.isFinite(n)) {
    allowedNumbers.add(String(Number((n * 100).toFixed(4))));
    allowedNumbers.add(String(Number((n / 100).toFixed(4))));
  }
};

// From DATA_REFERENCE.md
const refPath = join(ROOT, 'docs', 'content', 'DATA_REFERENCE.md');
if (existsSync(refPath)) {
  const txt = readFileSync(refPath, 'utf8');
  for (const m of txt.matchAll(/\d[\d,]*\.?\d*/g)) addNum(m[0]);
} else {
  WARNINGS.push('DATA_REFERENCE.md not found');
}

// From all data JSON (public + internal) and article chart data files
for (const f of walk(DATA).filter((f) => extname(f) === '.json')) {
  try { collectJsonNumbers(JSON.parse(readFileSync(f, 'utf8')), []).forEach(addNum); } catch { /* ignore */ }
}
for (const f of walk(CONTENT).filter((f) => f.endsWith('.data.json'))) {
  try { collectJsonNumbers(JSON.parse(readFileSync(f, 'utf8')), []).forEach(addNum); } catch { /* ignore */ }
}

// ---------- Token registries ----------
const sourceIds = new Set();
for (const f of walk(DATA).filter((f) => f.endsWith('.json'))) {
  if (!/sources|_sources_/.test(f.replace(/\\/g, '/'))) continue;
  try {
    const j = JSON.parse(readFileSync(f, 'utf8'));
    const arr = Array.isArray(j) ? j : [j];
    for (const s of arr) if (s && s.id) sourceIds.add(s.id);
  } catch { /* ignore */ }
}

const providerIds = new Set();
const providersDir = join(DATA, 'providers');
if (existsSync(providersDir)) {
  for (const f of readdirSync(providersDir).filter((f) => f.endsWith('.json'))) {
    try {
      const j = JSON.parse(readFileSync(join(providersDir, f), 'utf8'));
      for (const p of Array.isArray(j) ? j : []) if (p.id) providerIds.add(p.id);
    } catch { /* ignore */ }
  }
}

const contentFiles = walk(CONTENT).filter((f) => ['.mdx', '.md'].includes(extname(f)));

const slugSet = new Set();
for (const f of contentFiles) {
  const txt = readFileSync(f, 'utf8');
  const m = txt.match(/^slug:\s*(.+)$/m);
  if (m) slugSet.add(m[1].trim().replace(/["']/g, ''));
}
// Also allow slugs declared in the inventory (so links can target planned pages)
const invPath = join(ROOT, 'docs', 'content', 'CONTENT_INVENTORY.md');
if (existsSync(invPath)) {
  const inv = readFileSync(invPath, 'utf8');
  for (const m of inv.matchAll(/^\|\s*(?:\d+\s*\|\s*)?([a-z0-9-]+)\s*\|/gm)) slugSet.add(m[1]);
}

const chartIds = new Set();
for (const f of walk(CONTENT).filter((f) => f.endsWith('.data.json'))) {
  try {
    const j = JSON.parse(readFileSync(f, 'utf8'));
    for (const c of j.charts || []) if (c.id) chartIds.add(c.id);
  } catch { /* ignore */ }
}

// ---------- Banned phrases ----------
const banned = [
  'מובטח', 'מובטחת', 'מובטחים', 'רווח מובטח', 'תשואה מובטחת', 'תשואות מובטחות',
  'ללא סיכון', 'חסר סיכון', 'ללא הפסד', 'בלי להפסיד',
  'הכי טוב בישראל', 'הטוב בישראל', 'מספר 1 בישראל', 'הזול בישראל', 'הכי זול',
  'בלעדי', 'אקסקלוסיבי', 'הרוויחו', 'תרוויחו', 'כסף בחינם', 'בזמן מוגבל', 'מהרו עכשיו',
  'כדאי לך לבחור', 'כדאי לך לקחת', 'מומלץ לך לבחור',
];

const countWords = (s) => s.replace(/\{\{[^}]+\}\}/g, ' ').split(/\s+/).filter(Boolean).length;

// ---------- Per-file checks ----------
for (const f of contentFiles) {
  const rel = relative(ROOT, f).replace(/\\/g, '/');
  const raw = readFileSync(f, 'utf8');
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm = fmMatch ? fmMatch[1] : '';
  const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;

  // tokens
  for (const m of raw.matchAll(/\{\{link:([^}]+)\}\}/g)) {
    const slug = m[1].trim();
    if (!slugSet.has(slug)) BLOCKERS.push(`${rel}: {{link:${slug}}} — slug not in inventory`);
  }
  const isProvider = (slug) => providerIds.has(slug) || providerIds.has(slug.replace(/-/g, '_'));
  for (const m of raw.matchAll(/\{\{aff:([^}]+)\}\}/g)) {
    const slug = m[1].trim();
    if (!isProvider(slug)) BLOCKERS.push(`${rel}: {{aff:${slug}}} — provider id not found in /data/providers`);
  }
  for (const m of raw.matchAll(/\{\{sponsored:([^}]+)\}\}/g)) {
    if (!isProvider(m[1].trim())) BLOCKERS.push(`${rel}: {{sponsored:${m[1].trim()}}} — unknown provider`);
  }
  for (const m of raw.matchAll(/\{\{chart:([^}]+)\}\}/g)) {
    if (!chartIds.has(m[1].trim())) BLOCKERS.push(`${rel}: {{chart:${m[1].trim()}}} — no matching .data.json chart id`);
  }
  for (const m of raw.matchAll(/\{\{sources:\[([^\]]*)\]\}\}/g)) {
    for (const id of m[1].split(',').map((s) => s.trim()).filter(Boolean)) {
      if (!sourceIds.has(id)) BLOCKERS.push(`${rel}: {{sources}} references unknown source id "${id}"`);
    }
  }

  // banned phrases
  for (const phrase of banned) {
    if (raw.includes(phrase)) BLOCKERS.push(`${rel}: banned phrase "${phrase}"`);
  }

  // unsourced currency/percent numerals
  const lines = body.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/(\d[\d,]*\.?\d*)\s*(₪|%)/g)) {
      const num = m[1].replace(/,/g, '');
      const variants = [num, String(Number(num)), String(Number(Number(num).toFixed(4)))];
      if (variants.some((v) => allowedNumbers.has(v))) continue;
      const window = lines.slice(Math.max(0, i - 8), i + 9).join(' ');
      const nearExample = /דוגמה|הדגמה|לדוגמה|{{chart:/.test(window);
      const msg = `${rel}:${i + 1}: numeral "${m[1]}${m[2]}" not traceable to /data`;
      if (nearExample) WARNINGS.push(msg + ' (marked as דוגמה/הדגמה)');
      else BLOCKERS.push(msg);
    }
  });

  // disclosure + regulated gates
  const hasAff = /\{\{aff:/.test(raw) || /\{\{slot:AFF-/.test(raw);
  if (/\{\{aff:/.test(raw) && !/\{\{slot:AFF-/.test(raw) && !/גילוי נאות|עמלה|שותף/.test(raw)) {
    WARNINGS.push(`${rel}: contains {{aff:}} but no visible disclosure/slot`);
  }
  if (/regulated:\s*true/.test(fm) && !/DISC-PENSION/.test(raw)) {
    BLOCKERS.push(`${rel}: regulated:true but missing <!-- DISC-PENSION -->`);
  }
  if (/\{\{[^}]*\d{3,}/.test(raw) === false && /₪|%/.test(body) && /type:\s*(article|guide|compare|best)/.test(fm)) {
    if (!/\{\{updated:/.test(raw)) WARNINGS.push(`${rel}: figures present but no {{updated:...}}`);
    if (!/\{\{sources:\[/.test(raw)) WARNINGS.push(`${rel}: figures present but no {{sources:[...]}}`);
  }

  const words = countWords(body);
  const sentences = body.split(/[.!?؟\n]/).map((s) => s.trim()).filter((s) => s.length > 3);
  const avgSentence = sentences.length ? words / sentences.length : 0;
  const longSentences = sentences.filter((s) => countWords(s) > 25).length;

  FILE_REPORTS.push({ rel, type: (fm.match(/type:\s*(\S+)/) || [])[1] || '?', words, avgSentence: Math.round(avgSentence), longSentences });
}

// ---------- Article gate ----------
const articles = FILE_REPORTS.filter((r) => r.rel.startsWith('content/articles/') && r.rel.endsWith('.mdx'));
let goodArticles = 0;
for (const a of articles) {
  const raw = readFileSync(join(ROOT, a.rel), 'utf8');
  const hasTable = /^\|.*\|/m.test(raw);
  const hasChart = /\{\{chart:[^}]+\}\}/.test(raw);
  const hasSources = /\{\{sources:\[/.test(raw);
  const inRange = a.words >= 1000 && a.words <= 1800;
  if (!hasTable) BLOCKERS.push(`${a.rel}: article missing a Markdown table`);
  if (!hasChart) BLOCKERS.push(`${a.rel}: article missing {{chart:*}}`);
  if (!hasSources) BLOCKERS.push(`${a.rel}: article missing {{sources:[...]}}`);
  if (!inRange) WARNINGS.push(`${a.rel}: word count ${a.words} outside 1,000–1,800`);
  if (hasTable && hasChart && hasSources) goodArticles++;
}
if (articles.length < 20) BLOCKERS.push(`Only ${articles.length} articles in /content/articles (need >= 20)`);
if (goodArticles < 20) WARNINGS.push(`Only ${goodArticles} articles met the table+chart+sources bar`);

// Guide and review length floors (whitespace-based)
for (const r of FILE_REPORTS) {
  if (r.rel.startsWith('content/guides/') && r.words < 1200) WARNINGS.push(`${r.rel}: guide word count ${r.words} < 1,200`);
  if (r.rel.startsWith('content/guides/') && r.words > 2200) WARNINGS.push(`${r.rel}: guide word count ${r.words} > 2,200`);
  if (r.rel.startsWith('content/reviews/') && r.words < 900) WARNINGS.push(`${r.rel}: review word count ${r.words} < 900`);
}

// ---------- Report ----------
const byType = FILE_REPORTS.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {});
const totalWords = FILE_REPORTS.reduce((s, r) => s + r.words, 0);

console.log('=== IL-Tools content QA ===');
console.log(`Files scanned: ${FILE_REPORTS.length}`);
console.log(`By type: ${JSON.stringify(byType)}`);
console.log(`Total words: ${totalWords.toLocaleString()}`);
console.log(`Articles: ${articles.length} (met bar: ${goodArticles})`);
console.log(`Source ids: ${sourceIds.size} · providers: ${providerIds.size} · slugs: ${slugSet.size} · charts: ${chartIds.size}`);
console.log(`\nBLOCKERS: ${BLOCKERS.length}`);
for (const b of BLOCKERS) console.log('  ✗ ' + b);
console.log(`\nWARNINGS: ${WARNINGS.length}`);
for (const w of WARNINGS.slice(0, 120)) console.log('  ! ' + w);
if (WARNINGS.length > 120) console.log(`  … and ${WARNINGS.length - 120} more`);

if (arg('--report')) {
  console.log('\n=== per file ===');
  for (const r of FILE_REPORTS.sort((a, b) => a.rel.localeCompare(b.rel))) {
    console.log(`${String(r.words).padStart(5)}w  avg-sent ${String(r.avgSentence).padStart(2)}  ${r.rel}`);
  }
}

process.exit(BLOCKERS.length ? 1 : 0);
