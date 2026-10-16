'use client';
import { useId, useRef, useState, type ReactNode } from 'react';
import { LEAD_FORMS, type LeadType, type LeadField } from '@/lib/lead-schema';
import { trackEvent } from '@/lib/analytics';

type Values = Record<string, string>;
interface Props {
  type: LeadType;
  consentVersion: string;
  /** Rendered server-side from legal-texts.json (LEGAL-LEAD-TERMS / DISC-LEAD) — never retyped here. */
  leadTermsNode: ReactNode;
  discLeadNode: ReactNode;
  strings: { next: string; back: string; submit: string; sending: string; consent: string; consentHint: string; required: string; optional: string; ok: string; errorGeneric: string; stepOf: string; consentError: string; requiredError: string; waitlist: string };
}

export function LeadForm({ type, consentVersion, leadTermsNode, discLeadNode, strings }: Props) {
  const def = LEAD_FORMS[type];
  const id = useId();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false); // never pre-ticked
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'waitlist' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const last = step === def.steps.length - 1;

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    for (const f of def.steps[step].fields) {
      const v = (values[f.name] ?? '').trim();
      if (f.required && !v) errs[f.name] = strings.requiredError;
      else if (f.kind === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errs[f.name] = 'כתובת אימייל לא תקינה';
      else if (f.kind === 'tel' && v && !/^(?:\+?972|0)(?:[23489]|5\d|7\d)\d{7}$/.test(v.replace(/[\s-]/g, ''))) errs[f.name] = 'מספר טלפון לא תקין';
    }
    if (last && !consent) errs.consent = strings.consentError;
    setErrors(errs);
    if (Object.keys(errs).length) {
      const firstKey = Object.keys(errs)[0];
      requestAnimationFrame(() => document.getElementById(`${id}-${firstKey}`)?.focus());
    }
    return !Object.keys(errs).length;
  };

  const go = (d: 1 | -1) => {
    if (d === 1 && !validateStep()) return;
    setStep((s) => s + d);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!last) return go(1);
    if (!validateStep()) return;
    setState('sending');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-il-csrf': '1' },
        body: JSON.stringify({ type, ...values, consent, consentVersion, website: fd.get('website'), turnstile: fd.get('cf-turnstile-response') ?? undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; status?: string; error?: string; fields?: Record<string, string> };
      if (res.ok && data.ok) { setState('ok'); setMessage(strings.ok); trackEvent('lead_submit', { type }); }
      else if (data.status === 'waitlist') { setState('waitlist'); setMessage(data.error ?? strings.waitlist); }
      else { setState('error'); setMessage(data.error ?? strings.errorGeneric); setErrors(data.fields ?? {}); }
    } catch {
      setState('error'); setMessage(strings.errorGeneric);
    }
  }

  if (state === 'ok' || state === 'waitlist') {
    return <div role="status" aria-live="polite" className="card border-2 border-teal text-lg" data-testid="lead-result">{message}</div>;
  }

  const input = (f: LeadField) => {
    const fid = `${id}-${f.name}`;
    const err = errors[f.name];
    const common = { id: fid, name: f.name, value: values[f.name] ?? '', onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValues({ ...values, [f.name]: e.target.value }), 'aria-invalid': !!err, 'aria-describedby': [f.hint ? `${fid}-h` : '', err ? `${fid}-e` : ''].filter(Boolean).join(' ') || undefined, required: f.required, className: 'input' } as const;
    return (
      <div className="field" key={f.name}>
        <label htmlFor={fid}>{f.label} <span className="text-sm font-normal text-muted">({f.required ? strings.required : strings.optional})</span></label>
        {f.kind === 'select' ? (
          <select {...common}>
            <option value="">בחרו…</option>
            {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : f.kind === 'textarea' ? (
          <textarea {...common} rows={4} maxLength={1000} />
        ) : (
          <input {...common} type={f.kind} autoComplete={f.autoComplete} inputMode={f.kind === 'tel' ? 'tel' : undefined} dir={f.kind === 'text' ? undefined : 'ltr'} className="input text-start" />
        )}
        {f.hint && <p id={`${fid}-h`} className="field-hint">{f.hint}</p>}
        {err && <p id={`${fid}-e`} className="field-error" role="alert">{err}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={submit} noValidate aria-labelledby={`${id}-title`} className="card grid gap-4" data-testid="lead-form">
      <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1} className="m-0 text-xl">
        {def.steps[step].title}
        <span className="ms-2 text-sm font-normal text-muted">{strings.stepOf.replace('{n}', String(step + 1)).replace('{total}', String(def.steps.length))}</span>
      </h2>
      <progress className="w-full" max={def.steps.length} value={step + 1} aria-label={strings.stepOf.replace('{n}', String(step + 1)).replace('{total}', String(def.steps.length))} />
      {def.steps[step].fields.map(input)}
      {/* honeypot */}
      <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden"><label>אל תמלאו<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {last && (
        <>
          <div id={`${id}-disc`} className="text-sm">{discLeadNode}</div>
          <div className="flex items-start gap-2">
            <input id={`${id}-consent`} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1.5 h-5 w-5 shrink-0" aria-describedby={`${id}-terms ${id}-ch`} aria-invalid={!!errors.consent} />
            <label htmlFor={`${id}-consent`}>{strings.consent}</label>
          </div>
          <p id={`${id}-ch`} className="field-hint">{strings.consentHint}</p>
          <div id={`${id}-terms`} className="text-sm [&_a]:underline [&_p]:m-0">{leadTermsNode}</div>
          {errors.consent && <p className="field-error" role="alert" id={`${id}-consent-e`}>{errors.consent}</p>}
        </>
      )}
      <div className="flex flex-wrap gap-2">
        {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => go(-1)}>{strings.back}</button>}
        {last ? (
          <button type="submit" className="btn btn-cta" disabled={state === 'sending'}>{state === 'sending' ? strings.sending : strings.submit}</button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => go(1)}>{strings.next}</button>
        )}
      </div>
      <p role="status" aria-live="polite" className={state === 'error' ? 'field-error' : 'sr-only'}>{state === 'error' ? message : ''}</p>
    </form>
  );
}
