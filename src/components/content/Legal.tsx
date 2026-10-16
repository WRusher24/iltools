import type { ReactNode } from 'react';
import { getLegal, hasLegal, substitute, OWNER_BLANK_KEYS, type LegalVars } from '@/lib/legal';
import { renderMarkdown } from '@/lib/markdown';
import { sourceIndex } from '@/lib/data';

/** Render a legal text verbatim from legal-texts.json (placeholders substituted, owner blanks marked). */
export function legalNode(id: string, vars?: LegalVars): ReactNode {
  const t = getLegal(id);
  return renderMarkdown(substitute(t.markdown, vars), { ownerBlankKeys: OWNER_BLANK_KEYS, components: LEGAL_COMPONENTS });
}

const LEGAL_COMPONENTS = {
  a: ({ href = '', children, ...rest }: { href?: string; children?: ReactNode }) => (
    <a href={href} {...(href.startsWith('http') ? { rel: 'noopener noreferrer', target: '_blank' } : {})} {...rest}>
      {children}
    </a>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="טבלה">
      <table>{children}</table>
    </div>
  ),
};

export function sourcesText(ids: string[]): string {
  const idx = sourceIndex();
  return ids.map((i) => idx.get(i)?.title).filter(Boolean).join(', ');
}

interface BlockProps { id: string; vars?: LegalVars; className?: string; role?: string; heading?: string; testId?: string }

/** A boxed legal text (note/strip/inline block). */
export function LegalBlock({ id, vars, className = '', role = 'note', heading, testId }: BlockProps) {
  if (!hasLegal(id)) return null;
  const t = getLegal(id);
  return (
    <aside
      role={role}
      data-legal-id={id}
      data-legal-version={t.version}
      data-testid={testId ?? `legal-${id}`}
      className={`legal-box prose-il rounded-lg border border-line bg-surface-2 px-4 py-3 text-[0.95rem] ${className}`}
    >
      {heading ? <p className="mb-1 font-bold text-brand">{heading}</p> : null}
      {legalNode(id, vars)}
    </aside>
  );
}

/** DISC-AFFILIATE-STRIP: under the header, above the fold, role=note, ≥13px, AA contrast (LEGAL_COMPLIANCE §2.7). */
export function AffiliateStrip() {
  if (!hasLegal('DISC-AFFILIATE-STRIP')) return null;
  return (
    <div role="note" data-legal-id="DISC-AFFILIATE-STRIP" data-testid="affiliate-strip" className="border-b border-[#e2b24a] bg-warn-soft">
      <div className="prose-il mx-auto max-w-[var(--content-max)] px-4 py-2 text-[0.9rem] leading-snug text-[#3b2a00] [&_p]:m-0 [&_a]:text-[#0b4f4a]">
        {legalNode('DISC-AFFILIATE-STRIP')}
      </div>
    </div>
  );
}
