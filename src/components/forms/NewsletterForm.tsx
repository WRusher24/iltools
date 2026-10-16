'use client';
import { useId, useState, type ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';

type State = { status: 'idle' | 'loading' | 'ok' | 'error'; message?: string; fieldErrors?: Record<string, string> };

export function NewsletterForm({ termsNode, labels }: { termsNode: ReactNode; labels: Record<'title' | 'email' | 'submit' | 'consent' | 'ok' | 'sending' | 'errorGeneric', string> }) {
  const id = useId();
  const [state, setState] = useState<State>({ status: 'idle' });
  const [consent, setConsent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-il-csrf': '1' },
        body: JSON.stringify({ email: fd.get('email'), consent, website: fd.get('website'), turnstile: fd.get('cf-turnstile-response') ?? undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string> };
      if (res.ok && data.ok) {
        setState({ status: 'ok', message: labels.ok });
        trackEvent('newsletter_submit');
        form.reset();
        setConsent(false);
      } else setState({ status: 'error', message: data.error ?? labels.errorGeneric, fieldErrors: data.fields });
    } catch {
      setState({ status: 'error', message: labels.errorGeneric });
    }
  }

  const emailErr = state.fieldErrors?.email;
  const consentErr = state.fieldErrors?.consent;
  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby={`${id}-t`} className="grid gap-3" data-testid="newsletter-form">
      <h2 id={`${id}-t`} className="m-0 text-lg text-brand-ink">{labels.title}</h2>
      <div className="field">
        <label htmlFor={`${id}-e`}>{labels.email}</label>
        <input id={`${id}-e`} name="email" type="email" inputMode="email" autoComplete="email" required className="input text-start" dir="ltr" aria-invalid={!!emailErr} aria-describedby={emailErr ? `${id}-ee` : undefined} />
        {emailErr && <p id={`${id}-ee`} className="field-error">{emailErr}</p>}
      </div>
      {/* honeypot: hidden from people and assistive tech */}
      <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label>אל תמלאו שדה זה<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="flex items-start gap-2">
        <input id={`${id}-c`} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1.5 h-5 w-5 shrink-0" aria-describedby={`${id}-terms`} aria-invalid={!!consentErr} />
        <label htmlFor={`${id}-c`}>{labels.consent}</label>
      </div>
      {consentErr && <p className="field-error">{consentErr}</p>}
      <div id={`${id}-terms`} className="text-sm [&_a]:underline [&_p]:m-0">{termsNode}</div>
      <button type="submit" className="btn btn-cta" disabled={state.status === 'loading'}>
        {state.status === 'loading' ? labels.sending : labels.submit}
      </button>
      <p role="status" aria-live="polite" className={state.status === 'error' ? 'field-error' : 'text-sm'}>
        {state.message}
      </p>
    </form>
  );
}
