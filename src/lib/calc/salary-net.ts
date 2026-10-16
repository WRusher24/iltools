// K6 - employee net salary. Derived from data/rates.
import type { RatesFile } from '../rates';
import { checkNum, done, lowConfidenceWarning, MONTHS_PER_YEAR, num0, pct, round2, type Validation } from './common';
import { incomeTaxAfterCredits, niMonthly, type BracketLine } from './tax';

export interface Inputs {
  gross_monthly: number;
  car_value_monthly: number;
  credit_points: number;
  /** employee pension contribution, percent of gross */
  pension_pct: number;
  /** employee keren hishtalmut contribution, percent of gross */
  hishtalmut_pct: number;
}

export const INPUT_DEFAULTS: Inputs = { gross_monthly: NaN, car_value_monthly: 0, credit_points: 2.25, pension_pct: 0, hishtalmut_pct: 0 };

/** Defaults pre-filled from the (low-confidence) published employee rates. */
export function makeDefaults(rates: RatesFile): Inputs {
  return {
    ...INPUT_DEFAULTS,
    pension_pct: round2(rates.pension.employee_contribution_rate * 100),
    hishtalmut_pct: round2(rates.keren_hishtalmut.employee_contribution_rate * 100),
  };
}

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'gross_monthly', { label: 'שכר ברוטו', required: true, min: 0 });
  checkNum(e, i, 'car_value_monthly', { label: 'שווי רכב', min: 0 });
  checkNum(e, i, 'credit_points', { label: 'נקודות זיכוי', required: true, min: 0, max: 100 });
  checkNum(e, i, 'pension_pct', { label: 'אחוז פנסיה', min: 0, max: 100 });
  checkNum(e, i, 'hishtalmut_pct', { label: 'אחוז קרן השתלמות', min: 0, max: 100 });
  return done(e);
}

export interface EmployeeCore {
  taxable_monthly: number;
  income_tax_annual: number;
  tax_before_credits: number;
  credits_value: number;
  surtax: number;
  lines: BracketLine[];
  ni_monthly: number;
  ni_reduced_part: number;
  ni_full_part: number;
  pension_monthly: number;
  hishtalmut_monthly: number;
  net_monthly: number;
}

export function employeeCore(p: Inputs, rates: RatesFile): EmployeeCore {
  const gross = num0(p.gross_monthly);
  const taxableM = gross + num0(p.car_value_monthly);
  const tax = incomeTaxAfterCredits(taxableM * MONTHS_PER_YEAR, num0(p.credit_points), rates);
  const ni = niMonthly(taxableM, rates, false);
  const pension = gross * pct(num0(p.pension_pct));
  const kh = gross * pct(num0(p.hishtalmut_pct));
  const net = gross - tax.income_tax / MONTHS_PER_YEAR - ni.total - pension - kh;
  return {
    taxable_monthly: taxableM,
    income_tax_annual: tax.income_tax,
    tax_before_credits: tax.tax_before_credits,
    credits_value: tax.credits_value,
    surtax: tax.surtax,
    lines: tax.lines,
    ni_monthly: ni.total,
    ni_reduced_part: ni.reduced_part,
    ni_full_part: ni.full_part,
    pension_monthly: pension,
    hishtalmut_monthly: kh,
    net_monthly: net,
  };
}

export interface Result {
  gross_monthly: number;
  taxable_monthly: number;
  income_tax_monthly: number;
  income_tax_annual: number;
  tax_by_bracket: BracketLine[];
  ni_combined_monthly: number;
  health_tax: null;
  pension_monthly: number;
  hishtalmut_monthly: number;
  net_monthly: number;
  net_annual: number;
  effective_rate: number | null;
  employer_pension_monthly: number | null;
  employer_hishtalmut_monthly: number | null;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const c = employeeCore(i, rates);
  const gross = num0(i.gross_monthly);
  const warnings: string[] = [];
  const lc = [lowConfidenceWarning(rates, 'pension'), lowConfidenceWarning(rates, 'keren_hishtalmut')].filter(Boolean) as string[];
  if (num0(i.pension_pct) > 0 || num0(i.hishtalmut_pct) > 0) warnings.push(...new Set(lc));
  if (num0(i.hishtalmut_pct) > 0 && c.hishtalmut_monthly * MONTHS_PER_YEAR > rates.keren_hishtalmut.annual_contribution_ceiling) {
    warnings.push('ההפקדה השנתית לקרן ההשתלמות עולה על התקרה שפורסמה.');
  }
  const assumptions = [
    'המס מחושב לפי מדרגות שנתיות (ברוטו חודשי כפול 12) ולאחר הפחתת שווי נקודות הזיכוי.',
    'ביטוח לאומי ומס בריאות מחושבים לפי שיעורי העובד שפורסמו (מופחת/מלא), כשורה משולבת אחת; מס בריאות נפרד אינו זמין בנתונים.',
    'הפקדות העובד לפנסיה ולקרן השתלמות מנוכות מהשכר לפי האחוזים שהוזנו; לא מחושבת הטבת מס בגין ההפקדות (אין בנתונים תקרות).',
    'שווי רכב מתווסף לבסיס המס והביטוח הלאומי ואינו נכלל בנטו במזומן.',
    'לא נכללים ניכויים נוספים (הלוואות, מזונות), זיכויים נוספים או תוספות שכר.',
  ];
  const eff = c.taxable_monthly > 0 ? (c.income_tax_annual / MONTHS_PER_YEAR + c.ni_monthly) / c.taxable_monthly : null;
  const showEmployer = num0(i.pension_pct) > 0;
  return {
    gross_monthly: round2(gross),
    taxable_monthly: round2(c.taxable_monthly),
    income_tax_monthly: round2(c.income_tax_annual / MONTHS_PER_YEAR),
    income_tax_annual: round2(c.income_tax_annual),
    tax_by_bracket: c.lines,
    ni_combined_monthly: round2(c.ni_monthly),
    health_tax: null,
    pension_monthly: round2(c.pension_monthly),
    hishtalmut_monthly: round2(c.hishtalmut_monthly),
    net_monthly: round2(c.net_monthly),
    net_annual: round2(c.net_monthly * MONTHS_PER_YEAR),
    effective_rate: eff === null ? null : Math.round(eff * 10000) / 10000,
    employer_pension_monthly: showEmployer ? round2(gross * rates.pension.employer_contribution_rate) : null,
    employer_hishtalmut_monthly: num0(i.hishtalmut_pct) > 0 ? round2(gross * rates.keren_hishtalmut.employer_contribution_rate) : null,
    assumptions,
    warnings,
  };
}
