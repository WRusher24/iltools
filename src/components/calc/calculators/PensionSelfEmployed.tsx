'use client';
import { useCallback, useMemo } from 'react';
import { pensionSelfEmployed as k } from '@/lib/calc';
import { CalcShell } from '../CalcShell';
import { FormGrid, LowConfidenceBadge, Money, NaText, NumberField, Notice, Pct, ResultList, ResultRow, ResultTable } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';
import { formatILS } from '@/lib/format';

export default function PensionSelfEmployed({ slug, ctx }: CalcProps) {
  const defaults = useMemo(() => k.makeDefaults(ctx.rates), [ctx.rates]);
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון פנסיה לעצמאי"
      state={state}
      ctx={ctx}
      shareSummary={(r) => `הפקדה שנתית ${formatILS(r.deposit_annual)} לפנסיה (תרחיש חישובי)`}
      form={
        <>
          <Notice>עמוד חינוכי בלבד, ללא המלצת מוצר, גוף או רמת הפקדה. התשואה ודמי הניהול הם נתונים שאתם מזינים להמחשת תרחיש בלבד.</Notice>
          <FormGrid>
            <NumberField form={form} name="annual_income" label="הכנסה שנתית" unit="₪" />
            <NumberField form={form} name="deposit_pct" label="שיעור הפקדה לבדיקה" unit="%" hint="ברירת המחדל היא השיעור המינימלי שפורסם לעצמאי (ביטחון נמוך)." />
            <NumberField form={form} name="initial_balance" label="יתרה קיימת" unit="₪" optional />
            <NumberField form={form} name="years" label="שנות חיסכון" />
            <NumberField form={form} name="annual_return_pct" label="תשואה שנתית להמחשה" unit="%" hint="נתון שלכם להמחשה בלבד; אינו צפי." />
            <NumberField form={form} name="annual_fee_pct" label="דמי ניהול שנתיים מהצבירה" unit="%" hint="דמי הניהול אינם זמינים בנתוני האתר; יש להזין לפי הגוף." />
          </FormGrid>
        </>
      }
      renderResult={(r) => (
        <>
          <LowConfidenceBadge />
          <ResultList>
            <ResultRow label="שיעור הפקדה מינימלי שפורסם" value={<Pct v={r.min_deposit_rate} />} note={r.below_published_minimum ? 'השיעור שהוזן נמוך מהמינימום' : undefined} />
            <ResultRow label="הפקדה שנתית" value={<Money v={r.deposit_annual} />} note={<>חודשית: <Money v={r.deposit_monthly} /></>} />
          </ResultList>
          <ResultTable
            caption="שני מנגנוני ההטבה (להבנת ההבדל, ללא המלצה)"
            columns={[{ header: 'מנגנון' }, { header: 'שיעור' }, { header: 'סכום' }, { header: 'הערה' }]}
            rows={[
              ['זיכוי מס', <Pct key="a" v={r.credit_rate} />, <Money key="b" v={r.credit_amount} />, 'איור עליון: אין בנתונים תקרה להפקדה המזכה'],
              ['ניכוי מההכנסה', <Pct key="c" v={r.deduction_rate} />, <Money key="d" v={r.deduction_amount} />, <>חיסכון מס משוער: <Money key="e" v={r.deduction_tax_saving} /></>],
            ]}
          />
          <ResultList>
            <ResultRow label="דמי ניהול השוואתיים" value={<NaText />} note="נתון ציבורי מאומת אינו זמין." />
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
