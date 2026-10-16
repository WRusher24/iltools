#!/usr/bin/env node
// scripts/extract-legal.mjs — Agent 4 (legal).
// Parses the machine-readable LEGAL blocks inside /LEGAL_COMPLIANCE.md and writes
// /data/legal/legal-texts.json for Agent 6 to render verbatim.
//
// A block looks exactly like:
//   <!-- LEGAL:BEGIN id="DISC-CALC-TAX" version="1.0" lang="he" placement="calculator-modal" -->
//   ...Hebrew text (Markdown allowed, may contain blank lines)...
//   <!-- LEGAL:END id="DISC-CALC-TAX" -->
//
// Fails loudly (exit 1) on: missing LEGAL file, unbalanced BEGIN/END, duplicate ids,
// END id that does not match its BEGIN, or a block whose body is empty.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'LEGAL_COMPLIANCE.md');
const OUT = join(ROOT, 'data', 'legal', 'legal-texts.json');
const EFFECTIVE_DATE = '2026-10-16';

const fail = (msg) => { console.error(`extract-legal: ${msg}`); process.exit(1); };

if (!existsSync(SRC)) fail(`missing ${SRC} — run from the repository root`);

const raw = readFileSync(SRC, 'utf8');
const lines = raw.split(/\r?\n/);

const BEGIN = /^\s*<!--\s*LEGAL:BEGIN\s+([^>]*?)\s*-->\s*$/;
const END = /^\s*<!--\s*LEGAL:END\s+([^>]*?)\s*-->\s*$/;

const parseAttrs = (s) => {
  const attrs = {};
  for (const m of s.matchAll(/([A-Za-z_][\w-]*)="([^"]*)"/g)) attrs[m[1]] = m[2];
  return attrs;
};

const blocks = [];
let current = null;
let beginLine = 0;
let inFence = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; } // ignore any example markers inside code fences
  if (inFence) continue;
  const b = line.match(BEGIN);
  if (b) {
    if (current) fail(`unbalanced blocks: BEGIN at line ${i + 1} while a block (id="${current.id}") opened at line ${beginLine} was still open`);
    const attrs = parseAttrs(b[1]);
    if (!attrs.id) fail(`BEGIN without id at line ${i + 1}`);
    current = { id: attrs.id, version: attrs.version || '1.0', lang: attrs.lang || 'he', placement: attrs.placement || '', body: [] };
    beginLine = i + 1;
    continue;
  }
  const e = line.match(END);
  if (e) {
    if (!current) fail(`END without a matching BEGIN at line ${i + 1}`);
    const attrs = parseAttrs(e[1]);
    if (!attrs.id) fail(`END without id at line ${i + 1}`);
    if (attrs.id !== current.id) fail(`END id "${attrs.id}" (line ${i + 1}) does not match BEGIN id "${current.id}" (line ${beginLine})`);
    blocks.push(current);
    current = null;
    continue;
  }
  if (current) current.body.push(line);
}

if (current) fail(`unbalanced blocks: BEGIN id="${current.id}" at line ${beginLine} has no END`);

if (!blocks.length) fail('no LEGAL blocks found');

// duplicate ids
const seen = new Map();
for (const blk of blocks) {
  if (seen.has(blk.id)) fail(`duplicate id "${blk.id}" (first at block #${seen.get(blk.id) + 1})`);
  seen.set(blk.id, blocks.indexOf(blk));
}

const texts = blocks.map((blk) => {
  const markdown = blk.body.join('\n').replace(/^\n+/, '').replace(/\s+$/, '');
  if (!markdown) fail(`block id="${blk.id}" has an empty body`);
  return {
    id: blk.id,
    version: blk.version,
    lang: blk.lang,
    placement: blk.placement,
    markdown,
    effective_date: EFFECTIVE_DATE,
  };
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(texts, null, 2) + '\n', 'utf8');

const byPlacement = texts.reduce((acc, t) => { acc[t.placement || '(none)'] = (acc[t.placement || '(none)'] || 0) + 1; return acc; }, {});
console.log(`extract-legal: wrote ${texts.length} legal text(s) → ${OUT.replace(ROOT + '/', '')}`);
console.log(`ids: ${texts.map((t) => t.id).join(', ')}`);
console.log(`by placement: ${JSON.stringify(byPlacement)}`);
console.log('balanced BEGIN/END: ok · no duplicate ids · no empty bodies');
