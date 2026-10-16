// K3 - clearing (acquiring) fee comparison. Uses ONLY providers with published fee structures from provider data.
import type { RatesFile } from '../rates';
import { checkNum, done, MONTHS_PER_YEAR, num0, round2, type Validation } from './common';
import { readProviders } from './providers';

export interface Inputs {
  monthly_turnover: number;
  avg_basket: number;
}
export const INPUT_DEFAULTS: Inputs = { monthly_turnover: NaN, avg_basket: NaN };

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'monthly_turnover', { label: 'מחזור חודשי', required: true, min: 0 });
  checkNum(e, i, 'avg_basket', { label: 'סל ממוצע', required: true, gt: 0 });
  return done(e);
}

export interface FeeRow {
  provider_id: string;
  provider_name: string;
  plan_name: string | null;
  percent: number;
  fixed_per_transaction: number | null;
  plan_fee_monthly: number;
  variable_fee: number;
  fixed_fee: number;
  /** before VAT */
  total_monthly: number;
  total_annual: number;
  total_monthly_incl_vat: number | null;
  setup_fee: number | null;
  confidence: string | null;
  notes: string[];
}
export interface Excluded {
  provider_id: string;
  provider_name: string;
  plan_name: string | null;
  reason: string;
}
export interface Result {
  transactions: number;
  rows: FeeRow[];
  quote_only: { provider_id: string; provider_name: string; label: string }[];
  excluded: Excluded[];
  vat_rate: number;
  available: boolean;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile, extra?: { clearing?: unknown[] }): Result {
  const providers = readProviders(extra?.clearing);
  const turnover = num0(i.monthly_turnover);
  const basket = num0(i.avg_basket);
  const txns = basket > 0 ? Math.max(turnover > 0 ? 1 : 0, Math.round(turnover / basket)) : 0;
  const rows: FeeRow[] = [];
  const quote_only: Result['quote_only'] = [];
  const excluded: Excluded[] = [];
  const vat = rates.vat.standard_rate;

  for (const p of providers) {
    if (p.pricing_model === 'quote_only' || p.fees.percent_per_transaction === null) {
      quote_only.push({ provider_id: p.id, provider_name: p.name, label: 'הצעת מחיר בלבד — לא נכלל בחישוב' });
      continue;
    }
    if (p.currency && p.currency !== 'ILS') {
      excluded.push({ provider_id: p.id, provider_name: p.name, plan_name: null, reason: 'התמחור פורסם במטבע שאינו שקל' });
      continue;
    }
    const pct = p.fees.percent_per_transaction;
    const variable = (turnover * pct) / 100;
    const fixed = txns * (p.fees.fixed_per_transaction ?? 0);
    const base = Math.max(variable + fixed, p.fees.monthly_minimum ?? 0);
    const options: { plan: string | null; fee: number; note?: string; limit: number | null }[] = [];
    if (p.plans.length === 0) options.push({ plan: null, fee: 0, limit: null });
    for (const pl of p.plans) {
      if (pl.price_monthly === null) {
        excluded.push({ provider_id: p.id, provider_name: p.name, plan_name: pl.name, reason: 'אין מחיר חודשי מפורסם למסלול' });
        continue;
      }
      options.push({
        plan: pl.name,
        fee: pl.price_monthly,
        limit: pl.transactions_per_month,
        note: pl.billing_cycle === 'annual' ? 'מחיר חודשי בהתחייבות שנתית' : undefined,
      });
    }
    for (const o of options) {
      if (o.limit !== null && txns > o.limit) {
        excluded.push({ provider_id: p.id, provider_name: p.name, plan_name: o.plan, reason: `מספר העסקאות החודשי (${txns}) עולה על מכסת המסלול (${o.limit})` });
        continue;
      }
      const notes: string[] = [];
      if (o.note) notes.push(o.note);
      if (p.vat_included === false) notes.push('המחירים לפני מע״מ');
      else if (p.vat_included === null) notes.push('לא ידוע אם המחיר כולל מע״מ');
      if (p.confidence === 'low') notes.push('שיעור התחלתי/בביטחון נמוך — בפועל הצעת מחיר');
      if (p.plans.length > 0) notes.push('העמלה האחוזית פורסמה ברמת הספק; שיעור המסלול עשוי להיות שונה');
      const total = base + o.fee;
      rows.push({
        provider_id: p.id,
        provider_name: p.name,
        plan_name: o.plan,
        percent: pct,
        fixed_per_transaction: p.fees.fixed_per_transaction,
        plan_fee_monthly: round2(o.fee),
        variable_fee: round2(variable),
        fixed_fee: round2(fixed),
        total_monthly: round2(total),
        total_annual: round2(total * MONTHS_PER_YEAR),
        total_monthly_incl_vat: p.vat_included === false ? round2(total * (1 + vat)) : null,
        setup_fee: p.fees.setup_fee,
        confidence: p.confidence,
        notes,
      });
    }
  }
  rows.sort((a, b) => a.total_monthly - b.total_monthly || a.provider_name.localeCompare(b.provider_name, 'he'));
  return {
    transactions: txns,
    rows,
    quote_only,
    excluded,
    vat_rate: vat,
    available: providers.length > 0,
    assumptions: [
      'מספר העסקאות מחושב כמחזור חודשי חלקי סל ממוצע (מעוגל).',
      'העלות = עמלה אחוזית מהמחזור + סכום קבוע לעסקה (אם פורסם) + דמי מנוי חודשיים של המסלול. עמלות על תשלומים, כרטיס זר, זיכוי והחזר חיוב אינן נכללות.',
      'נכללים רק ספקים עם מבנה עמלות שפורסם; ספקים בהצעת מחיר בלבד מופיעים ברשימה נפרדת ואינם נכללים בחישוב. הסדר הוא לפי עלות חודשית בלבד.',
      'המחירים כפי שפורסמו, לפי תאריך הנתונים; יש לאמת מול הספק. אין בטבלה המלצה על ספק.',
    ],
    warnings: providers.length === 0 ? ['נתוני הספקים אינם זמינים כרגע (לא זמין).'] : [],
  };
}
