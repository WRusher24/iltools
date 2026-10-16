'use client';
import { useCallback } from 'react';
import { severance as k } from '@/lib/calc';
import { CalcShell } from '../CalcShell';
import { FormGrid, Money, NaText, NumberField, Notice, Pct, ResultList, ResultRow, ResultTable } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';
import { formatILS } from '@/lib/format';

export default function Severance({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון פיצויי פיטורים"
      state={state}
      ctx={ctx}
      shareSummary={(r) => `אומדן פיצויים ראשוני ${formatILS(r.estimate)}`}
      form={
        <FormGrid>
          <NumberField form={form} name="monthly_salary" label="שכר קובע חודשי" unit="₪" />
          <NumberField form={form} name="years" label="שנות ותק" hint="אפשר להזין שברים, למשל 5.5." />
          <NumberField
            form={form}
            name="exempt_monthly_ceiling"
            label="תקרת פטור חודשית לשנת ותק (אופציונלי)"
            unit="₪"
            optional
            hint="התקרה אינה בנתוני האתר. אפשר להזין ערך ממקור רשמי (רשות המסים) כדי לראות חלוקה לחלק פטור וחלק חייב; יש לאמת את הערך."
          />
        </FormGrid>
      }
      renderResult={(r) => (
        <>
          <ResultList>
            <ResultRow label="שכר שנתי" value={<Money v={r.annual_salary} />} />
            <ResultRow strong label="אומדן פיצויים (שכר × ותק)" value={<Money v={r.estimate} />} />
            <ResultRow label="חלק פטור ממס" value={r.exempt_amount === null ? <NaText /> : <Money v={r.exempt_amount} />} />
            <ResultRow label="חלק חייב במס" value={r.taxable_amount === null ? <NaText /> : <Money v={r.taxable_amount} />} />
          </ResultList>
          <Notice>המס על הפיצויים אינו מחושב. להקשר בלבד מוצגות מדרגות מס ההכנסה הכלליות.</Notice>
          <ResultTable
            caption="מדרגות מס הכנסה שנתיות (הקשר כללי)"
            columns={[{ header: 'מדרגה' }, { header: 'טווח שנתי' }, { header: 'שיעור' }]}
            rows={r.brackets.map((b, i) => [`מדרגה ${i + 1}`, <bdi key="r">{formatILS(b.from)} – {b.to === null ? 'ללא תקרה' : formatILS(b.to)}</bdi>, <Pct key="p" v={b.rate} />])}
          />
        </>
      )}
    />
  );
}
