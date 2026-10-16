// Test helpers: rates loaded straight from data/rates/2026.json (independent of the loader/generated index).
import rawRates from '../../data/rates/2026.json';
import clearingData from '../../data/providers/clearing.json';
import invoicingData from '../../data/providers/invoicing.json';
import bankingData from '../../data/providers/business-banking.json';
import type { RatesFile } from '@/lib/rates';

export const rates = rawRates as unknown as RatesFile;
export const clearing = clearingData as unknown as unknown[];
export const invoicing = invoicingData as unknown as unknown[];
export const banking = bankingData as unknown as unknown[];

/** plain half-up rounding to 2 decimals, used to state hand-computed expectations */
export const r2 = (n: number): number => Math.round(n * 100) / 100;
