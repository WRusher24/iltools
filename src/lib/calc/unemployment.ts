// K10 - unemployment benefit context. No benefit formula in the data: amount is "not available" unless user-entered.
import type { RatesFile } from '../rates';
import { checkNum, done, num0, round2, type Validation } from './common';

export interface Inputs {
  prior_salary_monthly: number;
  age: number;
  work_months: number;
  /** optional, user-entered from the official National Insurance publication */
  daily_benefit: number;
  /** optional, user-entered from the official publication */
  entitlement_days: number;
}
export const INPUT_DEFAULTS: Inputs = { prior_salary_monthly: NaN, age: NaN, work_months: NaN, daily_benefit: NaN, entitlement_days: NaN };

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'prior_salary_monthly', { label: 'שכר קודם', required: true, min: 0 });
  checkNum(e, i, 'age', { label: 'גיל', required: true, min: 16, max: 120, integer: true });
  checkNum(e, i, 'work_months', { label: 'חודשי עבודה', required: true, min: 0, max: 1200, integer: true });
  checkNum(e, i, 'daily_benefit', { label: 'דמי אבטלה ליום', min: 0 });
  checkNum(e, i, 'entitlement_days', { label: 'ימי זכאות', min: 0, max: 1000, integer: true });
  return done(e);
}

export interface Result {
  insured_wage_monthly: number;
  reduced_ceiling: number;
  monthly_ceiling: number;
  above_reduced_ceiling: boolean;
  above_monthly_ceiling: boolean;
  salary_annual: number;
  benefit_estimate: number | null;
  estimate_available: boolean;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const ni = rates.national_insurance;
  const sal = num0(i.prior_salary_monthly);
  const have = Number.isFinite(i.daily_benefit) && Number.isFinite(i.entitlement_days);
  return {
    insured_wage_monthly: round2(Math.min(sal, ni.monthly_ceiling)),
    reduced_ceiling: ni.reduced_rate_ceiling,
    monthly_ceiling: ni.monthly_ceiling,
    above_reduced_ceiling: sal > ni.reduced_rate_ceiling,
    above_monthly_ceiling: sal > ni.monthly_ceiling,
    salary_annual: round2(sal * 12),
    benefit_estimate: have ? round2(i.daily_benefit * i.entitlement_days) : null,
    estimate_available: have,
    assumptions: [
      'שיטת החישוב הרשמית של דמי האבטלה, שיעור התחלופה ומשך הזכאות אינם בנתוני האתר, ולכן אין נוסחה ואין סכום אומדן אוטומטי (לא זמין).',
      'הגיל ומספר חודשי העבודה נאספים כהקשר בלבד ואינם משפיעים על החישוב, כי אין נוסחה בנתונים.',
      'המחשבון מציג את השכר המבוטח (עד התקרה שפורסמה) ואת המדרגה המופחתת כהקשר בלבד.',
      'אפשר להזין ידנית דמי אבטלה ליום וימי זכאות מתוך הפרסום הרשמי של ביטוח לאומי; התוצאה היא מכפלה פשוטה של הנתונים שהוזנו.',
      'הזכאות בפועל, ההצהרות והתנאים נקבעים על ידי ביטוח לאומי. לא מטופלים חל״ת, עבודה חלקית או הכנסות נוספות.',
    ],
    warnings: ['התוצאה אינה קביעה של זכאות ואינה תחזית.'],
  };
}
