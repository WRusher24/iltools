# CONTENT_INVENTORY — מלאי התוכן של IL-Tools (אגנט 3)

**תאריך:** 16.10.2026 · **בעל המלאי:** אגנט 3 (תוכן) · **סטטוסים:** `written` = נכתב בקומיט זה · `planned` = מתוכנן, טרם נכתב · `deferred` = נדחה עם סיבה.

**מוסכמות אתר (אחידות):**
- מטבע: `1,000 ₪` (מספר, רווח, סימן שקל). אחוזים: `18%`. תאריכים: `16.10.2026`.
- פנייה מגדרית: צורות ניטרליות ("אפשר", "כדאי לבדוק", "מי שפועל/ת כעצמאי/ת") — לא "אתה/את".
- קישור פנימי: `{{link:slug}}`. אפיליאייט: `{{aff:slug}}`. ממומן: `{{sponsored:slug}}`. מקורות: `{{sources:[ids]}}`. עדכון: `{{updated:YYYY-MM-DD}}`. תרשים: `{{chart:id}}`. סלוט: `{{slot:AFF-1}}`.
- טופס מחשבון: `{{calc:slug}}`.
- כל מספר מגיע מ-`docs/content/DATA_REFERENCE.md` בלבד.

## 1. השוואות "A או B" — `/content/compare/` (12)

| # | slug | כותרת | מילת מפתח ראשית | סוג | מילים (יעד) | תלות נתונים | סטטוס |
|---|---|---|---|---|---|---|---|
| C1 | green-invoice-vs-morning | חשבונית ירוקה או מורנינג: מה ההבדל? | חשבונית ירוקה או מורנינג | compare | 1,100 | invoicing.json/inv_gi | written |
| C2 | icount-vs-green-invoice | iCount או חשבונית ירוקה | icount או חשבונית ירוקה | compare | 1,100 | invoicing.json | written |
| C3 | cardcom-vs-tranzila | Cardcom או Tranzila: סליקה לעסק | cardcom או tranzila | compare | 1,000 | clearing.json | written |
| C4 | payplus-vs-grow | PayPlus או Grow (משולם) | payplus או משולם | compare | 1,000 | clearing.json | written |
| C5 | grow-vs-paypal | Grow או PayPal: סליקה מקומית מול בינלאומית | grow או paypal | compare | 1,000 | clearing.json | written |
| C6 | osek-patur-vs-osek-murshe | עוסק פטור או עוסק מורשה | עוסק פטור או מורשה | compare | 1,200 | rates/2026.json | written |
| C7 | employee-vs-freelancer | שכיר או עצמאי: מה משתלם | שכיר או עצמאי | compare | 1,300 | rates/2026.json | written |
| C8 | pension-vs-management-insurance | קרן פנסיה או ביטוח מנהלים (חינוכי, לא ייעוץ) | קרן פנסיה או ביטוח מנהלים | compare (regulated) | 1,100 | pension.json | written |
| C9 | rivhit-vs-green-invoice | ריווחית או חשבונית ירוקה | ריווחית או חשבונית ירוקה | compare | 1,050 | invoicing.json | written |
| C10 | monday-vs-fireberry | monday או Fireberry ל-CRM | monday או fireberry | compare | 1,000 | crm.json | written |
| C11 | isracard-vs-max | ישראכרט או מקס: סליקה ישירה | ישראכרט או מקס | compare | 950 | clearing.json | written |
| C12 | zoho-vs-pipedrive | Zoho או Pipedrive | zoho או pipedrive | compare | 1,000 | crm.json | written |

## 2. "הכי טוב ל…" — `/content/best/` (8)

| # | slug | כותרת | מילת מפתח ראשית | תלות | סטטוס |
|---|---|---|---|---|---|
| B1 | best-invoicing-software-freelancers | התוכנה הכי מתאימה להפקת חשבוניות לעצמאים | תוכנה להפקת חשבוניות לעצמאים | invoicing.json | written |
| B2 | best-invoicing-osek-patur | הכלים המומלצים לעוסק פטור | תוכנה לעוסק פטור | invoicing.json | written |
| B3 | best-clearing-small-business | הסליקה הכי מתאימה לעסק קטן | סליקה לעסק קטן | clearing.json | written |
| B4 | best-clearing-ecommerce | הסליקה הכי מתאימה לעסק אונליין | סליקה לחנות אונליין | clearing.json | written |
| B5 | best-business-bank-startups | הבנק לעסק המתאים לסטארטאפ/עסק חדש | חשבון בנק לעסק | business-banking.json | written |
| B6 | best-crm-small-business | ה-CRM הכי מתאים לעסק קטן בישראל | crm לעסק קטן | crm.json | written |
| B7 | best-accounting-software | תוכנת הנהלת החשבונות הכי מתאימה לעצמאי | תוכנת הנהלת חשבונות | accounting.json | written |
| B8 | best-payroll-software | תוכנת השכר הכי מתאימה לעסק | תוכנת שכר | payroll.json | written |

## 3. דפי קטגוריה — `/content/categories/` (5)

| # | slug | כותרת | תלות | סטטוס |
|---|---|---|---|---|
| H1 | invoicing | תוכנות חשבוניות בישראל — השוואה ומדריך בחירה | invoicing.json | written |
| H2 | clearing | סליקת אשראי לעסקים — השוואה ומדריך בחירה | clearing.json | written |
| H3 | business-banking | בנקים לעסקים — מה משווים ואיך בוחרים | business-banking.json | written |
| H4 | pension | פנסיה וחיסכון — מידע חינוכי (לא ייעוץ) | pension.json (regulated) | written |
| H5 | crm | מערכות CRM לעסקים קטנים — השוואה | crm.json | written |

## 4. מאמרים עתירי-נתונים — `/content/articles/` (24) + `<slug>.data.json`

| # | slug | כותרת | regulated | תרשים | סטטוס |
|---|---|---|---|---|---|
| A1 | cost-of-being-self-employed-first-year | כמה עולה להיות עצמאי בשנה הראשונה | false | bar | written |
| A2 | osek-patur-ceiling-over-years | תקרת עוסק פטור לאורך השנים | false | line | written |
| A3 | income-tax-brackets-decade | מדרגות מס הכנסה בעשור האחרון | false | bar | written |
| A4 | national-insurance-self-employed | ביטוח לאומי לעצמאים: לאן הכסף הולך | false | table | written |
| A5 | how-clearing-fee-works | איך עובדת עמלת סליקה: מי לוקח מה | false | stacked | written |
| A6 | clearing-fees-by-turnover | עמלות סליקה לפי רמת מחזור | false | bar | written |
| A7 | hidden-clearing-costs | שבע עלויות נסתרות בסליקה | false | table | written |
| A8 | management-fees-pension-hishtalmut-30-years | דמי ניהול: מה פער קטן עושה אחרי 30 שנה (הדגמה) | true | line | written |
| A9 | keren-hishtalmut-how-it-works | קרן השתלמות: איך היא עובדת וכלל 6 השנים | true | table | written |
| A10 | pension-for-self-employed-facts | פנסיה לעצמאים: מה חובה ומה ההטבה במס | true | table | written |
| A11 | israel-invoice-allocation-number-timeline | חשבונית ישראל ומספר הקצאה: ציר זמן | false | line | written |
| A12 | accounting-document-types | סוגי מסמכים חשבונאיים: מתי משתמשים בכל אחד | false | table | written |
| A13 | recognized-expenses-self-employed | הוצאות מוכרות לעצמאי: מה מותר ומה לא | false | table | written |
| A14 | income-tax-advance-payments | מקדמות מס הכנסה: איך מחושבות ולמה משתנות | false | bar | written |
| A15 | ten-mistakes-new-freelancers-tax-vat | עשר טעויות של עצמאים חדשים עם מס ומע״מ | false | table | written |
| A16 | osek-murshe-vs-company-ltd | עוסק מורשה או חברה בע״מ: השוואה במספרים | false | bar | written |
| A17 | business-bank-fees | עמלות בנק לעסק: אילו קיימות ואיך מתמקחים | false | table | written |
| A18 | business-credit-card-cashback | כרטיס אשראי עסקי: מתי הקאשבק משתלם | false | bar | written |
| A19 | how-to-read-payslip | איך לקרוא תלוש שכר שורה אחר שורה | false | table | written |
| A20 | employee-vs-freelancer-beyond-net | שכיר או עצמאי: מעבר לנטו — זכויות | false | table | written |
| A21 | unemployment-benefits-self-employed | דמי אבטלה לעצמאים: מי זכאי ולמה לא להסתמך | true | table | written |
| A22 | how-to-price-freelance-services | איך מתמחרים שירות כפרילנסר | false | bar | written |
| A23 | selling-to-foreign-customers-vat-export | מכירה ללקוחות בחו״ל: מע״מ על יצוא שירותים | false | table | written |
| A24 | digital-payments-israel-bit-paybox | תשלומים דיגיטליים בישראל: ביט ופייבוקס | false | bar | written |

## 5. מדריכים — `/content/guides/<cluster>/` (20)

| # | cluster/slug | כותרת | מילים (יעד) | סטטוס |
|---|---|---|---|---|
| G1 | setup/open-osek-patur | פתיחת תיק עוסק פטור — מדריך צעד אחר צעד | 1,600 | written |
| G2 | setup/open-osek-murshe | פתיחת עוסק מורשה — מדריך מלא | 1,500 | written |
| G3 | setup/open-company-ltd | פתיחת חברה בע״מ: מתי זה מתאים | 1,500 | written |
| G4 | setup/business-setup-cost | כמה עולה להקים עסק בישראל | 1,400 | written |
| G5 | setup/business-bank-account | פתיחת חשבון בנק לעסק | 1,300 | written |
| G6 | tax/issue-invoice-allocation-number | איך מפיקים חשבונית ואיך עובד מספר הקצאה | 1,700 | written |
| G7 | tax/income-tax-advance-payments | מקדמות מס הכנסה לעצמאי | 1,400 | written |
| G8 | tax/annual-tax-report-self-employed | דו״ח שנתי לעצמאי | 1,600 | written |
| G9 | tax/vat-for-self-employed | מע״מ לעצמאים: חישוב, דיווח ותשלום | 1,600 | written |
| G10 | tax/recognized-expenses | הוצאות מוכרות לעצמאי | 1,400 | written |
| G11 | tax/choose-accountant | איך בוחרים רואה חשבון | 1,400 | written |
| G12 | tax/year-end-tax-prep | איך מתכוננים לסוף שנת מס | 1,400 | written |
| G13 | pension/pension-for-self-employed | פנסיה לעצמאיים: מה חובה ומה אפשר | 1,600 | written |
| G14 | pension/hishtalmut-deposit-self-employed | הפקדה לקרן השתלמות לעצמאי | 1,500 | written |
| G15 | banking/how-to-choose-clearing | איך בוחרים חברת סליקה | 1,500 | written |
| G16 | banking/reduce-bank-fees | איך מקטינים עמלות בנק לעסק | 1,400 | written |
| G17 | banking/business-credit-card-guide | מדריך לכרטיס אשראי עסקי | 1,300 | written |
| G18 | ecommerce/ecommerce-payments-setup | הקמת סליקה לחנות אונליין | 1,500 | written |
| G19 | ecommerce/selling-online-basics | יסודות מכירה אונליין בישראל | 1,400 | written |
| G20 | tools/choose-accounting-software | איך בוחרים תוכנת הנהלת חשבונות | 1,300 | written |

## 6. ביקורות ספק — `/content/reviews/` (30)

| # | slug | קטגוריה | סטטוס |
|---|---|---|---|
| R1 | cardcom | clearing | written |
| R2 | tranzila | clearing | written |
| R3 | payplus | clearing | written |
| R4 | grow | clearing | written |
| R5 | pelecard | clearing | written |
| R6 | yaad-sarig | clearing | written |
| R7 | stripe | clearing | written |
| R8 | paypal | clearing | written |
| R9 | isracard | clearing | written |
| R10 | max | clearing | written |
| R11 | cal | clearing | written |
| R12 | green-invoice | invoicing | written |
| R13 | icount | invoicing | written |
| R14 | rivhit | invoicing | written |
| R15 | invoice4u | invoicing | written |
| R16 | hyp-ezcount | invoicing | written |
| R17 | hashavshevet | invoicing | written |
| R18 | cardcom-invoices | invoicing | written |
| R19 | fireberry | crm | written |
| R20 | monday | crm | written |
| R21 | zoho | crm | written |
| R22 | pipedrive | crm | written |
| R23 | salesforce | crm | written |
| R24 | hubspot | crm | written |
| R25 | hilan | payroll | written |
| R26 | michpal | payroll | written |
| R27 | payslips | payroll | written |
| R28 | rivhit-accounting | accounting | written |
| R29 | bank-hapoalim | business-banking | written |
| R30 | bank-leumi | business-banking | written |

## 7. דפי מחשבונים — `/content/calculators/` (12 + 7 נוספים)

K1 atzmai-net · K2 employee-vs-freelancer · K3 clearing-fees · K4 invoicing-cost · K5 vat · K6 salary-net · K7 keren-hishtalmut · K8 pension-self-employed · K9 severance · K10 unemployment · K11 osek-patur-threshold · K12 compound-interest-mortgage
נוספים: freelancer-hourly-rate · payslip-decoder · business-setup-cost · business-structure-quiz · tax-calendar · bank-fee-checker · tax-refund-estimator

## 8. דפי נחיתה ו-UI — `/content/pages/`, `/content/ui/he.json`

home · about · methodology · editorial-policy · advertise · contact · lead-accountant · lead-pension-information · lead-mortgage-information · `ui/he.json`

## 9. ניוזלטר ורשתות — `/content/newsletter/`

6 גיליונות + 30 סניפטים לרשתות/וואטסאפ.

---

### החלטות ניהול מלאי
- **החלפות (swap):** לא בוצעו החלפות. הנתונים ב-`TOPICS_AND_KEYWORDS.md` דקים, ו-24 הנושאים נכתבו כפי שהוגדרו (עם התאמות ניסוח בלבד).
- **נושאים מפוקחים** (`regulated: true`): A8, A9, A10, A20, A21, C8, H4, וכן דפי המחשבון keren-hishtalmut ו-pension-self-employed ושני מדריכי הפנסיה — כולם כוללים `<!-- DISC-PENSION -->` ושפה חינוכית בלבד.
- **דחיות:** אין. כל 133 קבצי התוכן המתוכננים נכתבו בקומיט זה (בתוספת `content/ui/he.json` ו-`social-snippets.md`). סה״כ 134 קבצי `.mdx`/`.md` ו-24 קבצי תרשים `.data.json`.

### הערות יישום (לאגנט 5/6)
- **שלושת ה-slugs שהיו כפולים** בין סוגי עמודים שונים נוסחו מחדש כדי ש-`{{link:slug}}` יצביע ל-URL יחיד:
  - מדריך המקדמות: `income-tax-advance-payments` → `advance-payments-self-employed` (המאמר שומר על ה-slug המקורי).
  - מחשבון השכיר/עצמאי: `employee-vs-freelancer` → `employee-vs-freelancer-calculator` (עמוד ההשוואה שומר על ה-slug המקורי).
  - כלי עלות ההקמה: `business-setup-cost` → `business-setup-cost-calculator` (המדריך שומר על ה-slug המקורי).
- **טוקנים:** `{{aff:slug}}` תוקנן ל-`id` המדויק מ-`/data/providers/*.json` (קו תחתון, למשל `green_invoice`) בכל התוכן.
- **בדיקות:** `node scripts/content-qa.mjs` — 0 BLOCKERS. 8 אזהרות בלבד, כולן מספרי "דוגמה/הדגמה" מחושבים ומסומנים.
- **כתיב אחיד:** מטבע `1,000 ₪`, אחוזים `18%`, תאריכים `16.10.2026`, פנייה מגדרית ניטרלית.
