// K3, K4, K7, K8, K12 + tools
import { describe, expect, it } from 'vitest';
import {
  clearingFees as k3,
  invoicingCost as k4,
  kerenHishtalmut as k7,
  pensionSelfEmployed as k8,
  compoundInterestMortgage as k12,
  payslipDecoder as ps,
  businessSetupCost as bs,
  businessStructureQuiz as quiz,
  taxCalendar as tc,
  bankFeeChecker as bf,
  taxRefundEstimator as tr,
  CALC_META,
} from '@/lib/calc';
import { rates, r2, clearing, invoicing, banking } from './helpers';

const fakeProvider = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  name: { he: 'ספק בדיקה' },
  website: null,
  pricing: {
    vat_included: false,
    currency: 'ILS',
    pricing_model: 'public_tiers',
    plans: [],
    transaction_fees: { percent_per_transaction: 1, fixed_per_transaction: 0.5, monthly_minimum: null, setup_fee: null },
    ...(over.pricing as object),
  },
  features: {},
  confidence: 'high',
});

describe('K3 clearing-fees', () => {
  it('hand computed fee for a synthetic provider', () => {
    // 20000 / 100 = 200 txns: 1% = 200, fixed 200*0.5 = 100, plan 30
    const p = fakeProvider({ pricing: { plans: [{ id: 'a', name: { he: 'מסלול' }, price_monthly: 30, price_annually: null, billing_cycle: 'monthly', limits: { transactions_per_month: 500 } }] } });
    const r = k3.calculate({ monthly_turnover: 20000, avg_basket: 100 }, rates, { clearing: [p] });
    expect(r.transactions).toBe(200);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].total_monthly).toBe(330);
    expect(r.rows[0].total_annual).toBe(3960);
    expect(r.rows[0].total_monthly_incl_vat).toBe(r2(330 * 1.18));
  });
  it('real data: quote-only providers listed, not calculated; Grow/PayPal/Cardcom hand computed, Stripe (EUR) excluded', () => {
    const r = k3.calculate({ monthly_turnover: 10000, avg_basket: 100 }, rates, { clearing: clearing });
    const find = (id: string, plan?: string) => r.rows.find((x) => x.provider_id === id && (plan === undefined || x.plan_name === plan));
    expect(find('cardcom')!.total_monthly).toBe(120); // 1.2% of 10000
    expect(find('stripe')).toBeUndefined(); // priced in EUR: not converted, listed as excluded
    expect(r.excluded.some((x) => x.provider_id === 'stripe' && x.reason.includes('שקל'))).toBe(true);
    expect(find('paypal')!.total_monthly).toBe(r2(340 + 100 * 1.2));
    const grow = r.rows.filter((x) => x.provider_id === 'grow');
    expect(grow.map((g) => g.total_monthly).sort((a, b) => a - b)).toEqual([134, 144]); // 75+59, 75+69
    expect(r.excluded.some((x) => x.provider_id === 'grow' && x.reason.includes('מכסת'))).toBe(true); // light plan limit 20
    expect(r.quote_only.map((q) => q.provider_id)).toEqual(expect.arrayContaining(['tranzila', 'payplus', 'pelecard', 'isracard', 'max', 'cal']));
    expect(r.quote_only[0].label).toBe('הצעת מחיר בלבד — לא נכלל בחישוב');
    expect(r.rows.map((x) => x.total_monthly)).toEqual([...r.rows.map((x) => x.total_monthly)].sort((a, b) => a - b));
  });
  it('missing provider data is "not available"; validation', () => {
    const r = k3.calculate({ monthly_turnover: 100, avg_basket: 10 }, rates);
    expect(r.available).toBe(false);
    expect(r.warnings.length).toBe(1);
    expect(k3.validate({ monthly_turnover: 100, avg_basket: 0 }).errors.avg_basket).toBeTruthy();
  });
});

describe('K4 invoicing-cost', () => {
  const calc = (o: Partial<k4.Inputs>) => k4.calculate({ ...k4.INPUT_DEFAULTS, docs_per_month: 30, ...o }, rates, { invoicing });
  it('extra documents beyond the plan limit are added (Green Invoice Basic: 20 docs, 1 ILS extra)', () => {
    const r = calc({});
    const basic = r.rows.find((x) => x.provider_id === 'green_invoice' && x.plan_id === 'basic')!;
    expect(basic.extra_documents).toBe(10);
    expect(basic.total_annual).toBe(348 + 10 * 1.0 * 12);
    expect(basic.total_annual_incl_vat).toBe(r2((348 + 120) * 1.18));
  });
  it('large volume: Prime 500 docs limit and 0.15 extra', () => {
    const r = calc({ docs_per_month: 600 });
    const prime = r.rows.find((x) => x.provider_id === 'green_invoice' && x.plan_id === 'prime')!;
    expect(prime.total_annual).toBe(r2(1548 + 100 * 0.15 * 12));
    // plans without published extra-document cost are rejected, not guessed
    expect(r.rejected.some((x) => x.provider_id === 'invoice4u' && x.reason.includes('אין עלות מסמך חריג'))).toBe(true);
  });
  it('sorted by annual cost only; quote-only and non-ILS providers are not calculated', () => {
    const r = calc({});
    const costs = r.rows.map((x) => x.total_annual);
    expect(costs).toEqual([...costs].sort((a, b) => a - b));
    expect(r.cheapest).toEqual(r.rows[0]);
    expect(r.quote_only.map((q) => q.provider_id)).toEqual(expect.arrayContaining(['hashavshevet', 'cardcom_invoices']));
    expect(r.rows.some((x) => x.provider_id === 'fireberry')).toBe(false);
    expect(r.rejected.some((x) => x.provider_id === 'icount' && x.reason.includes('לפי שימוש'))).toBe(true);
  });
  it('feature filter and validation', () => {
    const r = calc({ need_allocation: true });
    expect(r.rows.every((x) => x.provider_id !== 'fireberry')).toBe(true);
    expect(k4.validate({ ...k4.INPUT_DEFAULTS }).errors.docs_per_month).toBe('שדה חובה');
    expect(k4.calculate({ ...k4.INPUT_DEFAULTS, docs_per_month: 5 }, rates).available).toBe(false);
  });
});

describe('K7 keren hishtalmut', () => {
  const base: k7.Inputs = { ...k7.makeDefaults(rates), monthly_income: 10000, years: 1, annual_return_pct: 0, annual_fee_pct: 0 };
  it('contributions from published rates; ceilings compared; low-confidence caveat', () => {
    const r = k7.calculate(base, rates);
    expect(r.employee_monthly).toBe(400);
    expect(r.employer_monthly).toBe(750);
    expect(r.total_annual).toBe(13800);
    expect(r.over_ceiling_annual).toBe(13800 - 20500);
    expect(r.over_exempt_ceiling_annual).toBe(13800 - 18854);
    expect(r.warnings).toContain('לפי הנתונים שפורסמו; יש לאמת מול מקור רשמי');
    expect(r.fee_benchmark).toBeNull();
  });
  it('zero return/fee: balance equals deposits; positive return matches the closed form', () => {
    expect(k7.calculate(base, rates).final_balance).toBe(13800);
    const r = k7.calculate({ ...base, annual_return_pct: 12 }, rates);
    const i = Math.pow(1.12, 1 / 12) - 1;
    expect(r.final_balance).toBe(r2(1150 * ((Math.pow(1 + i, 12) - 1) / i)));
  });
  it('fee is subtracted from the return; ceiling warning; validation requires return and fee', () => {
    const r = k7.calculate({ ...base, monthly_income: 30000, annual_return_pct: 5, annual_fee_pct: 1 }, rates);
    expect(r.net_annual_pct).toBe(4);
    expect(r.warnings.some((w) => w.includes('תקרה'))).toBe(true);
    const v = k7.validate(k7.makeDefaults(rates));
    expect(v.errors.annual_return_pct).toBe('שדה חובה');
    expect(v.errors.annual_fee_pct).toBe('שדה חובה');
  });
});

describe('K8 pension self-employed', () => {
  const base: k8.Inputs = { ...k8.makeDefaults(rates), annual_income: 120000, years: 10, annual_return_pct: 0, annual_fee_pct: 0 };
  it('mechanisms: 35% credit and 4.7% deduction (hand computed)', () => {
    const r = k8.calculate(base, rates);
    expect(r.deposit_annual).toBe(4800);
    expect(r.credit_amount).toBe(1680);
    expect(r.deduction_amount).toBe(4800); // min(4800, 0.047*120000=5640)
    expect(r.deduction_tax_saving).toBe(r2(4800 * 0.14)); // 115200..120000 lies in the 14% bracket
    expect(r.warnings).toContain('לפי הנתונים שפורסמו; יש לאמת מול מקור רשמי');
  });
  it('deduction cap applies for large deposits; projection with zero return is deposits', () => {
    const r = k8.calculate({ ...base, deposit_pct: 10 }, rates);
    expect(r.deposit_annual).toBe(12000);
    expect(r.deduction_amount).toBe(5640);
    expect(r.final_balance).toBe(120000);
  });
  it('flags below published minimum; validation', () => {
    expect(k8.calculate({ ...base, deposit_pct: 1 }, rates).below_published_minimum).toBe(true);
    expect(k8.validate(k8.makeDefaults(rates)).ok).toBe(false);
  });
});

describe('K12 compound interest / loan', () => {
  it('compound, nominal monthly: 10000 at 5% for 1 year', () => {
    const r = k12.calculate({ ...k12.INPUT_DEFAULTS, amount: 10000, annual_rate_pct: 5, years: 1 });
    expect(r.final_balance).toBe(r2(10000 * Math.pow(1 + 0.05 / 12, 12)));
    expect(r.total_interest).toBe(r2(r.final_balance! - 10000));
  });
  it('compound, effective annual: exactly 10500 after one year', () => {
    const r = k12.calculate({ ...k12.INPUT_DEFAULTS, amount: 10000, annual_rate_pct: 5, years: 1, rate_basis: 'effective_annual' });
    expect(r.final_balance).toBe(10500);
  });
  it('monthly deposits at zero rate', () => {
    const r = k12.calculate({ ...k12.INPUT_DEFAULTS, amount: 1000, monthly_deposit: 100, annual_rate_pct: 0, years: 2 });
    expect(r.final_balance).toBe(3400);
    expect(r.rows).toHaveLength(2);
  });
  it('loan amortisation: payment, totals, ending balance zero', () => {
    const r = k12.calculate({ ...k12.INPUT_DEFAULTS, mode: 'loan', amount: 100000, annual_rate_pct: 6, years: 20 });
    const i = 0.005;
    const pay = (100000 * i) / (1 - Math.pow(1 + i, -240));
    expect(r.monthly_payment).toBe(r2(pay));
    expect(r.total_paid).toBe(r2(r2(pay) * 240));
    expect(r.rows.at(-1)!.balance).toBe(0);
    expect(r.rows).toHaveLength(20);
    expect(Math.abs(r.rows.reduce((s, x) => s + x.principal, 0) - 100000)).toBeLessThan(0.2);
  });
  it('zero-rate loan; validation (rate is required, never defaulted)', () => {
    expect(k12.calculate({ ...k12.INPUT_DEFAULTS, mode: 'loan', amount: 12000, annual_rate_pct: 0, years: 1 }).monthly_payment).toBe(1000);
    expect(k12.validate({ ...k12.INPUT_DEFAULTS, amount: 1, years: 1 }).errors.annual_rate_pct).toBe('שדה חובה');
    expect(k12.validate({ ...k12.INPUT_DEFAULTS, mode: 'loan', amount: 0, annual_rate_pct: 1, years: 1 }).ok).toBe(false);
  });
});

describe('payslip decoder', () => {
  const base: ps.Inputs = { ...ps.INPUT_DEFAULTS, gross: 10000, income_tax: 575.1, ni_and_health: 608.46, pension_employee: 400, net_stated: 8416.44, credit_points: 2.25 };
  it('consistent payslip has no sum flag and gives an estimate (hand computed)', () => {
    const r = ps.calculate(base, rates);
    expect(r.total_deductions).toBe(r2(575.1 + 608.46 + 400));
    expect(r.computed_net).toBe(r2(10000 - 575.1 - 608.46 - 400));
    expect(r.net_difference).toBe(0);
    expect(r.flags.some((f) => f.includes('שונה'))).toBe(false);
    expect(r.estimate).toEqual({ income_tax: 575.1, ni_and_health: r2(7703 * 0.0427 + 2297 * 0.1217) });
  });
  it('flags mismatch, missing pension and missing credit points', () => {
    const r = ps.calculate({ ...base, net_stated: 9000, pension_employee: 0, credit_points: NaN }, rates);
    expect(r.flags.some((f) => f.includes('שונה'))).toBe(true);
    expect(r.flags.some((f) => f.includes('פנסיה'))).toBe(true);
    expect(r.flags.some((f) => f.includes('נקודות זיכוי'))).toBe(true);
    expect(r.estimate).toBeNull();
  });
  it('states client-side-only and validates', () => {
    expect(ps.calculate(base, rates).assumptions[0]).toContain('אין העלאת קובץ');
    expect(ps.validate(ps.INPUT_DEFAULTS).ok).toBe(false);
    expect(ps.validate(base).ok).toBe(true);
  });
});

describe('business setup cost', () => {
  it('totals only what the user typed; missing items are flagged, never estimated', () => {
    const r = bs.calculate({ ...bs.INPUT_DEFAULTS, once_registration: 100, monthly_invoicing: 29, monthly_accountant: 200 });
    expect(r.total_once).toBe(100);
    expect(r.total_monthly).toBe(229);
    expect(r.total_first_year).toBe(100 + 229 * 12);
    expect(r.missing_labels).toContain('ביטוחים עסקיים');
    expect(r.rows.find((x) => x.id === 'company_registration')).toBeUndefined();
  });
  it('excluded items are not counted; company adds items and a not-available note', () => {
    const r = bs.calculate({ ...bs.INPUT_DEFAULTS, status: 'company', inc_invoicing: false, monthly_invoicing: 500, once_company_registration: 50 });
    expect(r.total_monthly).toBe(0);
    expect(r.total_once).toBe(50);
    expect(r.company_note).toContain('לא זמין');
  });
  it('no input = zero totals; validation rejects negatives', () => {
    expect(bs.calculate(bs.INPUT_DEFAULTS).total_first_year).toBe(0);
    expect(bs.validate({ ...bs.INPUT_DEFAULTS, once_bank: -5 }).errors.once_bank).toBeTruthy();
  });
});

describe('business structure quiz', () => {
  const base: quiz.Inputs = { ...quiz.INPUT_DEFAULTS, turnover: 10000, expenses_monthly: 2000 };
  it('below the ceiling: patur and murshe get the K1 simulation, company is not available', () => {
    const r = quiz.calculate(base, rates);
    const [patur, murshe, company] = r.structures;
    expect(patur.simulation!.net_monthly).toBe(7339.84);
    expect(murshe.simulation).toEqual(patur.simulation);
    expect(company.simulation).toBeNull();
    expect(company.status_text).toBe('לא זמין — אין נתוני מיסוי חברה בקבצי הנתונים');
    expect(r.assumptions[0]).toContain('מידע כללי בלבד');
  });
  it('above the ceiling: patur excluded by turnover', () => {
    const r = quiz.calculate({ ...base, turnover: 11000 }, rates);
    expect(r.structures[0].simulation).toBeNull();
    expect(r.warnings.length).toBe(1);
  });
  it('annual mode and partners note; validation', () => {
    const r = quiz.calculate({ ...base, turnover_mode: 'annual', turnover: 120000, partners: 2 }, rates);
    expect(r.turnover_annual).toBe(120000);
    expect(r.structures[0].points.join(' ')).toContain('שותפים');
    expect(quiz.validate({ ...base, partners: 0 }).errors.partners).toBeTruthy();
  });
});

describe('tax calendar', () => {
  it('generates bimonthly dates from user entries only', () => {
    expect(tc.recurringDates(15, 'bimonthly', '2026-11')).toEqual(['2026-11-15', '2027-01-15', '2027-03-15', '2027-05-15', '2027-07-15', '2027-09-15']);
  });
  it('clamps days to the end of short months and rolls the year', () => {
    expect(tc.recurringDates(31, 'monthly', '2027-01').slice(0, 3)).toEqual(['2027-01-31', '2027-02-28', '2027-03-31']);
    expect(tc.recurringDates(10, 'monthly', '2026-12').slice(0, 2)).toEqual(['2026-12-10', '2027-01-10']);
  });
  it('no deadlines without user entries; validation requires day and month', () => {
    expect(tc.calculate(tc.INPUT_DEFAULTS).events).toHaveLength(0);
    const v = tc.validate(tc.INPUT_DEFAULTS);
    expect(v.errors.vat_day).toBe('שדה חובה');
    expect(v.errors.vat_start).toBeTruthy();
    expect(tc.validate({ ...tc.INPUT_DEFAULTS, vat_on: false, annual_on: true, annual_date: '2027-02-30' }).errors.annual_date).toBeTruthy();
  });
  it('builds a valid .ics (CRLF, folded <=75 octets, escaped, VALARM)', () => {
    const inp: tc.Inputs = { ...tc.INPUT_DEFAULTS, vat_day: 15, vat_start: '2026-11', annual_on: true, annual_date: '2027-05-31' };
    expect(tc.validate(inp).ok).toBe(true);
    const res = tc.calculate(inp);
    expect(res.events.find((e) => e.type === 'annual')).toMatchObject({ date: '2027-05-31' });
    const ics = tc.buildIcs(res.events, { nowIso: '2026-10-16T09:30:00Z', reminderDays: 3 });
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('DTSTART;VALUE=DATE:20261115');
    expect(ics).toContain('DTEND;VALUE=DATE:20261116');
    expect(ics).toContain('DTSTAMP:20261016T093000Z');
    expect(ics).toContain('TRIGGER:-P3D');
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(res.events.length);
    const enc = new TextEncoder();
    for (const line of ics.split('\r\n')) expect(enc.encode(line).length).toBeLessThanOrEqual(75);
    expect(tc.icsEscape('a,b;c\\d\ne')).toBe('a\\,b\;c\\\\d\\ne');
  });
});

describe('bank fee checker', () => {
  const base = { ...bf.INPUT_DEFAULTS, name_1: 'ניהול חשבון', cat_1: 'management', amount_1: 30, name_2: 'כרטיס', cat_2: 'cards', amount_2: 120, freq_2: 'annual', name_3: 'כרטיס', cat_3: 'cards', amount_3: 5 };
  it('totals monthly and annual, by category', () => {
    const r = bf.calculate(base);
    expect(r.total_monthly).toBe(r2(30 + 10 + 5));
    expect(r.total_annual).toBe(r2((30 + 10 + 5) * 12));
    expect(r.by_category.find((c) => c.category === 'cards')!.monthly).toBe(15);
  });
  it('review list sorted by annual cost and flags repeated names', () => {
    const r = bf.calculate(base);
    expect(r.review.map((x) => x.annual)).toEqual([...r.review.map((x) => x.annual)].sort((a, b) => b - a));
    expect(r.review.filter((x) => x.reasons.some((s) => s.includes('חוזר'))).length).toBe(2);
  });
  it('no verified public data to compare in the provider file; synthetic data enables comparison', () => {
    const r = bf.calculate(base, rates, { businessBanking: banking });
    expect(r.comparison_available).toBe(false);
    expect(r.comparison_text).toBe('אין נתון ציבורי מאומת להשוואה');
    const fake = [{ id: 'b', name: { he: 'בנק' }, pricing: { transaction_fees: { monthly_minimum: 25, setup_fee: null } } }];
    expect(bf.calculate(base, rates, { businessBanking: fake }).benchmarks).toEqual([{ provider_name: 'בנק', monthly_minimum: 25, setup_fee: null }]);
  });
  it('validation requires at least one fee line', () => {
    expect(bf.validate(bf.INPUT_DEFAULTS).ok).toBe(false);
    expect(bf.validate(base).ok).toBe(true);
  });
});

describe('tax refund estimator', () => {
  const base: tr.Inputs = { ...tr.INPUT_DEFAULTS, annual_income: 100000, tax_paid: 12000 };
  it('possible refund (hand computed)', () => {
    const r = tr.calculate(base, rates);
    const due = 84120 * 0.1 + 15880 * 0.14 - 6534; // 4101.2
    expect(r.tax_due_estimate).toBe(r2(due));
    expect(r.gap).toBe(r2(12000 - due));
    expect(r.direction).toBe('possible_refund');
    expect(r.warnings[0]).toContain('בדיקה ראשונית בלבד');
  });
  it('balance due and no gap', () => {
    expect(tr.calculate({ ...base, tax_paid: 1000 }, rates).direction).toBe('possible_balance_due');
    expect(tr.calculate({ ...base, tax_paid: 4101.2 }, rates).direction).toBe('no_gap');
  });
  it('deductions and extra credits lower the due tax; validation', () => {
    const r = tr.calculate({ ...base, deductions_annual: 10000, extra_credits_annual: 500 }, rates);
    expect(r.tax_due_estimate).toBe(r2(84120 * 0.1 + 5880 * 0.14 - 6534 - 500));
    expect(tr.validate(tr.INPUT_DEFAULTS).ok).toBe(false);
  });
});

describe('meta', () => {
  it('has all 19 slugs', () => {
    expect(Object.keys(CALC_META)).toHaveLength(19);
  });
});
