// K5 - VAT. Uses rates.vat.standard_rate only.
import type { RatesFile } from '../rates';
import { checkNum, checkOneOf, done, num0, round2, type Validation } from './common';

export type Mode = 'exclusive' | 'inclusive';
export interface Inputs {
  amount: number;
  mode: Mode;
  /** input VAT (purchases), ILS amount */
  inputs_vat: number;
  /** output VAT (sales), ILS amount */
  outputs_vat: number;
  osek_patur: boolean;
}
export const INPUT_DEFAULTS: Inputs = { amount: NaN, mode: 'exclusive', inputs_vat: 0, outputs_vat: 0, osek_patur: false };

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkNum(e, i, 'amount', { label: 'סכום', required: true, min: 0 });
  checkNum(e, i, 'inputs_vat', { label: 'מע״מ תשומות', min: 0 });
  checkNum(e, i, 'outputs_vat', { label: 'מע״מ תפוקות', min: 0 });
  checkOneOf(e, i, 'mode', ['exclusive', 'inclusive']);
  return done(e);
}

/** Split an amount into net/vat/gross. All values rounded to the agora; net + vat === gross exactly. */
export function splitVat(amount: number, mode: Mode, rate: number): { net: number; vat: number; gross: number } {
  const a = round2(Math.max(0, amount));
  if (mode === 'exclusive') {
    const vat = round2(a * rate);
    return { net: a, vat, gross: round2(a + vat) };
  }
  const net = round2(a / (1 + rate));
  return { net, vat: round2(a - net), gross: a };
}

export interface Result {
  rate: number;
  net: number;
  vat: number;
  gross: number;
  balance: number;
  /** 'pay' = output > input, 'refund' = input > output, 'zero' */
  balance_direction: 'pay' | 'refund' | 'zero';
  osek_patur: boolean;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, rates: RatesFile): Result {
  const r = rates.vat.standard_rate;
  const s = splitVat(num0(i.amount), i.mode, r);
  const balance = round2(num0(i.outputs_vat) - num0(i.inputs_vat));
  const warnings: string[] = [];
  if (i.osek_patur) warnings.push('עוסק פטור אינו גובה מע״מ ואינו מנכה מע״מ תשומות; התוצאה מוצגת להמחשה בלבד.');
  return {
    rate: r,
    ...s,
    balance,
    balance_direction: balance > 0 ? 'pay' : balance < 0 ? 'refund' : 'zero',
    osek_patur: i.osek_patur,
    assumptions: [
      'שיעור המע״מ הוא השיעור הרגיל שפורסם בנתונים; לא מטופלים שיעור אפס, פטורים, מע״מ על רכב ותקופת דיווח.',
      'כל הסכומים מעוגלים לאגורה; סכום לפני מע״מ ועוד מע״מ שווה לסכום הכולל.',
      'יתרת מע״מ = מע״מ תפוקות פחות מע״מ תשומות (חיובי: לתשלום; שלילי: להחזר). הסכומים מוזנים ידנית.',
    ],
    warnings,
  };
}
