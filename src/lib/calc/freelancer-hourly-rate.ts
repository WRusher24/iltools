// Tool - freelancer minimum hourly rate to reach a desired monthly net (K1 engine, solved by bisection).
import type { RatesFile } from '../rates';
import { checkNum, done, MONTHS_PER_YEAR, num0, round2, solveMonotone, type Validation } from './common';
import { selfEmployedCore } from './atzmai-net';

export interface Inputs {
  net_desired_monthly: number;
  billable_hours_week: number;
  vacation_weeks: number;
  business_expenses_monthly: number;
  pension_monthly: number;
  credit_points: number;
}
export const INPUT_DEFAULTS: Inputs = {
  net_desired_monthly: NaN,
  billable_hours_week: NaN,
  vacation_weeks: 0,
  business_expenses_monthly: 0,
  pension_monthly: 0,
  credit_points: 2.25,
};
export const WEEKS_PER_YEAR = 52;

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'net_desired_monthly', { label: 'נטו רצוי', required: true, gt: 0 });
  checkNum(e, i, 'billable_hours_week', { label: 'שעות חיוב בשבוע', required: true, gt: 0, max: 168 });
  checkNum(e, i, 'vacation_weeks', { label: 'שבועות חופשה', min: 0, max: WEEKS_PER_YEAR - 1 });
  checkNum(e, i, 'business_expenses_monthly', { label: 'הוצאות עסקיות', min: 0 });
  checkNum(e, i, 'pension_monthly', { label: 'הפקדה לפנסיה', min: 0 });
  checkNum(e, i, 'credit_points', { label: 'נקודות זיכוי', required: true, min: 0, max: 100 });
  return done(e);
}

export interface Result {
  required_revenue_monthly: number | null;
  required_profit_monthly: number | null;
  income_tax_monthly: number | null;
  ni_combined_monthly: number | null;
  annual_billable_hours: number;
  hourly_rate: number | null;
  hourly_rate_incl_vat: number | null;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const exp = num0(i.business_expenses_monthly);
  const f = (rev: number) =>
    selfEmployedCore({ revenue_monthly: rev, expenses_monthly: exp, credit_points: i.credit_points, pension_deposit: i.pension_monthly, hishtalmut_deposit: 0, deductions: 0 }, rates)
      .net_after_deposits_monthly;
  const target = num0(i.net_desired_monthly);
  const sol = solveMonotone(f, target, exp, (target + exp + num0(i.pension_monthly) + 1000) * 10);
  const annualHours = num0(i.billable_hours_week) * (WEEKS_PER_YEAR - num0(i.vacation_weeks));
  const warnings: string[] = [];
  if (num0(i.pension_monthly) > 0) warnings.push('לפי הנתונים שפורסמו; יש לאמת מול מקור רשמי');
  let core = null as ReturnType<typeof selfEmployedCore> | null;
  if (sol !== null) core = selfEmployedCore({ revenue_monthly: sol, expenses_monthly: exp, credit_points: i.credit_points, pension_deposit: i.pension_monthly, hishtalmut_deposit: 0, deductions: 0 }, rates);
  const hourly = sol !== null && annualHours > 0 ? (sol * MONTHS_PER_YEAR) / annualHours : null;
  return {
    required_revenue_monthly: sol === null ? null : round2(sol),
    required_profit_monthly: sol === null ? null : round2(sol - exp),
    income_tax_monthly: core ? round2(core.income_tax_annual / MONTHS_PER_YEAR) : null,
    ni_combined_monthly: core ? round2(core.ni_annual / MONTHS_PER_YEAR) : null,
    annual_billable_hours: round2(annualHours),
    hourly_rate: hourly === null ? null : round2(hourly),
    hourly_rate_incl_vat: hourly === null ? null : round2(hourly * (1 + rates.vat.standard_rate)),
    assumptions: [
      'הנטו הרצוי הוא נטו חודשי לאחר מס הכנסה, ביטוח לאומי ומס בריאות (שיעורי עובד משולבים כקירוב), ולאחר הפקדת הפנסיה שהוזנה.',
      'שעות החיוב השנתיות = שעות חיוב בשבוע כפול (52 פחות שבועות חופשה). חגים וימי מחלה: יש לכלול בשבועות החופשה.',
      'התוצאה היא תעריף מינימום לאיזון, לא תעריף שוק; מניחה הכנסה קבועה ותעריף אחיד לכל הלקוחות.',
      'התעריף כולל מע״מ מוצג למי שהוא עוסק מורשה, לפי שיעור המע״מ שפורסם.',
      'לא כולל זיכויים אישיים נוספים או הפסדים.',
    ],
    warnings,
  };
}
