import Link from 'next/link';
import type { Provider } from '@/lib/data';
import { providerIndex, sourceIndex } from '@/lib/data';
import { priceSummary, providerName } from '@/lib/providers-util';
import { formatDateHe } from '@/lib/format';
import { goHref, SponsorBadge } from './AffiliateBits';

export { goHref, SponsorBadge };

export function AffiliateLink({ id, page, slot, kind = 'שותף', label }: { id: string; page: string; slot: string; kind?: 'שותף' | 'ממומן'; label?: string }) {
  const p = providerIndex().get(id);
  if (!p) throw new Error(`Unresolved {{aff:${id}}} — provider not found in data/providers`);
  return (
    <>
      <a href={goHref(id, page, slot)} rel="sponsored nofollow noopener" target="_blank" data-provider={id} data-slot={slot} data-affiliate="true">
        {label ?? providerName(p)}
      </a>
      <SponsorBadge kind={kind} />
    </>
  );
}

/** Non-monetised plain mention (regulated pages: rule L-UI-07 forbids any affiliate/paid module). */
export function PlainProvider({ id }: { id: string }) {
  const p = providerIndex().get(id);
  if (!p) throw new Error(`Unresolved provider "${id}"`);
  return <span>{providerName(p)}</span>;
}

function PriceLine({ p }: { p: Provider }) {
  const s = priceSummary(p);
  const src = s.sourceId ? sourceIndex().get(s.sourceId) : undefined;
  return (
    <p className="text-sm text-muted">
      <bdi>{s.text}</bdi>
      {s.vatNote ? ` (${s.vatNote})` : ''}
      {s.accessedOn ? ` · נבדק ב-${formatDateHe(s.accessedOn)}` : ''}
      {src ? ` · מקור: ${src.title}` : ''}
    </p>
  );
}

/** AFF-1 — native top card. Methodology link + badge. No editorial score is shown (none is computed from data). */
export function TopPickCard({ providerId, page }: { providerId: string; page: string }) {
  const p = providerIndex().get(providerId);
  if (!p) return null;
  return (
    <section aria-label="ספק מוזכר בעמוד" data-slot="AFF-1" data-testid="top-pick-card" className="card my-6 border-2 border-brand">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 text-xl">
          {providerName(p)} <SponsorBadge />
        </h2>
      </div>
      <PriceLine p={p} />
      <p className="my-2 text-sm">
        המודול מסומן כקישור שותפים, נפרד מהדירוג המערכתי ואינו משנה אותו. <Link className="underline text-teal" href="/methodology">איך אנחנו מדרגים</Link>
      </p>
      <a className="btn btn-cta" href={goHref(providerId, page, 'AFF-1')} rel="sponsored nofollow noopener" target="_blank" data-provider={providerId} data-slot="AFF-1">
        בדקו מחיר עדכני באתר הספק
      </a>
    </section>
  );
}

/** AFF-2 — provider rows with CTA after a comparison table. */
export function ProviderRows({ ids, page }: { ids: string[]; page: string }) {
  const rows = ids.map((id) => providerIndex().get(id)).filter(Boolean) as Provider[];
  if (!rows.length) return null;
  return (
    <section aria-label="קישורים לספקים" data-slot="AFF-2" className="my-6 grid gap-3">
      {rows.map((p) => (
        <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="m-0 font-bold">{providerName(p)} <SponsorBadge /></p>
            <PriceLine p={p} />
          </div>
          <a className="btn btn-cta" href={goHref(p.id, page, 'AFF-2')} rel="sponsored nofollow noopener" target="_blank" data-provider={p.id} data-slot="AFF-2">
            בדקו באתר הספק
          </a>
        </div>
      ))}
    </section>
  );
}

/** Replaces AFF-1 on `regulated: true` pages (CONFLICTS_LOG #1, rule L-UI-07): non-affiliate, no paid content. */
export function RegulatedInfoModule() {
  return (
    <section aria-label="מידע נוסף" data-testid="regulated-info-module" className="card my-6 border-2 border-teal">
      <h2 className="m-0 text-xl">מידע נוסף ופנייה לבעל/ת מקצוע מורשה/ית</h2>
      <p className="my-2 text-sm">
        העמוד חינוכי בלבד ואינו כולל המלצה או קישורים מסחריים. הסבר על אופן הצגת המידע ב<Link className="underline text-teal" href="/methodology">שיטת הדירוג</Link>.
      </p>
      <Link className="btn btn-primary" href="/lead/pension-information">השארת פנייה לבעל/ת מקצוע מורשה/ית</Link>
    </section>
  );
}

export function LeadModule({ type, slot }: { type: 'accountant' | 'pension-information' | 'mortgage-information'; slot: 'LEAD-1' | 'LEAD-2' }) {
  const label = type === 'accountant' ? 'שיחה עם רו״ח' : type === 'pension-information' ? 'מידע מבעל/ת מקצוע מורשה/ית' : 'מידע בנושא משכנתא';
  return (
    <section aria-label={label} data-slot={slot} className="card my-6 bg-surface-2">
      <h2 className="m-0 text-lg">{label}</h2>
      <p className="my-2 text-sm">אפשר להשאיר פנייה. הפרטים יועברו רק בהסכמתכם ורק לבעל/ת מקצוע מורשה/ית; אם אין כרגע שותף מאומת תוצג רשימת המתנה.</p>
      <Link className="btn btn-primary" href={`/lead/${type}`}>לטופס הפנייה</Link>
    </section>
  );
}
