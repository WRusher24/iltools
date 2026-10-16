// K7 - keren hishtalmut educational calculator. Rates are LOW confidence in the data file.
import type { RatesFile } from '../rates';
import { checkNum, done, LOW_CONFIDENCE_NOTE, num0, pct, round2, type Validation } from './common';
import { projectBalance, type ProjectionRow } from './projection';

export interface Inputs {
  monthly_income: number;
  employee_pct: number;
  employer_pct: number;
  years: number;
  /** user-entered scenario; no default */
  annual_return_pct: number;
  /** user-entered; no default */
  annual_fee_pct: number;
  initial_balance: number;
}
export const INPUT_DEFAULTS: Inputs = { monthly_income: NaN, employee_pct: 0, employer_pct: 0, years: NaN, annual_return_pct: NaN, annual_fee_pct: NaN, initial_balance: 0 };
export function makeDefaults(rates: RatesFile): Inputs {
  return {
    ...INPUT_DEFAULTS,
    employee_pct: round2(rates.keren_hishtalmut.employee_contribution_rate * 100),
    employer_pct: round2(rates.keren_hishtalmut.employer_contribution_rate * 100),
  };
}

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'monthly_income', { label: 'הכנסה חודשית', required: true, min: 0 });
  checkNum(e, i, 'employee_pct', { label: 'שיעור עובד', min: 0, max: 100 });
  checkNum(e, i, 'employer_pct', { label: 'שיעור מעסיק', min: 0, max: 100 });
  checkNum(e, i, 'years', { label: 'שנים', required: true, gt: 0, max: 80 });
  checkNum(e, i, 'annual_return_pct', { label: 'תשואה', required: true, min: -99, max: 100 });
  checkNum(e, i, 'annual_fee_pct', { label: 'דמי ניהול', required: true, min: 0, max: 100 });
  checkNum(e, i, 'initial_balance', { label: 'יתרה התחלתית', min: 0 });
  return done(e);
}

export interface Result {
  employee_monthly: number;
  employer_monthly: number;
  total_monthly: number;
  total_annual: number;
  annual_contribution_ceiling: number;
  tax_exempt_ceiling: number;
  /** total annual contribution minus published ceiling (positive = above) */
  over_ceiling_annual: number;
  over_exempt_ceiling_annual: number;
  six_year_reached: boolean;
  total_deposits: number;
  final_balance: number;
  growth: number;
  net_annual_pct: number;
  rows: ProjectionRow[];
  /** management fee benchmark is not in the data */
  fee_benchmark: null;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const k = rates.keren_hishtalmut;
  const emp = num0(i.monthly_income) * pct(num0(i.employee_pct));
  const er = num0(i.monthly_income) * pct(num0(i.employer_pct));
  const total = emp + er;
  const annual = total * 12;
  const proj = projectBalance({ initial: i.initial_balance, monthly_deposit: total, years: i.years, annual_return_pct: i.annual_return_pct, annual_fee_pct: i.annual_fee_pct });
  const warnings: string[] = [];
  if (k.confidence === 'low') warnings.push(LOW_CONFIDENCE_NOTE);
  if (annual > k.annual_contribution_ceiling) warnings.push('ההפקדה השנתית עולה על התקרה השנתית שפורסמה.');
  return {
    employee_monthly: round2(emp),
    employer_monthly: round2(er),
    total_monthly: round2(total),
    total_annual: round2(annual),
    annual_contribution_ceiling: k.annual_contribution_ceiling,
    tax_exempt_ceiling: k.tax_exempt_ceiling,
    over_ceiling_annual: round2(annual - k.annual_contribution_ceiling),
    over_exempt_ceiling_annual: round2(annual - k.tax_exempt_ceiling),
    six_year_reached: num0(i.years) >= 6,
    total_deposits: proj.total_deposits,
    final_balance: proj.final_balance,
    growth: proj.growth,
    net_annual_pct: proj.net_annual_pct,
    rows: proj.rows,
    fee_benchmark: null,
    assumptions: [
      'עמוד חינוכי בלבד: אין המלצת מוצר, דירוג גופים או המלצת סכום הפקדה.',
      'התשואה ודמי הניהול הם נתונים שהוזנו על ידי המשתמש בלבד, להמחשת תרחיש חישובי; אין בהם צפי או הבטחה, ואין נתוני תשואה או דמי ניהול בנתוני האתר.',
      'הקרן צוברת לפי תשואה נטו (תשואה פחות דמי ניהול, כשיעור שנתי) הנגזרת לחודש; ההפקדה מתווספת בסוף כל חודש.',
      'שיעורי ההפקדה והתקרות לפי הנתונים שפורסמו; ההשוואה לתקרות היא לצורך מידע ואינה קובעת זכאות לפטור ממס.',
      'כלל שש השנים מוצג כמידע כללי בלבד; זכאות למשיכה ללא מס נקבעת מול מקור רשמי.',
    ],
    warnings,
  };
}
