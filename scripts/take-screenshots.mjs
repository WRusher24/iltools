#!/usr/bin/env node
// Captures compressed (JPEG) screenshots of key templates at mobile (360px) and desktop widths → docs/engineering/screenshots/.
// Usage: pnpm build && pnpm start (port 3100) then `node scripts/take-screenshots.mjs` (PW_CHROMIUM_PATH optional).
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const OUT = 'docs/engineering/screenshots';
mkdirSync(OUT, { recursive: true });
const pages = [
  ['home', '/'], ['compare', '/compare/green-invoice-vs-morning'], ['calculator', '/calculators/atzmai-net'], ['guide', '/guides/setup/open-osek-patur'],
  ['legal-privacy', '/legal/privacy'], ['lead', '/lead/accountant'], ['regulated-compare', '/compare/pension-vs-management-insurance'], ['article-chart', '/articles/accounting-document-types'],
];
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || undefined });
for (const [vp, size] of [['mobile', { width: 360, height: 740 }], ['desktop', { width: 1280, height: 800 }]]) {
  const ctx = await browser.newContext({ viewport: size, locale: 'he-IL', deviceScaleFactor: 1 });
  for (const [name, path] of pages) {
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/${name}-${vp}.jpg`, type: 'jpeg', quality: 55, fullPage: false });
    if (name === 'calculator') {
      await page.getByTestId('calc-disclaimer-modal').screenshot({ path: `${OUT}/calculator-disclaimer-modal-${vp}.jpg`, type: 'jpeg', quality: 60 }).catch(() => {});
    }
    await page.close();
  }
  await ctx.close();
}
const og = await (await fetch(`${BASE}/api/og?type=compare&slug=green-invoice-vs-morning`)).arrayBuffer();
const { writeFileSync } = await import('node:fs');
writeFileSync(`${OUT}/og-compare.png`, Buffer.from(og));
await browser.close();
console.log('screenshots written to', OUT);
