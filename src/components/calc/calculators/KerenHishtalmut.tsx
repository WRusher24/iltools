'use client';
import { useCallback, useMemo } from 'react';
import { kerenHishtalmut as k } from '@/lib/calc';
import { CalcShell } from '../CalcShell';
import { FormGrid, LowConfidenceBadge, Money, NaText, NumberField, Notice, Pct, ResultList, ResultRow, ResultTable } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';
import { formatILS } from '@/lib/format';

export default function KerenHishtalmut({ slug, ctx }: CalcProps) {
  const defaults = useMemo(() => k.makeDefaults(ctx.rates), [ctx.rates]);
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון קרן השתלמות"
      state={state}
      ctx={ctx}
      shareSummary={(r) => `הפקדה חודשית ${formatILS(r.total_monthly)} לקרן השתלמות (תרחיש חישובי)`}
      form={
        <>
          <Notice>עמוד חינוכי בלבד, ללא המלצת מוצר או סכום הפקדה. התשואה ודמי הניהול הם נתונים שאתם מזינים להמחשת תרחיש; אין בנתוני האתר תשואות או דמי ניהול.</Notice>
          <FormGrid>
            <NumberField form={form} name="monthly_income" label="הכנסה חודשית" unit="₪" />
            <NumberField form={form} name="employee_pct" label="שיעור הפקדת עובד" unit="%" hint="לפי הנתונים שפורסמו (ביטחון נמוך)." />
            <NumberField form={form} name="employer_pct" label="שיעור הפקדת מעסיק" unit="%" hint="לפי הנתונים שפורסמו (ביטחון נמוך). 0 לעצמאי." />
            <NumberField form={form} name="initial_balance" label="יתרה קיימת" unit="₪" optional />
            <NumberField form={form} name="years" label="שנות ותק / חיסכון" />
            <NumberField form={form} name="annual_return_pct" label="תשואה שנתית להמחשה" unit="%" hint="נתון שלכם להמחשה בלבד; אינו צפי." />
            <NumberField form={form} name="annual_fee_pct" label="דמי ניהול שנתיים מהצבירה" unit="%" hint="דמי הניהול אינם זמינים בנתוני האתר; יש להזין לפי הקרן." />
          </FormGrid>
        </>
      }
      renderResult={(r) => (
        <>
          <LowConfidenceBadge />
          <ResultList>
            <ResultRow label="הפקדת עובד (חודשי)" value={<Money v={r.employee_monthly} />} />
            <ResultRow label="הפקדת מעסיק (חודשי)" value={<Money v={r.employer_monthly} />} />
            <ResultRow label="סה״כ הפקדה שנתית" value={<Money v={r.total_annual} />} />
            <ResultRow label="תקרת הפקדה שנתית שפורסמה" value={<Money v={r.annual_contribution_ceiling} decimals={false} />} note={r.over_ceiling_annual > 0 ? <>חריגה: <Money v={r.over_ceiling_annual} /></> : 'ההפקדה בתוך התקרה'} />
            <ResultRow label="תקרה מוטבת לפטור שפורסמה" value={<Money v={r.tax_exempt_ceiling} decimals={false} />} note={r.over_exempt_ceiling_annual > 0 ? <>חריגה: <Money v={r.over_exempt_ceiling_annual} /></> : 'לא קובע זכאות לפטור'} />
            <ResultRow label="דמי ניהול השוואתיים" value={<NaText />} note="נתון ציבורי מאומת אינו זמין; ראו כלי ההשוואה הרשמיים." />
          </ResultList>
          <Notice>{r.six_year_reached ? 'הוזנו שש שנות חיסכון או יותר. כלל שש השנים הוא מידע כללי; הזכאות למשיכה ללא מס נקבעת מול מקור רשמי.' : 'כלל שש השנים: מידע כללי בלבד; הזכאות נקבעת מול מקור רשמי.'}</Notice>
          <ResultList>
            <ResultRow label="סה״כ הפקדות לאורך התקופה" value={<Money v={r.total_deposits} />} />
            <ResultRow strong label="יתרה בתרחיש שהוזן" value={<Money v={r.final_balance} />} note={<>תשואה נטו שנתית בתרחיש: <Pct v={r.net_annual_pct / 100} /></>} />
            <ResultRow label="תוספת מצטברת בתרחיש" value={<Money v={r.growth} />} />
          </ResultList>
          <ResultTable caption="יתרה לפי שנים (תרחיש חישובי)" columns={[{ header: 'שנה' }, { header: 'הפקדות מצטברות' }, { header: 'יתרה' }]} rows={r.rows.map((x) => [<bdi key="y">{x.year}</bdi>, <Money key="d" v={x.deposits_total} />, <Money key="b" v={x.balance} />])} />
        </>
      )}
    />
  );
}
