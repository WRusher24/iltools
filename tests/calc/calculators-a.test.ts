// K2, K5, K6, K11, K9, K10, hourly rate
import { describe, expect, it } from 'vitest';
import { employeeVsFreelancer as k2, vat as k5, salaryNet as k6, osekPaturThreshold as k11, severance as k9, unemployment as k10, freelancerHourlyRate as hr, atzmaiNet as k1 } from '@/lib/calc';
import { rates, r2 } from './helpers';

describe('K6 salary-net', () => {
  const base: k6.Inputs = { ...k6.INPUT_DEFAULTS, gross_monthly: 10000 };
  it('gross 10000, 2.25 points, no pension (hand computed)', () => {
    const r = k6.calculate(base, rates);
    const tax = (84120 * 0.1 + 35880 * 0.14 - 6534) / 12; // 575.1
    const ni = 7703 * 0.0427 + 2297 * 0.1217; // 608.463
    expect(r.income_tax_monthly).toBe(r2(tax));
    expect(r.ni_combined_monthly).toBe(r2(ni));
    expect(r.net_monthly).toBe(r2(10000 - tax - ni));
    expect(r.health_tax).toBeNull();
  });
  it('pension and hishtalmut percentages reduce net and employer part is shown', () => {
    const r = k6.calculate({ ...base, pension_pct: 4, hishtalmut_pct: 4 }, rates);
    expect(r.pension_monthly).toBe(400);
    expect(r.hishtalmut_monthly).toBe(400);
    expect(r.net_monthly).toBe(r2(10000 - 575.1 - 608.463 - 800));
    expect(r.employer_pension_monthly).toBe(650);
    expect(r.employer_hishtalmut_monthly).toBe(750);
    expect(r.warnings).toContain('לפי הנתונים שפורסמו; יש לאמת מול מקור רשמי');
  });
  it('car value is taxed but not paid in cash', () => {
    const r = k6.calculate({ ...base, car_value_monthly: 1000 }, rates);
    const tax = (84120 * 0.1 + 36600 * 0.14 + 11280 * 0.2 - 6534) / 12;
    const ni = 7703 * 0.0427 + 3297 * 0.1217;
    expect(r.net_monthly).toBe(r2(10000 - tax - ni));
  });
  it('defaults come from rates and validation works', () => {
    const d = k6.makeDefaults(rates);
    expect(d.pension_pct).toBe(4);
    expect(d.hishtalmut_pct).toBe(4);
    expect(k6.validate(k6.INPUT_DEFAULTS).errors.gross_monthly).toBe('שדה חובה');
    expect(k6.validate({ ...base, pension_pct: 120 }).ok).toBe(false);
  });
});

describe('K2 employee vs freelancer', () => {
  const base: k2.Inputs = { ...k2.INPUT_DEFAULTS, gross_offer: 10000, freelancer_rate: 100, billable_hours_month: 100 };
  it('equal incomes produce equal nets in this model (hand computed) and break-even at the same revenue', () => {
    const r = k2.calculate(base, rates);
    expect(r.employee_net_monthly).toBe(r2(10000 - 575.1 - 608.463));
    expect(r.freelancer_revenue_monthly).toBe(10000);
    // same profit 10000 => same tax; same NI base (no floor effect above 3442)
    expect(r.freelancer_net_monthly).toBe(r.employee_net_monthly);
    expect(r.difference_vs_employee_net).toBe(0);
    expect(r.breakeven_revenue_monthly).toBe(10000);
    expect(r.breakeven_rate).toBe(100);
  });
  it('employer extras raise the employee total and the break-even', () => {
    const r = k2.calculate({ ...base, employer_extras_monthly: 500 }, rates);
    expect(r.employee_net_plus_extras_monthly).toBe(r2(r.employee_net_monthly + 500));
    expect(r.breakeven_total_revenue_monthly!).toBeGreaterThan(r.breakeven_revenue_monthly!);
  });
  it('break-even revenue reproduces the employee net through K1', () => {
    const r = k2.calculate({ ...base, business_expenses_monthly: 1000 }, rates);
    const k = k1.calculate({ ...k1.INPUT_DEFAULTS, revenue_monthly: r.breakeven_revenue_monthly!, expenses_monthly: 1000 }, rates);
    expect(Math.abs(k.net_monthly - r.employee_net_monthly)).toBeLessThan(0.02);
  });
  it('validation', () => {
    expect(k2.validate(k2.INPUT_DEFAULTS).ok).toBe(false);
    expect(k2.validate({ ...base, billable_hours_month: 0 }).errors.billable_hours_month).toBeTruthy();
    expect(k2.validate(base).ok).toBe(true);
  });
});

describe('K5 vat', () => {
  it('exclusive 1000 -> 180 vat, 1180 gross', () => {
    const r = k5.calculate({ ...k5.INPUT_DEFAULTS, amount: 1000, mode: 'exclusive' }, rates);
    expect([r.net, r.vat, r.gross]).toEqual([1000, 180, 1180]);
  });
  it('inclusive 1000 -> net 847.46, vat 152.54', () => {
    const r = k5.calculate({ ...k5.INPUT_DEFAULTS, amount: 1000, mode: 'inclusive' }, rates);
    expect([r.net, r.vat, r.gross]).toEqual([r2(1000 / 1.18), r2(1000 - r2(1000 / 1.18)), 1000]);
    expect(r.vat).toBe(152.54);
  });
  it('balance: pay, refund, zero', () => {
    const mk = (o: number, i: number) => k5.calculate({ ...k5.INPUT_DEFAULTS, amount: 1, outputs_vat: o, inputs_vat: i }, rates);
    expect(mk(500, 200)).toMatchObject({ balance: 300, balance_direction: 'pay' });
    expect(mk(100, 200)).toMatchObject({ balance: -100, balance_direction: 'refund' });
    expect(mk(100, 100)).toMatchObject({ balance: 0, balance_direction: 'zero' });
  });
  it('osek patur warning and validation', () => {
    expect(k5.calculate({ ...k5.INPUT_DEFAULTS, amount: 10, osek_patur: true }, rates).warnings.length).toBe(1);
    expect(k5.validate(k5.INPUT_DEFAULTS).errors.amount).toBe('שדה חובה');
  });
});

describe('K11 osek patur threshold', () => {
  it('monthly 10000 is below the ceiling', () => {
    const r = k11.calculate({ mode: 'monthly', turnover: 10000 }, rates);
    expect(r.turnover_annual).toBe(120000);
    expect(r.gap).toBe(2833);
    expect(r.direction).toBe('below');
    expect(r.usage_ratio).toBe(Math.round((120000 / 122833) * 10000) / 10000);
  });
  it('monthly 11000 is above the ceiling', () => {
    const r = k11.calculate({ mode: 'monthly', turnover: 11000 }, rates);
    expect(r.gap).toBe(122833 - 132000);
    expect(r.direction).toBe('above');
    expect(r.warnings.length).toBe(1);
  });
  it('annual input equal to the ceiling', () => {
    const r = k11.calculate({ mode: 'annual', turnover: 122833 }, rates);
    expect(r.direction).toBe('equal');
    expect(r.price_with_vat_factor).toBeCloseTo(1.18, 10);
  });
});

describe('K9 severance', () => {
  it('salary x years; tax part not available without a ceiling', () => {
    const r = k9.calculate({ monthly_salary: 12000, years: 5.5, exempt_monthly_ceiling: NaN }, rates);
    expect(r.estimate).toBe(66000);
    expect(r.exempt_amount).toBeNull();
    expect(r.taxable_amount).toBeNull();
    expect(r.brackets.length).toBe(6);
  });
  it('user-entered exempt ceiling', () => {
    const r = k9.calculate({ monthly_salary: 12000, years: 5.5, exempt_monthly_ceiling: 10000 }, rates);
    expect(r.exempt_amount).toBe(55000);
    expect(r.taxable_amount).toBe(11000);
  });
  it('ceiling above salary exempts everything; validation', () => {
    const r = k9.calculate({ monthly_salary: 8000, years: 3, exempt_monthly_ceiling: 20000 }, rates);
    expect(r.taxable_amount).toBe(0);
    expect(k9.validate(k9.INPUT_DEFAULTS).ok).toBe(false);
    expect(k9.validate({ monthly_salary: 1, years: 0, exempt_monthly_ceiling: NaN }).errors.years).toBeTruthy();
  });
});

describe('K10 unemployment', () => {
  const base: k10.Inputs = { ...k10.INPUT_DEFAULTS, prior_salary_monthly: 8000, age: 35, work_months: 20 };
  it('no amount estimate without user-entered published data', () => {
    const r = k10.calculate(base, rates);
    expect(r.benefit_estimate).toBeNull();
    expect(r.estimate_available).toBe(false);
    expect(r.insured_wage_monthly).toBe(8000);
    expect(r.above_reduced_ceiling).toBe(true);
  });
  it('insured wage is capped at the monthly ceiling', () => {
    const r = k10.calculate({ ...base, prior_salary_monthly: 60000 }, rates);
    expect(r.insured_wage_monthly).toBe(51910);
    expect(r.above_monthly_ceiling).toBe(true);
  });
  it('user-entered daily benefit x days', () => {
    expect(k10.calculate({ ...base, daily_benefit: 200, entitlement_days: 100 }, rates).benefit_estimate).toBe(20000);
    expect(k10.validate({ ...base, age: 10 }).errors.age).toBeTruthy();
  });
});

describe('freelancer hourly rate', () => {
  const base: hr.Inputs = { ...hr.INPUT_DEFAULTS, net_desired_monthly: 8816.44, billable_hours_week: 25 };
  it('inverts the K1 engine (desired net 8816.44 needs revenue 10000)', () => {
    const r = hr.calculate(base, rates);
    expect(r.required_revenue_monthly).toBe(10000);
    expect(r.annual_billable_hours).toBe(1300);
    expect(r.hourly_rate).toBe(r2(120000 / 1300));
    expect(r.hourly_rate_incl_vat).toBe(r2((120000 / 1300) * 1.18));
  });
  it('vacation weeks reduce billable hours', () => {
    const r = hr.calculate({ ...base, vacation_weeks: 4 }, rates);
    expect(r.annual_billable_hours).toBe(1200);
    expect(r.hourly_rate).toBe(100);
  });
  it('business expenses are added on top and the result reproduces the target through K1', () => {
    const r = hr.calculate({ ...base, business_expenses_monthly: 2000 }, rates);
    const k = k1.calculate({ ...k1.INPUT_DEFAULTS, revenue_monthly: r.required_revenue_monthly!, expenses_monthly: 2000 }, rates);
    expect(Math.abs(k.net_monthly - 8816.44)).toBeLessThan(0.02);
    expect(r.required_revenue_monthly).toBe(12000);
  });
  it('validation', () => {
    expect(hr.validate(hr.INPUT_DEFAULTS).ok).toBe(false);
    expect(hr.validate({ ...base, vacation_weeks: 60 }).errors.vacation_weeks).toBeTruthy();
  });
});
