// Tool - bank fee checker. User enters fee lines; compared with published fee data ONLY when present in business-banking.json.
import type { RatesFile } from '../rates';
import { checkNum, done, num0, round2, type Validation } from './common';
import { readProviders } from './providers';

export const FEE_LINES = 8;
export type FeeCategory = 'management' | 'actions' | 'cards' | 'payments' | 'other';
export const CATEGORY_LABEL: Record<FeeCategory, string> = { management: 'ניהול חשבון', actions: 'פעולות', cards: 'כרטיסים', payments: 'תשלומים והעברות', other: 'אחר' };
export type Inputs = Record<string, string | number | boolean>;

export const INPUT_DEFAULTS: Inputs = (() => {
  const d: Inputs = {};
  for (let n = 1; n <= FEE_LINES; n++) {
    d[`name_${n}`] = '';
    d[`cat_${n}`] = 'other';
    d[`amount_${n}`] = NaN;
    d[`freq_${n}`] = 'monthly';
  }
  return d;
})();

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  let any = false;
  for (let n = 1; n <= FEE_LINES; n++) {
    checkNum(e, i, `amount_${n}`, { label: 'סכום', min: 0 });
    const a = i[`amount_${n}`];
    if (typeof a === 'number' && Number.isFinite(a) && a > 0) any = true;
  }
  if (!any && Object.keys(e).length === 0) e.amount_1 = 'יש להזין לפחות סעיף עמלה אחד';
  return done(e);
}

export interface LineOut {
  n: number;
  name: string;
  category: FeeCategory;
  amount: number;
  frequency: 'monthly' | 'annual';
  monthly: number;
  annual: number;
}
export interface Result {
  lines: LineOut[];
  total_monthly: number;
  total_annual: number;
  by_category: { category: FeeCategory; label: string; monthly: number }[];
  /** lines worth asking the bank about */
  review: { n: number; name: string; annual: number; reasons: string[] }[];
  comparison_available: boolean;
  benchmarks: { provider_name: string; monthly_minimum: number | null; setup_fee: number | null }[];
  comparison_text: string;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, _rates?: RatesFile, extra?: { businessBanking?: unknown[] }): Result {
  const lines: LineOut[] = [];
  for (let n = 1; n <= FEE_LINES; n++) {
    const a = i[`amount_${n}`];
    if (typeof a !== 'number' || !Number.isFinite(a) || a <= 0) continue;
    const freq = i[`freq_${n}`] === 'annual' ? 'annual' : 'monthly';
    const cat = (String(i[`cat_${n}`]) in CATEGORY_LABEL ? i[`cat_${n}`] : 'other') as FeeCategory;
    const monthly = freq === 'annual' ? a / 12 : a;
    lines.push({ n, name: String(i[`name_${n}`] ?? '').trim(), category: cat, amount: round2(a), frequency: freq, monthly: round2(monthly), annual: round2(monthly * 12) });
  }
  const totalM = lines.reduce((s, l) => s + (l.frequency === 'annual' ? l.amount / 12 : l.amount), 0);
  const byCat = (Object.keys(CATEGORY_LABEL) as FeeCategory[])
    .map((c) => ({ category: c, label: CATEGORY_LABEL[c], monthly: round2(lines.filter((l) => l.category === c).reduce((s, l) => s + (l.frequency === 'annual' ? l.amount / 12 : l.amount), 0)) }))
    .filter((c) => c.monthly > 0);
  const nameCount = new Map<string, number>();
  for (const l of lines) if (l.name) nameCount.set(l.name, (nameCount.get(l.name) ?? 0) + 1);
  const review = [...lines]
    .sort((a, b) => b.annual - a.annual)
    .map((l) => {
      const reasons: string[] = [];
      if (!l.name) reasons.push('שורה ללא שם — כדאי לברר מה מהות החיוב');
      if ((nameCount.get(l.name) ?? 0) > 1) reasons.push('שם סעיף שחוזר יותר מפעם אחת');
      return { n: l.n, name: l.name || `שורה ${l.n}`, annual: l.annual, reasons };
    });
  const providers = readProviders(extra?.businessBanking);
  const benchmarks = providers
    .filter((p) => p.fees.monthly_minimum !== null || p.fees.setup_fee !== null)
    .map((p) => ({ provider_name: p.name, monthly_minimum: p.fees.monthly_minimum, setup_fee: p.fees.setup_fee }));
  const available = benchmarks.length > 0;
  return {
    lines,
    total_monthly: round2(totalM),
    total_annual: round2(totalM * 12),
    by_category: byCat,
    review,
    comparison_available: available,
    benchmarks,
    comparison_text: available ? 'נתונים שפורסמו על עמלות בנקים מוצגים לצד הסכומים שהוזנו, לצורך מידע בלבד.' : 'אין נתון ציבורי מאומת להשוואה',
    assumptions: [
      'ההזנה ידנית; הכלי אינו מתחבר לחשבון הבנק ואינו קורא קבצים.',
      'עמלות בנק לעסק אינן מפורסמות בנתוני האתר כסכומים קבועים, ולכן אין השוואה מחייבת; סכום שנתי הוא סכום חודשי כפול 12.',
      'הפלט הוא רשימת בדיקות לבירור מול הבנק ואינו המלצה לעבור בנק.',
    ],
    warnings: num0(totalM) > 0 && !available ? ['לא קיים נתון ציבורי מאומת להשוואה: אין קביעה אם הסכומים גבוהים או נמוכים.'] : [],
  };
}
