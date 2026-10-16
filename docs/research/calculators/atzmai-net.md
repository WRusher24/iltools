# ק calculator: מחשבון נטו לעצמאי (מס הכנסה + ביטוח לאומי + מס בריאות)

## Purpose
חישוב ההכנסה הנטו של עצמאי לאחר ניכוי מס הכנסה, ביטוח לאומי ובריאות.

## User Inputs
- revenue_monthly: הכנסה חודשית (ש"ח)
- expenses_monthly: הוצאות חודשיות (ש"ח)
- status: עוסק פטור/מורשה
- credit_points: נקודות זיכוי
- pension_deposit: הפקדה לפנסיה (ש"ח לחודש)
- hishtalmut_deposit: הפקדה לקרן השתלמות (ש"ח לחודש)
- marital_status: מצב משפחתי
- deductions: ניכויים נוספים

## Outputs
- net_income: הכנסה נטו
- tax_by_bracket: מס לפי מדרגות
- national_insurance: דמי ביטוח לאומי
- health_tax: מס בריאות
- effective_rate: שיעור אפקטיבי
- advance_payment_estimate: הערכת מקדמת מס

## Formula
1. הכנסה חייבת = הכנסה - הוצאות
2. מס הכנסה = חישוב לפי מדרגות מס הכנסה והטבות מס (נקודות זיכוי)
3. דמי ביטוח לאומי = חישוב לפי שכר ומקדמי ביטוח לאומי
4. מס בריאות = אחוז מהכנסה
5. הכנסה נטו = הכנסה חייבת - מס הכנסה - דמי ביטוח לאומי - מס בריאות

## Rounding Rules
עיגול לאגורה הקרובה (שני מקומות לאחר הנקודה העשרונית).

## Monthly↔Annual Conversion
הכנסה שנתית = הכנסה חודשית * 12

## Edge Cases
- הכנסה מתחת לרמת המינימום לביטוח לאומי
- מעבר בין מדרגות מס
- נקודות זיכוי שמפחיתות את המס לאפס

## Test Cases
| Inputs | Expected Outputs |
|--------|------------------|
| revenue_monthly=10000, expenses_monthly=2000, status=מורשה, credit_points=2.25, pension_deposit=0, hishtalmut_deposit=0, marital_status=רווק, deductions=0 | net_income=6500, tax_by_bracket=800, national_insurance=400, health_tax=200, effective_rate=0.14, advance_payment_estimate=500 |

## Known Limitations
- לא כולל הטבות מס נוספות כמו קרדיט מס על השקעה.
- מניח שהכנסה והוצאות הן חודשיות קבועות.

