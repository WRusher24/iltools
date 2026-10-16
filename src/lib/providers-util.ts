import { providerIndex, type Provider } from './data';
import { formatILS } from './format';

export interface PriceSummary { text: string; vatNote: string | null; sourceId: string | null; accessedOn: string | null; quoteOnly: boolean }

export function providerName(p: Provider): string {
  return p.name.he || p.name.en;
}

export function lowestMonthly(p: Provider): number | null {
  const prices = (p.pricing?.plans ?? [])
    .map((pl) => (typeof pl.price_monthly === 'number' ? pl.price_monthly : null))
    .filter((n): n is number => n !== null && n > 0);
  return prices.length ? Math.min(...prices) : null;
}

export function priceSummary(p: Provider): PriceSummary {
  const low = lowestMonthly(p);
  const quote = p.pricing?.pricing_model === 'quote_only' || low === null;
  const vat = p.pricing?.vat_included;
  return {
    text: low !== null ? `החל מ-${formatILS(low)} לחודש` : 'הצעת מחיר בלבד / לא פורסם מחיר',
    vatNote: low === null ? null : vat === false ? 'לפני מע״מ' : vat === true ? 'כולל מע״מ' : null,
    sourceId: (p.pricing?.source_id as string | undefined) ?? null,
    accessedOn: (p.pricing?.accessed_on as string | undefined) ?? null,
    quoteOnly: quote,
  };
}

/** Provider ids mentioned by a page slug, e.g. cardcom-vs-tranzila → [cardcom, tranzila]; green-invoice → [green_invoice]. */
export function providersFromSlug(slug: string): string[] {
  const idx = providerIndex();
  const parts = slug.split('-vs-').flatMap((s) => [s.replace(/-/g, '_')]);
  return parts.filter((x) => idx.has(x));
}
