// Metadata for all 19 calculators/tools (URL slugs are fixed).
export type CalcKind = 'calculator' | 'tool';
export interface CalcMeta {
  slug: string;
  id: string;
  kind: CalcKind;
  title: string;
  /** provider data sets the calculator consumes (keys of the `providers` prop) */
  providers: ('invoicing' | 'clearing' | 'business-banking')[];
}

export const CALC_META: Record<string, CalcMeta> = {
  'atzmai-net': { slug: 'atzmai-net', id: 'K1', kind: 'calculator', title: 'מחשבון נטו לעצמאי', providers: [] },
  'employee-vs-freelancer-calculator': { slug: 'employee-vs-freelancer-calculator', id: 'K2', kind: 'calculator', title: 'שכיר או עצמאי: השוואת נטו', providers: [] },
  'clearing-fees': { slug: 'clearing-fees', id: 'K3', kind: 'calculator', title: 'מחשבון עמלות סליקה', providers: ['clearing'] },
  'invoicing-cost': { slug: 'invoicing-cost', id: 'K4', kind: 'calculator', title: 'מחשבון עלות תוכנת חשבוניות', providers: ['invoicing'] },
  vat: { slug: 'vat', id: 'K5', kind: 'calculator', title: 'מחשבון מע״מ', providers: [] },
  'salary-net': { slug: 'salary-net', id: 'K6', kind: 'calculator', title: 'מחשבון שכר נטו לשכיר', providers: [] },
  'keren-hishtalmut': { slug: 'keren-hishtalmut', id: 'K7', kind: 'calculator', title: 'מחשבון קרן השתלמות', providers: [] },
  'pension-self-employed': { slug: 'pension-self-employed', id: 'K8', kind: 'calculator', title: 'מחשבון פנסיה לעצמאי', providers: [] },
  severance: { slug: 'severance', id: 'K9', kind: 'calculator', title: 'מחשבון פיצויי פיטורים', providers: [] },
  unemployment: { slug: 'unemployment', id: 'K10', kind: 'calculator', title: 'מחשבון דמי אבטלה', providers: [] },
  'osek-patur-threshold': { slug: 'osek-patur-threshold', id: 'K11', kind: 'calculator', title: 'תקרת עוסק פטור', providers: [] },
  'compound-interest-mortgage': { slug: 'compound-interest-mortgage', id: 'K12', kind: 'calculator', title: 'ריבית דריבית והחזר הלוואה', providers: [] },
  'freelancer-hourly-rate': { slug: 'freelancer-hourly-rate', id: 'T1', kind: 'tool', title: 'מחשבון תעריף שעתי לעצמאי', providers: [] },
  'payslip-decoder': { slug: 'payslip-decoder', id: 'T2', kind: 'tool', title: 'מפענח תלוש שכר', providers: [] },
  'business-setup-cost-calculator': { slug: 'business-setup-cost-calculator', id: 'T3', kind: 'tool', title: 'מחשבון עלות הקמת עסק', providers: ['invoicing', 'clearing', 'business-banking'] },
  'business-structure-quiz': { slug: 'business-structure-quiz', id: 'T4', kind: 'tool', title: 'בוחן מבנה עסקי', providers: [] },
  'tax-calendar': { slug: 'tax-calendar', id: 'T5', kind: 'tool', title: 'לוח מועדי מס', providers: [] },
  'bank-fee-checker': { slug: 'bank-fee-checker', id: 'T6', kind: 'tool', title: 'בודק עמלות בנק', providers: ['business-banking'] },
  'tax-refund-estimator': { slug: 'tax-refund-estimator', id: 'T7', kind: 'tool', title: 'בדיקת החזר מס ראשונית', providers: [] },
};

export const CALC_SLUG_LIST = Object.keys(CALC_META);
