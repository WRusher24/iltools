'use client';
import { useCallback } from 'react';
import { unemployment as k } from '@/lib/calc';
import { CalcShell } from '../CalcShell';
import { FormGrid, Money, NaText, NumberField, Notice, ResultList, ResultRow } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function Unemployment({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון דמי אבטלה"
      state={state}
      ctx={ctx}
      form={
        <>
          <FormGrid>
            <NumberField form={form} name="prior_salary_monthly" label="שכר חודשי קודם" unit="₪" />
            <NumberField form={form} name="age" label="גיל (בקירוב)" />
            <NumberField form={form} name="work_months" label="חודשי עבודה" />
          </FormGrid>
          <Notice>נוסחת דמי האבטלה אינה בנתוני האתר. אפשר להזין ידנית נתונים מהפרסום הרשמי של ביטוח לאומי (דמי אבטלה ליום וימי זכאות) כדי לחשב מכפלה פשוטה.</Notice>
          <FormGrid>
            <NumberField form={form} name="daily_benefit" label="דמי אבטלה ליום (לפי ביטוח לאומי)" unit="₪" optional />
            <NumberField form={form} name="entitlement_days" label="ימי זכאות (לפי ביטוח לאומי)" optional />
          </FormGrid>
        </>
      }
      renderResult={(r) => (
        <ResultList>
          <ResultRow label="שכר שנתי" value={<Money v={r.salary_annual} />} />
          <ResultRow label="שכר מבוטח (עד התקרה שפורסמה)" value={<Money v={r.insured_wage_monthly} />} note={r.above_monthly_ceiling ? 'השכר עולה על התקרה' : undefined} />
          <ResultRow label="סף המדרגה המופחתת" value={<Money v={r.reduced_ceiling} decimals={false} />} note={r.above_reduced_ceiling ? 'השכר עולה על המדרגה המופחתת' : 'השכר בתוך המדרגה המופחתת'} />
          <ResultRow label="תקרת הכנסה מבוטחת" value={<Money v={r.monthly_ceiling} decimals={false} />} />
          <ResultRow strong label="אומדן דמי אבטלה כולל" value={r.benefit_estimate === null ? <NaText /> : <Money v={r.benefit_estimate} />} note={r.estimate_available ? 'מכפלת הנתונים שהוזנו' : 'לא זמין: אין נוסחה בנתונים'} />
        </ResultList>
      )}
    />
  );
}
