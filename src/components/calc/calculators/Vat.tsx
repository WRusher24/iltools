'use client';
import { useCallback } from 'react';
import { vat as k } from '@/lib/calc';
import { formatILS } from '@/lib/format';
import { CalcShell } from '../CalcShell';
import { CheckboxField, FormGrid, Money, NumberField, Pct, RadioGroup, ResultList, ResultRow } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function Vat({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון מע״מ"
      state={state}
      ctx={ctx}
      shareSummary={(r) => `סכום לפני מע״מ ${formatILS(r.net)}, מע״מ ${formatILS(r.vat)}, סה״כ ${formatILS(r.gross)}`}
      form={
        <>
          <RadioGroup
            form={form}
            name="mode"
            label="הסכום שהוזן"
            options={[
              { value: 'exclusive', label: 'לא כולל מע״מ' },
              { value: 'inclusive', label: 'כולל מע״מ' },
            ]}
          />
          <FormGrid>
            <NumberField form={form} name="amount" label="סכום" unit="₪" />
            <NumberField form={form} name="outputs_vat" label="מע״מ תפוקות (מכירות)" unit="₪" optional hint="סכום המע״מ שגבית מלקוחות." />
            <NumberField form={form} name="inputs_vat" label="מע״מ תשומות (קניות)" unit="₪" optional hint="סכום המע״מ ששילמת על הוצאות מוכרות." />
          </FormGrid>
          <CheckboxField form={form} name="osek_patur" label="אני עוסק פטור" />
        </>
      }
      renderResult={(r) => (
        <ResultList>
          <ResultRow label="שיעור מע״מ" value={<Pct v={r.rate} />} />
          <ResultRow label="סכום לפני מע״מ" value={<Money v={r.net} />} />
          <ResultRow label="מע״מ" value={<Money v={r.vat} />} />
          <ResultRow strong label="סכום כולל מע״מ" value={<Money v={r.gross} />} />
          <ResultRow
            label={r.balance_direction === 'refund' ? 'יתרת מע״מ להחזר' : r.balance_direction === 'pay' ? 'יתרת מע״מ לתשלום' : 'יתרת מע״מ'}
            value={<Money v={Math.abs(r.balance)} />}
            note="תפוקות פחות תשומות"
          />
        </ResultList>
      )}
    />
  );
}
