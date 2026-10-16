'use client';
import Fuse from 'fuse.js';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface Doc { title: string; path: string; type: string; description: string; keywords: string }
const TYPE_HE: Record<string, string> = { compare: 'השוואה', best: 'הכי מתאים', review: 'ביקורת', guide: 'מדריך', article: 'מאמר', calculator: 'מחשבון/כלי', page: 'עמוד', category: 'קטגוריה', provider: 'ספק' };

export function SearchPageClient({ labels }: { labels: { search: string; empty: string; hint: string; loading: string; results: string } }) {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('q');
    if (p) setQ(p.slice(0, 80));
    fetch('/search-index.json').then((r) => r.json()).then(setDocs).catch(() => setDocs([]));
  }, []);

  const fuse = useMemo(() => (docs ? new Fuse(docs, { keys: [{ name: 'title', weight: 3 }, { name: 'keywords', weight: 2 }, { name: 'description', weight: 1 }], threshold: 0.35, ignoreLocation: true, minMatchCharLength: 2 }) : null), [docs]);
  const results = useMemo(() => (fuse && q.trim().length >= 2 ? fuse.search(q.trim()).slice(0, 25).map((r) => r.item) : []), [fuse, q]);

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="my-4 max-w-xl">
        <label htmlFor="search-q" className="mb-1 block font-semibold">{labels.search}</label>
        <input id="search-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} className="input" autoComplete="off" aria-describedby="search-hint" />
        <p id="search-hint" className="field-hint">{labels.hint}</p>
      </form>
      <p role="status" aria-live="polite" className="sr-only">{docs === null ? labels.loading : q.trim().length >= 2 ? `${results.length} ${labels.results}` : ''}</p>
      {docs === null && <p>{labels.loading}</p>}
      {docs !== null && q.trim().length >= 2 && results.length === 0 && <p className="card">{labels.empty}</p>}
      <ul className="m-0 grid list-none gap-3 p-0">
        {results.map((r) => (
          <li key={`${r.path}-${r.title}`} className="card">
            <span className="badge">{TYPE_HE[r.type] ?? r.type}</span>
            <h2 className="m-0 mt-1 text-lg"><Link className="text-brand underline" href={r.path}>{r.title}</Link></h2>
            <p className="m-0 text-sm text-muted">{r.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
