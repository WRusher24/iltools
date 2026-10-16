import { loadProvidersByCategory, sourceIndex } from '@/lib/data';
import { priceSummary, providerName, lowestMonthly } from '@/lib/providers-util';
import { urlMapByPath } from '@/lib/content';
import { formatDateHe } from '@/lib/format';
import { ComparisonTable, type CompRow, type FeatureCol } from './ComparisonTable';

const FEATURES: FeatureCol[] = [
  { key: 'hebrew_support', label: 'תמיכה בעברית' },
  { key: 'allocation_number_integration', label: 'מספר הקצאה' },
  { key: 'api', label: 'API' },
  { key: 'app', label: 'אפליקציה' },
];

const DATA_FILE_BY_CATEGORY: Record<string, string> = {
  invoicing: 'invoicing',
  clearing: 'clearing',
  'business-banking': 'business-banking',
  crm: 'crm',
  accounting: 'accounting',
};

function featureValue(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    if (['yes', 'true', 'full', 'partial'].includes(s)) return true;
    if (['no', 'false', 'none'].includes(s)) return false;
  }
  return null;
}

/** Provider comparison for a category page — straight from /data/providers (no scores, no ranking). null for informational-only categories. */
export function CategoryComparison({ category }: { category: string }) {
  const file = DATA_FILE_BY_CATEGORY[category];
  if (!file) return null;
  const providers = loadProvidersByCategory()[file] ?? [];
  if (!providers.length || providers.every((p) => p.informational_only)) return null;
  const byPath = urlMapByPath();
  const rows: CompRow[] = providers.map((p) => {
    const s = priceSummary(p);
    const reviewPath = `/reviews/${p.id.replace(/_/g, '-')}`;
    const features: CompRow['features'] = {};
    for (const f of FEATURES) features[f.key] = featureValue((p.features ?? {})[f.key]);
    return {
      id: p.id,
      name: providerName(p),
      reviewHref: byPath.has(reviewPath) ? reviewPath : undefined,
      priceFrom: lowestMonthly(p),
      priceText: s.text,
      vatNote: s.vatNote,
      plans: p.pricing?.plans?.length ?? 0,
      features,
      source: s.sourceId ? sourceIndex().get(s.sourceId)?.title : undefined,
      checked: s.accessedOn ? formatDateHe(s.accessedOn) : undefined,
      quoteOnly: s.quoteOnly,
    };
  });
  const cols = FEATURES.filter((f) => rows.some((r) => r.features[f.key] !== null));
  return (
    <ComparisonTable
      rows={rows}
      featureCols={cols}
      caption="טבלת השוואת ספקים לפי הנתונים שפורסמו"
      allowPriceSort={rows.some((r) => r.priceFrom !== null)}
    />
  );
}
