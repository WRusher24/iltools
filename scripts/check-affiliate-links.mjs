#!/usr/bin/env node
// pnpm affiliate:check — health-checks affiliate destinations (data/internal/affiliate_programs.json) and, if no program is
// configured, the providers' official websites referenced by {{aff:…}} tokens. Needs network; never fails the offline build.
import { readFileSync, readdirSync } from 'node:fs';

const programsRaw = JSON.parse(readFileSync('data/internal/affiliate_programs.json', 'utf8'));
const programs = Array.isArray(programsRaw) ? programsRaw : programsRaw.programs ?? [];
const providers = new Map();
for (const f of readdirSync('data/providers')) for (const p of JSON.parse(readFileSync(`data/providers/${f}`, 'utf8'))) if (!providers.has(p.id)) providers.set(p.id, p);

const targets = programs.length
  ? programs.filter((p) => p.destination_url).map((p) => ({ id: p.provider_id, url: p.destination_url, kind: 'affiliate' }))
  : [...providers.values()].filter((p) => p.website).map((p) => ({ id: p.id, url: p.website, kind: 'official-site' }));
if (!programs.length) console.log('affiliate_programs.json is empty → checking providers\' official websites instead.');

let failed = 0;
for (const t of targets) {
  try {
    const res = await fetch(t.url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'IL-Tools-link-check/1.0' } });
    const ok = res.status < 400 || res.status === 405 || res.status === 403;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${res.status} ${t.kind} ${t.id} ${t.url}`);
    if (!ok) failed++;
  } catch (e) {
    console.log(`FAIL ERR ${t.kind} ${t.id} ${t.url} (${e.name})`);
    failed++;
  }
}
console.log(`${targets.length - failed}/${targets.length} reachable`);
process.exit(process.argv.includes('--strict') && failed ? 1 : 0);
