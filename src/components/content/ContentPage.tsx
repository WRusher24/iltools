import Link from 'next/link';
import type { ReactNode } from 'react';
import { type ContentItem, slugToPath, urlMapByPath } from '@/lib/content';
import { internalLinks } from '@/lib/data';
import { extractHeadings, renderMarkdown, scanTokens, splitSections } from '@/lib/markdown';
import { buildComponents, buildPageCtx, pageHasAffiliate, type PageCtx } from './Tokens';
import { AffiliateStrip, LegalBlock } from './Legal';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { breadcrumbsFor } from '@/lib/breadcrumbs';
import { JsonLd } from './JsonLd';
import { ProsCons, splitProsCons } from './ProsCons';
import { CategoryComparison } from './CategoryComparison';
import { AdSlot } from '@/components/ads/AdSlot';
import { LeadModule } from './Affiliate';
import { StickyAffiliateBar } from './StickyAffiliateBar';
import { articleLd, breadcrumbLd, extractFaq, faqLd, itemListLd, webPageLd, pageEntry, plainText } from '@/lib/seo';
import { providerIndex } from '@/lib/data';
import { providerName, providersFromSlug } from '@/lib/providers-util';
import { formatDateHe } from '@/lib/format';

const REVIEW_TYPES = new Set(['compare', 'best', 'review']);

export function relatedLinks(item: ContentItem): { path: string; title: string }[] {
  const byPath = urlMapByPath();
  const s2p = slugToPath();
  const fromMap = (internalLinks().links as Record<string, string[]>)[item.path];
  const paths = new Set<string>(fromMap ?? []);
  for (const slug of item.fm.related) {
    const p = s2p.get(slug);
    if (p) paths.add(p);
  }
  paths.delete(item.path);
  return [...paths].filter((p) => byPath.has(p)).map((p) => ({ path: p, title: byPath.get(p)!.title }));
}

function Toc({ md }: { md: string }) {
  const heads = extractHeadings(md).filter((h) => h.depth === 2);
  if (heads.length < 3) return null;
  return (
    <nav aria-label="תוכן העניינים" className="card text-sm">
      <p className="m-0 mb-2 font-bold">בעמוד זה</p>
      <ol className="m-0 grid list-none gap-1 p-0">
        {heads.map((h) => (
          <li key={h.id}><a className="text-teal underline" href={`#${h.id}`}>{h.text}</a></li>
        ))}
      </ol>
    </nav>
  );
}

export function RelatedBlock({ item }: { item: ContentItem }) {
  const links = relatedLinks(item);
  if (!links.length) return null;
  return (
    <nav aria-label="המשיכו משם" className="my-10 border-t border-line pt-6" data-testid="related-links">
      <h2 className="text-xl">המשיכו משם</h2>
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.path}><Link className="card block font-semibold text-teal underline" href={l.path}>{l.title}</Link></li>
        ))}
      </ul>
    </nav>
  );
}

function splitH1(md: string): { h1: string; rest: string } {
  const m = /^#\s+(.+?)\s*$/m.exec(md);
  if (!m) return { h1: '', rest: md };
  return { h1: m[1], rest: md.replace(m[0], '').replace(/^\s+/, '') };
}

export function pageSchema(item: ContentItem, ctx: PageCtx) {
  const entry = pageEntry(item.path);
  const crumbs = breadcrumbsFor(item.path, splitH1(item.body).h1 || item.fm.title);
  const types = new Set(entry?.schema_types ?? item.fm.schema_types);
  const s2p = slugToPath();
  const byPath = urlMapByPath();
  const linkTitle = (slug: string) => byPath.get(s2p.get(slug) ?? '')?.primary_keyword ?? slug;
  const data: (Record<string, unknown> | null)[] = [breadcrumbLd(crumbs)];
  const title = entry?.title ?? item.fm.title;
  const description = entry?.description ?? item.fm.description;
  const image = entry?.og.image ?? item.fm.og_image ?? '/api/og?type=page&slug=home';
  if (types.has('Article')) data.push(articleLd({ path: item.path, title, description, updated: item.fm.updated, keyword: item.fm.primary_keyword, image }));
  if (types.has('SoftwareApplication')) data.push(null); // handled by the calculator template
  if (types.has('WebPage') || types.has('CollectionPage')) data.push(webPageLd({ path: item.path, title, description, collection: types.has('CollectionPage') }));
  if (types.has('ItemList')) {
    const ids = ctx.affIds.length ? ctx.affIds : providersFromSlug(ctx.slug);
    const provItems = ids.filter((i) => providerIndex().has(i)).map((i) => ({ name: providerName(providerIndex().get(i)!), path: item.path }));
    const links = item.fm.type === 'category' ? relatedLinks(item).map((l) => ({ name: l.title, path: l.path })) : provItems;
    data.push(itemListLd(links));
  }
  data.push(faqLd(extractFaq(item.body, linkTitle)));
  return { data, crumbs };
}

interface Props { item: ContentItem; children?: ReactNode; after?: ReactNode }

/** Standard editorial page template: guides, articles, compare, best, reviews, categories, static pages. */
export function ContentPage({ item, after }: Props) {
  const { fm, body } = item;
  const ctx = buildPageCtx(fm, body);
  const hasPensionMarker = /<!--\s*DISC-PENSION\s*-->/.test(body);
  const regulated = fm.regulated || hasPensionMarker;
  const affiliate = pageHasAffiliate({ ...ctx, regulated }, body);
  const components = buildComponents({ ...ctx, regulated });
  const { data, crumbs } = pageSchema(item, ctx);
  const sections = splitSections(body);
  const [intro, ...rest] = sections;
  const { h1, rest: introRest } = splitH1(intro.md);
  const slots = new Set(fm.monetization_slots);
  const tokenSlots = new Set(scanTokens(body).filter((t) => t.kind === 'slot').map((t) => t.arg));
  const faqIdx = rest.findIndex((s) => s.heading === 'שאלות נפוצות');
  const midIdx = Math.floor(rest.length / 2);
  const showAd = (id: 'AD-1' | 'AD-3' | 'AD-4' | 'AD-5') => slots.has(id) && !tokenSlots.has(id);
  const type = fm.type;
  const showSidebarLead = slots.has('LEAD-1') && !tokenSlots.has('LEAD-1');
  const prosIdx = rest.findIndex((s) => s.heading === 'יתרונות וחסרונות');
  const isCategory = type === 'category';

  return (
    <>
      {affiliate && <AffiliateStrip />}
      <div className="mx-auto max-w-[var(--content-max)] px-4 pt-6">
        <Breadcrumbs items={crumbs} />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="min-w-0">
            <header>
              <p className="m-0 text-sm text-muted">
                עודכן לאחרונה: <time dateTime={fm.updated}>{formatDateHe(fm.updated)}</time>
                {fm.reading_time ? ` · זמן קריאה: ${fm.reading_time} דקות` : ''}
              </p>
              <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{h1 || fm.title}</h1>
              <div className="my-4 grid gap-3">
                {regulated && <LegalBlock id="DISC-PENSION" testId="disc-pension" />}
                {type === 'compare' && <LegalBlock id="DISC-COMPARE" testId="disc-compare" />}
                {REVIEW_TYPES.has(type) && <LegalBlock id="DISC-EDITORIAL-INDEPENDENCE" testId="disc-editorial" />}
              </div>
            </header>
            <div className="prose-il">{renderMarkdown(introRest, { components })}</div>
            {rest.map((s, i) => {
              const out: ReactNode[] = [];
              if (i === 1 && showAd('AD-1')) out.push(<AdSlot key="ad1" id="AD-1" />);
              if (i === 2 && showAd('AD-3')) out.push(<AdSlot key="ad3" id="AD-3" />);
              if (i === midIdx && midIdx > 2 && showAd('AD-4')) out.push(<AdSlot key="ad4" id="AD-4" />);
              if (i === faqIdx && showAd('AD-5')) out.push(<AdSlot key="ad5" id="AD-5" />);
              if (isCategory && s.heading === 'טבלת ספקים') {
                out.push(<div key={`s${i}`} className="prose-il">{renderMarkdown(s.md, { components })}<CategoryComparison category={fm.category} /></div>);
                return out;
              }
              if (i === prosIdx) {
                const pc = splitProsCons(s.md);
                if (pc) {
                  out.push(<div key={`s${i}`} className="prose-il"><ProsCons heading="יתרונות וחסרונות" pros={renderMarkdown(pc.pros, { components })} cons={renderMarkdown(pc.cons, { components })} /></div>);
                  return out;
                }
              }
              out.push(<div key={`s${i}`} className="prose-il">{renderMarkdown(s.md, { components })}</div>);
              return out;
            })}
            {isCategory && !rest.some((s) => s.heading === 'טבלת ספקים') && <CategoryComparison category={fm.category} />}
            {after}
            <RelatedBlock item={item} />
          </article>
          <aside className="hidden lg:block" aria-label="סרגל צד">
            <div className="grid gap-4">
              <Toc md={body} />
              {slots.has('AD-2') && <AdSlot id="AD-2" />}
              {showSidebarLead && <LeadModule type={fm.category === 'pension' ? 'pension-information' : 'accountant'} slot="LEAD-1" />}
            </div>
          </aside>
        </div>
      </div>
      {slots.has('AFF-3') && affiliate && ctx.affIds[0] && <StickyAffiliateBar providerId={ctx.affIds[0]} page={item.path} />}
      <JsonLd data={data} />
    </>
  );
}

export { plainText };
