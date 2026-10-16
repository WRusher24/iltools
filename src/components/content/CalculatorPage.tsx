import type { ReactNode } from 'react';
import { type ContentItem } from '@/lib/content';
import { slugToPath, urlMapByPath } from '@/lib/content';
import { loadProvidersByCategory, sourceIndex } from '@/lib/data';
import { getRates, ratesSourceIds } from '@/lib/rates';
import { renderMarkdown, splitSections, scanTokens } from '@/lib/markdown';
import { buildComponents, buildPageCtx } from './Tokens';
import { LegalBlock, legalNode } from './Legal';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { breadcrumbsFor } from '@/lib/breadcrumbs';
import { JsonLd } from './JsonLd';
import { RelatedBlock } from './ContentPage';
import { LeadModule } from './Affiliate';
import { AdSlot } from '@/components/ads/AdSlot';
import { CalcLoader } from '@/components/calc/CalcLoader';
import { CALC_CLASS_BY_SLUG, disclaimerIdForSlug } from '@/components/calc/classes';
import { breadcrumbLd, extractFaq, faqLd, webAppLd, pageEntry } from '@/lib/seo';
import { formatDateHe } from '@/lib/format';
import { getLegal } from '@/lib/legal';

/** Authoring scaffolding in the calculator MDX that must not be shown as page copy. */
const HIDDEN = new Set(['מיקרו-קופי לתוצאה', 'טקסט שיתוף לוואטסאפ', 'הצעות פעולה']);

function ctaVariants(body: string): string[] {
  const sec = splitSections(body).find((s) => s.heading === 'הצעות פעולה');
  if (!sec) return [];
  return [...sec.md.matchAll(/←\s*"([^"]+)"/g)].map((m) => m[1]);
}

function publicProviders() {
  const by = loadProvidersByCategory();
  const pick = (k: string) => (by[k] ?? []).map((p) => ({ id: p.id, name: p.name, category: p.category, website: p.website, pricing: p.pricing, features: p.features, informational_only: p.informational_only }));
  return { invoicing: pick('invoicing'), clearing: pick('clearing'), 'business-banking': pick('business-banking') } as Record<string, unknown[]>;
}

export function CalculatorPage({ item }: { item: ContentItem }) {
  const { fm, body } = item;
  const slug = fm.slug;
  const cls = CALC_CLASS_BY_SLUG[slug];
  const ctx = buildPageCtx(fm, body);
  const regulated = fm.regulated || /<!--\s*DISC-PENSION\s*-->/.test(body);
  const components = buildComponents({ ...ctx, regulated });
  const rates = getRates(new Date(`${fm.updated}T12:00:00Z`));
  const sourceIds = Array.from(new Set([...fm.sources, ...ratesSourceIds(rates)]));
  const idx = sourceIndex();
  const sourceLinks = sourceIds.map((id) => idx.get(id)).filter((s): s is NonNullable<typeof s> => !!s).map((s) => ({ id: s.id, title: s.title, url: s.url ?? '' }));
  const discId = disclaimerIdForSlug(slug);
  const sections = splitSections(body);
  const [intro, ...rest] = sections;
  const h1 = /^#\s+(.+?)\s*$/m.exec(intro.md)?.[1] ?? fm.title;
  const introBody = intro.md.replace(/^#\s+.+$/m, '').trim();
  const crumbs = breadcrumbsFor(item.path, h1);
  const entry = pageEntry(item.path);
  const s2p = slugToPath();
  const byPath = urlMapByPath();
  const linkTitle = (s: string) => byPath.get(s2p.get(s) ?? '')?.primary_keyword ?? s;
  const ctas = ctaVariants(body);
  const slots = new Set(fm.monetization_slots);
  const tokenSlots = new Set(scanTokens(body).filter((t) => t.kind === 'slot').map((t) => t.arg));

  const resultCta: ReactNode = ctas.length ? (
    <section aria-label="המשיכו" data-slot="CALC-RESULT-CTA" className="card mt-4 bg-surface-2">
      <ul className="m-0 grid list-none gap-1 p-0">
        {ctas.map((c) => (<li key={c} className="prose-il">{renderMarkdown(c, { components })}</li>))}
      </ul>
    </section>
  ) : null;

  return (
    <>
      <div className="mx-auto max-w-[var(--content-max)] px-4 pt-6">
        <Breadcrumbs items={crumbs} />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="min-w-0">
            <header>
              <p className="m-0 text-sm text-muted">עודכן לאחרונה: <time dateTime={fm.updated}>{formatDateHe(fm.updated)}</time></p>
              <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{h1}</h1>
              {regulated && <div className="my-4"><LegalBlock id="DISC-PENSION" testId="disc-pension" /></div>}
            </header>
            <div className="prose-il">{renderMarkdown(introBody, { components })}</div>
            <section aria-label="המחשבון" className="my-6" data-testid="calculator-region" data-calc-class={cls}>
              <CalcLoader
                slug={slug}
                rates={rates}
                providers={publicProviders()}
                disclaimer={{ id: discId, version: getLegal(discId).version, title: 'הסתייגות חשובה לפני השימוש', content: legalNode(discId, { updated: fm.updated }) }}
                ratesUpdated={fm.updated}
                sourceLinks={sourceLinks}
                resultCta={resultCta}
              />
            </section>
            {rest.filter((s) => !HIDDEN.has(s.heading ?? '')).map((s, i) => (
              <div key={s.heading ?? i}>
                {i === 1 && slots.has('AD-3') && !tokenSlots.has('AD-3') && <AdSlot id="AD-3" />}
                <div className="prose-il">{renderMarkdown(s.md, { components })}</div>
              </div>
            ))}
            <RelatedBlock item={item} />
          </article>
          <aside className="hidden lg:block" aria-label="סרגל צד">
            <div className="grid gap-4">
              {slots.has('LEAD-1') && <LeadModule type={fm.category === 'pension' ? 'pension-information' : 'accountant'} slot="LEAD-1" />}
            </div>
          </aside>
        </div>
      </div>
      <JsonLd data={[breadcrumbLd(crumbs), webAppLd({ path: item.path, title: entry?.title ?? fm.title, description: entry?.description ?? fm.description }), faqLd(extractFaq(body, linkTitle))]} />
    </>
  );
}
