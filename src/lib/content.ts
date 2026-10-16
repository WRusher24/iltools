// Content loader: reads /content/**/*.mdx (+ newsletter excluded), validates frontmatter with Zod,
// indexes pages by canonical path and slug. Server-only, memoised.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { urlMap, type UrlMapPage } from './data';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'content');

const isoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
);

export const frontmatterSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(155),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(['compare', 'best', 'review', 'guide', 'article', 'calculator', 'page', 'category', 'news']),
  category: z.string(),
  primary_keyword: z.string(),
  secondary_keywords: z.array(z.string()).default([]),
  search_intent: z.string().optional(),
  related: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
  updated: isoDate,
  author: z.string().default('il-tools-editorial'),
  monetization_slots: z.array(z.string()).default([]),
  regulated: z.boolean().default(false),
  word_count: z.number().optional(),
  reading_time: z.number().optional(),
  canonical: z.string().startsWith('/'),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_type: z.string().optional(),
  og_image: z.string().optional(),
  schema_types: z.array(z.string()).default([]),
  robots: z.string().default('index, follow'),
});
export type Frontmatter = z.infer<typeof frontmatterSchema>;

export interface ContentItem {
  fm: Frontmatter;
  body: string;
  file: string; // repo-relative
  path: string; // canonical route path
  /** group folder for guides: setup|tax|... */
  cluster?: string;
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.mdx')) out.push(p);
  }
  return out;
}

let _items: ContentItem[] | null = null;

export function allContent(): ContentItem[] {
  if (_items) return _items;
  const items: ContentItem[] = [];
  const errors: string[] = [];
  for (const abs of walk(CONTENT_DIR)) {
    const raw = readFileSync(abs, 'utf8');
    const parsed = matter(raw);
    const res = frontmatterSchema.safeParse(parsed.data);
    const rel = relative(ROOT, abs);
    if (!res.success) {
      errors.push(`${rel}: ${res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      continue;
    }
    const m = /content\/guides\/([^/]+)\//.exec(rel);
    items.push({ fm: res.data, body: parsed.content, file: rel, path: res.data.canonical, cluster: m?.[1] });
  }
  if (errors.length) throw new Error(`Frontmatter validation failed:\n${errors.join('\n')}`);
  _items = items;
  return items;
}

export const contentByPath = () => new Map(allContent().map((c) => [c.path, c]));

export function getContent(path: string): ContentItem | undefined {
  return contentByPath().get(path);
}

export function contentOfType(type: Frontmatter['type']): ContentItem[] {
  return allContent().filter((c) => c.fm.type === type);
}

/** Calculators vs tools share type "calculator"; route prefix tells them apart. */
export function calculators(): ContentItem[] {
  return allContent().filter((c) => c.path.startsWith('/calculators/'));
}
export function tools(): ContentItem[] {
  return allContent().filter((c) => c.path.startsWith('/tools/'));
}

/** slug (as used by {{link:slug}}) → page path, from the canonical SEO url-map. */
export function slugToPath(): Map<string, string> {
  return new Map(urlMap().pages.map((p) => [p.slug, p.path]));
}
export function pageBySlug(slug: string): UrlMapPage | undefined {
  return urlMap().pages.find((p) => p.slug === slug);
}
export function urlMapByPath(): Map<string, UrlMapPage> {
  return new Map(urlMap().pages.map((p) => [p.path, p]));
}

export const GUIDE_CLUSTERS: Record<string, string> = {
  setup: 'פתיחת עסק',
  tax: 'מיסים',
  pension: 'פנסיה וחיסכון',
  banking: 'בנקאות ואשראי',
  ecommerce: 'עסק אונליין',
  tools: 'כלים ופרודוקטיביות',
};

export const CATEGORY_LABELS: Record<string, string> = {
  invoicing: 'תוכנות חשבוניות',
  clearing: 'סליקת אשראי',
  'business-banking': 'בנקים לעסקים',
  'business-cards': 'כרטיסי אשראי עסקיים',
  pension: 'פנסיה וחיסכון',
  'keren-hishtalmut': 'קרן השתלמות',
  crm: 'מערכות CRM',
  accounting: 'הנהלת חשבונות',
  payroll: 'ניהול שכר',
  tax: 'מיסים',
  tools: 'כלים',
  banking: 'בנקאות',
  setup: 'פתיחת עסק',
  ecommerce: 'עסק אונליין',
  insurance: 'ביטוח',
  'business-finance': 'אשראי ומימון',
};
