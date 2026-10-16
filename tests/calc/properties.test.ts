import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { incomeTaxByBrackets, incomeTaxAfterCredits, niMonthly, atzmaiNet as k1, salaryNet as k6, vat as k5, compoundInterestMortgage as k12, taxCalendar as tc } from '@/lib/calc';
import { rates } from './helpers';

const income = fc.integer({ min: 0, max: 5_000_000 });

describe('properties', () => {
  it('gross income tax is monotonic non-decreasing and never negative', () => {
    fc.assert(
      fc.property(income, income, (a, b) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        const tLo = incomeTaxByBrackets(lo, rates).total;
        const tHi = incomeTaxByBrackets(hi, rates).total;
        expect(tLo).toBeGreaterThanOrEqual(0);
        expect(tHi).toBeGreaterThanOrEqual(tLo);
      }),
    );
  });
  it('tax after credits (with surtax) is monotonic and never negative', () => {
    fc.assert(
      fc.property(income, income, fc.double({ min: 0, max: 10, noNaN: true }), (a, b, pts) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        const tLo = incomeTaxAfterCredits(lo, pts, rates).income_tax;
        const tHi = incomeTaxAfterCredits(hi, pts, rates).income_tax;
        expect(tLo).toBeGreaterThanOrEqual(0);
        expect(tHi).toBeGreaterThanOrEqual(tLo - 1e-9);
      }),
    );
  });
  it('NI is monotonic and bounded by the ceiling charge', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 200_000 }), fc.integer({ min: 0, max: 200_000 }), (a, b) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        expect(niMonthly(hi, rates).total).toBeGreaterThanOrEqual(niMonthly(lo, rates).total);
        expect(niMonthly(hi, rates).total).toBeLessThanOrEqual(niMonthly(1e9, rates).total + 1e-9);
      }),
    );
  });
  it('K1 net is monotonic non-decreasing in revenue (sane range) and tax never negative', () => {
    fc.assert(
      fc.property(fc.integer({ min: 4000, max: 300_000 }), fc.integer({ min: 4000, max: 300_000 }), fc.integer({ min: 0, max: 3000 }), (a, b, pension) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        const mk = (rev: number) => k1.calculate({ ...k1.INPUT_DEFAULTS, revenue_monthly: rev, pension_deposit: pension }, rates);
        const rLo = mk(lo);
        const rHi = mk(hi);
        expect(rHi.net_monthly).toBeGreaterThanOrEqual(rLo.net_monthly);
        expect(rLo.income_tax_annual).toBeGreaterThanOrEqual(0);
        expect(rLo.ni_combined_monthly).toBeGreaterThanOrEqual(0);
      }),
    );
  });
  it('K6 net is monotonic non-decreasing in gross and tax never negative', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 400_000 }), fc.integer({ min: 0, max: 400_000 }), (a, b) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        const mk = (g: number) => k6.calculate({ ...k6.makeDefaults(rates), gross_monthly: g }, rates);
        expect(mk(hi).net_monthly).toBeGreaterThanOrEqual(mk(lo).net_monthly);
        expect(mk(lo).income_tax_monthly).toBeGreaterThanOrEqual(0);
      }),
    );
  });
  it('VAT split round-trips within 1 agora and net + vat = gross', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000_000 }), (cents) => {
        const amount = cents / 100;
        const ex = k5.splitVat(amount, 'exclusive', rates.vat.standard_rate);
        expect(Math.abs(ex.net + ex.vat - ex.gross)).toBeLessThan(0.0051);
        const back = k5.splitVat(ex.gross, 'inclusive', rates.vat.standard_rate);
        expect(Math.abs(back.net - ex.net)).toBeLessThanOrEqual(0.0100001);
        expect(Math.abs(back.net + back.vat - back.gross)).toBeLessThan(0.0051);
      }),
    );
  });
  it('compound interest is monotonic in rate and years', () => {
    const bal = (rate: number, years: number) => k12.calculate({ ...k12.INPUT_DEFAULTS, amount: 10000, monthly_deposit: 100, annual_rate_pct: rate, years }).final_balance!;
    fc.assert(
      fc.property(fc.double({ min: 0, max: 30, noNaN: true }), fc.double({ min: 0, max: 30, noNaN: true }), fc.integer({ min: 1, max: 40 }), (r1, r2_, years) => {
        const [lo, hi] = r1 <= r2_ ? [r1, r2_] : [r2_, r1];
        expect(bal(hi, years)).toBeGreaterThanOrEqual(bal(lo, years));
      }),
    );
    fc.assert(
      fc.property(fc.double({ min: 0, max: 30, noNaN: true }), fc.integer({ min: 1, max: 40 }), fc.integer({ min: 1, max: 40 }), (rate, y1, y2) => {
        const [lo, hi] = y1 <= y2 ? [y1, y2] : [y2, y1];
        expect(bal(rate, hi)).toBeGreaterThanOrEqual(bal(rate, lo));
      }),
    );
  });
  it('loan: payments cover principal (total paid >= principal) and ending balance is zero', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1000, max: 5_000_000 }), fc.double({ min: 0, max: 20, noNaN: true }), fc.integer({ min: 1, max: 40 }), (p, rate, years) => {
        const r = k12.calculate({ ...k12.INPUT_DEFAULTS, mode: 'loan', amount: p, annual_rate_pct: rate, years });
        expect(r.total_paid!).toBeGreaterThanOrEqual(p - 0.01 * years * 12);
        expect(r.rows.at(-1)!.balance).toBe(0);
      }),
    );
  });
  it('ics lines never exceed 75 octets', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 200 }), (s) => {
        const enc = new TextEncoder();
        for (const l of tc.icsFold(`SUMMARY:${s}`)) expect(enc.encode(l).length).toBeLessThanOrEqual(75);
      }),
    );
  });
});
