// K11 - turnover vs. the osek-patur ceiling in rates.vat.
import type { RatesFile } from '../rates';
import { checkNum, checkOneOf, done, MONTHS_PER_YEAR, num0, round2, type Validation } from './common';

export type Mode = 'monthly' | 'annual';
export interface Inputs {
  mode: Mode;
  turnover: number;
}
export const INPUT_DEFAULTS: Inputs = { mode: 'monthly', turnover: NaN };

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'turnover', { label: 'מחזור', required: true, min: 0 });
  checkOneOf(e, i, 'mode', ['monthly', 'annual']);
  return done(e);
}

export interface Result {
  turnover_annual: number;
  ceiling: number;
  /** ceiling - turnover (negative when above) */
  gap: number;
  direction: 'below' | 'above' | 'equal';
  usage_ratio: number;
  vat_rate: number;
  /** multiplier to apply to a pre-VAT price after moving to osek murshe */
  price_with_vat_factor: number;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const annual = i.mode === 'monthly' ? num0(i.turnover) * MONTHS_PER_YEAR : num0(i.turnover);
  const ceiling = rates.vat.osek_patur_ceiling_annual;
  const direction = annual > ceiling ? 'above' : annual < ceiling ? 'below' : 'equal';
  const warnings: string[] = [];
  if (direction === 'above') warnings.push('המחזור עולה על תקרת עוסק פטור שפורסמה. יש לבדוק מול רשות המסים או רואה חשבון.');
  return {
    turnover_annual: round2(annual),
    ceiling,
    gap: round2(ceiling - annual),
    direction,
    usage_ratio: ceiling > 0 ? Math.round((annual / ceiling) * 10000) / 10000 : 0,
    vat_rate: rates.vat.standard_rate,
    price_with_vat_factor: 1 + rates.vat.standard_rate,
    assumptions: [
      'מחזור שנתי = מחזור חודשי כפול 12 (כאשר הוזן מחזור חודשי).',
      'המחשבון בודק רק את תקרת המחזור, לא זכאות בפועל או חריגים; התקרה מתעדכנת מעת לעת.',
      'המעבר לעוסק מורשה משנה את מבנה המחיר ללקוח (תוספת מע״מ) ומאפשר ניכוי מע״מ תשומות.',
    ],
    warnings,
  };
}
