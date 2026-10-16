// pnpm content:tokens — fails the build on any unresolved token / broken reference (blueprint §4.4).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { allContent, slugToPath } from '../src/lib/content';
import { providerIndex, sourceIndex, urlMap } from '../src/lib/data';
import { findUnknownTokens, parseSourcesArg, scanTokens } from '../src/lib/markdown';
import { hasLegal } from '../src/lib/legal';
import { NAV, FOOTER_LEGAL, FOOTER_SITE } from '../src/config/nav';

const errors: string[] = [];
const warns: string[] = [];
const SLOTS = new Set(['AFF-1', 'AFF-2', 'AFF-3', 'AD-1', 'AD-2', 'AD-3', 'AD-4', 'AD-5', 'LEAD-1', 'LEAD-2', 'CALC-RESULT-CTA', 'SPONSOR-BADGE', 'EXIT-LEAD']);
const slugs = slugToPath();
const providers = providerIndex();
const sources = sourceIndex();
const content = allContent();
const paths = new Set(content.map((c) => c.path));

for (const c of content) {
  const where = c.file;
  for (const u of findUnknownTokens(c.body)) errors.push(`${where}: unknown token ${u}`);
  for (const t of scanTokens(c.body)) {
    if (t.kind === 'slot' && !SLOTS.has(t.arg)) errors.push(`${where}: unknown slot ${t.arg}`);
    if ((t.kind === 'aff' || t.kind === 'sponsored') && !providers.has(t.arg)) errors.push(`${where}: {{${t.kind}:${t.arg}}} — provider not in data/providers`);
    if ((t.kind === 'link' || t.kind === 'calc') && !slugs.has(t.arg)) errors.push(`${where}: {{${t.kind}:${t.arg}}} — slug not in seo/url-map.json`);
    if (t.kind === 'sources') for (const id of parseSourcesArg(t.arg)) if (!sources.has(id)) errors.push(`${where}: source id ${id} not in registry`);
    if (t.kind === 'updated' && !/^\d{4}-\d{2}-\d{2}$/.test(t.arg)) errors.push(`${where}: bad {{updated:${t.arg}}}`);
    if (t.kind === 'chart') {
      const f = join(process.cwd(), 'content/articles', `${c.fm.slug}.data.json`);
      if (!existsSync(f)) errors.push(`${where}: {{chart:${t.arg}}} — missing ${c.fm.slug}.data.json`);
    }
  }
  for (const id of c.fm.sources) if (!sources.has(id)) errors.push(`${where}: frontmatter source ${id} not in registry`);
  const pension = /<!--\s*DISC-PENSION\s*-->/.test(c.body);
  if (c.fm.regulated && !pension) errors.push(`${where}: regulated page lacks <!-- DISC-PENSION --> marker`);
  if (pension && !c.fm.regulated) warns.push(`${where}: has DISC-PENSION marker but regulated:false (rendered as regulated)`);
  if (c.fm.regulated || pension) {
    const aff = scanTokens(c.body).filter((t) => t.kind === 'aff' || t.kind === 'sponsored' || (t.kind === 'slot' && t.arg.startsWith('AFF-')));
    if (aff.length) warns.push(`${where}: regulated page carries ${aff.map((a) => a.kind + ':' + a.arg).join(', ')} → rendered as non-affiliate (rule L-UI-07 / CONFLICTS_LOG #1)`);
  }
}

// url-map ↔ content 1:1
for (const p of urlMap().pages) if (!paths.has(p.path)) errors.push(`url-map page ${p.path} has no content file`);
for (const c of content) if (!urlMap().pages.some((p) => p.path === c.path)) errors.push(`${c.file}: ${c.path} missing from seo/url-map.json`);

// legal IDs the UI depends on
for (const id of ['DISC-GENERAL', 'DISC-FULL', 'DISC-PENSION', 'DISC-COMPARE', 'DISC-RATES-DATE', 'DISC-AFFILIATE-STRIP', 'DISC-AFFILIATE-FULL', 'DISC-ADSENSE', 'DISC-SPONSORED', 'DISC-LEAD', 'DISC-EDITORIAL-INDEPENDENCE', 'LEGAL-PRIVACY', 'LEGAL-TERMS', 'LEGAL-LEAD-TERMS', 'LEGAL-NEWSLETTER-TERMS', 'LEGAL-COOKIES', 'LEGAL-COOKIE-BANNER', 'LEGAL-ACCESSIBILITY', ...['TAX', 'VAT', 'PENSION', 'NI', 'CREDIT', 'CLEARING', 'PAYSLIP', 'REFUND', 'GENERIC'].map((k) => `DISC-CALC-${k}`)]) {
  if (!hasLegal(id)) errors.push(`legal text ${id} missing from data/legal/legal-texts.json`);
}

// navigation targets exist (static hubs are allowed)
const HUBS = new Set(['/compare', '/best', '/reviews', '/category', '/guides', '/articles', '/calculators', '/tools', '/search', '/sitemap-html', '/feed.xml', '/guides/setup', '/guides/tax', '/guides/pension', '/guides/banking', '/guides/ecommerce', '/guides/tools']);
const navLinks = [...NAV.flatMap((g) => [g.href, ...(g.items ?? []).map((i) => i.href)]), ...FOOTER_LEGAL.map((l) => l.href), ...FOOTER_SITE.map((l) => l.href)].filter(Boolean) as string[];
for (const h of navLinks) if (!paths.has(h) && !HUBS.has(h) && !h.startsWith('/legal/')) errors.push(`navigation link ${h} resolves to no page`);

console.log(`content:tokens — ${content.length} pages checked, ${warns.length} notes, ${errors.length} errors`);
for (const w of warns) console.log(`  note: ${w}`);
for (const e of errors) console.error(`  ERROR: ${e}`);
process.exit(errors.length ? 1 : 0);
