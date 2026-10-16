import { describe, expect, it } from 'vitest';
import { atzmaiNet as k1 } from '@/lib/calc';
import { rates, r2 } from './helpers';

const base: k1.Inputs = { ...k1.INPUT_DEFAULTS, revenue_monthly: 10000, expenses_monthly: 2000 };
const calc = (o: Partial<k1.Inputs>) => k1.calculate({ ...base, ...o }, rates);

describe('K1 atzmai-net', () => {
  it('profit 8000/month, 2.25 credit points (hand computed)', () => {
    const r = calc({});
    const taxAnnual = 84120 * 0.1 + 11880 * 0.14 - 2.25 * 2904; // 3541.2
    const ni = 7703 * 0.0427 + 297 * 0.1217; // 365.063
    expect(r.profit_annual).toBe(96000);
    expect(r.tax_before_credits).toBe(10075.2);
    expect(r.credits_value).toBe(6534);
    expect(r.income_tax_annual).toBe(r2(taxAnnual));
    expect(r.income_tax_monthly).toBe(295.1);
    expect(r.ni_combined_monthly).toBe(r2(ni));
    expect(r.net_monthly).toBe(r2(8000 - taxAnnual / 12 - ni));
    expect(r.health_tax).toBeNull();
  });

  it('tax below credit points is floored at 0; income below NI minimum is charged on the minimum', () => {
    const r = calc({ revenue_monthly: 3000, expenses_monthly: 0 });
    expect(r.income_tax_annual).toBe(0);
    expect(r.ni_combined_monthly).toBe(r2(3442 * 0.0427));
    expect(r.net_monthly).toBe(r2(3000 - 3442 * 0.0427));
    expect(r.warnings.some((w) => w.includes('מינימלית'))).toBe(true);
  });

  it('crosses several brackets (profit 25000/month)', () => {
    const r = calc({ revenue_monthly: 30000, expenses_monthly: 5000 });
    const taxBefore = 84120 * 0.1 + 36600 * 0.14 + 107280 * 0.2 + 72000 * 0.31; // 57312
    const tax = taxBefore - 6534; // 50778
    const ni = 7703 * 0.0427 + 17297 * 0.1217;
    expect(r.tax_before_credits).toBe(r2(taxBefore));
    expect(r.income_tax_annual).toBe(r2(tax));
    expect(r.ni_combined_monthly).toBe(r2(ni));
    expect(r.net_annual).toBe(r2(300000 - tax - ni * 12));
    expect(r.tax_by_bracket.map((b) => b.taxable)).toEqual([84120, 36600, 107280, 72000, 0, 0]);
  });

  it('caps NI at the monthly ceiling', () => {
    const r = calc({ revenue_monthly: 60000, expenses_monthly: 0 });
    expect(r.ni_combined_monthly).toBe(r2(7703 * 0.0427 + (51910 - 7703) * 0.1217));
  });

  it('pension deduction is limited to tax_deduction_rate of profit and warns when exceeded', () => {
    const r = calc({ revenue_monthly: 20000, expenses_monthly: 0, pension_deposit: 1000 });
    expect(r.pension_deduction_annual).toBe(r2(0.047 * 240000)); // 11280 < 12000
    const taxBefore = 84120 * 0.1 + 36600 * 0.14 + 107280 * 0.2 + (228720 - 228000) * 0.31;
    expect(r.income_tax_annual).toBe(r2(taxBefore - 6534));
    expect(r.warnings.some((w) => w.includes('פנסיה'))).toBe(true);
    expect(r.warnings).toContain('לפי הנתונים שפורסמו; יש לאמת מול מקור רשמי');
    expect(r.net_after_deposits_monthly).toBe(r2(r.net_monthly - 1000));
  });

  it('pension deposit below the cap is fully deducted', () => {
    const r = calc({ pension_deposit: 100 }); // 1200/yr < 0.047*96000
    expect(r.pension_deduction_annual).toBe(1200);
    expect(r.taxable_annual).toBe(94800);
  });

  it('extra monthly deductions reduce taxable income', () => {
    const r = calc({ deductions: 500 });
    expect(r.taxable_annual).toBe(90000);
    expect(r.income_tax_annual).toBe(r2(84120 * 0.1 + 5880 * 0.14 - 6534));
  });

  it('surtax applies above the threshold', () => {
    const r = calc({ revenue_monthly: 100000, expenses_monthly: 0 });
    const bracket = 8412 + 5124 + 21456 + 73200 * 0.31 + 259080 * 0.35 + (1200000 - 560280) * 0.47; // 448658.4
    const surtax = (1200000 - 721560) * 0.03; // 14353.2
    expect(r.surtax).toBe(r2(surtax));
    expect(r.income_tax_annual).toBe(r2(bracket - 6534 + surtax));
  });

  it('zero revenue gives zeros and no effective rate', () => {
    const r = calc({ revenue_monthly: 0, expenses_monthly: 0 });
    expect(r.net_monthly).toBe(0);
    expect(r.ni_combined_monthly).toBe(0);
    expect(r.effective_rate).toBeNull();
  });

  it('effective rate is (tax + NI) / profit', () => {
    const r = calc({});
    expect(r.effective_rate).toBe(Math.round(((3541.2 + (7703 * 0.0427 + 297 * 0.1217) * 12) / 96000) * 10000) / 10000);
  });

  it('warns for osek patur above the ceiling', () => {
    const r = calc({ status: 'patur', revenue_monthly: 11000, expenses_monthly: 0 });
    expect(r.warnings.some((w) => w.includes('פטור'))).toBe(true);
  });

  it('discloses the NI/health proxy assumption', () => {
    const r = calc({});
    expect(r.assumptions.join(' ')).toContain('קירוב שמרני');
  });

  it('validation: required, negative, expenses above revenue, bad enums', () => {
    expect(k1.validate(k1.INPUT_DEFAULTS).errors.revenue_monthly).toBe('שדה חובה');
    expect(k1.validate({ ...base, revenue_monthly: -1 }).ok).toBe(false);
    expect(k1.validate({ ...base, expenses_monthly: 20000 }).errors.expenses_monthly).toBe('ההוצאות גבוהות מההכנסה');
    expect(k1.validate({ ...base, status: 'x' as never }).errors.status).toBeTruthy();
    expect(k1.validate(base).ok).toBe(true);
  });
});
