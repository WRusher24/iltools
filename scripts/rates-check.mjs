#!/usr/bin/env node
// pnpm rates:check — flags rates files older than 12 months, nulls, and low-confidence items.
// Exit 1 on nulls / missing required keys / stale year; low-confidence items are reported (warning) because the data owner
// (Agent 2) marked them so deliberately — the UI shows a caveat for them.
import { readdirSync, readFileSync } from 'node:fs';

const now = new Date();
const files = readdirSync('data/rates').filter((f) => /^\d{4}\.json$/.test(f));
let bad = 0;
const required = ['tax_year', 'currency', 'income_tax_brackets', 'credit_point_value_annual', 'vat', 'national_insurance', 'keren_hishtalmut', 'pension', 'surtax'];
const low = [];

function walk(node, path) {
  if (node === null) { console.error(`NULL value at ${path}`); bad++; return; }
  if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`));
  if (node && typeof node === 'object') {
    if (node.confidence === 'low') low.push(path || '(root)');
    for (const [k, v] of Object.entries(node)) {
      // open-ended top bracket legitimately has to_annual: null
      if (v === null && k === 'to_annual') continue;
      walk(v, path ? `${path}.${k}` : k);
    }
  }
}

for (const f of files) {
  const r = JSON.parse(readFileSync(`data/rates/${f}`, 'utf8'));
  for (const k of required) if (!(k in r)) { console.error(`${f}: missing key ${k}`); bad++; }
  walk(r, f.replace('.json', ''));
  const dates = JSON.stringify(r).match(/\d{4}-\d{2}-\d{2}/g) ?? [];
  const newest = dates.sort().at(-1);
  const ageMonths = newest ? (now - new Date(newest)) / (30.44 * 86400000) : Infinity;
  console.log(`${f}: tax_year ${r.tax_year}, newest stamp ${newest}, age ${ageMonths.toFixed(1)} months`);
  if (ageMonths > 12) { console.error(`${f}: data older than 12 months — run the rates rollover runbook`); bad++; }
}
const years = files.map((f) => Number(f.slice(0, 4)));
if (!years.includes(now.getFullYear())) console.warn(`WARNING: no rates file for the current year ${now.getFullYear()}`);
if (low.length) console.warn(`LOW-CONFIDENCE (${low.length}): ${low.join(', ')}`);
process.exit(bad ? 1 : 0);
