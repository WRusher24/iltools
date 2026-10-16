// Tool - business setup cost adder. NO cost data exists in /data, so every amount is USER-ENTERED; nothing is estimated.
import type { RatesFile } from '../rates';
import { checkNum, checkOneOf, done, num0, round2, type Validation } from './common';

export type BizStatus = 'patur' | 'murshe' | 'company';
export interface SetupItem {
  id: string;
  label: string;
  statuses: BizStatus[];
  /** optional comparison page hint (key into the host's compare links) */
  compare?: 'invoicing' | 'clearing' | 'business-banking';
}
export const SETUP_ITEMS: SetupItem[] = [
  { id: 'registration', label: 'רישום העסק (מס הכנסה, מע״מ, ביטוח לאומי)', statuses: ['patur', 'murshe', 'company'] },
  { id: 'company_registration', label: 'רישום חברה בע״מ', statuses: ['company'] },
  { id: 'invoicing', label: 'תוכנת חשבוניות', statuses: ['patur', 'murshe', 'company'], compare: 'invoicing' },
  { id: 'clearing', label: 'סליקת אשראי', statuses: ['patur', 'murshe', 'company'], compare: 'clearing' },
  { id: 'bank', label: 'חשבון בנק עסקי', statuses: ['patur', 'murshe', 'company'], compare: 'business-banking' },
  { id: 'accountant', label: 'רואה חשבון / יועץ מס', statuses: ['patur', 'murshe', 'company'] },
  { id: 'insurance', label: 'ביטוחים עסקיים', statuses: ['patur', 'murshe', 'company'] },
  { id: 'other', label: 'הוצאה אחרת', statuses: ['patur', 'murshe', 'company'] },
];

export type Inputs = { status: BizStatus } & Record<string, string | number | boolean>;

export const INPUT_DEFAULTS: Inputs = (() => {
  const d: Inputs = { status: 'patur' };
  for (const it of SETUP_ITEMS) {
    d[`inc_${it.id}`] = true;
    d[`once_${it.id}`] = NaN;
    d[`monthly_${it.id}`] = NaN;
  }
  return d;
})();

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkOneOf(e, i, 'status', ['patur', 'murshe', 'company']);
  for (const it of SETUP_ITEMS) {
    checkNum(e, i, `once_${it.id}`, { label: it.label, min: 0 });
    checkNum(e, i, `monthly_${it.id}`, { label: it.label, min: 0 });
  }
  return done(e);
}

export interface ItemRow {
  id: string;
  label: string;
  included: boolean;
  once: number | null;
  monthly: number | null;
  missing: boolean;
  compare?: SetupItem['compare'];
}
export interface Result {
  rows: ItemRow[];
  total_once: number;
  total_monthly: number;
  total_first_year: number;
  missing_labels: string[];
  company_note: string | null;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, _rates?: RatesFile): Result {
  const status = i.status as BizStatus;
  const rows: ItemRow[] = SETUP_ITEMS.filter((it) => it.statuses.includes(status)).map((it) => {
    const included = i[`inc_${it.id}`] !== false;
    const o = i[`once_${it.id}`];
    const m = i[`monthly_${it.id}`];
    const once = typeof o === 'number' && Number.isFinite(o) ? o : null;
    const monthly = typeof m === 'number' && Number.isFinite(m) ? m : null;
    return { id: it.id, label: it.label, included, once, monthly, missing: included && once === null && monthly === null, compare: it.compare };
  });
  const inc = rows.filter((r) => r.included);
  const once = inc.reduce((s, r) => s + num0(r.once), 0);
  const monthly = inc.reduce((s, r) => s + num0(r.monthly), 0);
  return {
    rows,
    total_once: round2(once),
    total_monthly: round2(monthly),
    total_first_year: round2(once + monthly * 12),
    missing_labels: rows.filter((r) => r.missing).map((r) => r.label),
    company_note: status === 'company' ? 'עלויות חברה בע״מ (אגרות, שכר טרחה, דוחות שנתיים) אינן בנתוני האתר — לא זמין. יש להזינן ידנית.' : null,
    assumptions: [
      'אין בנתוני האתר עלויות להקמת עסק (רישום, שכר טרחה, ביטוחים, בנק); כל הסכומים בכלי הם סכומים שהזנתם בעצמכם ואינם הערכה של האתר.',
      'סעיף שלא הוזן בו סכום מסומן כ״לא הוזן״ ואינו נספר.',
      'סכום שנה ראשונה = עלויות חד-פעמיות + עלויות חודשיות כפול 12. מחירים לפני מע״מ מופיעים בהשוואות; יש להוסיף מע״מ לפי הצורך.',
    ],
    warnings: [],
  };
}
