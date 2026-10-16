// Hebrew navigation (RTL: first item sits at the right edge). All hrefs are validated by scripts/validate-tokens.ts.
export interface NavGroup { label: string; href?: string; items?: { label: string; href: string }[] }

export const NAV: NavGroup[] = [
  {
    label: 'השוואות',
    href: '/compare',
    items: [
      { label: 'חשבונית ירוקה או מורנינג', href: '/compare/green-invoice-vs-morning' },
      { label: 'השוואת תוכנות חשבוניות', href: '/category/invoicing' },
      { label: 'השוואת סליקת אשראי', href: '/category/clearing' },
      { label: 'בנקים לעסקים', href: '/category/business-banking' },
      { label: 'מערכות CRM', href: '/category/crm' },
      { label: 'הכי מתאים ל…', href: '/best' },
      { label: 'ביקורות ספקים', href: '/reviews' },
    ],
  },
  {
    label: 'מחשבונים',
    href: '/calculators',
    items: [
      { label: 'נטו לעצמאי', href: '/calculators/atzmai-net' },
      { label: 'שכיר מול עצמאי', href: '/calculators/employee-vs-freelancer-calculator' },
      { label: 'שכר נטו', href: '/calculators/salary-net' },
      { label: 'עמלות סליקה', href: '/calculators/clearing-fees' },
      { label: 'מע״מ', href: '/calculators/vat' },
      { label: 'קרן השתלמות', href: '/calculators/keren-hishtalmut' },
      { label: 'פנסיה לעצמאי', href: '/calculators/pension-self-employed' },
      { label: 'תעריף שעתי', href: '/tools/freelancer-hourly-rate' },
      { label: 'פיצויים', href: '/calculators/severance' },
      { label: 'כל הכלים', href: '/tools' },
    ],
  },
  {
    label: 'מדריכים',
    href: '/guides',
    items: [
      { label: 'פתיחת עסק', href: '/guides/setup' },
      { label: 'מיסים', href: '/guides/tax' },
      { label: 'פנסיה וחיסכון', href: '/guides/pension' },
      { label: 'בנקאות ואשראי', href: '/guides/banking' },
      { label: 'עסק אונליין', href: '/guides/ecommerce' },
      { label: 'כלים ופרודוקטיביות', href: '/guides/tools' },
    ],
  },
  { label: 'קטגוריות', href: '/category' },
  { label: 'מאמרים', href: '/articles' },
  { label: 'אודות', href: '/about' },
];

export const FOOTER_LEGAL: { label: string; href: string }[] = [
  { label: 'הצהרת אחריות', href: '/legal/disclaimer' },
  { label: 'תנאי שימוש', href: '/legal/terms' },
  { label: 'מדיניות פרטיות', href: '/legal/privacy' },
  { label: 'גילוי נאות (אפיליאייט)', href: '/legal/affiliate-disclosure' },
  { label: 'מדיניות עוגיות', href: '/legal/cookies' },
  { label: 'הצהרת נגישות', href: '/legal/accessibility' },
  { label: 'שיטת הדירוג', href: '/methodology' },
  { label: 'מדיניות מערכת', href: '/editorial-policy' },
];
export const FOOTER_SITE: { label: string; href: string }[] = [
  { label: 'אודות', href: '/about' },
  { label: 'יצירת קשר', href: '/contact' },
  { label: 'פרסום באתר', href: '/advertise' },
  { label: 'חיפוש', href: '/search' },
  { label: 'מפת אתר', href: '/sitemap-html' },
  { label: 'פיד RSS', href: '/feed.xml' },
];
