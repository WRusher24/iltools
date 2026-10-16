// K1 - self-employed net income. Derived from data/rates (see docs/engineering/CALC_NOTES.md for assumptions).
import type { RatesFile } from '../rates';
import { checkNum, checkOneOf, done, LOW_CONFIDENCE_NOTE, MONTHS_PER_YEAR, num0, round2, type Validation } from './common';
import { incomeTaxAfterCredits, niMonthly, type BracketLine } from './tax';

export type Status = 'patur' | 'murshe';
export type MaritalStatus = 'single' | 'married' | 'other';

export interface Inputs {
  revenue_monthly: number;
  expenses_monthly: number;
  status: Status;
  credit_points: number;
  pension_deposit: number;
  hishtalmut_deposit: number;
  marital_status: MaritalStatus;
  /** additional deductions, ILS per month */
  deductions: number;
}

export const INPUT_DEFAULTS: Inputs = {
  revenue_monthly: NaN,
  expenses_monthly: 0,
  status: 'murshe',
  credit_points: 2.25,
  pension_deposit: 0,
  hishtalmut_deposit: 0,
  marital_status: 'single',
  deductions: 0,
};

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'revenue_monthly', { label: 'הכנסה חודשית', required: true, min: 0 });
  checkNum(e, i, 'expenses_monthly', { label: 'הוצאות חודשיות', min: 0 });
  checkNum(e, i, 'credit_points', { label: 'נקודות זיכוי', required: true, min: 0, max: 100 });
  checkNum(e, i, 'pension_deposit', { label: 'הפקדה לפנסיה', min: 0 });
  checkNum(e, i, 'hishtalmut_deposit', { label: 'הפקדה לקרן השתלמות', min: 0 });
  checkNum(e, i, 'deductions', { label: 'ניכויים נוספים', min: 0 });
  checkOneOf(e, i, 'status', ['patur', 'murshe']);
  checkOneOf(e, i, 'marital_status', ['single', 'married', 'other']);
  if (!e.revenue_monthly && !e.expenses_monthly && num0(i.expenses_monthly) > num0(i.revenue_monthly)) {
    e.expenses_monthly = 'ההוצאות גבוהות מההכנסה';
  }
  return done(e);
}

/** Core self-employed engine (unrounded intermediate values, monthly figures). Reused by K2, hourly-rate, quiz. */
export interface SelfEmployedCore {
  profit_annual: number;
  pension_deduction_annual: number;
  deductions_annual: number;
  taxable_annual: number;
  tax_before_credits: number;
  surtax: number;
  credits_value: number;
  credits_applied: number;
  income_tax_annual: number;
  lines: BracketLine[];
  ni_annual: number;
  ni_base_monthly: number;
  ni_reduced_part_monthly: number;
  ni_full_part_monthly: number;
  net_annual: number;
  net_monthly: number;
  deposits_monthly: number;
  net_after_deposits_monthly: number;
}

export function selfEmployedCore(
  p: { revenue_monthly: number; expenses_monthly: number; credit_points: number; pension_deposit: number; hishtalmut_deposit: number; deductions: number },
  rates: RatesFile,
): SelfEmployedCore {
  const rev = num0(p.revenue_monthly);
  const exp = num0(p.expenses_monthly);
  const profitM = Math.max(0, rev - exp);
  const profitA = profitM * MONTHS_PER_YEAR;
  const pensionA = num0(p.pension_deposit) * MONTHS_PER_YEAR;
  // Pension: deductible up to rates.pension.tax_deduction_rate of the annual profit (no ceiling key exists in the data).
  const pensionDed = Math.min(pensionA, rates.pension.tax_deduction_rate * profitA);
  const dedA = num0(p.deductions) * MONTHS_PER_YEAR;
  const taxable = Math.max(0, profitA - pensionDed - dedA);
  const tax = incomeTaxAfterCredits(taxable, num0(p.credit_points), rates);
  // NI is charged on profit before pension/other deductions (no NI-deduction key in the data).
  const ni = niMonthly(profitM, rates, true);
  const niA = ni.total * MONTHS_PER_YEAR;
  const netA = profitA - tax.income_tax - niA;
  const deposits = num0(p.pension_deposit) + num0(p.hishtalmut_deposit);
  return {
    profit_annual: profitA,
    pension_deduction_annual: pensionDed,
    deductions_annual: dedA,
    taxable_annual: taxable,
    tax_before_credits: tax.tax_before_credits,
    surtax: tax.surtax,
    credits_value: tax.credits_value,
    credits_applied: tax.credits_applied,
    income_tax_annual: tax.income_tax,
    lines: tax.lines,
    ni_annual: niA,
    ni_base_monthly: ni.base,
    ni_reduced_part_monthly: ni.reduced_part,
    ni_full_part_monthly: ni.full_part,
    net_annual: netA,
    net_monthly: netA / MONTHS_PER_YEAR,
    deposits_monthly: deposits,
    net_after_deposits_monthly: netA / MONTHS_PER_YEAR - deposits,
  };
}

export interface Result {
  revenue_annual: number;
  expenses_annual: number;
  profit_annual: number;
  profit_monthly: number;
  pension_deduction_annual: number;
  deductions_annual: number;
  taxable_annual: number;
  tax_before_credits: number;
  surtax: number;
  credits_value: number;
  income_tax_annual: number;
  income_tax_monthly: number;
  tax_by_bracket: BracketLine[];
  /** combined national insurance + health as published for employees (proxy) */
  ni_combined_annual: number;
  ni_combined_monthly: number;
  /** not available separately in the data */
  health_tax: null;
  net_annual: number;
  net_monthly: number;
  deposits_monthly: number;
  net_after_deposits_monthly: number;
  /** (income tax + NI) / profit; null when profit is 0 */
  effective_rate: number | null;
  /** estimate = annual income tax / 12 (official advance rates are not in the data) */
  advance_payment_monthly: number;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const c = selfEmployedCore(i, rates);
  const ni = rates.national_insurance;
  const warnings: string[] = [];
  const assumptions = [
    'ההכנסה השנתית מחושבת כהכנסה חודשית כפול 12; ההכנסה והוצאות מניחות קבועות לאורך השנה.',
    'סכומי ההכנסה וההוצאות מוזנים לפני מע״מ; הסטטוס (פטור/מורשה) אינו משנה את חישוב מס ההכנסה והביטוח הלאומי.',
    'ביטוח לאומי ומס בריאות: בנתונים קיימים רק שיעורי עובד (מופחת/מלא) ולא שיעורי עצמאי. החישוב משתמש בשיעורי העובד המשולבים כקירוב שמרני ומוצג כשורה אחת משולבת; מס בריאות נפרד: לא זמין.',
    `שיעור מופחת עד ${ni.reduced_rate_ceiling.toLocaleString('he-IL')} ₪ לחודש, שיעור מלא עד תקרה של ${ni.monthly_ceiling.toLocaleString('he-IL')} ₪ לחודש; הכנסה מתחת ל-${ni.min_income.toLocaleString('he-IL')} ₪ מחויבת כהכנסה מינימלית.`,
    'לא מוחל ניכוי של דמי הביטוח הלאומי מההכנסה החייבת (אין בסיס לכך בנתונים).',
    'הפקדה לפנסיה מנוכה מההכנסה החייבת עד שיעור הניכוי שפורסם מההכנסה; הטבת הזיכוי בגין פנסיה אינה מחושבת (אין בנתונים תקרה). הפקדה לקרן השתלמות אינה מנוכה.',
    'מצב משפחתי אינו משפיע על החישוב; נקודות הזיכוי מוזנות ידנית. ניכויים נוספים מנוכים מההכנסה החייבת (סכום חודשי).',
    'הערכת מקדמה = מס הכנסה שנתי חלקי 12; שיעורי המקדמות הרשמיים אינם בנתונים.',
  ];
  if (num0(i.pension_deposit) > 0 || num0(i.hishtalmut_deposit) > 0) warnings.push(LOW_CONFIDENCE_NOTE);
  const pensionA = num0(i.pension_deposit) * MONTHS_PER_YEAR;
  if (pensionA > c.pension_deduction_annual + 0.005) {
    warnings.push('חלק מההפקדה לפנסיה עולה על הניכוי המותר לפי השיעור שפורסם ולא נוכה מההכנסה החייבת.');
  }
  if (num0(i.hishtalmut_deposit) * MONTHS_PER_YEAR > rates.keren_hishtalmut.annual_contribution_ceiling) {
    warnings.push('ההפקדה השנתית לקרן ההשתלמות עולה על התקרה שפורסמה.');
  }
  if (num0(i.revenue_monthly) - num0(i.expenses_monthly) > 0 && num0(i.revenue_monthly) - num0(i.expenses_monthly) < ni.min_income) {
    warnings.push('ההכנסה החייבת נמוכה מההכנסה המינימלית לביטוח לאומי; הביטוח חושב לפי ההכנסה המינימלית.');
  }
  const wholeAnnualRevenue = num0(i.revenue_monthly) * MONTHS_PER_YEAR;
  if (i.status === 'patur' && wholeAnnualRevenue > rates.vat.osek_patur_ceiling_annual) {
    warnings.push('המחזור השנתי עולה על תקרת עוסק פטור שפורסמה; ייתכן שיש חובה לעבור לעוסק מורשה.');
  }
  const eff = c.profit_annual > 0 ? (c.income_tax_annual + c.ni_annual) / c.profit_annual : null;
  return {
    revenue_annual: round2(wholeAnnualRevenue),
    expenses_annual: round2(num0(i.expenses_monthly) * MONTHS_PER_YEAR),
    profit_annual: round2(c.profit_annual),
    profit_monthly: round2(c.profit_annual / MONTHS_PER_YEAR),
    pension_deduction_annual: round2(c.pension_deduction_annual),
    deductions_annual: round2(c.deductions_annual),
    taxable_annual: round2(c.taxable_annual),
    tax_before_credits: round2(c.tax_before_credits),
    surtax: round2(c.surtax),
    credits_value: round2(c.credits_value),
    income_tax_annual: round2(c.income_tax_annual),
    income_tax_monthly: round2(c.income_tax_annual / MONTHS_PER_YEAR),
    tax_by_bracket: c.lines,
    ni_combined_annual: round2(c.ni_annual),
    ni_combined_monthly: round2(c.ni_annual / MONTHS_PER_YEAR),
    health_tax: null,
    net_annual: round2(c.net_annual),
    net_monthly: round2(c.net_monthly),
    deposits_monthly: round2(c.deposits_monthly),
    net_after_deposits_monthly: round2(c.net_after_deposits_monthly),
    effective_rate: eff === null ? null : Math.round(eff * 10000) / 10000,
    advance_payment_monthly: round2(c.income_tax_annual / MONTHS_PER_YEAR),
    assumptions,
    warnings,
  };
}
