// K9 - severance estimate (salary x years). The exempt ceiling is NOT in the data: optional user-entered input.
import type { RatesFile } from '../rates';
import { checkNum, done, num0, round2, type Validation } from './common';
import { bracketBounds } from './tax';

export interface Inputs {
  monthly_salary: number;
  years: number;
  /** optional, user-entered from an official source: exempt monthly salary ceiling per year of service */
  exempt_monthly_ceiling: number;
}
export const INPUT_DEFAULTS: Inputs = { monthly_salary: NaN, years: NaN, exempt_monthly_ceiling: NaN };

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'monthly_salary', { label: 'שכר חודשי', required: true, min: 0 });
  checkNum(e, i, 'years', { label: 'שנות עבודה', required: true, gt: 0, max: 70 });
  checkNum(e, i, 'exempt_monthly_ceiling', { label: 'תקרת פטור', min: 0 });
  return done(e);
}

export interface Result {
  annual_salary: number;
  estimate: number;
  exempt_amount: number | null;
  taxable_amount: number | null;
  /** exempt ceiling status */
  exempt_ceiling_available: boolean;
  brackets: { id: string; rate: number; from: number; to: number | null }[];
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const salary = num0(i.monthly_salary);
  const years = num0(i.years);
  const estimate = salary * years;
  const hasCeiling = Number.isFinite(i.exempt_monthly_ceiling);
  const exempt = hasCeiling ? Math.min(salary, i.exempt_monthly_ceiling) * years : null;
  return {
    annual_salary: round2(salary * 12),
    estimate: round2(estimate),
    exempt_amount: exempt === null ? null : round2(exempt),
    taxable_amount: exempt === null ? null : round2(Math.max(0, estimate - exempt)),
    exempt_ceiling_available: hasCeiling,
    brackets: bracketBounds(rates).map((b) => ({ id: b.id, rate: b.rate, from: b.lower, to: b.upper })),
    assumptions: [
      'אומדן ראשוני: שכר קובע חודשי כפול שנות ותק. אינו כולל הודעה מוקדמת, חלף חופשה, שעות נוספות או הפקדות פנסיה שכבר נצברו.',
      'תקרת הפיצויים הפטורים ממס אינה בנתוני האתר ולכן לא מחושבת כברירת מחדל; אפשר להזין אותה ידנית מתוך מקור רשמי (אימות מול רשות המסים).',
      'המס על הפיצויים אינו מחושב; מוצגות מדרגות המס הכלליות להקשר בלבד.',
      'לא נבדקות נסיבות מיוחדות כמו סיום עבודה מרצון.',
    ],
    warnings: hasCeiling ? ['תקרת הפטור שהוזנה היא נתון של המשתמש ולא אומתה על ידי האתר; יש לאמת מול מקור רשמי.'] : ['תקרת הפטור לא זמינה בנתונים ולכן הפיצוי החייב במס לא מחושב.'],
  };
}
