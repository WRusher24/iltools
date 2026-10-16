// Tool - business structure quiz. Neutral informational summary only; reuses the K1 engine for the patur/murshe net simulation.
import type { RatesFile } from '../rates';
import { checkNum, checkOneOf, done, MONTHS_PER_YEAR, num0, round2, type Validation } from './common';
import { selfEmployedCore } from './atzmai-net';

export interface Inputs {
  turnover_mode: 'monthly' | 'annual';
  turnover: number;
  expenses_monthly: number;
  customers: 'private' | 'business' | 'mixed';
  partners: number;
  risk: 'low' | 'medium' | 'high';
  credit_points: number;
}
export const INPUT_DEFAULTS: Inputs = { turnover_mode: 'monthly', turnover: NaN, expenses_monthly: 0, customers: 'mixed', partners: 1, risk: 'low', credit_points: 2.25 };

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkOneOf(e, i, 'turnover_mode', ['monthly', 'annual']);
  checkOneOf(e, i, 'customers', ['private', 'business', 'mixed']);
  checkOneOf(e, i, 'risk', ['low', 'medium', 'high']);
  checkNum(e, i, 'turnover', { label: 'מחזור', required: true, min: 0 });
  checkNum(e, i, 'expenses_monthly', { label: 'הוצאות', min: 0 });
  checkNum(e, i, 'partners', { label: 'מספר שותפים', required: true, min: 1, integer: true, max: 100 });
  checkNum(e, i, 'credit_points', { label: 'נקודות זיכוי', required: true, min: 0, max: 100 });
  return done(e);
}

const CUSTOMER_LABEL: Record<Inputs['customers'], string> = { private: 'לקוחות פרטיים', business: 'לקוחות עסקיים', mixed: 'מעורב' };

export interface Simulation {
  net_monthly: number;
  income_tax_monthly: number;
  ni_combined_monthly: number;
  profit_monthly: number;
}
export interface Structure {
  id: 'patur' | 'murshe' | 'company';
  name: string;
  /** neutral status wording, not advice */
  status_text: string;
  points: string[];
  simulation: Simulation | null;
  simulation_text: string | null;
}
export interface Result {
  turnover_annual: number;
  structures: Structure[];
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const annual = i.turnover_mode === 'monthly' ? num0(i.turnover) * MONTHS_PER_YEAR : num0(i.turnover);
  const monthly = annual / MONTHS_PER_YEAR;
  const ceiling = rates.vat.osek_patur_ceiling_annual;
  const core = selfEmployedCore({ revenue_monthly: monthly, expenses_monthly: i.expenses_monthly, credit_points: i.credit_points, pension_deposit: 0, hishtalmut_deposit: 0, deductions: 0 }, rates);
  const sim: Simulation = {
    net_monthly: round2(core.net_monthly),
    income_tax_monthly: round2(core.income_tax_annual / MONTHS_PER_YEAR),
    ni_combined_monthly: round2(core.ni_annual / MONTHS_PER_YEAR),
    profit_monthly: round2(core.profit_annual / MONTHS_PER_YEAR),
  };
  const overCeiling = annual > ceiling;
  const partners = num0(i.partners);
  const common: string[] = [];
  if (partners > 1) common.push('עוסק פטור ועוסק מורשה הם מבנה של יחיד; כשיש כמה שותפים בוחנים בדרך כלל מבנה אחר, כמו שותפות או חברה.');

  const patur: Structure = {
    id: 'patur',
    name: 'עוסק פטור',
    status_text: overCeiling ? 'לא מתאים לפי המחזור שהוזן' : 'המחזור שהוזן אינו עולה על התקרה שפורסמה',
    points: [
      `תקרת מחזור שנתי שפורסמה: ${ceiling.toLocaleString('he-IL')} ₪.`,
      'עוסק פטור אינו גובה מע״מ מלקוחותיו ואינו מנכה מע״מ תשומות.',
      ...common,
    ],
    simulation: overCeiling ? null : sim,
    simulation_text: overCeiling ? 'הסימולציה לא מוצגת: המחזור עולה על התקרה.' : null,
  };
  const murshe: Structure = {
    id: 'murshe',
    name: 'עוסק מורשה',
    status_text: 'אין מגבלת מחזור לפי הנתונים שפורסמו',
    points: [
      `עוסק מורשה גובה מע״מ בשיעור ${Math.round(rates.vat.standard_rate * 100)}% ומנכה מע״מ תשומות.`,
      'הסימולציה זהה לעוסק פטור מבחינת מס הכנסה וביטוח לאומי; ההבדל הוא בחובות המע״מ. המחזור מוזן לפני מע״מ.',
      ...common,
    ],
    simulation: sim,
    simulation_text: null,
  };
  const company: Structure = {
    id: 'company',
    name: 'חברה בע״מ',
    status_text: 'לא זמין — אין נתוני מיסוי חברה בקבצי הנתונים',
    points: [
      `סוג הלקוחות שסומן: ${CUSTOMER_LABEL[i.customers]} (אינו משפיע על הסימולציה).`,
      'חברה היא ישות משפטית נפרדת מבעליה; מבנה זה נבחן לעיתים כשיש שותפים, או כשרוצים הפרדה בין רכוש פרטי לעסקי.',
      ...(i.risk !== 'low' ? ['רמת החשיפה שסומנה עשויה להיות רלוונטית להשוואה בין המבנים.'] : []),
    ],
    simulation: null,
    simulation_text: 'לא זמין — אין נתוני מיסוי חברה בקבצי הנתונים.',
  };
  return {
    turnover_annual: round2(annual),
    structures: [patur, murshe, company],
    assumptions: [
      'מידע כללי בלבד: סיכום ניטרלי של מאפיינים לפי התשובות, ללא המלצה ולא ייעוץ משפטי או מיסויי.',
      'סימולציית הנטו משתמשת במנוע הנטו לעצמאי (שיעורי עובד משולבים כקירוב לביטוח לאומי ומס בריאות; בלי הפקדות לפנסיה).',
      'לא נלקחות בחשבון נסיבות אישיות כמו תושבות מס או פעילות בחו״ל. ההחלטה הסופית נעשית עם רואה חשבון או יועץ מס.',
    ],
    warnings: overCeiling ? ['המחזור עולה על תקרת עוסק פטור שפורסמה.'] : [],
  };
}
