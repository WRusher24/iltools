import Link from 'next/link';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactNode } from 'react';
import { slugToPath, urlMapByPath } from '@/lib/content';
import { providerIndex, sourceIndex } from '@/lib/data';
import { parseSourcesArg, scanTokens } from '@/lib/markdown';
import { providersFromSlug } from '@/lib/providers-util';
import { formatDateHe } from '@/lib/format';
import { AffiliateLink, PlainProvider, ProviderRows, RegulatedInfoModule, TopPickCard, LeadModule, SponsorBadge } from './Affiliate';
import { Chart, type ChartDef } from './Chart';
import { LegalBlock, sourcesText } from './Legal';
import { AdSlot } from '@/components/ads/AdSlot';
import type { AdId } from '@/config/ads';

export interface PageCtx {
  path: string;
  slug: string;
  type: string;
  category: string;
  regulated: boolean;
  updated: string;
  sources: string[];
  /** provider ids from {{aff:…}} tokens in the page body (document order) */
  affIds: string[];
}

export function buildPageCtx(fm: { slug: string; type: string; category: string; regulated: boolean; updated: string; sources: string[]; canonical: string }, body: string): PageCtx {
  const affIds: string[] = [];
  for (const t of scanTokens(body)) if ((t.kind === 'aff' || t.kind === 'sponsored') && !affIds.includes(t.arg)) affIds.push(t.arg);
  return { path: fm.canonical, slug: fm.slug, type: fm.type, category: fm.category, regulated: fm.regulated, updated: fm.updated, sources: fm.sources, affIds };
}

export function pageHasAffiliate(ctx: PageCtx, body: string): boolean {
  if (ctx.regulated) return false; // rule L-UI-07
  const toks = scanTokens(body);
  return toks.some((t) => t.kind === 'aff' || t.kind === 'sponsored' || (t.kind === 'slot' && t.arg.startsWith('AFF-')));
}

function SourceCitations({ ids }: { ids: string[] }) {
  const idx = sourceIndex();
  return (
    <span className="whitespace-nowrap text-[0.8em]">
      {ids.map((id, i) => {
        const s = idx.get(id);
        if (!s) throw new Error(`Unresolved source id "${id}"`);
        return (
          <span key={id}>
            {i > 0 ? ', ' : ''}
            {s.url ? (
              <a href={s.url} rel="noopener noreferrer" target="_blank" title={s.title} aria-label={`מקור${ids.length > 1 ? ` ${i + 1}` : ''}: ${s.title}`} className="text-teal underline">
                מקור{ids.length > 1 ? ` ${i + 1}` : ''}
              </a>
            ) : (
              <span title={s.title}>מקור</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function SourcesList({ ids }: { ids: string[] }) {
  const idx = sourceIndex();
  const list = ids.map((id) => {
    const s = idx.get(id);
    if (!s) throw new Error(`Unresolved source id "${id}"`);
    return s;
  });
  return (
    <aside aria-label="מקורות" data-testid="sources-list" className="my-4 rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm">
      <p className="m-0 mb-1 font-bold">מקורות</p>
      <ul className="m-0 list-disc ps-5">
        {list.map((s) => (
          <li key={s.id}>
            {s.url ? <a className="text-teal underline" href={s.url} rel="noopener noreferrer" target="_blank">{s.title}</a> : s.title}
            {s.publisher ? ` — ${s.publisher}` : ''}
            {s.accessed_on ? ` (נבדק ב-${formatDateHe(s.accessed_on)})` : ''}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function UpdatedStamp({ date, sourceIds }: { date: string; sourceIds: string[] }) {
  return (
    <div className="my-4" data-testid="updated-stamp">
      <p className="m-0 text-sm text-muted">
        עודכן לאחרונה: <time dateTime={date}>{formatDateHe(date)}</time>
      </p>
      <LegalBlock id="DISC-RATES-DATE" vars={{ updated: date, sources: sourcesText(sourceIds) }} className="mt-2" />
    </div>
  );
}

function loadChart(slug: string, id: string): ChartDef {
  const file = join(process.cwd(), 'content/articles', `${slug}.data.json`);
  if (!existsSync(file)) throw new Error(`Unresolved {{chart:${id}}} — missing content/articles/${slug}.data.json`);
  const data = JSON.parse(readFileSync(file, 'utf8')) as { charts: ChartDef[] };
  const def = data.charts.find((c) => c.id === id);
  if (!def) throw new Error(`Unresolved {{chart:${id}}} in ${slug}.data.json`);
  return def;
}

/** Which provider the AFF-1/AFF-2 modules show on this page. */
function pickProviders(ctx: PageCtx): string[] {
  const ids = ctx.affIds.filter((i) => providerIndex().has(i));
  return ids.length ? ids : providersFromSlug(ctx.slug);
}

function SlotToken({ ctx, arg }: { ctx: PageCtx; arg: string }): ReactNode {
  if (arg.startsWith('AD-')) return <AdSlot id={arg as AdId} />;
  switch (arg) {
    case 'AFF-1': {
      if (ctx.regulated) return <RegulatedInfoModule />; // CONFLICTS_LOG #1
      const [first] = pickProviders(ctx);
      return first ? <TopPickCard providerId={first} page={ctx.path} /> : null;
    }
    case 'AFF-2': {
      if (ctx.regulated) return null;
      return <ProviderRows ids={pickProviders(ctx).slice(0, 4)} page={ctx.path} />;
    }
    case 'AFF-3': // sticky mobile bar is mounted by the page layout, not in-flow
    case 'EXIT-LEAD':
    case 'CALC-RESULT-CTA': // placed by the calculator template (resultCta)
    case 'SPONSOR-BADGE':
      return arg === 'SPONSOR-BADGE' && !ctx.regulated ? <SponsorBadge kind="ממומן" /> : null;
    case 'LEAD-1':
    case 'LEAD-2':
      return <LeadModule type={ctx.category === 'pension' ? 'pension-information' : 'accountant'} slot={arg} />;
    default:
      throw new Error(`Unknown slot id "${arg}"`);
  }
}

export function buildComponents(ctx: PageCtx) {
  const links = slugToPath();
  const byPath = urlMapByPath();
  return {
    'il-marker': () => null, // DISC-PENSION marker: the page template renders the block once, at the top
    'il-token': (props: Record<string, string>) => {
      const kind = props['data-kind'];
      const arg = props['data-arg'];
      const block = props['data-block'] === 'true';
      switch (kind) {
        case 'slot':
          return <SlotToken ctx={ctx} arg={arg} />;
        case 'aff':
          return ctx.regulated ? <PlainProvider id={arg} /> : <AffiliateLink id={arg} page={ctx.path} slot="inline" />;
        case 'sponsored':
          return ctx.regulated ? <PlainProvider id={arg} /> : <AffiliateLink id={arg} page={ctx.path} slot="inline" kind="ממומן" />;
        case 'link':
        case 'calc': {
          const path = links.get(arg);
          if (!path) throw new Error(`Unresolved {{${kind}:${arg}}} in ${ctx.path}`);
          const page = byPath.get(path);
          return <Link href={path}>{page?.primary_keyword ?? arg}</Link>;
        }
        case 'chart':
          return <Chart def={loadChart(ctx.slug, arg)} />;
        case 'sources': {
          const ids = parseSourcesArg(arg);
          return block ? <SourcesList ids={ids} /> : <SourceCitations ids={ids} />;
        }
        case 'updated':
          return block ? <UpdatedStamp date={arg} sourceIds={ctx.sources} /> : <span>עודכן {formatDateHe(arg)}</span>;
        default:
          throw new Error(`Unknown token kind "${kind}"`);
      }
    },
    a: ({ href = '', children, ...rest }: { href?: string; children?: ReactNode }) => {
      if (href.startsWith('/')) return <Link href={href}>{children}</Link>;
      return (
        <a href={href} rel="noopener noreferrer" target="_blank" {...rest}>
          {children}
        </a>
      );
    },
    table: ({ children, ...p }: { children?: ReactNode; 'data-caption'?: string }) => (
      <div className="table-wrap" tabIndex={0} role="region" aria-label={p['data-caption'] || 'טבלה'}>
        <table>
          {p['data-caption'] ? <caption className="sr-only">{p['data-caption']}</caption> : null}
          {children}
        </table>
      </div>
    ),
    input: ({ type, checked }: { type?: string; checked?: boolean }) =>
      type === 'checkbox' ? (
        <>
          <span aria-hidden="true">{checked ? '☑' : '☐'}</span>
          <span className="sr-only">{checked ? 'הושלם: ' : 'טרם הושלם: '}</span>
        </>
      ) : null,
    th: ({ children, ...p }: { children?: ReactNode }) => (
      <th scope="col" {...p}>
        {children}
      </th>
    ),
  };
}
