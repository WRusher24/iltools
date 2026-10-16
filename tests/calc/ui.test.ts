import { describe, expect, it } from 'vitest';
import { createElement, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseNum } from '@/components/calc/parse';
import { CALC_CLASS_BY_SLUG, CALC_SLUGS, calcPath, disclaimerIdForSlug } from '@/components/calc/classes';
import type { CalcContext, CalcProps } from '@/components/calc/types';
import { CALC_META } from '@/lib/calc';
import { rates, clearing, invoicing, banking } from './helpers';

const COMPONENTS: Record<string, () => Promise<{ default: ComponentType<CalcProps> }>> = {
  'atzmai-net': () => import('@/components/calc/calculators/AtzmaiNet'),
  'employee-vs-freelancer-calculator': () => import('@/components/calc/calculators/EmployeeVsFreelancer'),
  'clearing-fees': () => import('@/components/calc/calculators/ClearingFees'),
  'invoicing-cost': () => import('@/components/calc/calculators/InvoicingCost'),
  vat: () => import('@/components/calc/calculators/Vat'),
  'salary-net': () => import('@/components/calc/calculators/SalaryNet'),
  'keren-hishtalmut': () => import('@/components/calc/calculators/KerenHishtalmut'),
  'pension-self-employed': () => import('@/components/calc/calculators/PensionSelfEmployed'),
  severance: () => import('@/components/calc/calculators/Severance'),
  unemployment: () => import('@/components/calc/calculators/Unemployment'),
  'osek-patur-threshold': () => import('@/components/calc/calculators/OsekPaturThreshold'),
  'compound-interest-mortgage': () => import('@/components/calc/calculators/CompoundInterestMortgage'),
  'freelancer-hourly-rate': () => import('@/components/calc/calculators/FreelancerHourlyRate'),
  'payslip-decoder': () => import('@/components/calc/calculators/PayslipDecoder'),
  'business-setup-cost-calculator': () => import('@/components/calc/calculators/BusinessSetupCost'),
  'business-structure-quiz': () => import('@/components/calc/calculators/BusinessStructureQuiz'),
  'tax-calendar': () => import('@/components/calc/calculators/TaxCalendar'),
  'bank-fee-checker': () => import('@/components/calc/calculators/BankFeeChecker'),
  'tax-refund-estimator': () => import('@/components/calc/calculators/TaxRefundEstimator'),
};

const ctx: CalcContext = {
  rates,
  providers: { clearing, invoicing, 'business-banking': banking },
  disclaimer: { id: 'DISC-CALC-TAX', version: '1.0', title: 'הצהרת אחריות', content: createElement('p', null, 'טקסט משפטי לדוגמה') },
  ratesUpdated: '2026-10-16',
  sourceLinks: [{ id: 'src_ita_01', title: 'רשות המסים', url: 'https://example.invalid/ita' }],
  resultCta: createElement('div', { 'data-testid': 'cta-slot' }, 'CTA'),
};

describe('class map', () => {
  it('has 19 slugs with the specified classes and routes', () => {
    expect(CALC_SLUGS).toHaveLength(19);
    expect(Object.keys(COMPONENTS).sort()).toEqual([...CALC_SLUGS].sort());
    expect(Object.keys(CALC_META).sort()).toEqual([...CALC_SLUGS].sort());
    expect(CALC_CLASS_BY_SLUG['salary-net']).toBe('PAYSLIP');
    expect(CALC_CLASS_BY_SLUG['tax-refund-estimator']).toBe('REFUND');
    expect(CALC_CLASS_BY_SLUG['compound-interest-mortgage']).toBe('CREDIT');
    expect(disclaimerIdForSlug('vat')).toBe('DISC-CALC-VAT');
    expect(calcPath('vat')).toBe('/calculators/vat');
    expect(calcPath('tax-calendar')).toBe('/tools/tax-calendar');
    expect(CALC_META['tax-calendar'].kind).toBe('tool');
  });
});

describe('parseNum', () => {
  it.each([
    ['1234', 1234],
    ['1,234', 1234],
    ['1,234,567.5', 1234567.5],
    ['1,5', 1.5],
    ['12.5', 12.5],
    ['٣٠٠', 300],
    ['۱۲٫۵', 12.5],
    ['  ₪ 2,500 ', 2500],
    ['-3', -3],
    ['− 3', -3],
  ])('parses %s', (raw, want) => expect(parseNum(raw)).toBe(want));
  it.each(['', 'abc', '1.2.3', '--1', '1e3x'])('rejects %s', (raw) => expect(parseNum(raw)).toBeNaN());
});

describe('server render of every calculator (defaults / empty state)', () => {
  for (const slug of CALC_SLUGS) {
    it(`${slug} renders form + result region without NaN/undefined and without an open modal`, async () => {
      const Comp = (await COMPONENTS[slug]()).default;
      const html = renderToString(createElement(Comp, { slug, ctx }));
      expect(html).toContain('data-testid="calc-result"');
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('aria-atomic="true"');
      expect(html).toContain('data-testid="calc-disclaimer-persistent"');
      expect(html).toContain('טקסט משפטי לדוגמה');
      expect(html).toContain('data-testid="cta-slot"');
      expect(html).toContain('<form');
      expect(html).toMatch(/<label for=/);
      expect(html).not.toContain('calc-disclaimer-modal');
      expect(html).not.toMatch(/NaN|undefined|\[object/);
      expect(html).toContain('שתף בוואטסאפ');
      expect(html).toContain('איפוס');
      expect(html).toContain('עודכן לאחרונה');
    });
  }
});


const VALID: Record<string, Record<string, string>> = {
  'atzmai-net': { revenue_monthly: '10000', expenses_monthly: '2000', pension_deposit: '300' },
  'employee-vs-freelancer-calculator': { gross_offer: '15000', freelancer_rate: '150', billable_hours_month: '100', employer_extras_monthly: '500' },
  'clearing-fees': { monthly_turnover: '20000', avg_basket: '200' },
  'invoicing-cost': { docs_per_month: '30', users: '1' },
  vat: { amount: '1000', mode: 'inclusive', outputs_vat: '500', inputs_vat: '200' },
  'salary-net': { gross_monthly: '12000', pension_pct: '6', hishtalmut_pct: '2.5' },
  'keren-hishtalmut': { monthly_income: '12000', years: '7', annual_return_pct: '4', annual_fee_pct: '0.5' },
  'pension-self-employed': { annual_income: '150000', years: '15', annual_return_pct: '3', annual_fee_pct: '0.3' },
  severance: { monthly_salary: '12000', years: '6', exempt_monthly_ceiling: '10000' },
  unemployment: { prior_salary_monthly: '9000', age: '40', work_months: '24' },
  'osek-patur-threshold': { mode: 'monthly', turnover: '10000' },
  'compound-interest-mortgage': { mode: 'loan', amount: '500000', annual_rate_pct: '4.5', years: '25' },
  'freelancer-hourly-rate': { net_desired_monthly: '12000', billable_hours_week: '25', vacation_weeks: '4' },
  'payslip-decoder': { gross: '10000', income_tax: '575.1', ni_and_health: '608.46', net_stated: '8816.44', credit_points: '2.25' },
  'business-setup-cost-calculator': { status: 'company', once_registration: '100', monthly_invoicing: '29' },
  'business-structure-quiz': { turnover: '10000', expenses_monthly: '2000', partners: '2' },
  'tax-calendar': { vat_day: '15', vat_start: '2026-11', annual_on: '1', annual_date: '2027-05-31' },
  'bank-fee-checker': { name_1: 'ניהול', amount_1: '30', cat_1: 'management' },
  'tax-refund-estimator': { annual_income: '100000', tax_paid: '12000' },
};

describe('server render with valid input renders the success state', () => {
  for (const slug of CALC_SLUGS) {
    it(`${slug}: success state, no NaN/undefined, assumptions listed`, async () => {
      const Comp = (await COMPONENTS[slug]()).default;
      const html = renderToString(createElement(Comp, { slug, ctx: { ...ctx, initialValues: VALID[slug] } }));
      expect(html).toContain('data-status="success"');
      expect(html).not.toMatch(/NaN|undefined|\[object|Infinity/);
      expect(html).toContain('הנחות והגבלות');
      expect(html).toContain('<bdi>');
    });
  }
  it('K1 shows the combined NI line, the NA health line and the bracket table', async () => {
    const Comp = (await COMPONENTS['atzmai-net']()).default;
    const html = renderToString(createElement(Comp, { slug: 'atzmai-net', ctx: { ...ctx, initialValues: VALID['atzmai-net'] } }));
    expect(html).toContain('ביטוח לאומי ומס בריאות (משולב, חודשי)');
    expect(html).toContain('לא זמין');
    expect(html).toContain('מס הכנסה לפי מדרגות');
    expect(html).toContain('לפי הנתונים שפורסמו; יש לאמת מול מקור רשמי');
  });
  it('invalid input shows the error state with Hebrew messages', async () => {
    const Comp = (await COMPONENTS['vat']()).default;
    const html = renderToString(createElement(Comp, { slug: 'vat', ctx: { ...ctx, initialValues: { amount: 'abc' } } }));
    expect(html).toContain('data-status="error"');
    expect(html).toContain('יש להזין מספר');
    expect(html).toContain('aria-invalid="true"');
  });
  it('payslip decoder states client-side only', async () => {
    const Comp = (await COMPONENTS['payslip-decoder']()).default;
    const html = renderToString(createElement(Comp, { slug: 'payslip-decoder', ctx }));
    expect(html).toContain('אין העלאת קובץ');
  });
});

describe('static guards on src/components/calc', () => {
  const root = join(__dirname, '../../src/components/calc');
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(f)) files.push(p);
    }
  };
  walk(root);
  it('uses logical Tailwind properties only', () => {
    const bad = /(^|[\s"'`])(-?(pl|pr|ml|mr)-\S|text-left|text-right|(left|right)-[\d\[]|border-(l|r)(-|\s|"|'))/;
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      for (const line of src.split('\n')) expect(bad.test(line), `${f}: ${line.trim()}`).toBe(false);
    }
  });
  it('contains no lorem ipsum and no network or storage calls outside the disclaimer persistence', () => {
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      expect(/lorem ipsum/i.test(src)).toBe(false);
      expect(/\bfetch\(|XMLHttpRequest|sendBeacon/.test(src), f).toBe(false);
      if (!f.endsWith('DisclaimerModal.tsx')) expect(/localStorage|sessionStorage|indexedDB/.test(src), f).toBe(false);
    }
  });
});
