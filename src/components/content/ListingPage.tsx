import Link from 'next/link';
import type { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from './JsonLd';
import { breadcrumbLd, itemListLd, webPageLd } from '@/lib/seo';
import type { Crumb } from '@/lib/breadcrumbs';
import { formatDateHe } from '@/lib/format';

export interface ListItem { path: string; title: string; description?: string; updated?: string; badge?: string }

/** Hub/index page (compare, best, reviews, guides, articles, calculators, tools, categories). Crawlable links, no thin content: every card has title + description. */
export function ListingPage({ path, h1, intro, crumbs, items, groups, children, metaTitle, metaDescription }: {
  path: string; h1: string; intro: string; crumbs: Crumb[]; items?: ListItem[]; groups?: { heading: string; items: ListItem[] }[]; children?: ReactNode; metaTitle: string; metaDescription: string;
}) {
  const all = items ?? groups?.flatMap((g) => g.items) ?? [];
  const card = (it: ListItem) => (
    <li key={it.path} className="card">
      <h3 className="m-0 text-lg"><Link className="text-brand underline" href={it.path}>{it.title}</Link></h3>
      {it.badge ? <span className="badge">{it.badge}</span> : null}
      {it.description ? <p className="my-2 text-sm text-muted">{it.description}</p> : null}
      {it.updated ? <p className="m-0 text-xs text-muted">עודכן: <time dateTime={it.updated}>{formatDateHe(it.updated)}</time></p> : null}
    </li>
  );
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 pt-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-extrabold md:text-4xl">{h1}</h1>
      <p className="prose-il my-3">{intro}</p>
      {children}
      {items && <ul className="m-0 mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">{items.map(card)}</ul>}
      {groups?.map((g) => (
        <section key={g.heading} className="mt-8" aria-label={g.heading}>
          <h2 className="text-2xl">{g.heading}</h2>
          <ul className="m-0 mt-3 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">{g.items.map(card)}</ul>
        </section>
      ))}
      <JsonLd data={[breadcrumbLd(crumbs), webPageLd({ path, title: metaTitle, description: metaDescription, collection: true }), itemListLd(all.map((i) => ({ name: i.title, path: i.path })))]} />
    </div>
  );
}
