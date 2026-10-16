// K4 - invoicing software cost by documents/month and feature fit. Ordering by cost only (never by commission).
import type { RatesFile } from '../rates';
import { checkNum, done, MONTHS_PER_YEAR, num0, round2, type Validation } from './common';
import { readProviders } from './providers';

export interface Inputs {
  docs_per_month: number;
  users: number;
  need_api: boolean;
  need_allocation: boolean;
}
export const INPUT_DEFAULTS: Inputs = { docs_per_month: NaN, users: 1, need_api: false, need_allocation: false };

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'docs_per_month', { label: 'מסמכים בחודש', required: true, min: 0, integer: true });
  checkNum(e, i, 'users', { label: 'משתמשים', required: true, min: 1, integer: true });
  return done(e);
}

export interface PlanRow {
  provider_id: string;
  provider_name: string;
  plan_id: string;
  plan_name: string;
  price_monthly: number | null;
  /** published annual price, or monthly x 12 when none is published (see `annual_derived`) */
  annual_base: number;
  annual_derived: boolean;
  extra_documents: number;
  extra_documents_cost_monthly: number;
  total_monthly_equivalent: number;
  total_annual: number;
  total_annual_incl_vat: number | null;
  vat_note: string;
  notes: string[];
}
export interface Rejected {
  provider_id: string;
  provider_name: string;
  plan_name: string | null;
  reason: string;
}
export interface Result {
  rows: PlanRow[];
  cheapest: PlanRow | null;
  rejected: Rejected[];
  quote_only: { provider_id: string; provider_name: string }[];
  available: boolean;
  vat_rate: number;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile, extra?: { invoicing?: unknown[] }): Result {
  const providers = readProviders(extra?.invoicing);
  const docs = num0(i.docs_per_month);
  const users = Math.max(1, num0(i.users));
  const rows: PlanRow[] = [];
  const rejected: Rejected[] = [];
  const quote_only: Result['quote_only'] = [];
  const vat = rates.vat.standard_rate;

  for (const p of providers) {
    if (p.pricing_model === 'quote_only' || p.plans.length === 0) {
      quote_only.push({ provider_id: p.id, provider_name: p.name });
      continue;
    }
    if (p.currency && p.currency !== 'ILS') {
      rejected.push({ provider_id: p.id, provider_name: p.name, plan_name: null, reason: 'התמחור פורסם במטבע שאינו שקל (ולפי משתמש/שנה); לא נכלל' });
      continue;
    }
    if (i.need_api && p.feature_api !== true) {
      rejected.push({ provider_id: p.id, provider_name: p.name, plan_name: null, reason: p.feature_api === null ? 'לא ידוע אם קיים API' : 'אין API' });
      continue;
    }
    if (i.need_allocation && p.feature_allocation !== true) {
      rejected.push({ provider_id: p.id, provider_name: p.name, plan_name: null, reason: p.feature_allocation === null ? 'לא ידועה תמיכה במספר הקצאה' : 'אין תמיכה במספר הקצאה' });
      continue;
    }
    for (const pl of p.plans) {
      if (pl.billing_cycle === 'usage') {
        rejected.push({ provider_id: p.id, provider_name: p.name, plan_name: pl.name, reason: 'תמחור לפי שימוש; ראו הערות הספק — לא מחושב כאן' });
        continue;
      }
      if (pl.price_monthly === null && pl.price_annually === null) {
        rejected.push({ provider_id: p.id, provider_name: p.name, plan_name: pl.name, reason: 'אין מחיר מפורסם' });
        continue;
      }
      if (pl.users !== null && users > pl.users) {
        rejected.push({ provider_id: p.id, provider_name: p.name, plan_name: pl.name, reason: `מוגבל ל-${pl.users} משתמשים` });
        continue;
      }
      let extraDocs = 0;
      let extraCost = 0;
      if (pl.documents_per_month !== null && docs > pl.documents_per_month) {
        if (pl.extra_document_cost === null) {
          rejected.push({ provider_id: p.id, provider_name: p.name, plan_name: pl.name, reason: `מכסה של ${pl.documents_per_month} מסמכים בחודש ואין עלות מסמך חריג מפורסמת` });
          continue;
        }
        extraDocs = docs - pl.documents_per_month;
        extraCost = extraDocs * pl.extra_document_cost;
      }
      const annualDerived = pl.price_annually === null;
      const annualBase = pl.price_annually ?? (pl.price_monthly as number) * MONTHS_PER_YEAR;
      const totalAnnual = annualBase + extraCost * MONTHS_PER_YEAR;
      const notes: string[] = [];
      if (annualDerived) notes.push('מחיר שנתי חושב כמחיר חודשי כפול 12 (לא פורסם מחיר שנתי)');
      if (pl.notes) notes.push(pl.notes);
      const vatNote = p.vat_included === false ? 'המחירים לפני מע״מ' : p.vat_included === true ? 'המחירים כוללים מע״מ' : 'לא ידוע אם המחירים כוללים מע״מ';
      rows.push({
        provider_id: p.id,
        provider_name: p.name,
        plan_id: pl.id,
        plan_name: pl.name,
        price_monthly: pl.price_monthly,
        annual_base: round2(annualBase),
        annual_derived: annualDerived,
        extra_documents: extraDocs,
        extra_documents_cost_monthly: round2(extraCost),
        total_monthly_equivalent: round2(totalAnnual / MONTHS_PER_YEAR),
        total_annual: round2(totalAnnual),
        total_annual_incl_vat: p.vat_included === false ? round2(totalAnnual * (1 + vat)) : null,
        vat_note: vatNote,
        notes,
      });
    }
  }
  rows.sort((a, b) => a.total_annual - b.total_annual || a.provider_name.localeCompare(b.provider_name, 'he'));
  return {
    rows,
    cheapest: rows[0] ?? null,
    rejected,
    quote_only,
    available: providers.length > 0,
    vat_rate: vat,
    assumptions: [
      'מוצגים רק מסלולים שעומדים במספר המסמכים, במספר המשתמשים וביכולות שנבחרו. מסמך חריג מחושב לפי עלות המסמך הנוספת שפורסמה.',
      'עלות שנתית = המחיר השנתי שפורסם (אם קיים), אחרת מחיר חודשי כפול 12. מחיר חודשי בהתחייבות חודשית עשוי להיות גבוה יותר.',
      'הדירוג הוא לפי עלות שנתית והתאמת יכולות בלבד, ולא לפי עמלות או תגמול כלשהו. אין בטבלה המלצה על ספק.',
      'ספקים עם תמחור בהצעת מחיר בלבד מופיעים ברשימה נפרדת. תוספות (למשל מודול API) נכללות רק אם פורסמו בצורה ברורה ואינן מחושבות כאן.',
    ],
    warnings: providers.length === 0 ? ['נתוני הספקים אינם זמינים כרגע (לא זמין).'] : [],
  };
}
