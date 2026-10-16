'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Validation } from '@/lib/calc';
import { parseNum } from './parse';

export type Raw = Record<string, string | boolean>;

export interface FormApi {
  raw: Raw;
  set: (key: string, value: string | boolean) => void;
  blur: (key: string) => void;
  /** errors visible to the user (touched fields, or all after "calculate") */
  errors: Record<string, string>;
}

export type CalcStatus = 'empty' | 'error' | 'success';

export interface CalcState<I extends object, R> {
  form: FormApi;
  inputs: I;
  status: CalcStatus;
  result: R | null;
  allErrors: Record<string, string>;
  attempt: () => void;
  reset: () => void;
  /** current page URL including the query-string state (client only) */
  shareUrl: () => string;
}

function toRaw(defaults: object): Raw {
  const out: Raw = {};
  for (const [k, v] of Object.entries(defaults)) {
    out[k] = typeof v === 'number' ? (Number.isNaN(v) ? '' : String(v)) : typeof v === 'boolean' ? v : String(v ?? '');
  }
  return out;
}

function toInputs<I extends object>(defaults: I, raw: Raw): { inputs: I; parseErrors: Record<string, string> } {
  const inputs: Record<string, unknown> = {};
  const parseErrors: Record<string, string> = {};
  for (const [k, d] of Object.entries(defaults)) {
    const r = raw[k];
    if (typeof d === 'number') {
      const text = typeof r === 'string' ? r : '';
      const n = parseNum(text);
      inputs[k] = n;
      if (text.trim() !== '' && Number.isNaN(n)) parseErrors[k] = 'יש להזין מספר';
    } else if (typeof d === 'boolean') inputs[k] = r === true;
    else inputs[k] = typeof r === 'string' ? r : String(d ?? '');
  }
  return { inputs: inputs as I, parseErrors };
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function useCalc<I extends object, R>(opts: {
  defaults: I;
  validate: (i: I) => Validation;
  calculate: (i: I) => R;
  debounceMs?: number;
  /** false for sensitive tools (payslip): never read/write the query string */
  urlSync?: boolean;
  /** values applied on the very first render (e.g. a server-provided shared-link state) */
  initial?: Record<string, string>;
}): CalcState<I, R> {
  const { defaults, validate, calculate } = opts;
  const urlSync = opts.urlSync !== false;
  const defaultsRaw = useMemo(() => toRaw(defaults), [defaults]);
  const initialRaw = useMemo(() => {
    const next: Raw = { ...defaultsRaw };
    const t = new Set<string>();
    for (const [k, v] of Object.entries(opts.initial ?? {})) {
      if (!(k in next)) continue;
      next[k] = typeof defaultsRaw[k] === 'boolean' ? v === '1' || v === 'true' : v;
      t.add(k);
    }
    return { raw: next, touched: t };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [raw, setRaw] = useState<Raw>(initialRaw.raw);
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => initialRaw.touched);
  const [attempted, setAttempted] = useState(false);
  const [ready, setReady] = useState(false);
  const defaultsRef = useRef(defaultsRaw);
  useEffect(() => {
    defaultsRef.current = defaultsRaw;
  }, [defaultsRaw]);

  // Read the query string once after mount (the server render always uses defaults).
  useEffect(() => {
    if (!urlSync) {
      setReady(true);
      return;
    }
    try {
      const sp = new URLSearchParams(window.location.search);
      const next: Raw = { ...defaultsRef.current };
      const t = new Set<string>();
      for (const k of Object.keys(next)) {
        const v = sp.get(k);
        if (v === null) continue;
        next[k] = typeof defaultsRef.current[k] === 'boolean' ? v === '1' : v;
        t.add(k);
      }
      if (t.size > 0) {
        setRaw(next);
        setTouched(t);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [urlSync]);

  // Write state back with replaceState (never useSearchParams: that would force dynamic rendering).
  useEffect(() => {
    if (!ready || !urlSync) return;
    try {
      const url = new URL(window.location.href);
      for (const k of Object.keys(defaultsRaw)) {
        const v = raw[k];
        const d = defaultsRaw[k];
        if (v === d) url.searchParams.delete(k);
        else url.searchParams.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : v);
      }
      const next = url.pathname + url.search + url.hash;
      if (next !== window.location.pathname + window.location.search + window.location.hash) window.history.replaceState(window.history.state, '', next);
    } catch {
      /* ignore */
    }
  }, [raw, ready, defaultsRaw, urlSync]);

  const set = useCallback((key: string, value: string | boolean) => {
    setRaw((r) => ({ ...r, [key]: value }));
    setTouched((t) => (t.has(key) ? t : new Set(t).add(key)));
  }, []);
  const blur = useCallback((key: string) => setTouched((t) => (t.has(key) ? t : new Set(t).add(key))), []);

  const live = useMemo(() => {
    const { inputs, parseErrors } = toInputs(defaults, raw);
    return { inputs, errors: { ...validate(inputs).errors, ...parseErrors } };
  }, [defaults, raw, validate]);

  const dRaw = useDebounced(raw, opts.debounceMs ?? 300);
  const calc = useMemo(() => {
    const { inputs, parseErrors } = toInputs(defaults, dRaw);
    const errors = { ...validate(inputs).errors, ...parseErrors };
    const ok = Object.keys(errors).length === 0;
    let result: R | null = null;
    if (ok) {
      try {
        result = calculate(inputs);
      } catch {
        result = null;
      }
    }
    return { ok, result };
  }, [defaults, dRaw, validate, calculate]);

  const visibleErrors = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(live.errors)) if (attempted || touched.has(k)) out[k] = v;
    return out;
  }, [live.errors, touched, attempted]);

  const status: CalcStatus = calc.ok && calc.result !== null ? 'success' : touched.size === 0 && !attempted ? 'empty' : 'error';

  const reset = useCallback(() => {
    setRaw(defaultsRef.current);
    setTouched(new Set());
    setAttempted(false);
  }, []);
  const attempt = useCallback(() => setAttempted(true), []);
  const shareUrl = useCallback(() => (typeof window === 'undefined' ? '' : window.location.href), []);

  return {
    form: { raw, set, blur, errors: visibleErrors },
    inputs: live.inputs,
    status,
    result: status === 'success' ? calc.result : null,
    allErrors: live.errors,
    attempt,
    reset,
    shareUrl,
  };
}
