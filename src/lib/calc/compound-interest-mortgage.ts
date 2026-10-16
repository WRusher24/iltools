// K12 - compound interest and basic loan amortisation. The rate is ALWAYS user-entered.
import type { RatesFile } from '../rates';
import { checkNum, checkOneOf, done, num0, round2, type Validation } from './common';

export type Mode = 'compound' | 'loan';
export type RateBasis = 'nominal_monthly' | 'effective_annual';

export interface Inputs {
  mode: Mode;
  /** initial balance (compound) or loan principal (loan) */
  amount: number;
  monthly_deposit: number;
  annual_rate_pct: number;
  rate_basis: RateBasis;
  years: number;
}
export const INPUT_DEFAULTS: Inputs = { mode: 'compound', amount: NaN, monthly_deposit: 0, annual_rate_pct: NaN, rate_basis: 'nominal_monthly', years: NaN };

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  checkOneOf(e, i, 'mode', ['compound', 'loan']);
  checkOneOf(e, i, 'rate_basis', ['nominal_monthly', 'effective_annual']);
  checkNum(e, i, 'amount', { label: i.mode === 'loan' ? 'סכום הלוואה' : 'יתרה התחלתית', required: true, min: 0 });
  checkNum(e, i, 'monthly_deposit', { label: 'הפקדה חודשית', min: 0 });
  checkNum(e, i, 'annual_rate_pct', { label: 'ריבית שנתית', required: true, min: 0, max: 100 });
  checkNum(e, i, 'years', { label: 'שנים', required: true, gt: 0, max: 100 });
  if (i.mode === 'loan' && !e.amount && !(num0(i.amount) > 0)) e.amount = 'סכום ההלוואה חייב להיות גדול מ-0';
  return done(e);
}

/** Monthly rate from the entered annual rate. */
export function monthlyRate(annualPct: number, basis: RateBasis): number {
  const r = Math.max(0, num0(annualPct)) / 100;
  return basis === 'effective_annual' ? Math.pow(1 + r, 1 / 12) - 1 : r / 12;
}

export interface YearRow {
  year: number;
  /** compound: contributions so far / loan: principal paid in the year */
  principal: number;
  interest: number;
  /** compound: balance / loan: remaining balance */
  balance: number;
}

export interface Result {
  mode: Mode;
  months: number;
  monthly_rate: number;
  // compound
  final_balance: number | null;
  total_deposits: number | null;
  total_interest: number;
  // loan
  monthly_payment: number | null;
  total_paid: number | null;
  rows: YearRow[];
  assumptions: string[];
  warnings: string[];
}

/** Standard annuity (Spitzer) payment; handles zero rate. */
export function annuityPayment(principal: number, i: number, n: number): number {
  if (n <= 0) return 0;
  if (!(i > 1e-12)) return principal / n;
  // 1 - (1+i)^-n computed with expm1/log1p for precision at tiny rates
  return (principal * i) / -Math.expm1(-n * Math.log1p(i));
}

export function calculate(inp: Inputs, _rates?: RatesFile): Result {
  const months = Math.max(0, Math.round(num0(inp.years) * 12));
  const i = monthlyRate(inp.annual_rate_pct, inp.rate_basis);
  const rows: YearRow[] = [];
  const warnings: string[] = [];
  const common = [
    'הריבית שהוזנה היא נתון של המשתמש להמחשה בלבד; האתר אינו מספק ריבית משכנתא, פריים או אשראי.',
    'ריבית נומינלית שנתית מחולקת ל-12; ריבית אפקטיבית שנתית מומרת לריבית חודשית שקולה. הריבית קבועה לאורך התקופה.',
    'לא כולל עמלות, ביטוחים, הצמדה או ריבית משתנה. אין כאן הצעה או שיווק של אשראי.',
  ];
  if (inp.mode === 'compound') {
    let bal = num0(inp.amount);
    let dep = bal;
    let intr = 0;
    let yInt = 0;
    for (let m = 1; m <= months; m++) {
      const gain = bal * i;
      bal += gain + num0(inp.monthly_deposit);
      dep += num0(inp.monthly_deposit);
      intr += gain;
      yInt += gain;
      if (m % 12 === 0 || m === months) {
        rows.push({ year: Math.round((m / 12) * 100) / 100, principal: round2(dep), interest: round2(yInt), balance: round2(bal) });
        yInt = 0;
      }
    }
    return {
      mode: 'compound',
      months,
      monthly_rate: i,
      final_balance: round2(bal),
      total_deposits: round2(dep),
      total_interest: round2(intr),
      monthly_payment: null,
      total_paid: null,
      rows,
      assumptions: [...common, 'הריבית מצטרפת ליתרה מדי חודש; ההפקדה החודשית מתווספת בסוף החודש.'],
      warnings,
    };
  }
  const P = num0(inp.amount);
  const pay = annuityPayment(P, i, months);
  let bal = P;
  let yInt = 0;
  let yPrin = 0;
  for (let m = 1; m <= months; m++) {
    const it = bal * i;
    const pr = pay - it;
    bal = Math.max(0, bal - pr);
    yInt += it;
    yPrin += pr;
    if (m % 12 === 0 || m === months) {
      rows.push({ year: Math.round((m / 12) * 100) / 100, principal: round2(yPrin), interest: round2(yInt), balance: m === months ? 0 : round2(bal) });
      yInt = 0;
      yPrin = 0;
    }
  }
  return {
    mode: 'loan',
    months,
    monthly_rate: i,
    final_balance: null,
    total_deposits: null,
    // displayed payment is rounded to the agora; totals are consistent with it
    total_interest: round2(round2(pay) * months - P),
    monthly_payment: round2(pay),
    total_paid: round2(round2(pay) * months),
    rows,
    assumptions: [...common, 'החזר חודשי קבוע (לוח שפיצר) בסוף כל חודש.'],
    warnings,
  };
}
