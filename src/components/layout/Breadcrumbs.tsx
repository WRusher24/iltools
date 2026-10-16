import Link from 'next/link';
import type { Crumb } from '@/lib/breadcrumbs';

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="פירורי לחם" className="mb-4 text-sm text-muted">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 p-0">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="inline-flex items-center gap-2">
              {c.href && !last ? <Link className="underline" href={c.href}>{c.name}</Link> : <span aria-current={last ? 'page' : undefined}>{c.name}</span>}
              {!last && <span aria-hidden className="inline-block rtl:rotate-180">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
