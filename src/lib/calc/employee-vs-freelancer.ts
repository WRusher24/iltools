// K2 - employee vs freelancer net comparison. Reuses K6 (employee) and K1 (self-employed) engines.
import type { RatesFile } from '../rates';
import { checkNum, done, MONTHS_PER_YEAR, num0, round2, solveMonotone, type Validation } from './common';
import { selfEmployedCore } from './atzmai-net';
import { employeeCore, makeDefaults as salaryDefaults } from './salary-net';

export interface Inputs {
  gross_offer: number;
  /** monetary value of employer extras (car, meals, etc.), user-estimated, ILS/month */
  employer_extras_monthly: number;
  credit_points: number;
  pension_pct: number;
  hishtalmut_pct: number;
  freelancer_rate: number;
  billable_hours_month: number;
  business_expenses_monthly: number;
  freelancer_pension_monthly: number;
}

export const INPUT_DEFAULTS: Inputs = {
  gross_offer: NaN,
  employer_extras_monthly: 0,
  credit_points: 2.25,
  pension_pct: 0,
  hishtalmut_pct: 0,
  freelancer_rate: NaN,
  billable_hours_month: NaN,
  business_expenses_monthly: 0,
  freelancer_pension_monthly: 0,
};

export function makeDefaults(rates: RatesFile): Inputs {
  const s = salaryDefaults(rates);
  return { ...INPUT_DEFAULTS, pension_pct: s.pension_pct, hishtalmut_pct: s.hishtalmut_pct };
}

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'gross_offer', { label: 'שכר ברוטו', required: true, min: 0 });
  checkNum(e, i, 'employer_extras_monthly', { label: 'שווי תוספות מעסיק', min: 0 });
  checkNum(e, i, 'credit_points', { label: 'נקודות זיכוי', required: true, min: 0, max: 100 });
  checkNum(e, i, 'pension_pct', { label: 'אחוז פנסיה', min: 0, max: 100 });
  checkNum(e, i, 'hishtalmut_pct', { label: 'אחוז קרן השתלמות', min: 0, max: 100 });
  checkNum(e, i, 'freelancer_rate', { label: 'תעריף עצמאי', required: true, min: 0 });
  checkNum(e, i, 'billable_hours_month', { label: 'שעות חיוב בחודש', required: true, gt: 0, max: 744 });
  checkNum(e, i, 'business_expenses_monthly', { label: 'הוצאות עסקיות', min: 0 });
  checkNum(e, i, 'freelancer_pension_monthly', { label: 'הפקדת פנסיה לעצמאי', min: 0 });
  return done(e);
}

export interface Result {
  employee_net_monthly: number;
  employee_net_plus_extras_monthly: number;
  employee_pension_hishtalmut_monthly: number;
  freelancer_revenue_monthly: number;
  freelancer_net_monthly: number;
  freelancer_deposits_monthly: number;
  freelancer_net_after_deposits_monthly: number;
  /** freelancer net-after-deposits minus employee net cash (positive favours the freelancer path in this model) */
  difference_vs_employee_net: number;
  difference_vs_employee_total: number;
  /** monthly revenue / hourly rate at which freelancer net-after-deposits equals employee net cash; null if not reachable */
  breakeven_revenue_monthly: number | null;
  breakeven_rate: number | null;
  breakeven_total_revenue_monthly: number | null;
  breakeven_total_rate: number | null;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const emp = employeeCore(
    { gross_monthly: i.gross_offer, car_value_monthly: 0, credit_points: i.credit_points, pension_pct: i.pension_pct, hishtalmut_pct: i.hishtalmut_pct },
    rates,
  );
  const hours = num0(i.billable_hours_month);
  const revenue = num0(i.freelancer_rate) * hours;
  const f = (rev: number) =>
    selfEmployedCore(
      { revenue_monthly: rev, expenses_monthly: i.business_expenses_monthly, credit_points: i.credit_points, pension_deposit: i.freelancer_pension_monthly, hishtalmut_deposit: 0, deductions: 0 },
      rates,
    ).net_after_deposits_monthly;
  const fl = selfEmployedCore(
    { revenue_monthly: revenue, expenses_monthly: i.business_expenses_monthly, credit_points: i.credit_points, pension_deposit: i.freelancer_pension_monthly, hishtalmut_deposit: 0, deductions: 0 },
    rates,
  );
  const empNet = emp.net_monthly;
  const empTotal = empNet + num0(i.employer_extras_monthly);
  const hi = (num0(i.gross_offer) + num0(i.business_expenses_monthly) + num0(i.employer_extras_monthly) + 1000) * 20;
  const lo = num0(i.business_expenses_monthly);
  const be = solveMonotone(f, empNet, lo, hi);
  const bt = solveMonotone(f, empTotal, lo, hi);
  const warnings: string[] = [];
  if (num0(i.pension_pct) > 0 || num0(i.hishtalmut_pct) > 0) warnings.push('לפי הנתונים שפורסמו; יש לאמת מול מקור רשמי');
  return {
    employee_net_monthly: round2(empNet),
    employee_net_plus_extras_monthly: round2(empTotal),
    employee_pension_hishtalmut_monthly: round2(emp.pension_monthly + emp.hishtalmut_monthly),
    freelancer_revenue_monthly: round2(revenue),
    freelancer_net_monthly: round2(fl.net_monthly),
    freelancer_deposits_monthly: round2(fl.deposits_monthly),
    freelancer_net_after_deposits_monthly: round2(fl.net_after_deposits_monthly),
    difference_vs_employee_net: round2(fl.net_after_deposits_monthly - empNet),
    difference_vs_employee_total: round2(fl.net_after_deposits_monthly - empTotal),
    breakeven_revenue_monthly: be === null ? null : round2(be),
    breakeven_rate: be === null || hours <= 0 ? null : round2(be / hours),
    breakeven_total_revenue_monthly: bt === null ? null : round2(bt),
    breakeven_total_rate: bt === null || hours <= 0 ? null : round2(bt / hours),
    assumptions: [
      'ההשוואה היא של נטו במזומן בלבד, לאחר הפקדות העובד לפנסיה/קרן והפקדת הפנסיה שהוזנה לעצמאי; זכויות סוציאליות לא כספיות (חופשה, מחלה, ביטחון תעסוקתי) אינן מתומחרות.',
      'מסלול שכיר: מנוע חישוב שכר נטו (מס לפי מדרגות, נקודות זיכוי, ביטוח לאומי ומס בריאות משולב לפי שיעורי עובד).',
      'מסלול עצמאי: מנוע נטו לעצמאי (שיעורי עובד משולבים כקירוב לביטוח לאומי ומס בריאות; בנתונים אין שיעורי עצמאי).',
      'שווי התוספות של המעסיק הוא הערכה של המשתמש ומתווסף לצד השכיר בשורה נפרדת בלבד; הוא אינו מחושב כהכנסה חייבת.',
      'תקרת הפיצויים הפטורים אינה בנתונים ולכן אינה מחושבת. תזרים יציב מחושב לכל החודשים.',
      `ההפקדות של המעסיק לפנסיה/קרן (לפי ${MONTHS_PER_YEAR} חודשים) אינן נכללות בנטו במזומן.`,
    ],
    warnings,
  };
}
