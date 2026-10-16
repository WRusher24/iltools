# LEGAL_COMPLIANCE.md — IL-Tools (il-tools.co.il)

> **טיוטת עבודה — נדרשת בדיקת עורך דין.**
> This is a compliance **working draft**, prepared by Agent 4 (Israeli Legal & Regulatory Compliance Analyst). It is **not legal advice** and must be reviewed and approved by a licensed Israeli attorney (עורך דין) before launch. Nothing here may be relied upon as a legal opinion.

---

## 0. Header / מטא-מידע ובקרת גרסאות

| שדה | ערך |
|---|---|
| מסמך | LEGAL_COMPLIANCE.md (מקור משפטי יחיד לריפו) |
| גרסה | 1.0 |
| תאריך הכנה | 2026-10-16 |
| author | Agent 4 — Israeli Legal & Regulatory Compliance Analyst |
| status | טיוטת עבודה (draft) — pending licensed-attorney review |
| תוצר נגזר | `/data/legal/legal-texts.json` (נוצר ע"י `scripts/extract-legal.mjs`) |
| בדיקות | `scripts/legal-lint.mjs` · `scripts/content-qa.mjs` |

**Change log**

| גרסה | תאריך | שינוי |
|---|---|---|
| 1.0 | 2026-10-16 | יצירה ראשונית: הסתייגויות, גילויי נאות, פרטיות, תנאי שימוש, עוגיות, נגישות, רישום ממצאים, מפרט אינטגרציה, רשימת מוכנות, שאלות פתוחות ומקורות. תוקנו ממצאים HIGH בקבצי התוכן (cardcom, yaad-sarig). |

### 0.1 Legend — סמלים ומרקרים קריאים למכונה (Developer notes, English)

Every ready-to-render user-facing legal text is wrapped in a fenced block delimited by two HTML comments:

```
<!-- LEGAL:BEGIN id="DISC-CALC-TAX" version="1.0" lang="he" placement="calculator-modal" -->
...Hebrew Markdown...
<!-- LEGAL:END id="DISC-CALC-TAX" -->
```

* `scripts/extract-legal.mjs` parses these blocks → `/data/legal/legal-texts.json` with
  `{ id, version, lang, placement, markdown, effective_date }`.
* The `id=` in `BEGIN` **must** equal the `id=` in `END`. Blocks must be balanced; ids must be unique; bodies must be non-empty.
* Agent 6 must **render the `markdown` verbatim** from `legal-texts.json`. Do **not** retype, paraphrase or edit legal strings in components.
* Other machine markers used in content: `<!-- DISC-PENSION -->` (regulated pension/insurance/hishtalmut page), `<!-- LEGAL-REVIEW: reason -->` (paragraph flagged for attorney review), the tokens `{{updated:YYYY-MM-DD}}` / `{{sources:[…]}}` / `{{chart:…}}` / `{{slot:…}}` / `{{aff:…}}`, and frontmatter keys `regulated:` / `sources:` / `updated:` / `canonical:` / `type:`.

**Legal IDs defined in this document** (27): DISC-GENERAL, DISC-FULL, DISC-PENSION, DISC-COMPARE, DISC-RATES-DATE, DISC-CALC-TAX, DISC-CALC-VAT, DISC-CALC-PENSION, DISC-CALC-NI, DISC-CALC-CREDIT, DISC-CALC-CLEARING, DISC-CALC-PAYSLIP, DISC-CALC-REFUND, DISC-CALC-GENERIC, DISC-AFFILIATE-STRIP, DISC-AFFILIATE-FULL, DISC-ADSENSE, DISC-SPONSORED, DISC-LEAD, DISC-EDITORIAL-INDEPENDENCE, LEGAL-PRIVACY, LEGAL-TERMS, LEGAL-LEAD-TERMS, LEGAL-NEWSLETTER-TERMS, LEGAL-COOKIES, LEGAL-COOKIE-BANNER, LEGAL-ACCESSIBILITY.

**Default factual position (do not contradict without owner confirmation):** IL-Tools is an **information / comparison / calculator** service. It is **not** licensed to provide investment advice (ייעוץ השקעות), investment marketing (שיווק השקעות), pension advice or pension marketing (ייעוץ/שיווק פנסיוני), insurance agency, tax advice, or credit/mortgage brokerage. Regulated-topic content is **educational**; where leads are passed, they go **only to licensed third parties** who bear the advisory responsibility.

---

## 1. MANDATORY FINANCIAL DISCLAIMERS / הסתייגויות חובה

### 1.1 DISC-GENERAL — שורת פוטר אתר־רחבית

<!-- LEGAL:BEGIN id="DISC-GENERAL" version="1.0" lang="he" placement="footer" -->
**IL-Tools הוא אתר מידע, השוואה ומחשבונים.** המידע באתר הוא כללי בלבד, אינו ייעוץ פיננסי, פנסיוני, משפטי או מיסויי, ואינו תחליף לחישוב רשמי או לייעוץ של בעל/ת מקצוע מורשה/ית. **אין לראות באמור ייעוץ פיננסי או השקעות מכל סוג שהוא.** האחריות להחלטות היא של המשתמש/ת.
<!-- LEGAL:END id="DISC-GENERAL" -->

### 1.2 DISC-FULL — עמוד הצהרת האחריות המלא (`/legal/disclaimer`)

<!-- LEGAL:BEGIN id="DISC-FULL" version="1.0" lang="he" placement="page:/legal/disclaimer" -->
# הצהרת אחריות ואי־תחליפיות (Disclaimer)

## מהות השירות
IL-Tools הוא **אתר מידע, השוואה ומחשבונים** לעצמאים, לעסקים קטנים ולצרכנים בישראל. אנחנו אוספים נתונים ממקורות רשמיים ומפרסומים של ספקים, בונים מחשבונים ומפרסמים השוואות ומדריכים בעברית. השירות הוא **מידע כללי בלבד**.

## אין ייעוץ — אין תחליף לבעל/ת מקצוע
**אין לראות באמור ייעוץ פיננסי, פנסיוני, ביטוחי, השקעות, משפטי או מיסויי מכל סוג שהוא.** התוכן באתר אינו המלצה, אינו הצעה ואינו שיווק של מוצר, גוף או רמת הפקדה. הוא **אינו תחליף** לייעוץ של יועץ השקעות, יועץ/סוכן פנסיוני, סוכן ביטוח, רואה חשבון, יועץ מס או עורך דין מורשה/ית — ואינו תחליף לחישוב רשמי של רשות המסים, של ביטוח לאומי או של כל גוף ציבורי אחר.

## היעדר רישיון
IL-Tools **אינו בעל רישיון** לייעוץ השקעות, לשיווק השקעות, לניהול תיקי השקעות, לייעוץ פנסיוני או לשיווק פנסיוני לפי חוק הפיקוח על שירותים פיננסיים (ייעוץ, שיווק ומערכת סליקה פנסיוניים), התשס״ה-2005, לפי חוק הסדרת העיסוק בייעוץ השקעות, בשיווק השקעות ובניהול תיקי השקעות, התשנ״ה-1995, או לפי כל דין אחר. אין באתר שיווק של מוצר פנסיוני או ביטוחי, ואין בו דירוג או בחירה של מוצר.

## דיוק, שינויים וטעויות
הנתונים מתפרסמים כפי שאותרו במועד העדכון המצוין בכל עמוד, ו**עשויים להשתנות מעת לעת**, לרבות עקב שינויי חקיקה, תעריפים ותנאי ספקים. ייתכנו **טעויות, השמטות או אי-דיוקים**. אין באתר התחייבות לדיוק, לשלמות או לעדכניות. בכל מקום שבו מוצג מספר, יש לאמת אותו מול המקור הרשמי. תיקוני טעויות מתקבלים בכתובת {{לינק_לעמוד_יצירת_קשר}} ומוטמעים בהתאם למדיניות המערכת.

## נתוני עבר אינם מעידים על העתיד
כל נתון, דוגמה או הדגמה חישובית (לרבות חישוב תשואה היפותטית בדמי ניהול) הם **המחשה בלבד ואינם תחזית**. **נתוני עבר או הדגמות אינם מלמדים על תוצאות עתידיות.** אין באתר הבטחה לתשואה, לחיסכון או לתוצאה.

## ניגוד עניינים ותמורה
IL-Tools **עשוי לקבל תמורה** בגין קישורי שותפים (אפיליאייט), מיקום ממומן, לידים ופרסום. תמורה זו מסומנת, משפיעה על מיקום אך **אינה משנה את ציון המערכת**, ואינה מהווה המלצה. הפרטים מלאים בעמוד [גילוי נאות (אפיליאייט)]({{לינק_גילוי_נאות}}). אופן השימוש של המפעילים בנכסים פיננסיים: **לא אומת** — יש להשלים עם הבעלים (ראו סעיף 12).

## אחריות המשתמש
השימוש באתר ובמחשבונים הוא **על אחריות המשתמש/ת בלבד**. יש לאמת כל נתון לפני הסתמכות, ולהתייעץ עם בעל/ת מקצוע מורשה/ית לפני קבלת החלטה פיננסית, פנסיונית, מיסויית או משפטית. השימוש במחשבונים אינו יוצר יחסי ייעוץ.

## קטינים
השירות אינו מיועד לקטינים מתחת לגיל 18.

*עודכן: {{תאריך_עדכון_אחרון}}. טיוטה — נדרשת בדיקת עורך דין לפני עלייה לאוויר.*
<!-- LEGAL:END id="DISC-FULL" -->

### 1.3 DISC-CALC-* — הסתייגות מחשבון לפי מחלקה (מודאל בהרצה ראשונה + שורה קבועה ליד התוצאה)

<!-- LEGAL:BEGIN id="DISC-CALC-TAX" version="1.0" lang="he" placement="calculator-modal" -->
**התוצאה היא הערכה בלבד ואינה מחליפה חישוב רשמי של רשות המסים.** החישוב מבוסס על נתונים סטטוטוריים שפורסמו ועשויים להשתנות; ייתכנו טעויות ושינויי חקיקה. אין לראות באמור ייעוץ מיסויי מכל סוג. מומלץ לאמת כל מספר מול רשות המסים ולהתייעץ עם רואה חשבון או יועץ מס לפני החלטה.
<!-- LEGAL:END id="DISC-CALC-TAX" -->

<!-- LEGAL:BEGIN id="DISC-CALC-VAT" version="1.0" lang="he" placement="calculator-modal" -->
**החישוב להערכה בלבד.** שיעור המע״מ וכללי החיוב והקיזוז עשויים להשתנות מעת לעת, וקיימים מקרים מיוחדים (יצוא, נכסים, מע״מ על רכב וציוד ועוד). אין לראות באמור ייעוץ מיסויי. יש לאמת מול רשות המסים ובמערכת הנהלת החשבונות שלכם.
<!-- LEGAL:END id="DISC-CALC-VAT" -->

<!-- LEGAL:BEGIN id="DISC-CALC-PENSION" version="1.0" lang="he" placement="calculator-modal" -->
**מידע חינוכי בלבד — לא ייעוץ פנסיוני ולא שיווק פנסיוני.** המחשבון אינו ממליץ על מוצר, גוף או רמת הפקדה. שיעורי ההפקדה, התקרות וההטבות שמוצגים הם לפי הנתונים שפורסמו, הם **בביטחון נמוך ועשויים להשתנות**, ואינם קובעים זכאות. דמי ניהול אינם מוצגים. לבדיקת דמי ניהול יש לפנות לגמל נט ולפנסיה נט הרשמיים, ולהתייעץ עם יועץ/ת פנסיוני/ת מורשה/ית. **אין לראות באמור ייעוץ השקעות או פנסיוני מכל סוג.**
<!-- LEGAL:END id="DISC-CALC-PENSION" -->

<!-- LEGAL:BEGIN id="DISC-CALC-NI" version="1.0" lang="he" placement="calculator-modal" -->
**התוצאה היא אומדן בלבד ואינה קביעה של זכאות או של סכום.** שיעורי ותקרות ביטוח לאומי, תנאי הזכאות ומשך הזכאות נקבעים על ידי ביטוח לאומי בלבד, ומשתנים מעת לעת. אין לראות באמור ייעוץ. יש לבדוק זכאות רשמית מול ביטוח לאומי.
<!-- LEGAL:END id="DISC-CALC-NI" -->

<!-- LEGAL:BEGIN id="DISC-CALC-CREDIT" version="1.0" lang="he" placement="calculator-modal" -->
**החישוב להמחשה בלבד ואינו הצעה, התחייבות או ייעוץ אשראי או משכנתאות.** הריביות, ההחזרים והתנאים בפועל נקבעים על ידי הגוף המלווה ומושפעים מנתונים אישיים. אין באתר התחייבות לאישור הלוואה, לריבית או לתנאים. אין לראות באמור ייעוץ פיננסי. לפני התקשרות יש להתייעץ עם בעל/ת רישיון או עם הגוף המלווה.
<!-- LEGAL:END id="DISC-CALC-CREDIT" -->

<!-- LEGAL:BEGIN id="DISC-CALC-CLEARING" version="1.0" lang="he" placement="calculator-modal" -->
**החישוב להערכה בלבד ואינו הצעת מחיר.** העמלות בפועל נקבעות בהסכם אישי עם חברת הסליקה, לפי מחזור, סוג כרטיס ורמת סיכון, ואינן מפורסמות במלואן. אין לראות באמור ייעוץ פיננסי או המלצה על ספק. יש לאמת כל רכיב בהצעה כתובה.
<!-- LEGAL:END id="DISC-CALC-CLEARING" -->

<!-- LEGAL:BEGIN id="DISC-CALC-PAYSLIP" version="1.0" lang="he" placement="calculator-modal" -->
**הכלי מסביר ומסמן — ואינו קובע אם התלוש תקין.** החישוב להערכה בלבד ואינו מחליף את המעסיק, מחלקת השכר או רואה חשבון, ואינו מהווה ייעוץ מיסויי או ייעוץ שכר. את הנתונים יש לאמת מול המעסיק ומול רשות המסים.
<!-- LEGAL:END id="DISC-CALC-PAYSLIP" -->

<!-- LEGAL:BEGIN id="DISC-CALC-REFUND" version="1.0" lang="he" placement="calculator-modal" -->
**זו בדיקה ראשונית בלבד — אינה בקשת החזר ואינה קביעה שמגיע החזר.** הפער המסומן הוא אינדיקציה אפשרית; הזכאות, הסכום ותקופת ההתיישנות נקבעים על ידי רשות המסים ולפי בדיקה מקצועית. אין כאן התחייבות לתוצאה ואין ייעוץ מיסויי.
<!-- LEGAL:END id="DISC-CALC-REFUND" -->

<!-- LEGAL:BEGIN id="DISC-CALC-GENERIC" version="1.0" lang="he" placement="calculator-modal" -->
**התוצאה היא הערכה בלבד ואינה מחליפה חישוב רשמי או ייעוץ מקצועי.** הנתונים מבוססים על מקורות שפורסמו ועשויים להשתנות; ייתכנו טעויות. **אין לראות באמור ייעוץ פיננסי, מיסויי או משפטי מכל סוג.** יש לאמת את הנתונים מול המקור הרשמי ולהתייעץ עם בעל/ת מקצוע מורשה/ית לפני החלטה.
<!-- LEGAL:END id="DISC-CALC-GENERIC" -->

### 1.4 DISC-PENSION — עמודי פנסיה / ביטוח / קרן השתלמות (regulated)

<!-- LEGAL:BEGIN id="DISC-PENSION" version="1.0" lang="he" placement="regulated-page" -->
**מידע חינוכי בלבד — לא ייעוץ פנסיוני, לא שיווק פנסיוני ולא המלצה.**

התוכן בעמוד זה הוא **מידע כללי** בלבד. הוא אינו ייעוץ פנסיוני, אינו ייעוץ השקעות, אינו ייעוץ מס ואינו המלצה או שיווק של מוצר, גוף, מסלול או רמת הפקדה. **אין לראות באמור ייעוץ פיננסי או השקעות מכל סוג שהוא.**

- IL-Tools **אינו בעל רישיון** לייעוץ או לשיווק פנסיוני לפי חוק הפיקוח על שירותים פיננסיים (ייעוץ, שיווק ומערכת סליקה פנסיוניים), התשס״ה-2005.
- **אין באתר תשואות, ואין דירוג של מוצרים פנסיוניים או ביטוחיים** לפי תשואה.
- **דמי ניהול** של הגופים אינם מוצגים בנתוני האתר; יש לבדוק אותם בכלים הרשמיים של רשות שוק ההון — **גמל נט** ו-**פנסיה נט**.
- שיעורי הפקדה, תקרות והטבות מס מוצגים לפי הנתונים שפורסמו, **בביטחון נמוך**, ואינם קובעים זכאות. יש לאמת מול מקור רשמי.
- כל החלטה על מוצר פנסיוני או ביטוחי מחייבת שיחה עם **יועץ/ת פנסיוני/ת, סוכן/ת פנסיוני/ת או סוכן/ת ביטוח מורשה/ית**. האחריות על ההחלטה היא של המשתמש/ת.
<!-- LEGAL:END id="DISC-PENSION" -->

### 1.5 DISC-COMPARE — עמודי השוואה

<!-- LEGAL:BEGIN id="DISC-COMPARE" version="1.0" lang="he" placement="compare-page" -->
**ההשוואה מבוססת על נתונים שפורסמו ואינה המלצה.** הנתונים בעמוד מוצגים "כפי שפורסמו" במועד העדכון, עשויים להשתנות, וייתכנו הבדלים בין ספק לספק ובמהלך הזמן. הציון והמיקום נקבעים לפי [שיטת הדירוג](/methodology) ואינם מושפעים מתשלום. **אין לראות באמור ייעוץ פיננסי, פנסיוני, מיסויי או משפטי, ואין בו המלצה לבחור ספק, מוצר או מסלול.** יש לאמת תנאים ומחירים מול הספק ובהצעה כתובה, ולהתייעץ עם בעל/ת מקצוע מורשה/ית לפי הצורך.
<!-- LEGAL:END id="DISC-COMPARE" -->

### 1.6 DISC-RATES-DATE — תבנית "תאריך עדכון נתונים"

<!-- LEGAL:BEGIN id="DISC-RATES-DATE" version="1.0" lang="he" placement="inline-stamp" -->
**הנתונים עודכנו לאחרונה בתאריך {date}.** הנתונים הסטטוטוריים (מדרגות מס, נקודות זיכוי, תקרות, שיעורי מע״מ וביטוח לאומי) נבדקים מחדש בכל ינואר ובכל שינוי חקיקה. לפני הסתמכות, יש לאמת את הנתונים מול המקור הרשמי. מקורות: {sources}.
<!-- LEGAL:END id="DISC-RATES-DATE" -->

### 1.7 Developer note — מקום החלפת ה-placeholders

`{date}`, `{sources}`, `{{לינק_...}}`, `{{תאריך_עדכון_אחרון}}` are runtime placeholders. Agent 6 fills `{date}` from the page's `{{updated:…}}` and `{sources}` from `/data/sources.json`; `{{לינק_...}}` resolve to the internal routes in §10.3. Never ship a raw placeholder.

---

## 2. AFFILIATE, ADVERTISING & SPONSORSHIP DISCLOSURES / גילויי נאות לפרסום, שותפים וחסות

### 2.1 DISC-AFFILIATE-STRIP — פס גילוי נאות עליון (אתר־רחבי, מעל הקפל)

<!-- LEGAL:BEGIN id="DISC-AFFILIATE-STRIP" version="1.0" lang="he" placement="top-strip" -->
**גילוי נאות:** IL-Tools עשוי לקבל עמלה או תמורה אחרת כאשר רוכשים או נרשמים לשירות דרך קישורים באתר. התמורה **אינה משנה את ציוני המערכת או את דירוג הסליקה**, והיא מסומנת ליד הקישור. פרטים מלאים בעמוד [גילוי נאות](/legal/affiliate-disclosure).
<!-- LEGAL:END id="DISC-AFFILIATE-STRIP" -->

### 2.2 DISC-AFFILIATE-FULL — עמוד גילוי נאות מלא (`/legal/affiliate-disclosure`)

<!-- LEGAL:BEGIN id="DISC-AFFILIATE-FULL" version="1.0" lang="he" placement="page:/legal/affiliate-disclosure" -->
# גילוי נאות — קישורי שותפים, פרסום ותוכן ממומן

## איך אנחנו מתפרנסים
IL-Tools מתפרנס ממספר מקורות, וכולם גלויים לקוראים:
- **קישורי שותפים (אפיליאייט):** אם נרשמים או רוכשים שירות דרך קישור באתר, אנו עשויים לקבל עמלה. העמלה אינה מייקרת עבורכם את השירות.
- **מיקום ממומן ותוכן ממומן:** יחידות בתשלום, המסומנות בבירור כ"ממומן" או "בשיתוף".
- **לידים:** העברת פרטי פונים לבעלי מקצוע **מורשים בלבד**, בהסכמת הפונים ובתמורה מוסכמת.
- **פרסום תצוגה (Google AdSense):** פרסומות המוצגות על ידי Google.

## מה אנחנו שומרים עליו
- **הדירוג אינו למכירה.** הציון נקבע לפי [שיטת הדירוג](/methodology) בלבד. מיקום בתשלום הוא מודול נפרד ומסומן, ואינו משנה ציון.
- **גילוי לפני הקפל.** הפס העליון [DISC-AFFILIATE-STRIP] מוצג בכל עמוד שיש בו קישור שותפים.
- **סימון ליד הקישור.** כל קישור שותפים מסומן; אין הסתרת מהות מסחרית.
- **עריכה בלתי תלויה.** תוכן מערכתי אינו נמכר ואינו מושפע מתשלום.

## מה זה אומר עבורך
העמלה שאנו מקבלים אינה משנה את המחיר שאתם משלמים, והיא אינה אמורה להשפיע על מה שאנחנו כותבים. בכל זאת, **יש לאמת מחירים ותנאים מול הספק עצמו** לפני התקשרות. אין בגילוי הזה כדי להפוך את המידע באתר לייעוץ.

## קישורים יוצאים
קישורים יוצאים לספקים ולשותפים מסומנים ב-`rel="sponsored nofollow noopener"` ומפנים דרך `/go/[slug]` (עמוד לא-מאונדקס). פרטים מלאים על הסימון במפרט האינטגרציה (§10).

*עודכן: {{תאריך_עדכון_אחרון}}.*
<!-- LEGAL:END id="DISC-AFFILIATE-FULL" -->

### 2.3 DISC-ADSENSE — הסבר פרסומות Google ועוגיות

<!-- LEGAL:BEGIN id="DISC-ADSENSE" version="1.0" lang="he" placement="page:/legal/cookies" -->
## פרסומות של Google (AdSense)
האתר מציג פרסומות באמצעות **Google AdSense**. Google וספקי צד שלישי עשויים להשתמש בעוגיות כדי להציג פרסומות על סמך ביקורים קודמים באתר זה או באתרים אחרים.

- ניתן להשבית פרסום מותאם אישית בהגדרות של Google.
- ניתן לבטל פרסום מותאם אישית של ספקי צד שלישי באמצעות כלי ההעדפות של Google.
- פרסומות מותאמות אישית מוצגות **רק לאחר קבלת הסכמה** בהתאם להגדרות ה-Consent Mode ולבחירה שלכם בבאנר; ללא הסכמה, מוצגות פרסומות לא-מותאמות אישית ככל שהדבר מתאפשר.
- אנחנו לא שולטים בתוכן הפרסומות; פרסומת אינה המלצה של IL-Tools.
<!-- LEGAL:END id="DISC-ADSENSE" -->

### 2.4 DISC-SPONSORED — סימון "ממומן / בשיתוף / פרסומת"

<!-- LEGAL:BEGIN id="DISC-SPONSORED" version="1.0" lang="he" placement="inline-label" -->
**מתי משתמשים בכל תווית:**
- **"ממומן"** — כאשר הספק שילם על הצגת פריט, מיקום או תוכן.
- **"בשיתוף"** — כאשר התוכן נעשה בשיתוף פעולה עם ספק (לרבות קבלת מידע, גישה או תמורה), גם אם לא שולם ישירות.
- **"פרסומת"** — כאשר המסר מהווה פרסומת של הספק, לרבות בדיוור ובניוזלטר.
- **"שותף"** — לצד קישור שותפים שמזכה בעמלה.

התווית מוצגת **גלוי, בסמוך לפריט וללא הסתרה** — לא רק בפוטר, בטקסט קטן או בצבע זהה לרקע. אין לתייג תוכן מערכתי כשאינו ממומן.
<!-- LEGAL:END id="DISC-SPONSORED" -->

### 2.5 DISC-LEAD — גילוי לגבי טפסי לידים

<!-- LEGAL:BEGIN id="DISC-LEAD" version="1.0" lang="he" placement="form" -->
## מה קורה כששולחים טופס
- הפרטים שאתם מוסרים נשלחים ל-**IL-Tools**.
- אנחנו מעבירים אותם ל**בעל/ת מקצוע מורשה/ית בלבד** (למשל רואה חשבון, יועץ מס, יועץ/סוכן פנסיוני מורשה, יועץ משכנתאות) המתאים לתחום, לצורך חזרה אליכם.
- **IL-Tools אינו צד להתקשרות** עם בעל/ת המקצוע ואינו נותן ייעוץ. האחריות על הייעוץ ועל התנאים היא של בעל/ת המקצוע.
- **IL-Tools עשוי לקבל תמורה** בגין העברת הפנייה. התמורה אינה מייקרת עבורכם את השירות והיא אינה משנה את אופן הטיפול בפנייה.
- אפשר לבקש בכל עת שהפרטים יימחקו — דרך [יצירת קשר](/contact).
- אין התחייבות למחיר, לזמינות או לתוצאה.
<!-- LEGAL:END id="DISC-LEAD" -->

### 2.6 DISC-EDITORIAL-INDEPENDENCE — עצמאות מערכתית

<!-- LEGAL:BEGIN id="DISC-EDITORIAL-INDEPENDENCE" version="1.0" lang="he" placement="inline-note" -->
**הדירוג אינו למכירה.** הציון והמיקום בכל השוואה נקבעים לפי [שיטת הדירוג](/methodology) בלבד — מחיר, התאמת יכולות, תמיכה, אמינות ושקיפות — ואינם מושפעים מתשלום, משותפות או מפרסום. פריטים בתשלום מוצגים במודול נפרד ומסומן. אין באתר ציטוטים, דירוגי משתמשים או ביקורות שאין לנו, ואין דירוג מוצרים פנסיוניים לפי תשואה.
<!-- LEGAL:END id="DISC-EDITORIAL-INDEPENDENCE" -->

### 2.7 Developer note — visual & rel requirements (English)

* **DISC-AFFILIATE-STRIP**: render at the **top of every page** that contains an `{{aff:…}}` link or an `{{slot:AFF-*}}`, immediately under the header, **above the fold**, `role="note"`, minimum font-size 13px, contrast ≥ 4.5:1, never clipped, never `display:none`.
* **Link `rel`**: every affiliate/outbound monetized link → `rel="sponsored nofollow noopener"` and `target="_blank"`; route via `/go/[slug]`, which must be `noindex` and `Disallow`ed in robots.
* **Sponsored labels**: text label `ממומן` / `בשיתוף` / `פרסומת` inside the same card as the item, ≥ 12px, AA contrast, not removed on hover/focus.
* **Proximity**: the label must be within the card/row, not only at page level. DISC-AFFILIATE-STRIP cannot be the sole disclosure for a labelled module.
* **Prohibited (dark patterns)**: pre-ticked consents, hidden/`opacity:0` disclosures, disclosures styled as content, "confirm-shaming", fake scarcity/countdowns, ads styled to look like editorial cards.

---

## 3. PRIVACY POLICY / מדיניות פרטיות (`/legal/privacy`)

<!-- LEGAL:BEGIN id="LEGAL-PRIVACY" version="1.0" lang="he" placement="page:/legal/privacy" -->
# מדיניות פרטיות

*נוסח זה הוא טיוטת עבודה לבדיקת עורך דין. יש להשלים את כל השדות המסומנים ב-`[...]` לפני פרסום.*

## 1. מי אנחנו (בעל השליטה במאגר)
בעל השליטה במידע האישי הוא **[שם הישות המשפטית]**, ח.פ./ע.מ. **[מספר]**, מרחב **[כתובת]**, ישראל ("**IL-Tools**", "אנחנו"). לפניות בנושאי פרטיות: **[כתובת אימייל לפרטיות]**.

IL-Tools הוא אתר מידע, השוואה ומחשבונים. אנחנו לא נותנים ייעוץ פיננסי, פנסיוני, מיסויי או משפטי (ראו [הצהרת אחריות](/legal/disclaimer)).

## 2. איזה מידע אנחנו אוספים
- **מידע שאתם מוסרים מרצון**: שם, טלפון, כתובת אימייל והודעה — בעיקר בטפסי לידים ובהרשמה לניוזלטר. בטפסים מסוימים אתם עשויים למסור מידע פיננסי כללי (למשל סוג העיסוק או נושא הפנייה). **אין למסור מידע רגיש שאינו נדרש.**
- **מידע שנאסף אוטומטית**: כתובת IP, סוג דפדפן ומכשיר, דפים שנצפו, זמני ביקור, מקור ההגעה, ומזהים מקוונים (עוגיות ומזהי מכשיר).
- **מידע מכלי צד שלישי**: Google Analytics ו-Google AdSense (ראו סעיף 7 ל[מדיניות העוגיות](/legal/cookies)).
- **מידע בטפסי המחשבונים**: המחשבונים פועלים **בדפדפן בלבד**. נתוני המחשבון, לרבות נתוני מחשבון תלוש השכר, **אינם נשלחים לשרת ואינם נשמרים** אצלנו.
- **יומני שרת**: נרשמות בקשות לדפים ולנקודות קצה, לצורכי אבטחה, תקינות ומניעת שימוש לרעה.

## 3. למה אנחנו משתמשים במידע (מטרות)
- הפעלת האתר, אבטחתו ותחזוקתו.
- החזרת תשובה לפנייה, לרבות העברת פרטי ליד לבעל/ת מקצוע מורשה בהסכמתכם.
- שליחת ניוזלטר/עדכונים — **בכפוף להסכמה** (ראו סעיף 7).
- מדידת שימוש ושיפור התוכן והמחשבונים.
- הצגת פרסומות (בכפוף להסכמה לעוגיות פרסום).
- עמידה בחובות חוקיות.

## 4. בסיס העיבוד והסכמה
בסיס העיבוד הוא **הסכמתכם** (למשל: שליחת טופס, הרשמה לניוזלטר, הסכמה לעוגיות שאינן הכרחיות), **האינטרס הלגיטימי** בהפעלת האתר ובאבטחתו, ו**קיום חובה חוקית** במקרים המתאימים. **מסירת המידע היא לרוב וולונטרית ואינה חובה חוקית**, למטרה שתצוין בעת האיסוף; אולם בלי למסור את הפרטים הנדרשים לא נוכל לחזור אליכם או לטפל בפנייה.

**הודעה בעת איסוף (סעיף 11 לחוק הגנת הפרטיות):** בכל פנייה לקבלת מידע אישי נמסור: אם חלה חובת מסירה או שהמסירה תלויה ברצון ובהסכמה ומהי תוצאת אי‑ההסכמה; המטרה שלשמה מבוקש המידע; שמו של בעל השליטה ודרכי ההתקשרות עמו; למי יימסר המידע ולשם אילו מטרות; וקיומן של זכות העיון וזכות התיקון.

## 5. מסירת מידע לצדדים שלישיים ומעבדים
- **ספקי לידים**: פרטי הפנייה מועברים ל**בעל/ת מקצוע מורשה/ית בלבד**, לצורך חזרה אליכם.
- **מעבדי שירות (מחזיקים)**: אחסון ואתר (Vercel), בסיס נתונים (Neon / Supabase PostgreSQL), דיוור (ספק האימייל), אנליטיקה ופרסום (Google). עם כל מחזיק מידע אנו מתקשרים בהתאם לתקנות הגנת הפרטיות (אבטחת מידע), התשע״ז-2017.
- **רשויות**: אם נידרש לכך על פי דין.

אין אנו מוכרים מידע אישי לצדדים שלישיים.

## 6. העברת מידע מחוץ לישראל
חלק מספקי השירות מאחסנים או מעבדים מידע **מחוץ לישראל** (למשל באיחוד האירופי ובארצות הברית). ההעברה נעשית לצורך הפעלת השירות, בהתאם לדין, ובנקיטת אמצעים חוזיים וטכניים סבירים להגנה על המידע. **אזורי האחסון המדויקים: [להשלמה — למשל fra1/arn1].**

## 7. דיוור ישיר, ניוזלטר וערוצי מסרונים
- הרשמה לניוזלטר נעשית ב**אימות כפול** (double opt-in).
- בדיוור פרסומי נציין את זהותנו, את מהות הפרסומת ("פרסומת") ואת **דרך פשוטה להסרה**. כל הודעה תכלול קישור/הוראה לביטול; ניתן להסיר בכל עת.
- מסירת פרטי קשר לצורך דיוור אינה מהווה הסכמה לקבלת פרסומות ללא הסכמה מפורשת נפרדת.

## 8. עוגיות ומעקב
האתר משתמש בעוגיות ובטכנולוגיות דומות. פירוט מלא ב[מדיניות העוגיות](/legal/cookies). עוגיות שאינן הכרחיות **כבויות כברירת מחדל** ומופעלות רק לאחר הסכמה.

## 9. תקופות שמירה
- **פניות ולידים**: נשמרים כל עוד נדרש למטרת הטיפול ולעמידה בדין, ובכל מקרה לא מעבר ל-[להשלמה — למשל 24 חודשים] ממועד הסגירה.
- **נרשמי ניוזלטר**: נשמרים עד להסרה.
- **יומני שרת**: לתקופה קצרה, לצורכי אבטחה ותקינות.
- **תיעוד הסכמות**: נשמר לצורך הוכחת עמידה בדין.

## 10. אמצעי אבטחה
אנו נוקטים אמצעים טכניים וארגוניים סבירים: הצפנת תעבורה (HTTPS), שמירת סודות באופן מוצפן, הרשאות גישה מצומצמות, תיעוד, גיבויים, והצפנת שדות רגישים בטופסי הלידים. אין אבטחה מוחלטת.

## 11. זכויותיך
אתה רשאי/ת ל**עיין** במידע האישי שנשמר עליך (סעיף 13 לחוק הגנת הפרטיות), לבקש **לתקן** מידע שגוי (סעיף 14), לבקש **למחוק** מידע (בכפוף לחריגים שבדין), לחזור בך מהסכמה, ולהתנגד לדיוור ישיר. לפניות: **[כתובת אימייל לפרטיות]**. נשיב בהתאם למועדים שבדין.

## 12. קטינים
השירות אינו מיועד לקטינים מתחת לגיל 18, ואין אנו אוספים ביודעין מידע מקטינים. אם נודע לנו שנאסף מידע כזה — נפעל למחיקתו.

## 13. תלונה לרשות
אם אינך מרוצה מהתנהלותנו, באפשרותך לפנות ל**הרשות להגנת הפרטיות** במשרד המשפטים (gov.il) בהתאם לחוק הגנת הפרטיות, התשמ״א-1981.

## 14. עדכונים
אנו עשויים לעדכן מדיניות זו מעת לעת; גרסה מעודכנת תפורסם בעמוד זה עם תאריך עדכון. שינוי מהותי יפורסם באופן בולט.

*עודכן: {{תאריך_עדכון_אחרון}}. טיוטה — נדרשת בדיקת עורך דין.*
<!-- LEGAL:END id="LEGAL-PRIVACY" -->

### 3.1 Developer/Owner note — database registration & DPO analysis (English, לא אומת לפרטי האתר)

Based on the current text of the Privacy Protection Law after **Amendment No. 13** (published 14.8.2024, **in force 14.8.2025**), a careful (conservative) reading for a small website:

* **Registration (סעיף 8א(א))**: registration duty now applies mainly to a database whose **main purpose is transferring data to others as a business or for consideration with data on >10,000 people**, and to public bodies. A typical comparison/lead site that keeps its own lead list is likely **outside** the registration duty — but this must be verified once the owner confirms volumes and purposes.
* **Notice duty (סעיף 8א(ב))**: notice to the PPA if the database holds **special-sensitivity data on >100,000 people**. Financial data and salary data are within the "special sensitivity" list; a small site is likely below the threshold, but a lead list of financial-detail submissions must be monitored.
* **DPO (סעיף 17ב1)**: appointment is required for public bodies, for a database whose main purpose is transfer as a business with >10,000 people, for large-scale systematic monitoring, and for large-scale special-sensitivity processing. A small site is likely **not** obligated — **owner must confirm**; if uncertain, appointing a DPO is the safer course.
* **Security regulations (תקנות אבטחת המידע, התשע״ז-2017)**: define database-definition document (תקנה 2), security procedure (תקנה 4), mapping/risk survey (תקנה 5), incident documentation and serious-incident reporting (תקנה 11), and processor agreements (תקנה 15). These apply regardless of registration.
* **Sensitive data**: lead forms collecting financial/pension details should be treated as special-sensitivity data → field-level encryption, least-privilege access, retention limits, and deletion.
* **Transfer abroad**: document hosting regions (Vercel/Neon/Supabase) and rely on contractual safeguards.

**Conclusion (conservative, לא אומת):** registration and DPO are **likely not mandatory** for the site as currently scoped, but the section-11 notice, the security regulations, processor agreements, and the lead-data rules **are** mandatory. Owner to confirm in §12.

---

## 4. TERMS OF USE / תנאי שימוש (`/legal/terms`) + נספחי טופס וניוזלטר

<!-- LEGAL:BEGIN id="LEGAL-TERMS" version="1.0" lang="he" placement="page:/legal/terms" -->
# תנאי שימוש

*נוסח זה הוא טיוטת עבודה לבדיקת עורך דין. יש להשלים `[...]` לפני פרסום.*

## 1. כללי והסכמה
ברוכים הבאים ל-IL-Tools (il-tools.co.il). השימוש באתר, בתוכן ובמחשבונים ("**השירות**") כפוף לתנאים אלה. עצם השימוש מהווה הסכמה להם. אם אינך מסכים/ה — נא להימנע משימוש. השירות ניתן "כפי שהוא" (as is) ו"כפי שזמין" (as available).

## 2. מהות השירות ואי-תחליפיות
השירות הוא **מידע, השוואה ומחשבונים** בלבד. **אין לראות בתוכן ייעוץ פיננסי, פנסיוני, ביטוחי, השקעות, מיסויי או משפטי**, ואין בו המלצה או תחליף לחישוב רשמי או לבעל/ת מקצוע מורשה/ית. הפרטים ב[הצהרת האחריות](/legal/disclaimer).

## 3. אין רישיון
IL-Tools **אינו בעל רישיון** לייעוץ/שיווק השקעות, לייעוץ/שיווק פנסיוני, לתיווך אשראי/משכנתאות או למתן ייעוץ מס. אין באתר שיווק של מוצר פנסיוני או ביטוי של המלצה אישית.

## 4. שימוש מותר
מותר להשתמש באתר לשימוש אישי, סביר וחוקי. **אסור**: שימוש אוטומטי או מסחרי בלתי מורשה; חילוץ נתונים (scraping) ללא הרשאה; ניסיון לפגוע באבטחת האתר; העתקה או פרסום של תוכן באופן שיוצר מצג שווא; שימוש שמפר דין או זכויות צד שלישי.

## 5. קניין רוחני
התוכן, העיצוב, הקוד, התרשימים והמחשבונים הם קניינו של IL-Tools או של מי שהרשה לנו, ומוגנים לפי חוק זכות יוצרים, התשס"ח-2007. שמות, לוגואים וסימני מסחר של ספקים הם קניינם של בעליהם, ומוצגים לצורכי זיהוי והשוואה בלבד, בלא שזו הבעת חסות. אין להסיר סימוני בעלות.

## 6. אחריות
השירות ניתן **ללא אחריות** מכל סוג. אנו לא מתחייבים לדיוק, לשלמות, לעדכניות או לזמינות הנתונים. **נתוני עבר והדגמות אינם מעידים על העתיד.** השימוש על אחריותך בלבד.

## 7. הגבלת אחריות
במידה הרבה ביותר המותרת בדין, IL-Tools ומפעיליו לא יישאו באחריות לנזק עקיף, תוצאתי, מיוחד או מקרי, לרבות אובדן רווח, הנובע מהשימוש באתר או מהסתמכות עליו. אין באמור כדי לגרוע מאחריות שאינה ניתנת להגבלה לפי דין (לרבות בגין מעשה בזדון או רשלנות רשמית וחמורה, לפי כל דין). **[מומלץ: לאימות עו"ד — גבולות החוק לגבי הגבלת אחריות, וכללי החוזים האחידים.]**

## 8. קישורים לאתרי צד שלישי
האתר מכיל קישורים לאתרים של ספקים ולשותפים. אין אנו שולטים בהם, אינם באחריותנו, ותנאי השימוש והפרטיות שלהם חלים. אין קישור כזה בגדר המלצה.

## 9. תוכן ממומן וקישורי שותפים
פריטים בתשלום מסומנים; קישורי שותפים מסומנים ומובילים דרך `/go/`. הפרטים ב[גילוי נאות](/legal/affiliate-disclosure).

## 10. תוכן משתמשים
אין באתר תוכן שמפרסמים משתמשים, למעט טפסים שאתם שולחים אלינו. אין באתר ציטוטים, דירוגי משתמשים או ביקורות שאין לנו.

## 11. שינויים בשירות ובתנאים
אנו רשאים לשנות את השירות ואת התנאים מעת לעת. גרסה מעודכנת תפורסם עם תאריך עדכון. המשך שימוש מהווה הסכמה לנוסח המעודכן.

## 12. דין וסמכות שיפוט
על תנאים אלה יחול **דין מדינת ישראל**. לבתי המשפט **במחוז [להשלמה — מומלץ תל-אביב]** תהא סמכות שיפוט ייחודית, בכפוף להוראות דין קוגנטיות (ובפרט בענייני צרכנות).

## 13. הוראות כלליות
סעיף שיימצא בלתי-אכיף ייגרע וייתר הסעיפים יעמדו. כותרות לנוחות בלבד.

## 14. יצירת קשר
[כתובת אימייל לפניות משפטיות] · עמוד [יצירת קשר](/contact).

*עודכן: {{תאריך_עדכון_אחרון}}. טיוטה — נדרשת בדיקת עורך דין.*
<!-- LEGAL:END id="LEGAL-TERMS" -->

<!-- LEGAL:BEGIN id="LEGAL-LEAD-TERMS" version="1.0" lang="he" placement="form" -->
**תנאים לשליחת פנייה (ליד):** מסירת הפרטים היא **וולונטרית ואינה חובה על פי דין**. הפרטים נשלחים ל-IL-Tools, אשר **יעביר אותם לבעל/ת מקצוע מורשה/ית בלבד** לצורך חזרה אליך, ועשוי לקבל תמורה בגין ההעברה. **IL-Tools אינו בעל רישיון ואינו נותן ייעוץ**, ואינו צד להתקשרות עם בעל/ת המקצוע. אין התחייבות למחיר, לזמינות או לתוצאה. ניתן לבקש מחיקת הפרטים בכל עת דרך עמוד [יצירת קשר](/contact). הפרטים יישמרו וייעשה בהם שימוש בהתאם ל[מדיניות הפרטיות](/legal/privacy). **אין למסור מידע רגיש שאינו נדרש.**
<!-- LEGAL:END id="LEGAL-LEAD-TERMS" -->

<!-- LEGAL:BEGIN id="LEGAL-NEWSLETTER-TERMS" version="1.0" lang="he" placement="form" -->
**תנאים להרשמה לניוזלטר:** בהרשמה את/ה מסכים/ה לקבל מאיתנו דיוור, לרבות **פרסומי**, הכולל עדכונים, מדריכים וכלים. ההרשמה מותנית ב**אימות כפול** (קישור/קוד לאימות). כל הודעה תכלול דרך פשוטה להסרה, וניתן להסיר בכל עת בלחיצה אחת. מסירת כתובת האימייל לצורך הרשמה אינה מהווה הסכמה לקבלת פרסומות מעבר לניוזלטר, וניתן להסיר הסכמה בכל עת. הפרטים נשמרים ומשמשים בהתאם ל[מדיניות הפרטיות](/legal/privacy).
<!-- LEGAL:END id="LEGAL-NEWSLETTER-TERMS" -->

---

## 5. COOKIE POLICY & CONSENT SPECIFICATION / מדיניות עוגיות והסכמה

### 5.1 LEGAL-COOKIES — עמוד מדיניות עוגיות (`/legal/cookies`)

<!-- LEGAL:BEGIN id="LEGAL-COOKIES" version="1.0" lang="he" placement="page:/legal/cookies" -->
# מדיניות עוגיות והסכמה

## מה הן עוגיות
עוגיות (cookies) וטכנולוגיות דומות הן קבצים קטנים הנשמרים במכשירך ומאפשרים לזהות את הדפדפן, לשמור העדפות ולמדוד שימוש.

## קטגוריות
- **הכרחיות (Necessary)** — נדרשות לתפקוד האתר ולאבטחה; פועלות תמיד ואינן דורשות הסכמה.
- **מדידה (Analytics)** — עוזרות להבין שימוש באתר (למשל Google Analytics). **כבויות עד הסכמה.**
- **פרסום (Advertising)** — משמשות להצגת פרסומות ולמדידתן (למשל Google AdSense). **כבויות עד הסכמה.**
- **שותפים (Affiliate)** — משמשות לייחוס המרות של קישורי שותפים. **כבויות עד הסכמה.**

## ברירת מחדל ובקרה
כל העוגיות שאינן הכרחיות **כבויות כברירת מחדל**. ניתן לסמן/לבטל בנפרד דרך "העדפות" בבאנר או בקישור "העדפות עוגיות" בפוטר בכל עת. בחירה נשמרת, וניתן לשנותה.

## טבלת עוגיות וסקריפטים צפויים
| שם | ספק | קטגוריה | מטרה | משך (אופייני) |
|---|---|---|---|---|
| `il_consent` | IL-Tools | הכרחית | שמירת בחירת ההסכמה | 12 חודשים |
| `_ga`, `_gid`, `_ga_*` | Google Analytics | מדידה | מדידת שימוש | עד 24 חודשים |
| `__gads`, `__gpi`, `IDE`, `NID` | Google AdSense | פרסום | הצגת/מדידת פרסומות | עד 24 חודשים |
| `_gcl_*` | Google | פרסום | מדידת המרות | עד 90 יום |
| עוגיות שותפים/הפניות | ספקים שונים | שותפים | ייחוס המרות | לפי הספק |

**בדיקה ואימות:** רשימת העוגיות בפועל תיבדק מול הדפדפן לפני עלייה לאוויר ותעודכן בהתאם. יומני ההסכמה נשמרים ללא זיהוי אישי.

## פרסום של Google
ראו גם פרק הפרסום ב[מדיניות הפרטיות](/legal/privacy). פרסומות מותאמות אישית מוצגות בהתאם להסכמה.

## כיצד לשנות העדפות בדפדפן
ניתן לחסום/למחוק עוגיות בהגדרות הדפדפן. חסימת עוגיות הכרחיות עלולה לפגוע בתפקוד האתר.

*עודכן: {{תאריך_עדכון_אחרון}}.*
<!-- LEGAL:END id="LEGAL-COOKIES" -->

### 5.2 LEGAL-COOKIE-BANNER — נוסח הבאנר

<!-- LEGAL:BEGIN id="LEGAL-COOKIE-BANNER" version="1.0" lang="he" placement="banner" -->
**אנחנו משתמשים בעוגיות כדי להפעיל את האתר, למדוד שימוש ולהציג פרסומות. עוגיות שאינן הכרחיות פועלות רק לאחר אישור.** [אישור הכל] · [דחייה] · [העדפות] — פרטים ב[מדיניות העוגיות](/legal/cookies).
<!-- LEGAL:END id="LEGAL-COOKIE-BANNER" -->

*(The banner strings are also present in `/content/ui/he.json` under `consent.*`; **legal-texts.json is the source of truth** and the UI must render it verbatim.)*

### 5.3 Consent specification (English, normative for Agent 6)

* Categories: **necessary, analytics, advertising, affiliate**. Default = all non-essential **OFF**.
* Consent must be **opt-in**, granular, and stored (`localStorage` key `il_consent`, versioned JSON). No non-essential script may load before consent.
* Google: use **Consent Mode v2** semantics (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) — deny by default, update on consent.
* Provide a reachable link to "העדפות עוגיות" in the footer on every page (opens the preference centre, not the banner-once).
* The banner must not block the DISC-AFFILIATE-STRIP nor the calculator DISC-CALC modal; neither may cover the other.
* Re-consent if the text version changes.

---

## 6. ACCESSIBILITY STATEMENT / הצהרת נגישות (`/legal/accessibility`)

<!-- LEGAL:BEGIN id="LEGAL-ACCESSIBILITY" version="1.0" lang="he" placement="page:/legal/accessibility" -->
# הצהרת נגישות

**IL-Tools רואה חשיבות בנגישות האתר לכלל המשתמשים, כולל אנשים עם מוגבלות, ופועל להנגיש את השירות בהתאם לדין.**

## רמת הנגישות
האתר נבנה בהתאם להוראות **חוק שוויון זכויות לאנשים עם מוגבלות, התשנ״ח-1998** ו**תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013**, ועל פי **התקן הישראלי ת"י 5568** לנגישות תכנים באינטרנט, ברמה **AA** (המבוסס על הנחיות WCAG 2.0/2.1).

## אמצעי הנגישות באתר
- ניווט מלא במקלדת וסימון מיקוד (focus) ברור.
- מבנה סמנטי תקין (כותרות, אזורי landmark, תוויות טפסים).
- ניגודיות צבעים מספקת, אפשרות להגדלת טקסט עד 200%.
- טקסט חלופי לתמונות, כתוביות/חלופות לתוכן חזותי.
- תוצאות מחשבון מוכרזות לקורא מסך (aria-live).
- תמיכה בהעדפת צמצום תנועה (prefers-reduced-motion).
- התאמה למסכים צרים (RTL).

**הערה:** רכיב "וידג'ט נגישות" הוא תוספת בלבד ואינו תחליף לנגישות אמיתית בקוד.

## מגבלות ידועות
- **ריכוזים ומסמכים של צד שלישי** (למשל קבצים של ספקים) עשויים שלא להיות נגישים במלואם.
- **מגבלות זמניות** עקב רכיבים חדשים — נטפל בהן לפי הצורך.
- רשימת מגבלות מעודכנת: **[להשלמה — לאחר בדיקת נגישות]**.

## רכז/ת הנגישות ופניות
- **רכז/ת נגישות:** [שם] · **דוא"ל:** [accessibility@il-tools.co.il] · **טלפון:** [להשלמה].
- נתקלתם בבעיית נגישות? נשמח לדעת. נטפל בפנייה בהתאם להסדרי הנגישות ובמועדים שבדין.
- ניתן לפנות גם ל**נציבות שוויון זכויות לאנשים עם מוגבלות** במשרד המשפטים.

## תאריך בדיקת הנגישות האחרונה
**[להשלמה — תאריך ביקורת נגישות אחרונה]** (ההצהרה תתעדכן לאחר כל ביקורת).

*עודכן: {{תאריך_עדכון_אחרון}}. טיוטה — יש להשלים שדות ולבצע ביקורת נגישות.*
<!-- LEGAL:END id="LEGAL-ACCESSIBILITY" -->

---

## 7. LEAD-GEN & SPAM-LAW COMPLIANCE / לידים ודיוור (סעיף 30א לחוק התקשורת)

### 7.1 Consent checkbox text (Hebrew, unticked by default)

```
[ ] אני מאשר/ת ל-IL-Tools להעביר את הפרטים שמסרתי לבעל/ת מקצוע מורשה/ית לצורך חזרה אליי בנושא פנייתי.
    מסירת ההסכמה אינה חובה; בלי ההסכמה לא נוכל להעביר את הפנייה.
    קראתי את תנאי הפנייה [LEGAL-LEAD-TERMS] ואת מדיניות הפרטיות.
```

*Requirements:* the checkbox is **never pre-ticked**; the consent text is versioned and rendered from `LEGAL-LEAD-TERMS` in `legal-texts.json`; the version is stored with the lead; validation blocks submission without consent.

### 7.2 Marketing (email/SMS/WhatsApp) — חוק הספאם, סעיף 30א

* **Prior explicit consent** is required for advertising messages ("דבר פרסומת") to anyone who is not an existing customer in the narrow statutory sense; the message must allow **easy, free removal** and must identify itself as advertising.
* Flow: **double opt-in** — the user requests subscription, receives a confirmation message, and is subscribed **only after** confirming. Record the timestamp + the consent text version.
* Every message contains: sender identity, the word **"פרסומת"**, and a one-click unsubscribe (also honoured via email reply / "הסר").
* Unsubscribe is processed promptly and permanently; a suppression list is maintained.
* **WhatsApp Business**: use opt-in templates and honour opt-out; do not send marketing without recorded consent.
* **Never** buy lists or send marketing based only on a lead submission (a lead about a pension question is **not** consent to marketing).

### 7.3 Rules for passing leads ONLY to licensed entities (normative)

Before any lead is routed to a partner, the operator must verify and record:

| # | Check | Evidence to keep |
|---|---|---|
| 1 | The partner holds a **current licence** for the relevant activity (pension/insurance agent or adviser; accountant/tax adviser; mortgage adviser) | Licence number + registry screenshot + date |
| 2 | Licence verified against the **relevant registry** (רשות שוק ההון / רשות ניירות ערך / מועצת רואי החשבון / רשות שוק ההון for pension) | Registry URL + access date |
| 3 | The licence covers the **type of lead** being transferred | Licence scope note |
| 4 | The partner is **active** in the system (`lead_partners.active`) and **licence_verified_on** is recent | DB row |
| 5 | A **data-processing / lead-transfer agreement** is signed (privacy, security, purpose limitation, no onward transfer, retention, breach notice) | Signed agreement (§7.4) |
| 6 | The partner will **not** use the lead for marketing without the person's separate consent | Contract clause |

**If no verified licensed partner exists for a lead type → show a neutral "בקרוב" waitlist and do NOT route or fake routing.**

### 7.4 Data-processing / lead-transfer agreement checklist (English)

* Roles: IL-Tools = controller; partner = independent controller (or processor, as applicable) — state it explicitly.
* Purpose limitation: only to respond to the specific inquiry.
* Lawful basis & consent evidence: the versioned consent text + timestamp must travel with the lead.
* Security: encryption in transit and at rest, access control, incident notification within a defined time.
* Retention & deletion: partner deletes on request and after the stated period.
* No onward transfer without IL-Tools' approval and the data subject's consent.
* Audit & cooperation: IL-Tools may verify licence status and compliance.
* Liability, governing law (Israel), and term/termination.

---

## 8. CONTENT RULES & BANNED / REQUIRED PHRASING

> **BANNED_PHRASES.md is the single source of truth** for banned/required wording. `scripts/legal-lint.mjs` and `scripts/content-qa.mjs` **parse** it; do not restate or fork the list here. This section only adds claim-handling rules and regulated-category rules.

### 8.1 Risky claim types → approved alternatives

| סוג טענה | דוגמה אסורה | ניסוח מאושר |
|---|---|---|
| הבטחת תוצאה | "מובטח", "רווח מובטח", "ללא סיכון" | "לפי הנתונים שפורסמו…", "בדרך כלל…", "ייתכן" |
| עליונות מוחלטת | "הכי טוב בישראל", "מספר 1" | "מתאים במיוחד ל…, לפי הקריטריונים הבאים" |
| מחיר מוחלט | "הכי זול" | "לפי המחירון שפורסם, בין הזולים שראינו" |
| המלצה אישית | "כדאי לך לבחור/לקחת" | "שאלות שכדאי לשאול יועץ/ת מורשה/ית" |
| לחץ מלאכותי | "בזמן מוגבל", "מהרו" | "ניתן לבדוק את התנאים לפני החלטה" |
| אישור רגולטורי | "מערכת מאושרת" ללא מקור | "לפי פרסומי החברה…" (מוקצה למקור) |
| השוואה פוגענית | "רק X מחזיקים ברישיון" | "לפי פרסומי X, היא מחזיקה ברישיון…" |
| תשואה | הצגת תשואות/דירוג לפי תשואה | "תשואות אינן מוצגות ואינן מדורגות" |

### 8.2 Regulated categories (pension, insurance, investments, credit)

* Strictly **educational**; frame as how the product works / what to check, not what to choose.
* **No** product/provider/track/deposit-level recommendation; **no** returns displayed or ranked; no "הטוב ביותר" in these categories.
* Fee data may only come from the **official** comparison tools (גמל נט / פנסיה נט) or the provider's published tariff; if unavailable, write "לא זמין".
* Pages keep `regulated: true` + `<!-- DISC-PENSION -->`; **no affiliate monetization** is rendered on them (see §10 rule L-UI-07).
* Leads go to **licensed third parties** only (§7.3).

### 8.3 Naming competitors / providers

* Use **verifiable facts** with a source; state "לפי הנתונים שפורסמו" / "לפי פרסומי החברה".
* Never assert a competitor lacks a licence/permit, or is illegitimate; avoid same-name-foreign-entity insinuations.
* Absolute/ranking claims ("מקום ראשון בסקר") require a **verifiable source** and correct attribution.

### 8.4 Reviews & testimonials

* No fabricated testimonials, user quotes, star ratings or "user reviews".
* Reviews analyse **publicly verifiable** features; state "בדקנו לפי המידע שפורסם באתר הספק ב-[date]".
* Subjective quality statements ("איכות הממשק בעברית בינונית") must correspond to a **published methodology component**, or be softened/attributed.

### 8.5 Screenshots & logos

* Prefer neutral text; use provider names/logos only for identification in comparisons, without implying endorsement/sponsorship.
* Respect copyright (חוק זכות יוצרים, 2007) and trademark rights; no scraping-and-republication of provider content beyond fair, cited use.

---

## 9. REVIEW FINDINGS REGISTER

Severity: BLOCKER > HIGH > MEDIUM > LOW. Owner: A3 = Agent 3 (content), A6 = Agent 6 (build), OWNER = site owner, A4 = this agent.
Status: FIXED (content edited) · MITIGATED (fixed at render/lint) · OPEN.

| ID | File | Location | Issue | Severity | Legal basis | Required fix | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| L-001 | content/compare/pension-vs-management-insurance.mdx | body `{{slot:AFF-1}}` (≈L27) + frontmatter `monetization_slots:[AFF-1, AD-3]` | Affiliate monetization slot rendered on a **regulated** pension comparison page | **HIGH** | חוק הפיקוח (ייעוץ, שיווק וסליקה פנסיוניים), התשס״ה-2005, סעיף 1 (הגדרת "שיווק פנסיוני") וסעיף 3 (חובת רישיון); הגנת הצרכן סעיף 2 | Do **not** render any affiliate/paid module on `regulated: true` pages (rule L-UI-07). Token intentionally preserved per Agent-4 rules (no token alteration). | A6 | MITIGATED |
| L-002 | content/reviews/cardcom.mdx | intro; §מי זה מתאים לו; §חוזקות | Unverified licence claim about a named firm + comparative implication that peers lack a permanent acquirer licence | **HIGH** | חוק איסור לשון הרע, התשכ״ה-1965; חוק עוולות מסחריות, התשנ״ט-1999; הגנת הצרכן סעיף 2 | Reworded: licence attributed to the company's own publications; peer comparison removed | A4 | FIXED |
| L-003 | content/reviews/yaad-sarig.mdx | §מי זה מתאים לו; §חוזקות (×3) | Unverified regulator/security-clearance/certification claims ("ספק מורשה של שב״א", "חשבוניות … באישור מס הכנסה", PCI-DSS) | **HIGH** | הגנת הצרכן סעיף 2; עוולות מסחריות | Reworded to attribute to product descriptions and mark non-verified | A4 | FIXED |
| L-004 | content/pages/lead-pension-information.mdx · lead-accountant.mdx · lead-mortgage-information.mdx | body consent checkbox | Consent text is hard-coded in MDX, not rendered from `legal-texts.json`; no documented verification that the recipient is licensed | **HIGH** | חוק הגנת הפרטיות סעיף 11; חוק הפיקוח 2005; סעיף 30א לחוק התקשורת | Render consent from `LEGAL-LEAD-TERMS`; verify partner licence before routing (§7.3) | A6 | OPEN |
| L-005 | (site-wide) | footer | `DISC-GENERAL` and the `/legal/*` routes are not yet implemented in content | **HIGH** | הגנת הצרכן; פרטיות; נגישות | Implement footer link set and routes (§10.3) | A6 | OPEN |
| L-006 | content/reviews/green-invoice.mdx | §מי זה מתאים לו; §חוזקות; §פסק דין | "מערכת מאושרת רשות המסים" asserted as fact (regulator-approval claim) | MEDIUM | הגנת הצרכן סעיף 2 | Attribute: "לפי פרסומי החברה, המערכת מסומנת כמאושרת רשות המסים" | A3 | OPEN |
| L-007 | content/best/best-business-bank-startups.mdx · content/categories/business-banking.mdx | supplier tables; §למה כל ספק נבחר / §אשראי | "מקום ראשון / דירוג גבוה בסקר שביעות רצון … (2026)" — ranking claim about a named bank | MEDIUM | הגנת הצרכן סעיף 2; עוולות מסחריות | Verify the survey source and attribute; otherwise remove. **לא אומת** | OWNER | OPEN |
| L-008 | content/reviews/payplus.mdx | §מי זה מתאים לו; §חולשות | Names same-name foreign entities, casting doubt on a named company's identity | MEDIUM | לשון הרע | Reframe to "זהות עסקית לא אומתה" without naming foreign entities | A3 | OPEN |
| L-009 | content/reviews/*.mdx (30) | heading `## פסק דין` | "פסק דין" reads as a judicial determination about a named company | MEDIUM | לשון הרע | Rename to "שורה תחתונה" | A3 | OPEN |
| L-010 | content/reviews/zoho.mdx · hubspot.mdx · pipedrive.mdx · salesforce.mdx · yaad-sarig.mdx · best/best-crm-small-business.mdx | §מי זה מתאים לו / §חולשות | Subjective "איכות הממשק בעברית … לפי הסיווג שלנו" with no matching component in `/methodology` | MEDIUM | הגנת הצרכן סעיף 2 | Add the component to `/methodology` or soften/attribute | A3 | OPEN |
| L-011 | content/compare/employee-vs-freelancer.mdx | frontmatter `monetization_slots:[AD-3]` vs body `{{slot:AFF-1}}` | Config/body mismatch for AFF monetization | MEDIUM | governance | Align config with body (token preserved) | A6 | OPEN |
| L-012 | content/reviews/isracard.mdx · max.mdx · cal.mdx · pelecard.mdx · tranzila.mdx | corporate-history / licence claims | Hard corporate-history/ownership/licence claims resting on weak sources (aggregator/vendor pages) | MEDIUM | הגנת הצרכן; עוולות מסחריות | Re-source from registry/ISA/TASE or attribute as "לפי פרסומי החברה" | A3 | OPEN |
| L-013 | content/articles/management-fees-pension-hishtalmut-30-years.mdx | §ההדגמה | Hypothetical 5% return with ₪ balances on a `regulated: true` page | MEDIUM | חוק הפיקוח 2005 (risk of being read as returns/advice) | Already fully hedged ("הדגמה", assumptions block); attorney review recommended; keep labels | OWNER/attorney | OPEN |
| L-014 | content/reviews/rivhit-accounting.mdx | §חולשות | "המסלול הזול ביותר" — superlative | LOW | BANNED_PHRASES §A/§B | Rephrase to "מסלול הכניסה" | A3 | OPEN |
| L-015 | content/compare/zoho-vs-pipedrive.mdx | §(body) | "מהמסלול הזול ביותר שמספיק לעסק" — superlative | LOW | BANNED_PHRASES §B | Rephrase to "מסלול כניסה מתאים" | A3 | OPEN |
| L-016 | content/newsletter/*.md | body | Newsletter issues cite ₪/% figures without `{{updated}}`/`{{sources}}` | LOW | accuracy/consumer | Acceptable for email; add a dated "הנתונים לפי…" line | A3 | OPEN |
| L-017 | content/pages/methodology.mdx | weights table | % weights without sources | LOW | n/a | None — internal, published methodology (accepted) | A4 | ACCEPTED |
| L-018 | content/compare/green-invoice-vs-morning.mdx | body | phrase "חינם" (BANNED_PHRASES §B: "חינם בלי הסבר") | LOW | BANNED_PHRASES §B | Ensure context explains the free tier | A3 | OPEN |

**Re-review after fixes:** the four content edits (L-002, L-003) and the new/edited scripts were re-run — see §9.1. `content-qa.mjs` remains **0 BLOCKERS**; `legal-lint.mjs` is **0 BLOCKERS**.

### 9.1 Tool output captured after edits

```
$ node scripts/content-qa.mjs
=== IL-Tools content QA ===
Files scanned: 134
By type: {"article":24,"best":8,"calculator":19,"category":5,"compare":12,"guide":20,"page":15,"?":1,"review":30}
Total words: 123,674
Articles: 24 (met bar: 24)
Source ids: 101 · providers: 62 · slugs: 134 · charts: 24

BLOCKERS: 0
WARNINGS: 31   (all numbers marked "דוגמה/הדגמה")

$ node scripts/legal-lint.mjs
=== IL-Tools legal lint (Agent 4) ===
Files scanned: 134
Banned phrases parsed from BANNED_PHRASES.md: 34 BLOCKER + 8 HIGH
Regulated pages: 13 · pages with {{aff:}}: 51

BLOCKERS: 0
HIGH: 14
  ! content/compare/green-invoice-vs-morning.mdx: risky phrase (B) "חינם"
  ! content/newsletter/issue-01..06.md, social-snippets.md: ₪/% figures present but no {{updated:YYYY-MM-DD}} / {{sources:[…]}}
  ! content/pages/methodology.mdx: ₪/% figures present but no {{sources:[…]}}   (internal weights — accepted)

$ node scripts/extract-legal.mjs
extract-legal: wrote 27 legal text(s) → data/legal/legal-texts.json
balanced BEGIN/END: ok · no duplicate ids · no empty bodies
```

*Verdict:* `content-qa.mjs` = **0 BLOCKERS** (unchanged); `legal-lint.mjs` = **0 BLOCKERS**. The 14 legal-lint HIGHs are triaged in the register (L-016 newsletters accepted-with-note; L-017 methodology accepted; L-018 "חינם" context).

---

## 10. UI INTEGRATION SPEC (for Agent 6)

Render every text **verbatim from `/data/legal/legal-texts.json`**. Never retype. If an ID referenced here is missing from the JSON, **stop** and list it in `/docs/engineering/BLOCKERS.md`.

### 10.1 Mapping table

| ID | Placement | Trigger | Format | Accessibility behaviour | Persistence | Version | Acceptance test |
|---|---|---|---|---|---|---|---|
| DISC-GENERAL | Global footer | always | text line | text is selectable; `role="contentinfo"` | none | 1.0 | footer contains the exact DISC-GENERAL sentence on every route |
| DISC-FULL | `/legal/disclaimer` | route visit | page | one `<h1>`, logical heading order | none | 1.0 | route renders `DISC-FULL.markdown` verbatim |
| DISC-AFFILIATE-STRIP | top strip under header | every page with `{{aff:…}}` or `{{slot:AFF-*}}` | strip | `role="note"`, above the fold, contrast ≥ 4.5:1 | none | 1.0 | strip present above fold on compare/best/review pages |
| DISC-AFFILIATE-FULL | `/legal/affiliate-disclosure` | route visit | page | heading order | none | 1.0 | page renders verbatim |
| DISC-ADSENSE | `/legal/cookies` (ads section) | route visit | page section | heading order | none | 1.0 | section renders verbatim |
| DISC-SPONSORED | inline label near sponsored item | item `{{sponsored:…}}` present | label | visible text, not colour-only | none | 1.0 | label text matches `DISC-SPONSORED` labels |
| DISC-LEAD | lead form | form render | text block | associated with form via `aria-describedby` | none | 1.0 | block present above submit button |
| DISC-EDITORIAL-INDEPENDENCE | methodology/compare/review | route visit / inline | note | heading order | none | 1.0 | present on compare/best/review and `/methodology` |
| DISC-PENSION | page | page has `<!-- DISC-PENSION -->` **or** `regulated: true` | block (top) | rendered once, above content | none | 1.0 | every regulated page shows DISC-PENSION |
| DISC-COMPARE | compare pages | `type: compare` | note | heading order | none | 1.0 | present on all `/compare/*` |
| DISC-RATES-DATE | near figures | page has figures | inline stamp | `role="note"` | none | 1.0 | stamp shows real date from `{{updated}}` (no raw `{date}`) |
| DISC-CALC-<CLASS> | calculator modal + persistent short line | **first run per class** (see 10.2) | modal + line | focus trap, Esc closes, ARIA `role="dialog"`, `aria-labelledby`, return focus | `localStorage["il_calc_disc_<CLASS>"] = {version, date}` | 1.0 | modal on first run; re-prompt on version change; Esc/focus-trap verified |
| LEGAL-PRIVACY | `/legal/privacy` | route visit | page | heading order | none | 1.0 | verbatim |
| LEGAL-TERMS | `/legal/terms` | route visit | page | heading order | none | 1.0 | verbatim |
| LEGAL-LEAD-TERMS | lead form(s) | form render | text | linked to consent checkbox | consent list | 1.0 | consent text matches; version stored with lead |
| LEGAL-NEWSLETTER-TERMS | newsletter signup | form render | text | linked to checkbox | consent log | 1.0 | text matches; double opt-in enforced |
| LEGAL-COOKIES | `/legal/cookies` | route visit | page | heading order | none | 1.0 | verbatim |
| LEGAL-COOKIE-BANNER | consent banner | first run (no stored consent) | banner | focusable, keyboard-operable, no focus trap theft, `role="dialog"` | `localStorage["il_consent"]` | 1.0 | all non-essential OFF by default; choices persist |
| LEGAL-ACCESSIBILITY | `/legal/accessibility` | route visit | page | heading order | none | 1.0 | verbatim |

### 10.2 Calculator slug → DISC-CALC class map (all 19 calculator/tool pages)

| Slug (`/calculators/*` or `/tools/*`) | Class | Legal ID | Rationale |
|---|---|---|---|
| `atzmai-net` | TAX | DISC-CALC-TAX | income tax + NI + health (self-employed) |
| `employee-vs-freelancer-calculator` | TAX | DISC-CALC-TAX | tax comparison |
| `salary-net` | PAYSLIP | DISC-CALC-PAYSLIP | employee net pay |
| `vat` | VAT | DISC-CALC-VAT | VAT |
| `osek-patur-threshold` | TAX | DISC-CALC-TAX | turnover vs. threshold |
| `keren-hishtalmut` | PENSION | DISC-CALC-PENSION | regulated |
| `pension-self-employed` | PENSION | DISC-CALC-PENSION | regulated |
| `severance` | NI | DISC-CALC-NI | severance estimate |
| `unemployment` | NI | DISC-CALC-NI | unemployment benefit |
| `clearing-fees` | CLEARING | DISC-CALC-CLEARING | acquiring fees |
| `compound-interest-mortgage` | CREDIT | DISC-CALC-CREDIT | credit/loan |
| `invoicing-cost` | GENERIC | DISC-CALC-GENERIC | software cost |
| `freelancer-hourly-rate` | GENERIC | DISC-CALC-GENERIC | pricing tool |
| `payslip-decoder` | PAYSLIP | DISC-CALC-PAYSLIP | payslip (client-side only) |
| `business-setup-cost-calculator` | GENERIC | DISC-CALC-GENERIC | setup cost |
| `business-structure-quiz` | GENERIC | DISC-CALC-GENERIC | structure quiz |
| `tax-calendar` | TAX | DISC-CALC-TAX | filing deadlines |
| `bank-fee-checker` | GENERIC | DISC-CALC-GENERIC | bank fees |
| `tax-refund-estimator` | REFUND | DISC-CALC-REFUND | refund check |

> **Rule L-UI-01:** a page whose slug appears in this table **must** render the mapped `DISC-CALC-<CLASS>` modal on first run (per class) and the persistent short line near the result.
> **Rule L-UI-02:** a page containing `<!-- DISC-PENSION -->` (or `regulated: true`) **must** render `DISC-PENSION`.
> **Rule L-UI-07:** pages with `regulated: true` **must not** render any `{{slot:AFF-*}}`, `{{aff:…}}` or `{{sponsored:…}}` (see L-001).

### 10.3 Footer link set & required legal routes

Footer must link: **הצהרת אחריות** `/legal/disclaimer` · **תנאי שימוש** `/legal/terms` · **מדיניות פרטיות** `/legal/privacy` · **גילוי נאות (אפיליאייט)** `/legal/affiliate-disclosure` · **מדיניות עוגיות** `/legal/cookies` · **הצהרת נגישות** `/legal/accessibility` · **שיטת הדירוג** `/methodology` · **מדיניות מערכת** `/editorial-policy` · **העדפות עוגיות** (opens banner) · and the `DISC-GENERAL` line.

Existing `ui/he.json` keys already cover the labels: `legal.footer.link.{disclaimer,terms,privacy,affiliateDisclosure,cookies,accessibility,methodology,editorialPolicy}` and `legal.footer.disclaimer`. **Reconcile `legal.footer.disclaimer` with `DISC-GENERAL`** so the footer renders the single source of truth.

### 10.4 Enforcement (CI)

* `pnpm legal:extract` → regenerate `legal-texts.json`; fail on unbalanced/duplicate ids.
* `pnpm legal:lint` → `scripts/legal-lint.mjs`; exit non-zero on BLOCKER.
* CI must run both alongside `content-qa.mjs` and fail the build on any BLOCKER.

---

## 11. PRE-LAUNCH COMPLIANCE CHECKLIST

Each item has an objective pass/fail test. Agent 6 and the owner tick these off.

**Content**

- [ ] `node scripts/content-qa.mjs` → **0 BLOCKERS**.
- [ ] `node scripts/legal-lint.mjs` → **0 BLOCKERS**; HIGH items triaged (registered or fixed).
- [ ] Findings L-002 and L-003 edits present; L-001/L-004/L-005 addressed in build.
- [ ] No `regulated: true` page lacks `<!-- DISC-PENSION -->`.

**UI**

- [ ] All 8 legal routes exist and render `legal-texts.json` verbatim (diff test against the JSON).
- [ ] `DISC-AFFILIATE-STRIP` above the fold on every page with `{{aff:…}}`.
- [ ] Calculator modal (correct class) on first run; re-prompts on version change; Esc + focus trap verified.
- [ ] `DISC-PENSION` renders on every `<!-- DISC-PENSION -->` / `regulated: true` page.
- [ ] Footer link set complete; `legal.footer.disclaimer` reconciled with `DISC-GENERAL`.

**Data / privacy**

- [ ] Privacy policy has all `[...]` placeholders filled (entity, address, emails, retention, regions).
- [ ] Consent notice at every data-collection point; consent version stored with leads.
- [ ] No non-essential script loads before consent (verified in DevTools network tab).
- [ ] Lead fields encrypted at rest; access least-privilege; retention job exists.
- [ ] Processor agreements (Vercel/Neon/email/Google) documented.

**Ads / affiliate**

- [ ] No ads above the H1; density limits; no ads inside calculator inputs.
- [ ] Affiliate links `rel="sponsored nofollow noopener"`, routed via `/go/[slug]`, `/go/` `noindex` + robots-disallowed.
- [ ] Sponsored items carry a visible label in-card.
- [ ] **No affiliate/paid module on `regulated: true` pages** (rule L-UI-07).
- [ ] `ads.txt` served; AdSense review submitted post-launch with live content.

**Forms / marketing**

- [ ] Consent checkbox unticked by default; submission blocked without consent.
- [ ] Newsletter double opt-in; unsubscribe works; messages labelled "פרסומת".
- [ ] Lead routing only to partners with verified licence (§7.3); otherwise "בקרוב" waitlist.

**Accessibility**

- [ ] Accessibility statement published with coordinator details and last audit date.
- [ ] axe/Lighthouse a11y pass on one page per template; keyboard-only walkthrough of menu, modal, tables, calculators.
- [ ] `html[lang=he][dir=rtl]`; no horizontal overflow at 360px.

**Governance**

- [ ] Licensed Israeli attorney has reviewed and signed off on this document (status → approved).
- [ ] Owner confirmations from §12 recorded.
- [ ] `/methodology` and `/editorial-policy` published and linked.
- [ ] Rate-freshness process (annual January recheck) in place.

---

## 12. OPEN QUESTIONS FOR THE OWNER & ATTORNEY

### 12.1 Facts needed from the owner (block real-world publication of placeholders)

| # | Question | Needed for |
|---|---|---|
| O-01 | Legal entity name, registration number (ח.פ./ע.מ.), registered address, contact email for legal/privacy | Privacy policy, Terms, Accessibility, DISC-FULL |
| O-02 | Does IL-Tools (or its operators) hold **any** licence? (pension/insurance/advice/tax/mortgage) | Precise non-licence wording (§1–2) |
| O-03 | Do the operators hold positions in, or receive compensation from, any provider? | DISC-FULL conflict statement |
| O-04 | Accessibility coordinator name + contact; date of last accessibility audit | LEGAL-ACCESSIBILITY |
| O-05 | DPO decision: appoint or not (are registration/DPO thresholds met?) | LEGAL-PRIVACY §3.1 |
| O-06 | Hosting regions (Vercel/Neon/Supabase) for the transfer-abroad disclosure | LEGAL-PRIVACY §6 |
| O-07 | Retention periods (leads, newsletter, logs) | LEGAL-PRIVACY §9 |
| O-08 | Governing-law court district for Terms | LEGAL-TERMS §12 |
| O-09 | Which affiliate programs are actually in place? (`/data/internal/affiliate_programs.json` is **empty** → no verified commission facts) | DISC-AFFILIATE-FULL, disclosure wording |
| O-10 | Who are the licensed lead partners (names + licence numbers)? | §7.3, lead pages |
| O-11 | If any paid product/digital subscription is sold → distance-sale & cancellation rules apply (חוק הגנת הצרכן, סעיף 14א ואילך) | Terms/Privacy |

### 12.2 Risks I could not resolve with confidence (flagged "לא אומת")

1. **AFF-1 on a regulated page (L-001)** — highest residual risk; needs a build rule, not just content.
2. **Licence/approval claims about named providers** (green-invoice "מערכת מאושרת רשות המסים"; cardcom licence history; the FIBI survey ranking) — sources are vendor pages/secondary aggregators, not registries. **לא אומת.**
3. **Privacy thresholds** — whether the site crosses the registration/DPO/notice thresholds depends on volumes and purposes; my analysis is a conservative default, not a finding of fact. **לא אומת.**
4. **Exact section numbering** of the 1995 investment-advice law (definitions in §1; licensing in §3) and of the 1999 commercial-torts law (torts in §1) should be confirmed against the current Nevo text before the attorney cites them. **לא אומת במדויק.**
5. **AdSense policy scope for finance content** — Google's financial-services restrictions apply mainly to *advertisers*; a publisher's exposure is the Publisher Policies (misrepresentation/spammy/valuable inventory). The precise interaction is policy-driven and can change.

---

## 13. SOURCES

Statutes, regulations and authority pages relied upon (accessed 2026-10-16). Where the exact section number could not be verified I marked it; the **authoritative text is the one published in Reshumot / on Nevo**.

**Financial advice & pension regulation**
1. חוק הסדרת העיסוק בייעוץ השקעות, בשיווק השקעות ובניהול תיקי השקעות, התשנ״ה-1995 — נבו: `https://www.nevo.co.il/law_html/law00/74252.htm` (§1 הגדרות — פרק א׳ "פרשנות"; §3 חובת רישיון ופטורים) · נוסח רשות ניירות ערך: `https://www.new.isa.gov.il/nav-index/supervised-legislation/Occupational-Regulation-Act`. *(subsection numbering to be confirmed.)*
2. חוק הפיקוח על שירותים פיננסיים (ייעוץ, שיווק ומערכת סליקה פנסיוניים), התשס״ה-2005 — נבו: `https://www.nevo.co.il/law_html/law00/73928.htm`; **§1 הגדרות** — "ייעוץ פנסיוני", "שיווק פנסיוני", "בעל רישיון", "סוג מוצר פנסיוני" (נוסח אומת דרך מאגר חילן: חקיקה/דיני ביטוח פנסיוני). §3 חובת רישיון ("סוכן פנסיוני — מי שרשאי לעסוק בשיווק פנסיוני לפי הוראות סעיף 3"); §5 רישיון יועץ פנסיוני; §6 תנאים לרישיון סוכן. (אומת חלקית — ניתן לאמת §3–§6 במלואם בנבו.)
3. חוק הפיקוח על שירותים פיננסיים (שירותים פיננסיים מוסדרים), התשע״ו-2016 — הוזכר בהגדרות חוק 2005.
4. חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס״ה-2005 — נבו: `https://www.nevo.co.il/law_html/law00/70391.htm`.

**Consumer protection, competition, defamation**
5. חוק הגנת הצרכן, התשמ״א-1981 — נבו: `https://www.nevo.co.il/law_html/law00/70305.htm`; gov.il: `https://www.gov.il/he/pages/cpfta_hok_haganat_hatzarchan_1981`. **סעיף 2(א)** — איסור הטעיה בפרסום (מידע על "פרסומת מטעה": `https://abro-law.co.il/consumer-protection-false-advertising/`).
6. הרשות להגנת הצרכן ולסחר הוגן — עמוד הבית: `https://www.gov.il/he/departments/consumer_protection_and_fair_trade_authority/govil-landing-page`; מדריך לעוסקים: `https://www.gov.il/he/pages/cpfta_guide_for_dealers`. *(guidance on influencer/affiliate disclosure — לא אומת בנוסח מחייב.)*
7. חוק איסור לשון הרע, התשכ״ה-1965 — סעיף 1 (הגדרת "לשון הרע"), סעיף 2 (איסור), הגנות (אמת בפרסום/עניין ציבורי). *(exact subsections to be confirmed.)*
8. חוק עוולות מסחריות, התשנ״ט-1999 — עוולות גרימת בלבול ותיאור כוזב (סעיף 1). *(numbering to be confirmed.)* ; חוק התחרות הכלכלית, התשמ״ח-1988.
9. חוק זכות יוצרים, התשס״ח-2007.

**Privacy**
10. חוק הגנת הפרטיות, התשמ״א-1981 **כתוקן בתיקון מס׳ 13, התשפ״ד-2024** (פורסם 14.8.2024; **תחילה 14.8.2025**): **§8א(א)** רישום מאגר; **§8א(ב)** הודעה לרשות (מידע בעל רגישות מיוחדת >100,000); **§11** חובת הודעה בעת איסוף; **§13–§14** עיון ותיקון; **§15א** פיצויים לדוגמה; **§17ב1** ממונה הגנת הפרטיות; **§23כו** עיצומים כספיים; **§29א** פיצוי בלא הוכחת נזק; **§36א** אגרות. סיכום מקצועי: `https://meiri.co/blog/privacy-policy-requirements` (עו״ד ורו״ח ירון מאירי; מקורותיו: נוסח התיקון — `https://fs.knesset.gov.il/25/law/25_lsr_4810658.pdf`; מדריך הרשות — gov.il `guide_tikon13_professional`).
11. תקנות הגנת הפרטיות (אבטחת מידע), התשע״ז-2017 — תקנות 2 (מסמך הגדרות), 4 (נוהל אבטחה), 5 (סקר סיכונים), 11 (אירועי אבטחה), 15 (הסכם עם מחזיק).
12. חוק נתוני אשראי, התשע״ו-2016 — נבו: `https://www.nevo.co.il/law_html/law00/141357.htm` (מודרג לעניין השוואת אשראי; לא נדרש ככל הנראה לפעילות הנוכחית).

**Telecom / spam**
13. חוק התקשורת (בזק ושידורים), התשמ״ב-1982, **סעיף 30א** (דבר פרסומת — הסכמה מראש, הסרה, סימון; פיצוי לדוגמה עד 1,000 ₪). סקירה: `https://asherfirm.com/articles/israeli-anti-spam-law` · `https://israelsegal.co.il/divrei-pirsomet-30a/`.

**Accessibility**
14. חוק שוויון זכויות לאנשים עם מוגבלות, התשנ״ח-1998; תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013; **ת"י 5568** (WCAG 2.0/2.1 AA). מדריך הצהרת נגישות — נציבות שוויון זכויות: `https://www.gov.il/he/pages/declaration_website_accessibility`.

**Platform policies**
15. Google AdSense Program policies — `https://support.google.com/adsense/answer/48182`; Google Publisher Policies — `https://support.google.com/adsense/answer/10502938`; Google Ads **Misrepresentation / Unacceptable business practices** — `https://support.google.com/adspolicy/answer/15938071`; Financial products & services (personal loans) — `https://support.google.com/adspolicy/answer/15188216`. *(Publisher-vs-advertiser scope assessed; policies are dynamic.)*

**Sections for which exact numbering is flagged "לא אומת"** — 1 (§1/§3), 3 (§3–§6), 7, 8: confirm against the current Nevo text before the attorney relies on them.

---

*End of working draft v1.0 — pending licensed Israeli attorney review before launch.*
