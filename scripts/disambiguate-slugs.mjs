#!/usr/bin/env node
// scripts/disambiguate-slugs.mjs — make {{link:slug}} unambiguous where two route
// types shared a slug. Idempotent.
import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync, statSync } from 'node:fs';
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

const read = (p) => readFileSync(p, 'utf8');
const write = (p, s) => writeFileSync(p, s);

// 1) Guide: income-tax-advance-payments -> advance-payments-self-employed
const gOld = join(ROOT, 'content/guides/tax/income-tax-advance-payments.mdx');
const gNew = join(ROOT, 'content/guides/tax/advance-payments-self-employed.mdx');
if (existsSync(gOld)) {
  let t = read(gOld);
  t = t.replace(/^slug:\s*income-tax-advance-payments\s*$/m, 'slug: advance-payments-self-employed')
       .replace(/^canonical:\s*\/guides\/tax\/income-tax-advance-payments\s*$/m, 'canonical: /guides/tax/advance-payments-self-employed');
  write(gOld, t);
  renameSync(gOld, gNew);
  console.log('renamed guide -> advance-payments-self-employed.mdx');
}

// Fix the article's accidental self-link to point at the guide instead.
const aPath = join(ROOT, 'content/articles/income-tax-advance-payments.mdx');
if (existsSync(aPath)) {
  const t = read(aPath).replace(/\{\{link:income-tax-advance-payments\}\}/g, '{{link:advance-payments-self-employed}}');
  write(aPath, t);
}

const all = [...walk(join(ROOT, 'content')), ...walk(join(ROOT, 'docs'))].filter((f) => ['.mdx', '.md'].includes(extname(f)));

// 2) Calculator employee-vs-freelancer -> employee-vs-freelancer-calculator
const calcPath = join(ROOT, 'content/calculators/employee-vs-freelancer.mdx');
if (existsSync(calcPath)) {
  let t = read(calcPath);
  t = t.replace(/^slug:\s*employee-vs-freelancer\s*$/m, 'slug: employee-vs-freelancer-calculator')
       .replace(/^canonical:\s*\/calculators\/employee-vs-freelancer\s*$/m, 'canonical: /calculators/employee-vs-freelancer-calculator');
  write(calcPath, t);
}
for (const f of all) {
  const lines = read(f).split('\n').map((line) => {
    if (line.includes('השוואה')) return line;
    return line.replace(/\{\{link:employee-vs-freelancer\}\}/g, '{{link:employee-vs-freelancer-calculator}}');
  });
  write(f, lines.join('\n'));
}

// 3) Tool business-setup-cost -> business-setup-cost-calculator
const toolPath = join(ROOT, 'content/tools/business-setup-cost.mdx');
if (existsSync(toolPath)) {
  let t = read(toolPath);
  t = t.replace(/^slug:\s*business-setup-cost\s*$/m, 'slug: business-setup-cost-calculator')
       .replace(/^canonical:\s*\/tools\/business-setup-cost\s*$/m, 'canonical: /tools/business-setup-cost-calculator');
  write(toolPath, t);
}
for (const f of all) {
  const lines = read(f).split('\n').map((line) => {
    if (line.includes('מחשבון')) return line.replace(/\{\{link:business-setup-cost\}\}/g, '{{link:business-setup-cost-calculator}}');
    return line;
  });
  write(f, lines.join('\n'));
}

console.log('disambiguate-slugs: done');
