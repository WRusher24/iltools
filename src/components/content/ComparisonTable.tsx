'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export interface CompRow {
  id: string;
  name: string;
  reviewHref?: string;
  priceFrom: number | null; // monthly, ILS
  priceText: string;
  vatNote: string | null;
  plans: number;
  features: Record<string, boolean | null>; // null = לא זמין
  source?: string;
  checked?: string;
  quoteOnly: boolean;
}

export interface FeatureCol { key: string; label: string }

const cell = (v: boolean | null | undefined) => (v === true ? '✓ כן' : v === false ? '✗ לא' : 'לא זמין');

/** Data-driven, sortable, use-case-filterable comparison. Sticky first column; card fallback below 640px. Never ranks or scores. */
export function ComparisonTable({ rows, featureCols, caption, allowPriceSort }: { rows: CompRow[]; featureCols: FeatureCol[]; caption: string; allowPriceSort: boolean }) {
  const [sort, setSort] = useState<'name' | 'price'>('name');
  const [filters, setFilters] = useState<string[]>([]);

  const shown = useMemo(() => {
    let r = rows.filter((row) => filters.every((f) => row.features[f] === true));
    r = [...r].sort((a, b) => {
      if (sort === 'price') {
        if (a.priceFrom === null && b.priceFrom === null) return a.name.localeCompare(b.name, 'he');
        if (a.priceFrom === null) return 1;
        if (b.priceFrom === null) return -1;
        return a.priceFrom - b.priceFrom;
      }
      return a.name.localeCompare(b.name, 'he');
    });
    return r;
  }, [rows, sort, filters]);

  const toggle = (k: string) => setFilters((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));

  return (
    <section aria-label={caption} className="my-6" data-testid="comparison-table">
      <div className="mb-3 flex flex-wrap items-center gap-3 no-print">
        <fieldset className="m-0 flex flex-wrap items-center gap-2 border-0 p-0">
          <legend className="sr-only">סינון לפי צורך</legend>
          <span className="font-semibold">סינון לפי צורך:</span>
          {featureCols.map((c) => (
            <button key={c.key} type="button" aria-pressed={filters.includes(c.key)} onClick={() => toggle(c.key)} className={`btn min-h-10 ${filters.includes(c.key) ? 'btn-primary' : 'btn-ghost'}`}>
              {c.label}
            </button>
          ))}
        </fieldset>
        <div className="field !grid-flow-col items-center gap-2">
          <label htmlFor="cmp-sort">מיון:</label>
          <select id="cmp-sort" className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value as 'name' | 'price')}>
            <option value="name">לפי שם (א״ב)</option>
            {allowPriceSort && <option value="price">לפי מחיר התחלתי</option>}
          </select>
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">{shown.length} ספקים מוצגים</p>
      {!shown.length && <p className="card">אין ספקים שמתאימים לסינון שנבחר.</p>}

      <div className="table-wrap hidden sm:block" tabIndex={0} role="region" aria-label={caption}>
        <table>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">ספק</th>
              <th scope="col">מחיר התחלתי לחודש</th>
              <th scope="col">מסלולים</th>
              {featureCols.map((c) => (<th scope="col" key={c.key}>{c.label}</th>))}
              <th scope="col">מקור ותאריך</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id}>
                <th scope="row" className="font-bold text-start">{r.reviewHref ? <Link href={r.reviewHref}>{r.name}</Link> : r.name}</th>
                <td><bdi>{r.priceText}</bdi>{r.vatNote ? <span className="block text-xs text-muted">{r.vatNote}</span> : null}</td>
                <td>{r.plans || 'לא זמין'}</td>
                {featureCols.map((c) => (<td key={c.key}>{cell(r.features[c.key])}</td>))}
                <td className="text-xs">{r.source ?? 'לא זמין'}{r.checked ? ` · ${r.checked}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="m-0 grid list-none gap-3 p-0 sm:hidden">
        {shown.map((r) => (
          <li key={r.id} className="card">
            <p className="m-0 text-lg font-bold">{r.reviewHref ? <Link href={r.reviewHref}>{r.name}</Link> : r.name}</p>
            <p className="m-0"><bdi>{r.priceText}</bdi>{r.vatNote ? ` (${r.vatNote})` : ''}</p>
            <dl className="m-0 mt-2 grid grid-cols-2 gap-x-3 text-sm">
              {featureCols.map((c) => (
                <div key={c.key} className="contents"><dt className="text-muted">{c.label}</dt><dd className="m-0">{cell(r.features[c.key])}</dd></div>
              ))}
            </dl>
            <p className="m-0 mt-2 text-xs text-muted">{r.source ?? 'לא זמין'}{r.checked ? ` · ${r.checked}` : ''}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
