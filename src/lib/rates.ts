// Typed loader for statutory rates (data/rates/<year>.json). Pure, no React, usable on server and client.
import { RATES_BY_YEAR } from '@/generated/rates-index';

export interface Bracket {
  id: string;
  from_annual: number | null;
  to_annual: number | null;
  rate: number;
  effective_from: string;
  legal_basis: string;
  source_id: string;
  accessed_on: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RatesFile {
  tax_year: number;
  currency: 'ILS';
  income_tax_brackets: Bracket[];
  credit_point_value_annual: number;
  vat: { standard_rate: number; osek_patur_ceiling_annual: number };
  national_insurance: {
    monthly_ceiling: number;
    reduced_rate_ceiling: number;
    employee_rate: { reduced: number; full: number };
    employer_rate: { reduced: number; full: number };
    min_income: number;
  };
  surtax: {
    regular_income: { rate: number; threshold_annual: number };
    capital_income: { rate: number; threshold_annual: number };
  };
  keren_hishtalmut: {
    employer_contribution_rate: number;
    employee_contribution_rate: number;
    annual_contribution_ceiling: number;
    tax_exempt_ceiling: number;
    effective_from: string;
    confidence: string;
  };
  pension: {
    employee_contribution_rate: number;
    employer_contribution_rate: number;
    self_employed_min_deposit: number;
    tax_credit_rate: number;
    tax_deduction_rate: number;
    effective_from: string;
    confidence: string;
  };
}

export const AVAILABLE_YEARS = Object.keys(RATES_BY_YEAR).map(Number).sort((a, b) => a - b);

/** Select the rates file for a date: newest year <= date's year, else the earliest available. */
export function getRates(date: Date = new Date()): RatesFile {
  const y = date.getFullYear();
  const eligible = AVAILABLE_YEARS.filter((x) => x <= y);
  const year = eligible.length ? eligible[eligible.length - 1] : AVAILABLE_YEARS[0];
  return RATES_BY_YEAR[year];
}

export function getRatesForYear(year: number): RatesFile | undefined {
  return RATES_BY_YEAR[year];
}

/** Source ids referenced by the statutory rates, for "sources" stamps. */
export function ratesSourceIds(r: RatesFile): string[] {
  return Array.from(new Set(r.income_tax_brackets.map((b) => b.source_id)));
}
