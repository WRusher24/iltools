import type { ReactNode } from 'react';

/** Two-column pros/cons block (stacks on mobile). Text-only: no scores, no ratings. */
export function ProsCons({ heading, pros, cons }: { heading: string; pros: ReactNode; cons: ReactNode }) {
  return (
    <section aria-label={heading} className="my-6">
      <h2>{heading}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card border-ok/40">
          <p className="m-0 mb-2 font-bold text-ok">יתרונות</p>
          <div className="prose-il">{pros}</div>
        </div>
        <div className="card border-danger/40">
          <p className="m-0 mb-2 font-bold text-danger">חסרונות</p>
          <div className="prose-il">{cons}</div>
        </div>
      </div>
    </section>
  );
}

/** Split the "**יתרונות** … **חסרונות** …" markdown that Agent 3 wrote into two bullet blocks. */
export function splitProsCons(md: string): { pros: string; cons: string } | null {
  const lines = md.split('\n');
  let mode: 'pros' | 'cons' | null = null;
  const acc = { pros: [] as string[], cons: [] as string[] };
  for (const l of lines) {
    const t = l.trim();
    if (/^\*\*יתרונות\*\*/.test(t)) { mode = 'pros'; continue; }
    if (/^\*\*חסרונות\*\*/.test(t)) { mode = 'cons'; continue; }
    if (/^##\s/.test(t)) continue;
    if (mode) acc[mode].push(l);
  }
  if (!acc.pros.join('').trim() || !acc.cons.join('').trim()) return null;
  return { pros: acc.pros.join('\n'), cons: acc.cons.join('\n') };
}
