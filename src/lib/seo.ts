import type { Metadata } from 'next';
import { isProductionSite, siteUrl, SITE } from './site';
import { urlMap, type UrlMapPage } from './data';
import type { Crumb } from './breadcrumbs';

const BRAND_SUFFIX = ' | IL-Tools';

/** Title rule (ONPAGE_RULES §1): ≤60 chars; brand suffix only if the rendered <title> stays ≤60. */
export function renderTitle(title: string): string {
  if (/IL-Tools/.test(title)) return title;
  return title.length + BRAND_SUFFIX.length <= 60 ? `${title}${BRAND_SUFFIX}` : title;
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path === '/' ? '' : path}` || siteUrl();
}

export function pageEntry(path: string): UrlMapPage | undefined {
  return urlMap().pages.find((p) => p.path === path);
}

function robotsFor(directive: string, force?: string): Metadata['robots'] {
  const d = (force ?? directive).toLowerCase();
  const prod = isProductionSite();
  return {
    index: prod && !d.includes('noindex'),
    follow: !d.includes('nofollow'),
  };
}

export interface MetaOverride { title?: string; description?: string; robots?: string; path: string }

/** Metadata from seo/url-map.json (authoritative). Falls back to explicit override for hub pages not in the map. */
export function buildMetadata(o: MetaOverride): Metadata {
  const entry = pageEntry(o.path);
  const title = o.title ?? entry?.title ?? SITE.name;
  const description = o.description ?? entry?.description ?? SITE.tagline;
  const rendered = renderTitle(title);
  const url = absoluteUrl(entry?.canonical ?? o.path);
  const image = entry?.og.image ? `${siteUrl()}${entry.og.image}` : `${siteUrl()}/api/og?type=page&slug=home`;
  const ogTitle = entry?.og.title ?? `${title}${/IL-Tools/.test(title) ? '' : BRAND_SUFFIX}`;
  return {
    title: { absolute: rendered },
    description,
    alternates: { canonical: url, languages: { [SITE.hreflang]: url } },
    robots: robotsFor(entry?.robots ?? 'index, follow', o.robots),
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: entry?.og.type === 'article' ? 'article' : 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description, images: [image] },
  };
}

// ---------------------------------------------------------------- JSON-LD
type Json = Record<string, unknown>;
const ORG_ID = () => `${siteUrl()}/#organization`;

export function organizationLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID(),
    name: SITE.name,
    url: siteUrl(),
    logo: { '@type': 'ImageObject', url: `${siteUrl()}/icon.svg` },
    description: SITE.tagline,
  };
}

export function websiteLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl()}/#website`,
    name: SITE.name,
    url: siteUrl(),
    inLanguage: SITE.hreflang,
    publisher: { '@id': ORG_ID() },
    potentialAction: { '@type': 'SearchAction', target: `${siteUrl()}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
  };
}

export function breadcrumbLd(crumbs: Crumb[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href && i < crumbs.length - 1 ? { item: absoluteUrl(c.href) } : {}),
    })),
  };
}

export function articleLd(p: { path: string; title: string; description: string; updated: string; keyword: string; image: string }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${absoluteUrl(p.path)}#article`,
    headline: p.title,
    description: p.description,
    inLanguage: SITE.hreflang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(p.path) },
    datePublished: p.updated,
    dateModified: p.updated,
    author: { '@type': 'Organization', name: SITE.editorialAuthor, url: absoluteUrl('/about'), '@id': ORG_ID() },
    publisher: { '@id': ORG_ID() },
    image: [`${siteUrl()}${p.image}`],
    isAccessibleForFree: true,
    keywords: p.keyword,
  };
}

export function webAppLd(p: { path: string; title: string; description: string }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${absoluteUrl(p.path)}#software`,
    name: p.title,
    description: p.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    inLanguage: SITE.hreflang,
    url: absoluteUrl(p.path),
    isAccessibleForFree: true, // no `offers`: no published price, no ratings
  };
}

export function webPageLd(p: { path: string; title: string; description: string; collection?: boolean }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': p.collection ? 'CollectionPage' : 'WebPage',
    '@id': `${absoluteUrl(p.path)}#webpage`,
    name: p.title,
    description: p.description,
    url: absoluteUrl(p.path),
    inLanguage: SITE.hreflang,
    isPartOf: { '@id': `${siteUrl()}/#website` },
  };
}

export function itemListLd(items: { name: string; path: string }[]): Json | null {
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absoluteUrl(it.path) })),
  };
}

export function faqLd(faq: { q: string; a: string }[]): Json | null {
  if (!faq.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

/** Strip tokens/markdown from FAQ text so JSON-LD matches visible text. */
export function plainText(md: string, linkTitle: (slug: string) => string): string {
  return md
    .replace(/\{\{sources:[^}]*\}\}/g, '')
    .replace(/\{\{updated:[^}]*\}\}/g, '')
    .replace(/\{\{(?:link|calc):([^}]*)\}\}/g, (_m, s: string) => linkTitle(s.trim()))
    .replace(/\{\{(?:aff|sponsored):([^}]*)\}\}/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\s+\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parse the "שאלות נפוצות" section: `**question?**` followed by answer lines. */
export function extractFaq(body: string, linkTitle: (slug: string) => string): { q: string; a: string }[] {
  const m = /^##\s+שאלות נפוצות\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/m.exec(body);
  if (!m) return [];
  const out: { q: string; a: string }[] = [];
  let cur: { q: string; a: string[] } | null = null;
  for (const line of m[1].split('\n')) {
    const q = /^\*\*(.+?)\*\*\s*$/.exec(line.trim());
    if (q) {
      if (cur) out.push({ q: plainText(cur.q, linkTitle), a: plainText(cur.a.join(' '), linkTitle) });
      cur = { q: q[1], a: [] };
    } else if (cur && line.trim() && !/^\{\{/.test(line.trim())) cur.a.push(line.trim());
  }
  if (cur) out.push({ q: plainText(cur.q, linkTitle), a: plainText(cur.a.join(' '), linkTitle) });
  return out.filter((f) => f.q && f.a);
}
