// Balance projection with USER-ENTERED return and fee. Illustrative scenario only. Pure.
import { num0, round2 } from './common';

export interface ProjectionInput {
  initial: number;
  monthly_deposit: number;
  years: number;
  annual_return_pct: number;
  annual_fee_pct: number;
}
export interface ProjectionRow {
  year: number;
  deposits_total: number;
  balance: number;
}
export interface Projection {
  months: number;
  net_annual_pct: number;
  total_deposits: number;
  final_balance: number;
  growth: number;
  rows: ProjectionRow[];
}

/**
 * Net annual rate = return - fee (percentage points, fee approximated as a yearly deduction from the return).
 * Monthly rate = (1 + net)^(1/12) - 1. Each month: balance = balance * (1 + i) + deposit (deposit at month end).
 */
export function projectBalance(p: ProjectionInput): Projection {
  const months = Math.max(0, Math.round(num0(p.years) * 12));
  const net = num0(p.annual_return_pct) - num0(p.annual_fee_pct);
  const base = Math.max(1 + net / 100, 0);
  const i = Math.pow(base, 1 / 12) - 1;
  let bal = num0(p.initial);
  let dep = num0(p.initial);
  const rows: ProjectionRow[] = [];
  for (let m = 1; m <= months; m++) {
    bal = bal * (1 + i) + num0(p.monthly_deposit);
    dep += num0(p.monthly_deposit);
    if (m % 12 === 0 || m === months) rows.push({ year: Math.round((m / 12) * 100) / 100, deposits_total: round2(dep), balance: round2(bal) });
  }
  return { months, net_annual_pct: net, total_deposits: round2(dep), final_balance: round2(bal), growth: round2(bal - dep), rows };
}
