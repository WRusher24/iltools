'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { formatDateHe } from '@/lib/format';
import { CALC_CLASS_BY_SLUG, disclaimerIdForSlug } from './classes';
import { DisclaimerModal } from './DisclaimerModal';
import { Notice } from './primitives';
import { S } from './strings';
import type { CalcContext, BaseResult } from './types';
import type { CalcState } from './useCalc';

export interface CalcShellProps<I extends object, R extends BaseResult> {
  slug: string;
  title: string;
  state: CalcState<I, R>;
  ctx: CalcContext;
  form: ReactNode;
  renderResult: (r: R) => ReactNode;
  /** plain-text summary used in the WhatsApp message */
  shareSummary?: (r: R) => string;
  /** shown above the form, e.g. a "client-side only" note */
  intro?: ReactNode;
}

export function CalcShell<I extends object, R extends BaseResult>({ slug, title, state, ctx, form, renderResult, shareSummary, intro }: CalcShellProps<I, R>) {
  const cls = CALC_CLASS_BY_SLUG[slug] ?? 'GENERIC';
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (copyTimer.current && clearTimeout(copyTimer.current)), []);

  const { status, result } = state;
  const errorList = Object.values(state.form.errors);

  const share = () => {
    const url = state.shareUrl();
    const summary = result && shareSummary ? shareSummary(result) : '';
    const text = `${title}${summary ? `: ${summary}` : ''}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };
  const copyLink = async () => {
    const url = state.shareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.insetInlineStart = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        return;
      }
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="grid gap-6" data-calc={slug} data-disclaimer-id={disclaimerIdForSlug(slug)}>
      <DisclaimerModal cls={cls} version={ctx.disclaimer.version} title={ctx.disclaimer.title} content={ctx.disclaimer.content} />

      <form
        className="card grid gap-4"
        noValidate
        aria-label={S.input}
        onSubmit={(e) => {
          e.preventDefault();
          state.attempt();
          resultRef.current?.focus();
        }}
      >
        <h2 className="m-0 text-xl">{S.input}</h2>
        {intro}
        {form}
        <div className="no-print flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary">
            {S.calculate}
          </button>
          <button type="button" className="btn btn-ghost" onClick={state.reset}>
            {S.reset}
          </button>
        </div>
      </form>

      <div
        ref={resultRef}
        tabIndex={-1}
        role="region"
        aria-label={S.output}
        aria-live="polite"
        aria-atomic="true"
        data-testid="calc-result"
        data-status={status}
        className="card grid gap-4"
      >
        <h2 className="m-0 text-xl">{S.output}</h2>
        {status === 'empty' ? <p className="m-0 text-muted">{S.emptyState}</p> : null}
        {status === 'error' ? (
          <div className="grid gap-2" role="alert">
            <p className="m-0 font-bold text-danger">{S.errorCalc}</p>
            {errorList.length > 0 ? (
              <ul className="m-0 ps-5">
                {Array.from(new Set(errorList)).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {status === 'success' && result ? (
          <>
            {renderResult(result)}
            {result.warnings.length > 0 ? (
              <section aria-label={S.warnings} className="grid gap-2">
                {result.warnings.map((w) => (
                  <Notice key={w} tone="warn">
                    {w}
                  </Notice>
                ))}
              </section>
            ) : null}
            {result.assumptions.length > 0 ? (
              <section aria-labelledby={`${slug}-assumptions`}>
                <h3 id={`${slug}-assumptions`} className="mb-2 mt-0 text-base">
                  {S.assumptions}
                </h3>
                <ul className="m-0 grid gap-1 ps-5 text-muted">
                  {result.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="no-print flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-ghost" onClick={share} disabled={status !== 'success'}>
          {S.whatsapp}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          {S.print} / {S.exportPdf}
        </button>
        <button type="button" className="btn btn-ghost" onClick={copyLink}>
          {S.copyLink}
        </button>
        <span role="status" aria-live="polite" className="text-muted">
          {copied ? S.copied : ''}
        </span>
      </div>

      <aside data-testid="calc-disclaimer-persistent" aria-label={ctx.disclaimer.title} className="rounded-lg border border-line bg-surface-2 p-3 text-sm" data-disclaimer-id={ctx.disclaimer.id}>
        {ctx.disclaimer.content}
      </aside>

      {ctx.resultCta ? <div className="no-print">{ctx.resultCta}</div> : null}

      <div className="text-sm text-muted">
        <p className="m-0">
          {S.lastUpdated} <bdi>{formatDateHe(ctx.ratesUpdated)}</bdi>
        </p>
        {ctx.sourceLinks.length > 0 ? (
          <div>
            <span>{S.sources}: </span>
            <ul className="m-0 inline list-none p-0">
              {ctx.sourceLinks.map((s, i) => (
                <li key={s.id} className="inline">
                  {i > 0 ? ' · ' : ''}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-teal underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
