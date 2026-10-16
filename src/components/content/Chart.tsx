import { formatNumber } from '@/lib/format';
import { sourceIndex } from '@/lib/data';

export interface ChartPoint { label: string; value: number; value_display?: string }
export interface ChartSeries { name_he: string; data: ChartPoint[] }
export interface ChartDef {
  id: string; type: 'bar' | 'line' | 'stacked' | 'table'; title_he: string; x_label_he?: string; y_label_he?: string;
  unit?: string; series: ChartSeries[]; source_ids?: string[]; derived?: boolean; assumptions_he?: string;
}

const COLORS = ['#0b2545', '#0b6b65', '#9a4b00', '#6d28d9', '#b42318'];

function fmt(v: number, unit?: string) {
  const n = formatNumber(v);
  return unit ? `${n} ${unit}` : n;
}

function DataTable({ def }: { def: ChartDef }) {
  const labels = def.series[0]?.data.map((d) => d.label) ?? [];
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={`טבלת נתונים: ${def.title_he}`}>
      <table>
        <caption className="sr-only">{def.title_he}</caption>
        <thead>
          <tr>
            <th scope="col">{def.x_label_he ?? 'פריט'}</th>
            {def.series.map((s) => (
              <th scope="col" key={s.name_he}>{s.name_he}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l}>
              <th scope="row" className="font-normal text-start">{l}</th>
              {def.series.map((s) => (
                <td key={s.name_he}>
                  <bdi>{s.data[i]?.value_display ?? (s.data[i] ? fmt(s.data[i].value, def.unit) : 'לא זמין')}</bdi>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Accessible, RTL, data-driven chart: inline SVG + data-table fallback. First category sits at the right edge. */
export function Chart({ def }: { def: ChartDef }) {
  const sources = (def.source_ids ?? []).map((id) => sourceIndex().get(id)).filter(Boolean);
  const labels = def.series[0]?.data.map((d) => d.label) ?? [];
  const W = 640, H = 320, PL = 24, PR = 56, PT = 28, PB = 64;
  const all = def.series.flatMap((s) => s.data.map((d) => d.value));
  const stacked = def.type === 'stacked';
  const maxV = stacked
    ? Math.max(0, ...labels.map((_, i) => def.series.reduce((a, s) => a + Math.max(0, s.data[i]?.value ?? 0), 0)))
    : Math.max(0, ...all);
  const minV = Math.min(0, ...all);
  const span = maxV - minV || 1;
  const y = (v: number) => PT + (1 - (v - minV) / span) * (H - PT - PB);
  const innerW = W - PL - PR;
  const n = Math.max(labels.length, 1);
  const step = innerW / n;
  // RTL: index 0 at the right edge
  const cx = (i: number) => W - PR - step * (i + 0.5);
  const summary = `${def.title_he}. ${labels.map((l, i) => `${l}: ${def.series.map((s) => (s.data[i] ? fmt(s.data[i].value, def.unit) : 'לא זמין')).join(', ')}`).join('; ')}`;

  return (
    <figure className="my-6" data-chart-id={def.id}>
      <figcaption className="mb-2 font-semibold text-brand">
        {def.title_he}
        {def.derived ? <span className="badge ms-2">הדגמה</span> : null}
      </figcaption>
      {def.type !== 'table' && (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full max-w-2xl rounded-lg border border-line bg-surface" direction="rtl">
          <line x1={PL} x2={W - PR} y1={y(0)} y2={y(0)} stroke="#6b7280" strokeWidth="1" />
          {[0.25, 0.5, 0.75, 1].map((t) => {
            const v = minV + span * t;
            return (
              <g key={t}>
                <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} stroke="#e5e7eb" strokeWidth="1" />
                <text x={W - PR + 6} y={y(v) + 4} fontSize="11" fill="#4b5563" textAnchor="start">{formatNumber(Math.round(v * 100) / 100)}</text>
              </g>
            );
          })}
          {def.type === 'line' &&
            def.series.map((s, si) => (
              <g key={s.name_he}>
                <polyline fill="none" stroke={COLORS[si % COLORS.length]} strokeWidth="3" points={s.data.map((d, i) => `${cx(i)},${y(d.value)}`).join(' ')} />
                {s.data.map((d, i) => (
                  <circle key={d.label} cx={cx(i)} cy={y(d.value)} r="4" fill={COLORS[si % COLORS.length]} />
                ))}
              </g>
            ))}
          {(def.type === 'bar' || stacked) &&
            labels.map((l, i) => {
              const groupW = step * 0.7;
              const bw = stacked ? groupW : groupW / def.series.length;
              let acc = 0;
              return (
                <g key={l}>
                  {def.series.map((s, si) => {
                    const v = s.data[i]?.value ?? 0;
                    const x = stacked ? cx(i) - groupW / 2 : cx(i) + groupW / 2 - bw * (si + 1);
                    let rectY: number;
                    let hgt: number;
                    if (stacked) {
                      const pos = Math.max(v, 0);
                      rectY = y(acc + pos);
                      hgt = y(acc) - y(acc + pos);
                      acc += pos;
                    } else if (v >= 0) {
                      rectY = y(v);
                      hgt = y(0) - y(v);
                    } else {
                      rectY = y(0);
                      hgt = y(v) - y(0);
                    }
                    return (
                      <g key={s.name_he}>
                        <rect x={x} y={rectY} width={Math.max(bw - 2, 1)} height={Math.max(hgt, 1)} fill={COLORS[si % COLORS.length]} rx="3" />
                        {!stacked && (
                          <text x={x + (bw - 2) / 2} y={v < 0 ? rectY + hgt + 14 : rectY - 5} fontSize="11" textAnchor="middle" fill="#111827">
                            {formatNumber(v)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          {labels.map((l, i) => (
            <text key={l} x={cx(i)} y={H - PB + 18} fontSize="11.5" textAnchor="middle" fill="#111827">
              {l.length > 16 ? [l.slice(0, 16), l.slice(16, 32)].map((part, k) => <tspan key={k} x={cx(i)} dy={k ? 14 : 0}>{part}</tspan>) : l}
            </text>
          ))}
        </svg>
      )}
      {def.type !== 'table' && def.series.length > 1 && (
        <ul className="mt-2 flex flex-wrap gap-x-4 text-sm" aria-label="מקרא">
          {def.series.map((s, si) => (
            <li key={s.name_he} className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block h-3 w-3 rounded-sm" style={{ background: COLORS[si % COLORS.length] }} />
              {s.name_he}
            </li>
          ))}
        </ul>
      )}
      {def.type === 'table' ? (
        <DataTable def={def} />
      ) : (
        <details className="mt-2">
          <summary className="cursor-pointer text-teal underline">הצגת הנתונים בטבלה</summary>
          <DataTable def={def} />
        </details>
      )}
      {def.assumptions_he && <p className="mt-2 text-sm text-muted">{def.assumptions_he}</p>}
      {sources.length > 0 && (
        <p className="mt-1 text-sm text-muted">
          מקורות:{' '}
          {sources.map((s, i) => (
            <span key={s!.id}>
              {i > 0 && ', '}
              {s!.url ? <a className="underline" href={s!.url} rel="noopener noreferrer" target="_blank">{s!.title}</a> : s!.title}
            </span>
          ))}
        </p>
      )}
    </figure>
  );
}
