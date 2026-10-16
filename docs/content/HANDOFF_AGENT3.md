# HANDOFF_AGENT3 — העברת תוכן לאגנט 4 (משפטי) ולאגנט 5 (SEO)

**מאת:** אגנט 3 (תוכן) · **תאריך:** 16.10.2026 · **היקף:** 134 קבצי תוכן + 24 קבצי תרשים, 111,414 מילים.

---

## חלק א׳ — לאגנט 4: קטעים רגישים משפטית לבדיקה

### A1. עמודים בקטגוריה מפוקחת (`regulated: true`) — דורשים DISC-PENSION ובדיקת ניסוח
| קובץ | סוג | למה רגיש |
|---|---|---|
| `content/compare/pension-vs-management-insurance.mdx` | compare | השוואת מוצרים פנסיוניים — גבול ייעוץ/שיווק |
| `content/categories/pension.mdx` | category hub | קטגוריה מפוקחת |
| `content/pages/lead-pension-information.mdx` | lead form | העברת לידים לפנסיה — נדרשת בדיקת ספק מורשה |
| `content/articles/management-fees-pension-hishtalmut-30-years.mdx` | article | "הדגמה" של דמי ניהול — חייב להישאר לא-ייעוצי |
| `content/articles/keren-hishtalmut-how-it-works.mdx` | article | כללי קרן השתלמות ופטור ממס |
| `content/articles/pension-for-self-employed-facts.mdx` | article | חובת הפקדה והטבות מס |
| `content/articles/employee-vs-freelancer-beyond-net.mdx` | article | זכויות סוציאליות/פנסיה |
| `content/articles/unemployment-benefits-self-employed.mdx` | article | זכויות ביטוח לאומי |
| `content/guides/pension/pension-for-self-employed.mdx` | guide | הדרכת פנסיה לעצמאי |
| `content/guides/pension/hishtalmut-deposit-self-employed.mdx` | guide | הפקדה לקרן השתלמות |
| `content/calculators/keren-hishtalmut.mdx` · `pension-self-employed.mdx` | calculator | מחשבון מפוקח — דורש DISC-CALC-PENSION |

**בקשה:** לאמת שכל אחד מהם (א) אינו ממליץ על מוצר/גוף/רמת הפקדה, (ב) אינו מציג תשואות, (ג) מציג "לא זמין" לדמי ניהול, (ד) מפנה לגמל נט/פנסיה נט הרשמיים, (ה) נושא DISC-PENSION/DISC-CALC.

### A2. אפיליאייט וגילוי נאות
- כל עמודי `compare/`, `best/` והביקורות (`reviews/`) מכילים `{{slot:AFF-1}}` ו/או `{{aff:slug}}`. **נדרש:** פס גילוי נאות מעל הקפל (DISC-AFFILIATE-STRIP) בכל עמוד עם `{{aff:}}`, ותג "ממומן/שותף" היכן שרלוונטי. אין כרגע הצהרת שותפות פר-ספק — נדרש טקסט גילוי.
- `/data/internal/affiliate_programs.json` **ריק** — אין מודל עמלה מאומת. אין לגרוע מכך שהאתר משתכר מכל ספק; יש להשתמש בניסוח הגילוי הכללי.

### A3. טפסי לידים ו"איננו יועצים"
- `content/pages/lead-accountant.mdx`, `lead-pension-information.mdx`, `lead-mortgage-information.mdx` — כל אחד מציין במפורש ש-IL-Tools אינה יועצת מורשית ומסביר את זרימת הנתונים. **נדרש:** לוודא שהצ'קבוקס הסכמה אינו מסומן כברירת מחדל, נוסח ההסכמה מגיע מ-`legal-texts.json`, וקיים מסלול לספקים מורשים בלבד.

### A4. שיטת הדירוג (טענה מסחרית)
- `content/pages/methodology.mdx` מפרסם משקלות (מחיר 30%, התאמת יכולות 30%, תמיכה 15%, אמינות 15%, שקיפות 10%). **נדרש:** לוודא שהניסוח "דירוג אינו למכירה" עומד בדרישות הגילוי, ושהמשקלות מוגדרות כמתודולוגיה פנימית (לא כסטטיסטיקה חיצונית).

### A5. מחשבונים — הסתייגויות
- 19 דפי מחשבון מכילים `## הנחות והגבלות`. **נדרש:** DISC-CALC לפי מחלקה (מס/מע״מ/פנסיה/סליקה/תלוש/החזר), מודאל בהרצה ראשונה, ואישור-גרסה.

### A6. ניסוחים שכבר נמנענו מהם (לבדיקה חוזרת)
- לא נכתב "כדאי לך לבחור" בקטגוריות מפוקחות; כל מספר "low confidence" (קרן השתלמות/פנסיה) מלווה בהסתייגות. אין תשואות, אין דירוג מוצרים מפוקחים, אין עדויות/ביקורות משתמש מומצאות.

---

## חלק ב׳ — לאגנט 5: הזדמנויות אופטימיזציה

### B1. Frontmatter שכבר קיים ומוכן
לכל קובץ: `title`, `description`, `slug`, `type`, `category`, `primary_keyword`, `secondary_keywords[]`, `search_intent`, `related[]`, `sources[]`, `updated`, `author`, `monetization_slots[]`, `regulated`, `word_count`, `reading_time`, `canonical`. **חסר לאגנט 5:** אימות אורך title/description, מיפוי canonical סופי, שדות OG, וסכמת JSON-LD.

### B2. מילות מפתח עיקריות לכל אשכול
- השוואות: "חשבונית ירוקה או מורנינג", "icount או חשבונית ירוקה", "cardcom או tranzila", "עוסק פטור או מורשה", "שכיר או עצמאי".
- מחשבונים: "מחשבון נטו לעצמאי", "מחשבון מע״מ", "מחשבון עמלות סליקה", "מחשבון שכר נטו", "מחשבון קרן השתלמות".
- מדריכים: "פתיחת תיק עוסק פטור", "איך מפיקים חשבונית", "מקדמות מס הכנסה", "דוח שנתי לעצמאי", "פנסיה לעצמאיים".
- מאמרים: מילות מפתח ארוכות ("תקרת עוסק פטור", "עמלת סליקה", "הוצאות מוכרות").

### B3. קישור פנימי
- כל מאמר מסתיים ב-`## המשיכו משם` עם `{{link:calculator}}` + `{{link:compare}}` + 2 קשורים. כל מדריך מסתיים ב-`## סיכום ומה הלאה`.
- **יעד:** כל השוואה תקבל 2 versus נוספים + hub + 2 מדריכים; כל מחשבון → השוואה + 2 מדריכים. יש להפיק `/seo/internal-links.json`.
- **שים לב:** תוקננו 3 slugs כפולים (ראו `CONTENT_INVENTORY.md` → "הערות יישום"). יש להשתמש ב-slugs הסופיים ב-`url-map.json`.

### B4. תרשים כנכס Discover/Dataset
- 24 קבצי `/content/articles/<slug>.data.json`. מומלץ להציע `Dataset` schema לעמודי הנתונים השנתיים (מדרגות מס, תקרות, עמלות סליקה) ולבנות "דוח עמלות סליקה" שנתי כנכס לקישורים.

### B5. סיכוני SEO / קוליזיה
- הימנעו מ-cannibalization בין מאמר ל-guide באותו נושא (למשל `income-tax-advance-payments` מאמר מול `advance-payments-self-employed` מדריך) — להגדיר URL ראשי אחד לכל אשכול.
- דפי "הצעת מחיר בלבד" (סליקה/בנקים) דקים במספרים אך עשירים בהסבר — לא להוסיף מספרים מומצאים כדי "להעשיר".

### B6. אשכולות תוכן (hub→spoke)
`invoicing` → השוואות חשבוניות + ביקורות + מחשבון עלות → מדריך בחירה. `clearing` → השוואות סליקה + מחשבון עמלות + מאמרי-נתונים. `pension`/`keren-hishtalmut`, `business-banking`, `crm`, `accounting`, `payroll` — באותו מבנה.

---

## חלק ג׳ — פערים פתוחים (מפורט ב-`CONTENT_GAPS.md`)
פנסיה/קרן השתלמות — דמי ניהול חסרים (G-01/G-02); מקדמות/ניכוי במקור חסרים (G-05/G-06); תעריפי סליקה ל-6 סולקים חסרים (G-07); עמלות בנק וכרטיסים חסרות (G-11/G-12); תוכניות אפיליאייט ריקות (G-17). כל אלה נכתבו בלי מספר — אסור למלא בהערכה.

## חלק ד׳ — כלי בקרה
- `node scripts/content-qa.mjs` — 0 BLOCKERS, 8 אזהרות "דוגמה" בלבד.
- `node scripts/normalize-aff.mjs` — תיקון טוקנים.
- `node scripts/disambiguate-slugs.mjs` — ייחוד slugs.
