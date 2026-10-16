import { allContent, CATEGORY_LABELS, GUIDE_CLUSTERS, type ContentItem } from './content';
import { urlMapByPath } from './content';
import type { ListItem } from '@/components/content/ListingPage';

export function toItem(c: ContentItem): ListItem {
  const entry = urlMapByPath().get(c.path);
  return { path: c.path, title: entry?.title ?? c.fm.title, description: entry?.description ?? c.fm.description, updated: c.fm.updated };
}

export const byTitle = (a: ListItem, b: ListItem) => a.title.localeCompare(b.title, 'he');

export function itemsOf(prefix: string): ListItem[] {
  return allContent().filter((c) => c.path.startsWith(prefix)).map(toItem).sort(byTitle);
}

export function groupedBy(prefix: string, key: (c: ContentItem) => string, label: (k: string) => string) {
  const groups = new Map<string, ListItem[]>();
  for (const c of allContent().filter((x) => x.path.startsWith(prefix))) {
    const k = key(c);
    groups.set(k, [...(groups.get(k) ?? []), toItem(c)]);
  }
  return [...groups.entries()].map(([k, items]) => ({ heading: label(k), items: items.sort(byTitle) })).sort((a, b) => a.heading.localeCompare(b.heading, 'he'));
}

export { CATEGORY_LABELS, GUIDE_CLUSTERS };
