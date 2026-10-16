'use client';
import { useCallback } from 'react';
import { osekPaturThreshold as k } from '@/lib/calc';
import { formatILS } from '@/lib/format';
import { CalcShell } from '../CalcShell';
import { Money, NumberField, Pct, RadioGroup, ResultList, ResultRow } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function OsekPaturThreshold({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  const monthly = form.raw.mode === 'monthly';
  return (
    <CalcShell
      slug={slug}
      title="תקרת עוסק פטור"
      state={state}
      ctx={ctx}
      shareSummary={(r) => `מחזור שנתי ${formatILS(r.turnover_annual)} מול תקרה של ${formatILS(r.ceiling)}`}
      form={
        <>
          <RadioGroup
            form={form}
            name="mode"
            label="סוג ההזנה"
            options={[
              { value: 'monthly', label: 'מחזור חודשי' },
              { value: 'annual', label: 'מחזור שנתי' },
            ]}
          />
          <NumberField form={form} name="turnover" label={monthly ? 'מחזור חודשי (לפני מע״מ)' : 'מחזור שנתי (לפני מע״מ)'} unit="₪" />
        </>
      }
      renderResult={(r) => (
        <ResultList>
          <ResultRow label="מחזור שנתי" value={<Money v={r.turnover_annual} />} />
          <ResultRow label="תקרת עוסק פטור שפורסמה" value={<Money v={r.ceiling} decimals={false} />} />
          <ResultRow
            strong
            label={r.direction === 'above' ? 'חריגה מעל התקרה' : r.direction === 'below' ? 'נותר עד התקרה' : 'המחזור שווה לתקרה'}
            value={<Money v={Math.abs(r.gap)} />}
          />
          <ResultRow label="ניצול התקרה" value={<Pct v={r.usage_ratio} />} />
          <ResultRow label="מכפיל מחיר ללקוח לאחר מעבר לעוסק מורשה" value={<bdi>{r.price_with_vat_factor.toFixed(2)}</bdi>} note={<>תוספת מע״מ <Pct v={r.vat_rate} /> על מחיר לפני מע״מ</>} />
        </ResultList>
      )}
    />
  );
}
