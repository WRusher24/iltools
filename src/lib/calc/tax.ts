// Statutory tax engine derived ONLY from the typed rates file. Pure.
import type { RatesFile } from '../rates';
import { round2 } from './common';

export interface BracketLine {
  id: string;
  rate: number;
  /** lower bound of the bracket (annual, ILS) */
  from: number;
  /** upper bound (annual, ILS); null = open ended */
  to: number | null;
  /** portion of taxable income that falls in this bracket */
  taxable: number;
  /** tax for this bracket (rounded 2dp) */
  tax: number;
}

/**
 * Bracket bounds. The file lists `from_annual` of the next bracket as `to_annual + 1`;
 * we treat brackets as contiguous: lower bound = previous bracket's `to_annual`.
 */
export function bracketBounds(rates: RatesFile): { id: string; rate: number; lower: number; upper: number | null }[] {
  const sorted = [...rates.income_tax_brackets].sort((a, b) => (a.from_annual ?? 0) - (b.from_annual ?? 0));
  return sorted.map((b, i) => ({
    id: b.id,
    rate: b.rate,
    lower: i === 0 ? 0 : (sorted[i - 1].to_annual ?? 0),
    upper: b.to_annual,
  }));
}

export interface BracketTax {
  total: number; // unrounded
  lines: BracketLine[];
}

export function incomeTaxByBrackets(taxableAnnual: number, rates: RatesFile): BracketTax {
  const t = Math.max(0, Number.isFinite(taxableAnnual) ? taxableAnnual : 0);
  let total = 0;
  const lines: BracketLine[] = [];
  for (const b of bracketBounds(rates)) {
    const top = b.upper === null ? t : Math.min(t, b.upper);
    const part = Math.max(0, top - b.lower);
    const tax = part * b.rate;
    total += tax;
    lines.push({ id: b.id, rate: b.rate, from: b.lower, to: b.upper, taxable: round2(part), tax: round2(tax) });
  }
  return { total, lines };
}

/** Surtax on regular income above the threshold in the rates file (unrounded). */
export function surtaxRegular(taxableAnnual: number, rates: RatesFile): number {
  const { rate, threshold_annual } = rates.surtax.regular_income;
  return Math.max(0, taxableAnnual - threshold_annual) * rate;
}

export function creditsValueAnnual(points: number, rates: RatesFile): number {
  return Math.max(0, Number.isFinite(points) ? points : 0) * rates.credit_point_value_annual;
}

export interface TaxResult {
  tax_before_credits: number; // bracket tax, unrounded
  credits_value: number;
  credits_applied: number;
  surtax: number;
  /** bracket tax minus credits (floor 0) plus surtax; unrounded */
  income_tax: number;
  lines: BracketLine[];
}

export function incomeTaxAfterCredits(taxableAnnual: number, creditPoints: number, rates: RatesFile, extraCreditsAnnual = 0): TaxResult {
  const br = incomeTaxByBrackets(taxableAnnual, rates);
  const credits = creditsValueAnnual(creditPoints, rates) + Math.max(0, extraCreditsAnnual);
  const applied = Math.min(credits, br.total);
  const surtax = surtaxRegular(taxableAnnual, rates);
  return {
    tax_before_credits: br.total,
    credits_value: credits,
    credits_applied: applied,
    surtax,
    income_tax: br.total - applied + surtax,
    lines: br.lines,
  };
}

export interface NiResult {
  base: number;
  reduced_part: number;
  full_part: number;
  total: number; // monthly, unrounded
}

/**
 * National insurance (as published for employees; combined NI + health as in the file).
 * `floorToMin`: self-employed proxy - income below `min_income` is charged as `min_income` (only when income > 0).
 */
export function niMonthly(monthlyIncome: number, rates: RatesFile, floorToMin = false): NiResult {
  const ni = rates.national_insurance;
  let base = Math.max(0, Number.isFinite(monthlyIncome) ? monthlyIncome : 0);
  if (floorToMin && base > 0) base = Math.max(base, ni.min_income);
  base = Math.min(base, ni.monthly_ceiling);
  const reduced_part = Math.min(base, ni.reduced_rate_ceiling) * ni.employee_rate.reduced;
  const full_part = Math.max(0, base - ni.reduced_rate_ceiling) * ni.employee_rate.full;
  return { base, reduced_part, full_part, total: reduced_part + full_part };
}
