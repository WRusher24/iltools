import { GUIDE_CLUSTERS } from './content';

export interface Crumb { name: string; href?: string }

const HUBS: Record<string, { name: string; href: string }> = {
  compare: { name: 'השוואות', href: '/compare' },
  best: { name: 'הכי מתאים ל…', href: '/best' },
  reviews: { name: 'ביקורות', href: '/reviews' },
  guides: { name: 'מדריכים', href: '/guides' },
  articles: { name: 'מאמרים', href: '/articles' },
  calculators: { name: 'מחשבונים', href: '/calculators' },
  tools: { name: 'כלים', href: '/tools' },
  category: { name: 'קטגוריות', href: '/category' },
  lead: { name: 'השארת פנייה', href: '/' },
  legal: { name: 'מידע משפטי', href: '/legal/disclaimer' },
};

/** Visible Hebrew trail; also feeds BreadcrumbList JSON-LD. Last crumb has no href. */
export function breadcrumbsFor(path: string, title: string): Crumb[] {
  const crumbs: Crumb[] = [{ name: 'דף הבית', href: '/' }];
  const segs = path.split('/').filter(Boolean);
  if (!segs.length) return crumbs.slice(0, 1);
  const hub = HUBS[segs[0]];
  if (hub && segs.length > 1) {
    crumbs.push({ name: hub.name, href: segs[0] === 'lead' ? undefined : hub.href });
    if (segs[0] === 'guides' && segs.length > 2) crumbs.push({ name: GUIDE_CLUSTERS[segs[1]] ?? segs[1], href: `/guides/${segs[1]}` });
  } else if (hub && segs.length === 1) {
    return [crumbs[0], { name: hub.name }];
  }
  crumbs.push({ name: title });
  return crumbs.filter((c, i, a) => !(c.href === undefined && i < a.length - 1 && segs[0] === 'lead'));
}
