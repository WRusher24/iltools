import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { atzmaiNet } from '@/lib/calc';
import { rates, r2 } from './helpers';

const FIXTURE_DIR = join(__dirname, '../../docs/research/fixtures');

interface FixtureCase {
  name: string;
  inputs: Record<string, unknown>;
  expected_outputs: Record<string, number | null>;
}

const STATUS: Record<string, atzmaiNet.Status> = { 'מורשה': 'murshe', 'פטור': 'patur' };
const MARITAL: Record<string, atzmaiNet.MaritalStatus> = { 'רווק': 'single', 'נשוי': 'married' };

/** Maps fixture file base-name -> function(inputs) returning outputs under the spec's output names. */
const RUNNERS: Record<string, (inputs: Record<string, unknown>) => Record<string, number | null>> = {
  'atzmai-net': (inp) => {
    const status = STATUS[String(inp.status)];
    const marital = MARITAL[String(inp.marital_status)];
    if (!status || !marital) throw new Error(`Unmapped fixture enum: ${String(inp.status)} / ${String(inp.marital_status)}`);
    const input: atzmaiNet.Inputs = {
      revenue_monthly: Number(inp.revenue_monthly),
      expenses_monthly: Number(inp.expenses_monthly),
      status,
      credit_points: Number(inp.credit_points),
      pension_deposit: Number(inp.pension_deposit),
      hishtalmut_deposit: Number(inp.hishtalmut_deposit),
      marital_status: marital,
      deductions: Number(inp.deductions),
    };
    expect(atzmaiNet.validate(input).ok).toBe(true);
    const r = atzmaiNet.calculate(input, rates);
    return {
      net_income: r.net_monthly,
      tax_by_bracket: r.income_tax_monthly,
      national_insurance: r.ni_combined_monthly,
      health_tax: r.health_tax,
      effective_rate: r.effective_rate,
      advance_payment_estimate: r.advance_payment_monthly,
    };
  },
};

/**
 * Fixture cases that provably cannot match data/rates/2026.json. Key: `<file>::<case name>`.
 * `hand` = independently computed expected value (plain arithmetic from rates keys, written out below).
 */
const KNOWN_FIXTURE_DISCREPANCIES: Record<string, { reason: string; hand: Record<string, number | null> }> = {
  'atzmai-net.json::Test Case 1': {
    reason:
      'Fixture uses flat placeholder percentages (tax 10% of profit, NI 5%, health 2.5%, advance 5% of revenue) that do not follow from the bracket/credit-point/NI rates in data/rates/2026.json; it is also internally inconsistent (8000-800-400-200=6600, not 6500).',
    hand: (() => {
      // profit 10000-2000 = 8000/month => 96000/year
      const taxBefore = 84120 * 0.1 + (96000 - 84120) * 0.14; // 8412 + 1663.2 = 10075.2
      const credits = 2.25 * 2904; // 6534
      const taxAnnual = taxBefore - credits; // 3541.2 (no surtax: < 721560)
      const niMonthly = 7703 * 0.0427 + (8000 - 7703) * 0.1217; // 328.9181 + 36.1449 = 365.063
      const netMonthly = 8000 - taxAnnual / 12 - niMonthly; // 8000 - 295.1 - 365.063
      return {
        net_income: r2(netMonthly),
        tax_by_bracket: r2(taxAnnual / 12),
        national_insurance: r2(niMonthly),
        health_tax: null,
        effective_rate: Math.round(((taxAnnual + niMonthly * 12) / 96000) * 10000) / 10000,
        advance_payment_estimate: r2(taxAnnual / 12),
      };
    })(),
  },
};

const files = readdirSync(FIXTURE_DIR).filter((f) => f.endsWith('.json'));

describe('research fixtures', () => {
  it('finds at least one fixture file and every file has a runner', () => {
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) expect(Object.keys(RUNNERS), `no runner for fixture ${f}`).toContain(f.replace(/\.json$/, ''));
  });

  it('every KNOWN_FIXTURE_DISCREPANCIES entry still refers to an existing case', () => {
    const existing = new Set<string>();
    for (const f of files) for (const c of JSON.parse(readFileSync(join(FIXTURE_DIR, f), 'utf8')) as FixtureCase[]) existing.add(`${f}::${c.name}`);
    for (const k of Object.keys(KNOWN_FIXTURE_DISCREPANCIES)) expect(existing.has(k), `stale discrepancy entry ${k}`).toBe(true);
  });

  for (const f of files) {
    const cases = JSON.parse(readFileSync(join(FIXTURE_DIR, f), 'utf8')) as FixtureCase[];
    describe(f, () => {
      for (const c of cases) {
        const key = `${f}::${c.name}`;
        const known = KNOWN_FIXTURE_DISCREPANCIES[key];
        const run = RUNNERS[f.replace(/\.json$/, '')];
        if (!known) {
          it(`${c.name}: matches expected outputs exactly`, () => {
            const actual = run(c.inputs);
            for (const [k, v] of Object.entries(c.expected_outputs)) expect(actual[k], `${key} -> ${k}`).toBe(v);
          });
        } else {
          it(`${c.name}: known discrepancy still exists (remove the entry if the fixture was corrected)`, () => {
            const actual = run(c.inputs);
            const differing = Object.keys(c.expected_outputs).filter((k) => actual[k] !== c.expected_outputs[k]);
            expect(
              differing.length,
              `Fixture ${key} now matches the calculator: remove it from KNOWN_FIXTURE_DISCREPANCIES in tests/calc/fixtures.test.ts`,
            ).toBeGreaterThan(0);
            // for this fixture every field is expected to differ
            expect(differing.sort()).toEqual(Object.keys(c.expected_outputs).sort());
          });
          it(`${c.name}: calculator equals the independently hand-computed values`, () => {
            const actual = run(c.inputs);
            expect(actual).toEqual(known.hand);
            expect(known.reason.length).toBeGreaterThan(10);
          });
        }
      }
    });
  }

  it('documents that the atzmai-net fixture is internally inconsistent', () => {
    const [c] = JSON.parse(readFileSync(join(FIXTURE_DIR, 'atzmai-net.json'), 'utf8')) as FixtureCase[];
    const e = c.expected_outputs;
    const profit = 10000 - 2000;
    expect(profit - (e.tax_by_bracket as number) - (e.national_insurance as number) - (e.health_tax as number)).not.toBe(e.net_income);
  });
});
