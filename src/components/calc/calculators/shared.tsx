'use client';
import type { BracketLine } from '@/lib/calc';
import { formatILS, formatPct } from '@/lib/format';
import { Money, Pct, ResultTable } from '../primitives';

/** Tax-by-bracket data table (mandatory) plus a decorative stacked bar. */
export function BracketTable({ lines, caption = 'מס הכנסה לפי מדרגות (שנתי, לפני נקודות זיכוי)' }: { lines: BracketLine[]; caption?: string }) {
  const total = lines.reduce((s, l) => s + l.tax, 0);
  const active = lines.filter((l) => l.tax > 0);
  const label = active.length ? `התפלגות המס לפי מדרגות: ${active.map((l) => `${formatPct(l.rate)} — ${formatILS(l.tax)}`).join(', ')}` : 'אין מס לפי מדרגות';
  return (
    <div className="grid gap-3">
      {total > 0 ? (
        <div role="img" aria-label={label} className="flex h-4 w-full overflow-hidden rounded-full border border-line">
          {active.map((l, i) => (
            <span key={l.id} style={{ width: `${(l.tax / total) * 100}%`, background: `color-mix(in srgb, var(--color-brand) ${35 + i * 13}%, white)` }} />
          ))}
        </div>
      ) : null}
      <ResultTable
        caption={caption}
        columns={[{ header: 'מדרגה' }, { header: 'טווח הכנסה שנתי' }, { header: 'שיעור' }, { header: 'הכנסה במדרגה' }, { header: 'מס' }]}
        rows={lines.map((l, i) => [
          `מדרגה ${i + 1}`,
          <bdi key="r">
            {formatILS(l.from)} – {l.to === null ? 'ללא תקרה' : formatILS(l.to)}
          </bdi>,
          <Pct key="p" v={l.rate} />,
          <Money key="t" v={l.taxable} />,
          <Money key="x" v={l.tax} />,
        ])}
        footer={['סה״כ', '', '', '', <Money key="s" v={total} />]}
      />
    </div>
  );
}
