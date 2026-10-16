'use client';
import { useCallback } from 'react';
import { payslipDecoder as k } from '@/lib/calc';
import { CalcShell } from '../CalcShell';
import { FormGrid, LowConfidenceBadge, Money, NumberField, Notice, ResultList, ResultRow, ResultTable } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function PayslipDecoder({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate, urlSync: false });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מפענח תלוש שכר"
      state={state}
      ctx={ctx}
      intro={<Notice>פרטיות: ההזנה ידנית ומתבצעת בדפדפן שלכם בלבד. אין העלאת קובץ, אין שליחת נתונים לשרת ואין שמירה של התלוש או של הסכומים שהוזנו. הסכומים אינם נכתבים לכתובת הדף, ולכן קישור השיתוף אינו כולל אותם.</Notice>}
      form={
        <FormGrid>
          <NumberField form={form} name="gross" label="שכר ברוטו" unit="₪" />
          <NumberField form={form} name="income_tax" label="מס הכנסה" unit="₪" />
          <NumberField form={form} name="ni_and_health" label="ביטוח לאומי ומס בריאות (יחד)" unit="₪" />
          <NumberField form={form} name="pension_employee" label="פנסיה — חלק העובד" unit="₪" optional />
          <NumberField form={form} name="hishtalmut_employee" label="קרן השתלמות — חלק העובד" unit="₪" optional />
          <NumberField form={form} name="other_deductions" label="ניכויים אחרים" unit="₪" optional />
          <NumberField form={form} name="net_stated" label="נטו לתשלום (כפי שמופיע בתלוש)" unit="₪" />
          <NumberField form={form} name="credit_points" label="נקודות זיכוי בתלוש" optional hint="להשוואה להערכה מחושבת." />
          <NumberField form={form} name="pension_employer" label="פנסיה — חלק המעסיק" unit="₪" optional />
        </FormGrid>
      }
      renderResult={(r) => (
        <>
          <ResultTable caption="פירוק התלוש בשפה פשוטה" columns={[{ header: 'שורה' }, { header: 'סכום' }, { header: 'מה זה' }]} rows={r.lines.map((l) => [l.label, <Money key="a" v={l.amount} />, l.explanation])} />
          <ResultList>
            <ResultRow label="סך ניכויים שהוזנו" value={<Money v={r.total_deductions} />} />
            <ResultRow label="נטו מחושב (ברוטו פחות ניכויים)" value={<Money v={r.computed_net} />} />
            <ResultRow strong label="הפרש מול הנטו שהוזן" value={<Money v={r.net_difference} />} />
          </ResultList>
          {r.estimate ? (
            <ResultTable
              caption="השוואה להערכה מחושבת מנתוני 2026 (לצורך בדיקה בלבד)"
              columns={[{ header: 'רכיב' }, { header: 'בתלוש' }, { header: 'הערכה' }]}
              rows={[
                ['מס הכנסה', <Money key="a" v={r.lines[1].amount} />, <Money key="b" v={r.estimate.income_tax} />],
                ['ביטוח לאומי ומס בריאות', <Money key="c" v={r.lines[2].amount} />, <Money key="d" v={r.estimate.ni_and_health} />],
              ]}
            />
          ) : null}
          <section aria-labelledby="ps-flags">
            <h3 id="ps-flags" className="mb-2 mt-0 text-base">מה כדאי לבדוק</h3>
            {r.flags.length === 0 ? <p className="m-0 text-muted">לא סומנו נקודות לבדיקה לפי הנתונים שהוזנו. אין בכך קביעה שהתלוש תקין.</p> : <ul className="m-0 grid gap-1 ps-5">{r.flags.map((f) => <li key={f}>{f}</li>)}</ul>}
          </section>
          <LowConfidenceBadge />
        </>
      )}
    />
  );
}
