// Slug -> disclaimer class map (LEGAL_COMPLIANCE.md section 10.2). Legal ID = DISC-CALC-<CLASS>.
export type CalcClass = 'TAX' | 'VAT' | 'PENSION' | 'NI' | 'CREDIT' | 'CLEARING' | 'PAYSLIP' | 'REFUND' | 'GENERIC';

export const CALC_CLASS_BY_SLUG: Record<string, CalcClass> = {
  'atzmai-net': 'TAX',
  'employee-vs-freelancer-calculator': 'TAX',
  'salary-net': 'PAYSLIP',
  vat: 'VAT',
  'osek-patur-threshold': 'TAX',
  'keren-hishtalmut': 'PENSION',
  'pension-self-employed': 'PENSION',
  severance: 'NI',
  unemployment: 'NI',
  'clearing-fees': 'CLEARING',
  'compound-interest-mortgage': 'CREDIT',
  'invoicing-cost': 'GENERIC',
  'freelancer-hourly-rate': 'GENERIC',
  'payslip-decoder': 'PAYSLIP',
  'business-setup-cost-calculator': 'GENERIC',
  'business-structure-quiz': 'GENERIC',
  'tax-calendar': 'TAX',
  'bank-fee-checker': 'GENERIC',
  'tax-refund-estimator': 'REFUND',
};

export const CALC_SLUGS: string[] = Object.keys(CALC_CLASS_BY_SLUG);

/** Slugs that live under /tools/ (everything else lives under /calculators/). */
export const TOOL_SLUGS: ReadonlySet<string> = new Set([
  'freelancer-hourly-rate',
  'payslip-decoder',
  'business-setup-cost-calculator',
  'business-structure-quiz',
  'tax-calendar',
  'bank-fee-checker',
  'tax-refund-estimator',
]);

export function calcPath(slug: string): string {
  return `${TOOL_SLUGS.has(slug) ? '/tools' : '/calculators'}/${slug}`;
}

export function disclaimerIdForClass(cls: CalcClass): string {
  return `DISC-CALC-${cls}`;
}
export function disclaimerIdForSlug(slug: string): string {
  return disclaimerIdForClass(CALC_CLASS_BY_SLUG[slug] ?? 'GENERIC');
}

/** Comparison pages linked from the setup-cost tool (host owns the routes; adjust here if they change). */
export const COMPARE_LINKS: Record<'invoicing' | 'clearing' | 'business-banking', { href: string; label: string }> = {
  invoicing: { href: '/category/invoicing', label: 'השוואת תוכנות חשבוניות' },
  clearing: { href: '/category/clearing', label: 'השוואת חברות סליקה' },
  'business-banking': { href: '/category/business-banking', label: 'השוואת בנקאות עסקית' },
};
