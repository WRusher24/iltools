// Microcopy: taken from content/ui/he.json where a key exists; local Hebrew fallbacks otherwise.
import he from '../../../content/ui/he.json';

const dict = he as Record<string, string>;
export function t(key: string, fallback = ''): string {
  return dict[key] ?? fallback;
}

export const S = {
  calculate: t('calc.calculate', 'חישוב'),
  reset: t('calc.reset', 'איפוס'),
  whatsapp: t('calc.shareWhatsapp', 'שתף בוואטסאפ'),
  print: t('calc.print', 'הדפסה'),
  exportPdf: t('calc.exportPdf', 'ייצוא PDF'),
  copyLink: t('common.copyLink', 'העתקת קישור'),
  copied: t('success.copied', 'הועתק ללוח'),
  assumptions: t('calc.assumptions', 'הנחות והגבלות'),
  input: t('calc.input', 'קלט'),
  output: t('calc.output', 'תוצאה'),
  calculating: t('loading.calculating', 'מחשב…'),
  loading: t('loading.default', 'טוען…'),
  errorCalc: t('error.calc', 'לא הצלחנו לחשב. בדקו את הנתונים ונסו שוב.'),
  errorGeneric: t('error.generic', 'משהו השתבש. נסו שוב.'),
  required: t('validation.required', 'שדה חובה'),
  optional: t('form.optional', 'אופציונלי'),
  emptyState: 'המחשבון ממתין להזנה. מלאו את שדות החובה כדי לקבל תוצאה.',
  warnings: 'שים לב',
  lastUpdated: 'עודכן לאחרונה',
  sources: 'מקורות',
  disclaimerAck: 'אישור והמשך',
  lowConfidence: 'לפי הנתונים שפורסמו; יש לאמת מול מקור רשמי',
  na: 'לא זמין',
} as const;
