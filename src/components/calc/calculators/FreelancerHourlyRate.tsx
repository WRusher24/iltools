'use client';
import { useCallback } from 'react';
import { freelancerHourlyRate as k } from '@/lib/calc';
import { formatILS } from '@/lib/format';
import { CalcShell } from '../CalcShell';
import { FormGrid, LowConfidenceBadge, Money, NaText, NumberField, Notice, Num, ResultList, ResultRow } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function FreelancerHourlyRate({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון תעריף שעתי לעצמאי"
      state={state}
      ctx={ctx}
      shareSummary={(r) => `תעריף מינימום לאיזון ${formatILS(r.hourly_rate)} לשעה`}
      form={
        <FormGrid>
          <NumberField form={form} name="net_desired_monthly" label="נטו חודשי רצוי" unit="₪" />
          <NumberField form={form} name="billable_hours_week" label="שעות חיוב בשבוע" hint="שעות שאפשר באמת לחייב, לא שעות העבודה הכוללות." />
          <NumberField form={form} name="vacation_weeks" label="שבועות חופשה, חגים ומחלה בשנה" optional />
          <NumberField form={form} name="business_expenses_monthly" label="הוצאות עסקיות חודשיות" unit="₪" optional />
          <NumberField form={form} name="pension_monthly" label="הפקדה חודשית לפנסיה" unit="₪" optional />
          <NumberField form={form} name="credit_points" label="נקודות זיכוי" hint="נקודות בסיס: 2.25 לגבר, 2.75 לאישה." />
        </FormGrid>
      }
      renderResult={(r) => (
        <>
          {r.hourly_rate === null ? <Notice tone="warn">לא נמצא תעריף לנתונים שהוזנו. <NaText /></Notice> : null}
          <ResultList>
            <ResultRow strong label="תעריף מינימום לשעה (לפני מע״מ)" value={r.hourly_rate === null ? <NaText /> : <Money v={r.hourly_rate} />} />
            <ResultRow label="תעריף לשעה כולל מע״מ (לעוסק מורשה)" value={r.hourly_rate_incl_vat === null ? <NaText /> : <Money v={r.hourly_rate_incl_vat} />} />
            <ResultRow label="מחזור חודשי נדרש" value={r.required_revenue_monthly === null ? <NaText /> : <Money v={r.required_revenue_monthly} />} />
            <ResultRow label="רווח חייב חודשי נדרש" value={r.required_profit_monthly === null ? <NaText /> : <Money v={r.required_profit_monthly} />} />
            <ResultRow label="מס הכנסה חודשי" value={r.income_tax_monthly === null ? <NaText /> : <Money v={r.income_tax_monthly} />} />
            <ResultRow label="ביטוח לאומי ומס בריאות (משולב, חודשי)" value={r.ni_combined_monthly === null ? <NaText /> : <Money v={r.ni_combined_monthly} />} />
            <ResultRow label="שעות חיוב בשנה" value={<Num v={r.annual_billable_hours} />} />
          </ResultList>
          {Number(form.raw.pension_monthly) > 0 ? <LowConfidenceBadge /> : null}
        </>
      )}
    />
  );
}
