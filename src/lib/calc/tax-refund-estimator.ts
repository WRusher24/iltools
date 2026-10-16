// Tool - rough first-pass tax refund check (NOT a refund claim, NOT a commitment).
import type { RatesFile } from '../rates';
import { checkNum, done, num0, round2, type Validation } from './common';
import { incomeTaxAfterCredits } from './tax';

export interface Inputs {
  annual_income: number;
  deductions_annual: number;
  tax_paid: number;
  credit_points: number;
  extra_credits_annual: number;
}
export const INPUT_DEFAULTS: Inputs = { annual_income: NaN, deductions_annual: 0, tax_paid: NaN, credit_points: 2.25, extra_credits_annual: 0 };

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'annual_income', { label: 'הכנסה שנתית', required: true, min: 0 });
  checkNum(e, i, 'deductions_annual', { label: 'ניכויים', min: 0 });
  checkNum(e, i, 'tax_paid', { label: 'מס שנגבה', required: true, min: 0 });
  checkNum(e, i, 'credit_points', { label: 'נקודות זיכוי', required: true, min: 0, max: 100 });
  checkNum(e, i, 'extra_credits_annual', { label: 'זיכויים נוספים', min: 0 });
  return done(e);
}

export interface Result {
  taxable_annual: number;
  tax_before_credits: number;
  credits_value: number;
  surtax: number;
  tax_due_estimate: number;
  tax_paid: number;
  /** tax_paid - tax_due_estimate; positive = possible gap in the taxpayer's favour */
  gap: number;
  direction: 'possible_refund' | 'possible_balance_due' | 'no_gap';
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const taxable = Math.max(0, num0(i.annual_income) - num0(i.deductions_annual));
  const t = incomeTaxAfterCredits(taxable, num0(i.credit_points), rates, num0(i.extra_credits_annual));
  const gap = num0(i.tax_paid) - t.income_tax;
  const direction = gap > 0.005 ? 'possible_refund' : gap < -0.005 ? 'possible_balance_due' : 'no_gap';
  return {
    taxable_annual: round2(taxable),
    tax_before_credits: round2(t.tax_before_credits),
    credits_value: round2(t.credits_value),
    surtax: round2(t.surtax),
    tax_due_estimate: round2(t.income_tax),
    tax_paid: round2(num0(i.tax_paid)),
    gap: round2(gap),
    direction,
    assumptions: [
      'בדיקה ראשונית בלבד: אינה בקשת החזר ואינה התחייבות לתוצאה או לקבלת החזר.',
      'המס המחושב לפי מדרגות המס השנתיות שפורסמו, שווי נקודות הזיכוי שהוזנו וזיכויים נוספים שהוזנו ידנית; ייתכנו זיכויים ופטורים שאינם בנתונים.',
      'לא נלקחים בחשבון מקורות הכנסה מרובים או שינויי עבודה במהלך השנה, אלא אם הוזנו במלואם בסכומים השנתיים.',
      'זכות להחזר מוגבלת בזמן; יש לבדוק את תקופת ההתיישנות מול רשות המסים. הפער אינו סכום סופי.',
    ],
    warnings: ['בדיקה ראשונית בלבד — אין לראות בתוצאה סכום החזר.'],
  };
}
