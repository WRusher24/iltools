import { allContent } from './content';
import { loadProvidersByCategory } from './data';
import { urlMapByPath } from './content';

export interface SearchDoc { title: string; path: string; type: string; description: string; keywords: string }

export function buildSearchIndex(): SearchDoc[] {
  const byPath = urlMapByPath();
  const docs: SearchDoc[] = allContent().map((c) => {
    const e = byPath.get(c.path);
    return {
      title: e?.title ?? c.fm.title,
      path: c.path,
      type: c.fm.type,
      description: e?.description ?? c.fm.description,
      keywords: [c.fm.primary_keyword, ...c.fm.secondary_keywords].join(' '),
    };
  });
  // providers → link to their review when one exists, else their category hub
  const seen = new Set<string>();
  for (const [file, list] of Object.entries(loadProvidersByCategory())) {
    for (const p of list) {
      const review = `/reviews/${p.id.replace(/_/g, '-')}`;
      const target = byPath.has(review) ? review : byPath.has(`/category/${file}`) ? `/category/${file}` : null;
      if (!target || seen.has(`${p.id}|${target}`)) continue;
      seen.add(`${p.id}|${target}`);
      docs.push({ title: p.name.he, path: target, type: 'provider', description: `${p.name.he} (${p.name.en})`, keywords: `${p.name.en} ${p.id.replace(/_/g, ' ')}` });
    }
  }
  return docs;
}
