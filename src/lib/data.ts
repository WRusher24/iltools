// Server-side loaders for /data/** and /seo/** static files. Memoised; never touches a database.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const cache = new Map<string, unknown>();

export function readJson<T>(rel: string, fallback?: T): T {
  if (cache.has(rel)) return cache.get(rel) as T;
  const p = join(/*turbopackIgnore: true*/ ROOT, rel);
  if (!existsSync(p)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing data file: ${rel}`);
  }
  const v = JSON.parse(readFileSync(p, 'utf8')) as T;
  cache.set(rel, v);
  return v;
}

// ---------------------------------------------------------------- providers
export interface Provider {
  id: string;
  name: { he: string; en: string };
  category: string;
  website: string;
  legal_entity?: { he?: string; en?: string };
  licenses?: string[];
  pricing?: {
    vat_included?: boolean;
    pricing_model?: string;
    plans?: Array<Record<string, unknown>>;
    transaction_fees?: unknown;
    notes_he?: string;
    source_id?: string;
    accessed_on?: string;
    confidence?: string;
  } & Record<string, unknown>;
  features?: Record<string, unknown>;
  informational_only?: boolean;
  last_verified?: string;
  confidence?: string;
  notes?: string;
}

export function loadProvidersByCategory(): Record<string, Provider[]> {
  return cache.get('providers:byCat') as Record<string, Provider[]> ?? (() => {
    const dir = join(ROOT, 'data/providers');
    const out: Record<string, Provider[]> = {};
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      out[f.replace(/\.json$/, '')] = JSON.parse(readFileSync(join(dir, f), 'utf8')) as Provider[];
    }
    cache.set('providers:byCat', out);
    return out;
  })();
}

/** Flat provider index by id. Ids repeat across categories (e.g. clal, bank_leumi): first occurrence wins for display name/website. */
export function providerIndex(): Map<string, Provider> {
  const hit = cache.get('providers:index') as Map<string, Provider> | undefined;
  if (hit) return hit;
  const m = new Map<string, Provider>();
  for (const list of Object.values(loadProvidersByCategory())) for (const p of list) if (!m.has(p.id)) m.set(p.id, p);
  cache.set('providers:index', m);
  return m;
}

// ---------------------------------------------------------------- sources
export interface SourceRec { id: string; title: string; publisher?: string; url?: string; accessed_on?: string; language?: string }

export function sourceIndex(): Map<string, SourceRec> {
  const hit = cache.get('sources:index') as Map<string, SourceRec> | undefined;
  if (hit) return hit;
  const m = new Map<string, SourceRec>();
  const add = (rel: string) => {
    const v = readJson<unknown>(rel, []);
    const arr = Array.isArray(v) ? v : ((v as { sources?: SourceRec[] }).sources ?? []);
    for (const s of arr as SourceRec[]) m.set(s.id, s);
  };
  add('data/sources.json');
  const dir = join(ROOT, 'data/internal');
  if (existsSync(dir)) for (const f of readdirSync(dir).filter((x) => /^_sources_prov_.*\.json$/.test(x))) add(`data/internal/${f}`);
  cache.set('sources:index', m);
  return m;
}

// ---------------------------------------------------------------- affiliate config (private, may be empty)
export interface AffiliateProgram {
  provider_id: string;
  network?: string;
  destination_url?: string;
  params?: Record<string, string>;
  status?: 'active' | 'paused';
}
export function affiliatePrograms(): AffiliateProgram[] {
  const v = readJson<unknown>('data/internal/affiliate_programs.json', []);
  const arr = Array.isArray(v) ? v : ((v as { programs?: AffiliateProgram[] }).programs ?? []);
  return (arr as AffiliateProgram[]).filter((p) => p && typeof p.provider_id === 'string');
}

// ---------------------------------------------------------------- seo data
export interface UrlMapPage {
  slug: string; path: string; url: string; type: string; category?: string; title: string; description: string;
  primary_keyword: string; canonical: string; robots: string; schema_types: string[];
  og: { title: string; type: string; image: string }; updated: string;
}
export interface UrlMap { domain: string; pages: UrlMapPage[] }
export const urlMap = () => readJson<UrlMap>('seo/url-map.json');

export interface RedirectRule { source: string; destination: string; permanent: boolean; reason?: string }
export const redirectsFile = () => readJson<{ host_level: string[]; rules: RedirectRule[] }>('seo/redirects.json');

export interface InternalLinks {
  hubs: Record<string, { hub: string; spokes: Record<string, string[]> }>;
  [k: string]: unknown;
}
export const internalLinks = () => readJson<InternalLinks>('seo/internal-links.json');
