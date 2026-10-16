#!/usr/bin/env node
// scripts/normalize-aff.mjs — canonicalise {{aff:}} / {{sponsored:}} tokens to the exact
// provider `id` used in /data/providers/*.json (underscored ids, e.g. green_invoice).
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

const providerIds = new Set();
const pdir = join(ROOT, 'data', 'providers');
for (const f of readdirSync(pdir).filter((f) => f.endsWith('.json'))) {
  for (const p of JSON.parse(readFileSync(join(pdir, f), 'utf8'))) if (p.id) providerIds.add(p.id);
}
const ALIAS = { 'hyp-ezcount': 'ezcount' };
const canon = (slug) => {
  if (providerIds.has(slug)) return slug;
  const u = slug.replace(/-/g, '_');
  if (providerIds.has(u)) return u;
  if (ALIAS[slug] && providerIds.has(ALIAS[slug])) return ALIAS[slug];
  return null;
};

let changed = 0;
const files = [...walk(join(ROOT, 'content')), ...walk(join(ROOT, 'docs'))].filter((f) => ['.mdx', '.md'].includes(extname(f)));
for (const f of files) {
  const raw = readFileSync(f, 'utf8');
  const next = raw.replace(/\{\{(aff|sponsored):([^}]+)\}\}/g, (m, kind, slug) => {
    const c = canon(slug.trim());
    if (c && c !== slug.trim()) { changed++; return `{{${kind}:${c}}}`; }
    return m;
  });
  if (next !== raw) writeFileSync(f, next);
}
console.log(`normalize-aff: rewrote ${changed} token(s) across content/docs.`);
