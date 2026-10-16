'use client';
import { useCallback, useMemo } from 'react';
import { salaryNet as k } from '@/lib/calc';
import { formatILS } from '@/lib/format';
import { CalcShell } from '../CalcShell';
import { FormGrid, LowConfidenceBadge, Money, NaText, NumberField, Notice, Pct, ResultList, ResultRow } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';
import { BracketTable } from './shared';

export default function SalaryNet({ slug, ctx }: CalcProps) {
  const defaults = useMemo(() => k.makeDefaults(ctx.rates), [ctx.rates]);
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון שכר נטו לשכיר"
      state={state}
      ctx={ctx}
      shareSummary={(r) => `ברוטו ${formatILS(r.gross_monthly)}, נטו משוער ${formatILS(r.net_monthly)} לחודש`}
      form={
        <FormGrid>
          <NumberField form={form} name="gross_monthly" label="שכר ברוטו חודשי" unit="₪" />
          <NumberField form={form} name="car_value_monthly" label="שווי רכב (חודשי)" unit="₪" optional />
          <NumberField form={form} name="credit_points" label="נקודות זיכוי" hint="נקודות בסיס: 2.25 לגבר, 2.75 לאישה." />
          <NumberField form={form} name="pension_pct" label="אחוז הפקדת עובד לפנסיה" unit="%" hint="ברירת המחדל לפי הנתונים שפורסמו (ביטחון נמוך); אפשר לשנות לפי התלוש." />
          <NumberField form={form} name="hishtalmut_pct" label="אחוז הפקדת עובד לקרן השתלמות" unit="%" hint="ברירת המחדל לפי הנתונים שפורסמו (ביטחון נמוך); 0 אם אין קרן." />
        </FormGrid>
      }
      renderResult={(r) => (
        <>
          <Notice>ביטוח לאומי ומס בריאות מחושבים לפי שיעורי העובד שפורסמו ומוצגים כשורה משולבת; מס בריאות נפרד אינו זמין בנתונים.</Notice>
          <ResultList>
            <ResultRow label="שכר ברוטו" value={<Money v={r.gross_monthly} />} />
            <ResultRow label="מס הכנסה" value={<Money v={r.income_tax_monthly} />} />
            <ResultRow label="ביטוח לאומי ומס בריאות (משולב)" value={<Money v={r.ni_combined_monthly} />} />
            <ResultRow label="מס בריאות (בנפרד)" value={<NaText />} />
            <ResultRow label="הפקדת עובד לפנסיה" value={<Money v={r.pension_monthly} />} />
            <ResultRow label="הפקדת עובד לקרן השתלמות" value={<Money v={r.hishtalmut_monthly} />} />
            <ResultRow strong label="נטו (חודשי)" value={<Money v={r.net_monthly} />} note={<>שנתי: <Money v={r.net_annual} /></>} />
            <ResultRow label="שיעור אפקטיבי (מס וביטוח)" value={r.effective_rate === null ? <NaText /> : <Pct v={r.effective_rate} />} />
            {r.employer_pension_monthly !== null ? <ResultRow label="הפרשת מעסיק לפנסיה (מידע, לא בנטו)" value={<Money v={r.employer_pension_monthly} />} /> : null}
            {r.employer_hishtalmut_monthly !== null ? <ResultRow label="הפרשת מעסיק לקרן השתלמות (מידע, לא בנטו)" value={<Money v={r.employer_hishtalmut_monthly} />} /> : null}
          </ResultList>
          {r.pension_monthly > 0 || r.hishtalmut_monthly > 0 ? <LowConfidenceBadge /> : null}
          <BracketTable lines={r.tax_by_bracket} />
        </>
      )}
    />
  );
}
