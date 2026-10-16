// K8 - self-employed pension: deposit mechanisms illustration + balance projection (user-entered return/fee).
import type { RatesFile } from '../rates';
import { checkNum, done, LOW_CONFIDENCE_NOTE, num0, pct, round2, type Validation } from './common';
import { projectBalance, type ProjectionRow } from './projection';
import { incomeTaxByBrackets } from './tax';

export interface Inputs {
  annual_income: number;
  deposit_pct: number;
  years: number;
  annual_return_pct: number;
  annual_fee_pct: number;
  initial_balance: number;
}
export const INPUT_DEFAULTS: Inputs = { annual_income: NaN, deposit_pct: 0, years: NaN, annual_return_pct: NaN, annual_fee_pct: NaN, initial_balance: 0 };
export function makeDefaults(rates: RatesFile): Inputs {
  return { ...INPUT_DEFAULTS, deposit_pct: round2(rates.pension.self_employed_min_deposit * 100) };
}

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'annual_income', { label: 'הכנסה שנתית', required: true, min: 0 });
  checkNum(e, i, 'deposit_pct', { label: 'שיעור הפקדה', required: true, min: 0, max: 100 });
  checkNum(e, i, 'years', { label: 'שנות חיסכון', required: true, gt: 0, max: 80 });
  checkNum(e, i, 'annual_return_pct', { label: 'תשואה', required: true, min: -99, max: 100 });
  checkNum(e, i, 'annual_fee_pct', { label: 'דמי ניהול', required: true, min: 0, max: 100 });
  checkNum(e, i, 'initial_balance', { label: 'יתרה התחלתית', min: 0 });
  return done(e);
}

export interface Result {
  min_deposit_rate: number;
  deposit_annual: number;
  deposit_monthly: number;
  below_published_minimum: boolean;
  /** mechanism A: credit = credit_rate x deposit (no ceiling in data, so an upper illustration) */
  credit_rate: number;
  credit_amount: number;
  /** mechanism B: deduction = min(deposit, deduction_rate x income); saving = tax(income) - tax(income - deduction), before credit points */
  deduction_rate: number;
  deduction_amount: number;
  deduction_tax_saving: number;
  total_deposits: number;
  final_balance: number;
  growth: number;
  net_annual_pct: number;
  rows: ProjectionRow[];
  fee_benchmark: null;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const p = rates.pension;
  const income = num0(i.annual_income);
  const dep = income * pct(num0(i.deposit_pct));
  const ded = Math.min(dep, p.tax_deduction_rate * income);
  const saving = incomeTaxByBrackets(income, rates).total - incomeTaxByBrackets(Math.max(0, income - ded), rates).total;
  const proj = projectBalance({ initial: i.initial_balance, monthly_deposit: dep / 12, years: i.years, annual_return_pct: i.annual_return_pct, annual_fee_pct: i.annual_fee_pct });
  const warnings: string[] = [];
  if (p.confidence === 'low') warnings.push(LOW_CONFIDENCE_NOTE);
  if (pct(num0(i.deposit_pct)) < p.self_employed_min_deposit) warnings.push('שיעור ההפקדה נמוך מהשיעור המינימלי שפורסם לעצמאי.');
  return {
    min_deposit_rate: p.self_employed_min_deposit,
    deposit_annual: round2(dep),
    deposit_monthly: round2(dep / 12),
    below_published_minimum: pct(num0(i.deposit_pct)) < p.self_employed_min_deposit,
    credit_rate: p.tax_credit_rate,
    credit_amount: round2(dep * p.tax_credit_rate),
    deduction_rate: p.tax_deduction_rate,
    deduction_amount: round2(ded),
    deduction_tax_saving: round2(saving),
    total_deposits: proj.total_deposits,
    final_balance: proj.final_balance,
    growth: proj.growth,
    net_annual_pct: proj.net_annual_pct,
    rows: proj.rows,
    fee_benchmark: null,
    assumptions: [
      'עמוד חינוכי בלבד: אין המלצת מוצר, גוף או רמת הפקדה.',
      'שני מנגנוני ההטבה (זיכוי וניכוי) מוצגים להבנת ההבדל ביניהם ואינם נצברים אוטומטית; הצגה אינה המלצה על מנגנון.',
      'בנתונים אין תקרה להפקדה המזכה, ולכן סכום הזיכוי מוצג כאיור עליון (שיעור הזיכוי כפול ההפקדה) ובפועל עשוי להיות נמוך יותר.',
      'חיסכון המס בניכוי מחושב כהפרש מס לפי מדרגות לפני נקודות זיכוי.',
      'התשואה ודמי הניהול מוזנים על ידי המשתמש בלבד, להמחשת תרחיש חישובי ללא צפי או הבטחה; ההפקדה מתווספת בסוף כל חודש.',
      'זכאות להטבות מס נקבעת מול רשות המסים ובבדיקה אישית.',
    ],
    warnings,
  };
}
