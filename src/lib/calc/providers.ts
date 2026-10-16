// Defensive typed readers for provider data (shape of data/providers/*.json). Pure. Keys of the `providers` prop = file basenames
// ("invoicing", "clearing", "business-banking").
import { isNum } from './common';

export interface ProviderPlan {
  id: string;
  name: string;
  price_monthly: number | null;
  price_annually: number | null;
  billing_cycle: string | null;
  documents_per_month: number | null;
  transactions_per_month: number | null;
  users: number | null;
  extra_document_cost: number | null;
  notes: string | null;
  confidence: string | null;
}
export interface TransactionFees {
  percent_per_transaction: number | null;
  fixed_per_transaction: number | null;
  monthly_minimum: number | null;
  setup_fee: number | null;
  foreign_card_surcharge: number | null;
  refund_fee: number | null;
  chargeback_fee: number | null;
}
export interface Provider {
  id: string;
  name: string;
  website: string | null;
  pricing_model: string | null;
  currency: string | null;
  vat_included: boolean | null;
  confidence: string | null;
  plans: ProviderPlan[];
  fees: TransactionFees;
  feature_api: boolean | null;
  feature_allocation: boolean | null;
  notes_he: string | null;
}

const nn = (x: unknown): number | null => (isNum(x) ? x : null);
const ns = (x: unknown): string | null => (typeof x === 'string' ? x : null);
const nb = (x: unknown): boolean | null => (typeof x === 'boolean' ? x : null);
const rec = (x: unknown): Record<string, unknown> => (x && typeof x === 'object' ? (x as Record<string, unknown>) : {});

export function readProviders(list: unknown[] | undefined): Provider[] {
  if (!Array.isArray(list)) return [];
  const out: Provider[] = [];
  for (const raw of list) {
    const r = rec(raw);
    const id = ns(r.id);
    if (!id) continue;
    const pricing = rec(r.pricing);
    const name = rec(r.name);
    const features = rec(r.features);
    const fees = rec(pricing.transaction_fees);
    const plans = (Array.isArray(pricing.plans) ? pricing.plans : []).map((pl): ProviderPlan => {
      const p = rec(pl);
      const lim = rec(p.limits);
      const pn = rec(p.name);
      return {
        id: ns(p.id) ?? '',
        name: ns(pn.he) ?? ns(p.id) ?? '',
        price_monthly: nn(p.price_monthly),
        price_annually: nn(p.price_annually),
        billing_cycle: ns(p.billing_cycle),
        documents_per_month: nn(lim.documents_per_month),
        transactions_per_month: nn(lim.transactions_per_month),
        users: nn(lim.users),
        extra_document_cost: nn(lim.extra_document_cost),
        notes: ns(lim.notes),
        confidence: ns(p.confidence),
      };
    });
    out.push({
      id,
      name: ns(name.he) ?? id,
      website: ns(r.website),
      pricing_model: ns(pricing.pricing_model),
      currency: ns(pricing.currency),
      vat_included: nb(pricing.vat_included),
      confidence: ns(pricing.confidence) ?? ns(r.confidence),
      plans,
      fees: {
        percent_per_transaction: nn(fees.percent_per_transaction),
        fixed_per_transaction: nn(fees.fixed_per_transaction),
        monthly_minimum: nn(fees.monthly_minimum),
        setup_fee: nn(fees.setup_fee),
        foreign_card_surcharge: nn(fees.foreign_card_surcharge),
        refund_fee: nn(fees.refund_fee),
        chargeback_fee: nn(fees.chargeback_fee),
      },
      feature_api: nb(features.api),
      feature_allocation: nb(features.allocation_number_integration),
      notes_he: ns(pricing.notes_he),
    });
  }
  return out;
}
