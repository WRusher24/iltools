// Tool - payslip decoder. CLIENT-SIDE ONLY manual entry: no upload, no fetch, no storage.
import type { RatesFile } from '../rates';
import { checkNum, done, num0, round2, LOW_CONFIDENCE_NOTE, type Validation } from './common';
import { employeeCore } from './salary-net';

export interface Inputs {
  gross: number;
  income_tax: number;
  ni_and_health: number;
  pension_employee: number;
  hishtalmut_employee: number;
  other_deductions: number;
  net_stated: number;
  credit_points: number;
  pension_employer: number;
}
export const INPUT_DEFAULTS: Inputs = {
  gross: NaN,
  income_tax: NaN,
  ni_and_health: NaN,
  pension_employee: 0,
  hishtalmut_employee: 0,
  other_deductions: 0,
  net_stated: NaN,
  credit_points: NaN,
  pension_employer: 0,
};

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'gross', { label: 'ברוטו', required: true, min: 0 });
  checkNum(e, i, 'income_tax', { label: 'מס הכנסה', required: true, min: 0 });
  checkNum(e, i, 'ni_and_health', { label: 'ביטוח לאומי ומס בריאות', required: true, min: 0 });
  checkNum(e, i, 'pension_employee', { label: 'פנסיה עובד', min: 0 });
  checkNum(e, i, 'hishtalmut_employee', { label: 'קרן השתלמות עובד', min: 0 });
  checkNum(e, i, 'other_deductions', { label: 'ניכויים אחרים', min: 0 });
  checkNum(e, i, 'net_stated', { label: 'נטו בתלוש', required: true, min: 0 });
  checkNum(e, i, 'credit_points', { label: 'נקודות זיכוי', min: 0, max: 100 });
  checkNum(e, i, 'pension_employer', { label: 'פנסיה מעסיק', min: 0 });
  return done(e);
}

export interface Line {
  key: string;
  label: string;
  amount: number;
  explanation: string;
}
export interface Result {
  lines: Line[];
  total_deductions: number;
  computed_net: number;
  net_difference: number;
  flags: string[];
  /** reference estimate from the 2026 data, only when credit points were entered */
  estimate: { income_tax: number; ni_and_health: number } | null;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const gross = num0(i.gross);
  const lines: Line[] = [
    { key: 'gross', label: 'שכר ברוטו', amount: round2(gross), explanation: 'סך התשלום החודשי לפני ניכויים, כולל תוספות וגמולים שנכללו בתלוש.' },
    { key: 'income_tax', label: 'מס הכנסה', amount: round2(num0(i.income_tax)), explanation: 'ניכוי מקדמת מס הכנסה לפי מדרגות המס ונקודות הזיכוי של העובד.' },
    { key: 'ni_and_health', label: 'ביטוח לאומי ומס בריאות', amount: round2(num0(i.ni_and_health)), explanation: 'ניכוי חובה לביטוח לאומי ולביטוח בריאות, בשיעור מופחת עד סכום מסוים ובשיעור מלא מעליו.' },
    { key: 'pension_employee', label: 'הפקדת עובד לפנסיה', amount: round2(num0(i.pension_employee)), explanation: 'חלק העובד בהפקדה לקרן פנסיה; מנוכה מהשכר ומופקד לחיסכון.' },
    { key: 'hishtalmut_employee', label: 'הפקדת עובד לקרן השתלמות', amount: round2(num0(i.hishtalmut_employee)), explanation: 'חלק העובד בהפקדה לקרן השתלמות, אם קיימת.' },
    { key: 'other_deductions', label: 'ניכויים אחרים', amount: round2(num0(i.other_deductions)), explanation: 'ניכויים נוספים שמופיעים בתלוש, כמו ארוחות, הלוואה או ניכוי מרצון.' },
  ];
  const deductions = num0(i.income_tax) + num0(i.ni_and_health) + num0(i.pension_employee) + num0(i.hishtalmut_employee) + num0(i.other_deductions);
  const computed = gross - deductions;
  const diff = num0(i.net_stated) - computed;
  const flags: string[] = [];
  if (Math.abs(diff) > 0.005) flags.push(`הנטו שהוזן שונה מברוטו פחות הניכויים שהוזנו בסך ${round2(Math.abs(diff))} ₪ — כדאי לבדוק אם חסר סעיף בתלוש.`);
  if (num0(i.pension_employee) === 0 && num0(i.pension_employer) === 0) flags.push('לא הוזנה הפקדה לפנסיה — כדאי לבדוק מול המעסיק אם יש הפקדה.');
  if (Number.isFinite(i.credit_points) ? i.credit_points === 0 : true) flags.push('לא הוזנו נקודות זיכוי — כדאי לבדוק כמה נקודות הוחלו בתלוש.');
  if (deductions > gross) flags.push('סך הניכויים גבוה מהברוטו — כדאי לבדוק את ההזנה.');
  let estimate: Result['estimate'] = null;
  if (Number.isFinite(i.credit_points) && gross > 0) {
    const c = employeeCore({ gross_monthly: gross, car_value_monthly: 0, credit_points: i.credit_points, pension_pct: 0, hishtalmut_pct: 0 }, rates);
    estimate = { income_tax: round2(c.income_tax_annual / 12), ni_and_health: round2(c.ni_monthly) };
  }
  return {
    lines,
    total_deductions: round2(deductions),
    computed_net: round2(computed),
    net_difference: round2(diff),
    flags,
    estimate,
    assumptions: [
      'ההזנה ידנית ובדפדפן בלבד: אין העלאת קובץ, אין שליחה לשרת ואין שמירה של הנתונים.',
      'ההסברים כלליים ומתייחסים לרכיבים המרכזיים בלבד; הכלי אינו קובע אם התלוש תקין.',
      'ההערכה לצורך השוואה מחושבת מנתוני 2026 לפי מדרגות, נקודות הזיכוי שהוזנו ושיעורי עובד משולבים, ללא הטבות מס אחרות.',
    ],
    warnings: [LOW_CONFIDENCE_NOTE + ' (שיעורי פנסיה).'],
  };
}
