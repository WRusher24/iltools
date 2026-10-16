#!/usr/bin/env node
// Generates vercel.json from seo/redirects.json (+ static platform config). `--check` fails if the committed file is stale.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const redirects = JSON.parse(readFileSync('seo/redirects.json', 'utf8'));
const rules = redirects.rules
  .filter((r) => !r.destination.startsWith('/tax-year/') && r.source !== '/:path*/') // trailing-slash catch-all is handled by trailingSlash:false // deferred route: never redirect into a non-existent page
  .map((r) => ({ source: r.source, destination: r.destination, statusCode: r.permanent ? 301 : 302 }));

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  framework: 'nextjs',
  installCommand: 'pnpm install --frozen-lockfile',
  buildCommand: 'pnpm build',
  regions: ['fra1'],
  functions: { 'src/app/api/**/*.ts': { maxDuration: 15 }, 'src/app/go/**/*.ts': { maxDuration: 10 } },
  crons: [
    { path: '/api/cron/rates-freshness', schedule: '0 6 * * 1' },
    { path: '/api/cron/retention', schedule: '30 3 * * *' },
  ],
  redirects: [
    { source: '/:path*', has: [{ type: 'host', value: 'www.il-tools.co.il' }], destination: 'https://il-tools.co.il/:path*', statusCode: 301 },
    ...rules,
  ],
};

const out = `${JSON.stringify(config, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (!existsSync('vercel.json') || readFileSync('vercel.json', 'utf8') !== out) {
    console.error('vercel.json is out of date — run `node scripts/gen-vercel-json.mjs`');
    process.exit(1);
  }
  console.log('vercel.json is up to date');
} else {
  writeFileSync('vercel.json', out);
  console.log(`vercel.json written (${rules.length} redirect rules)`);
}
