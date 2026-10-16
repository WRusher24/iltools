// Shared pure helpers for the calculators. No React/Next/DOM imports; deterministic; no I/O.
import type { RatesFile } from '../rates';

export type Errors = Record<string, string>;
export interface Validation {
  ok: boolean;
  errors: Errors;
}

export const LOW_CONFIDENCE_NOTE = 'לפי הנתונים שפורסמו; יש לאמת מול מקור רשמי';
export const NA_TEXT = 'לא זמין';

export function isNum(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}
/** Finite number or 0 (for optional numeric inputs that may be NaN/empty). */
export function num0(x: unknown): number {
  return isNum(x) ? x : 0;
}
/** Round a money value to 2 decimals (nearest agora), half away from zero. */
export function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const r = Math.round(Math.abs(n) * 100 + 1e-6) / 100;
  return n < 0 ? -r : r;
}
export function round2OrNull(n: number | null | undefined): number | null {
  return n == null || !Number.isFinite(n) ? null : round2(n);
}
export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export interface NumRule {
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
  /** strictly greater than */
  gt?: number;
}

/** Validate one numeric field; writes a Hebrew message into `errors[key]` when invalid. */
export function checkNum(errors: Errors, inputs: object, key: string, rule: NumRule): void {
  const v = (inputs as Record<string, unknown>)[key];
  const empty = v === undefined || v === null || (typeof v === 'number' && Number.isNaN(v));
  if (empty) {
    if (rule.required) errors[key] = 'שדה חובה';
    return;
  }
  if (!isNum(v)) {
    errors[key] = 'יש להזין מספר';
    return;
  }
  if (rule.gt !== undefined && !(v > rule.gt)) {
    errors[key] = `הערך חייב להיות גדול מ-${rule.gt}`;
    return;
  }
  if (rule.min !== undefined && v < rule.min) {
    errors[key] = rule.min === 0 ? 'הערך אינו יכול להיות שלילי' : `הערך חייב להיות לפחות ${rule.min}`;
    return;
  }
  if (rule.max !== undefined && v > rule.max) {
    errors[key] = `הערך חייב להיות לכל היותר ${rule.max}`;
    return;
  }
  if (rule.integer && !Number.isInteger(v)) errors[key] = 'יש להזין מספר שלם';
}

export function checkOneOf(errors: Errors, inputs: object, key: string, allowed: readonly string[]): void {
  const v = (inputs as Record<string, unknown>)[key];
  if (typeof v !== 'string' || !allowed.includes(v)) errors[key] = 'יש לבחור ערך מהרשימה';
}

export function done(errors: Errors): Validation {
  return { ok: Object.keys(errors).length === 0, errors };
}

/** Monotone non-decreasing f: find smallest x in [lo, hi] with f(x) >= target (bisection). null if f(hi) < target. */
export function solveMonotone(f: (x: number) => number, target: number, lo: number, hi: number): number | null {
  if (f(lo) >= target) return lo;
  if (f(hi) < target) return null;
  let a = lo;
  let b = hi;
  for (let i = 0; i < 80; i++) {
    const mid = (a + b) / 2;
    if (f(mid) >= target) b = mid;
    else a = mid;
  }
  return b;
}

export function lowConfidenceWarning(rates: RatesFile, section: 'pension' | 'keren_hishtalmut'): string | null {
  return rates[section].confidence === 'low' ? LOW_CONFIDENCE_NOTE : null;
}

/** Percent number (e.g. 4) to ratio (0.04). */
export const pct = (p: number): number => p / 100;

export const MONTHS_PER_YEAR = 12;
