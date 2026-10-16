'use client';
import { useCallback } from 'react';
import { taxRefundEstimator as k } from '@/lib/calc';
import { CalcShell } from '../CalcShell';
import { FormGrid, Money, NumberField, Notice, ResultList, ResultRow } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function TaxRefundEstimator({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="בדיקת החזר מס ראשונית"
      state={state}
      ctx={ctx}
      intro={<Notice tone="warn">בדיקה ראשונית בלבד. זו אינה בקשת החזר, אינה התחייבות לתוצאה, והפער שיוצג אינו סכום סופי.</Notice>}
      form={
        <FormGrid>
          <NumberField form={form} name="annual_income" label="הכנסה חייבת שנתית (ברוטו)" unit="₪" />
          <NumberField form={form} name="deductions_annual" label="ניכויים שנתיים" unit="₪" optional />
          <NumberField form={form} name="tax_paid" label="מס הכנסה שנגבה בפועל בשנה" unit="₪" />
          <NumberField form={form} name="credit_points" label="נקודות זיכוי שמגיעות לך" hint="נקודות בסיס: 2.25 לגבר, 2.75 לאישה." />
          <NumberField form={form} name="extra_credits_annual" label="זיכויים נוספים (שנתי)" unit="₪" optional hint="זיכויים שאינם נקודות זיכוי בסיס, אם יש." />
        </FormGrid>
      }
      renderResult={(r) => (
        <>
          <ResultList>
            <ResultRow label="הכנסה חייבת לאחר ניכויים" value={<Money v={r.taxable_annual} />} />
            <ResultRow label="מס לפי מדרגות (לפני זיכויים)" value={<Money v={r.tax_before_credits} />} />
            <ResultRow label="שווי נקודות זיכוי וזיכויים" value={<Money v={r.credits_value} />} />
            {r.surtax > 0 ? <ResultRow label="מס יסף" value={<Money v={r.surtax} />} /> : null}
            <ResultRow label="מס מחושב להערכה" value={<Money v={r.tax_due_estimate} />} />
            <ResultRow label="מס שנגבה בפועל" value={<Money v={r.tax_paid} />} />
            <ResultRow
              strong
              label={r.direction === 'possible_refund' ? 'פער אפשרי לטובתך — לבדיקה בלבד' : r.direction === 'possible_balance_due' ? 'ייתכן חוב מס — לבדיקה בלבד' : 'לא נמצא פער'}
              value={<Money v={Math.abs(r.gap)} />}
            />
          </ResultList>
        </>
      )}
    />
  );
}
