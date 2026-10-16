#!/usr/bin/env node
// RTL guard: fails on physical Tailwind utilities / CSS properties. The site must use logical properties only.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PHYSICAL_TW = /(?<![\w-])(?:-?(?:pl|pr|ml|mr)-(?:\d|\[|px)|(?:left|right)-(?:\d|\[|auto|full|px|1\/2)|text-(?:left|right)\b|border-(?:l|r)(?:-\d|\b(?=[\s"'`]))|rounded-(?:l|r|tl|tr|bl|br)(?:-|\b(?=[\s"'`]))|float-(?:left|right)|scroll-(?:ml|mr|pl|pr)-)/;
const PHYSICAL_CSS = /(?<![\w-])(?:margin-(?:left|right)|padding-(?:left|right)|border-(?:left|right)(?:-\w+)?|(?:left|right)\s*:|text-align\s*:\s*(?:left|right)|float\s*:\s*(?:left|right))/;
const bad = [];

function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (!['node_modules', '.next', 'fonts', 'assets'].includes(e)) walk(p); continue; }
    if (!/\.(tsx|ts|css)$/.test(p)) continue;
    const lines = readFileSync(p, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (/lint-logical-ok/.test(line)) return;
      if (p.endsWith('.css') ? PHYSICAL_CSS.test(line) : PHYSICAL_TW.test(line)) bad.push(`${p}:${i + 1}: ${line.trim().slice(0, 120)}`);
    });
  }
}
walk('src');
if (bad.length) { console.error(`Physical (non-logical) CSS found — use ps/pe/ms/me/start/end/text-start:\n${bad.join('\n')}`); process.exit(1); }
console.log('logical-css lint: OK');
