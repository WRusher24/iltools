'use client';
import { useCallback, useMemo } from 'react';
import { employeeVsFreelancer as k } from '@/lib/calc';
import { formatILS } from '@/lib/format';
import { CalcShell } from '../CalcShell';
import { FormGrid, LowConfidenceBadge, Money, NaText, NumberField, Notice, ResultList, ResultRow, Section } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function EmployeeVsFreelancer({ slug, ctx }: CalcProps) {
  const defaults = useMemo(() => k.makeDefaults(ctx.rates), [ctx.rates]);
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="שכיר או עצמאי: השוואת נטו"
      state={state}
      ctx={ctx}
      shareSummary={(r) => `נטו שכיר ${formatILS(r.employee_net_monthly)} מול נטו עצמאי ${formatILS(r.freelancer_net_after_deposits_monthly)} לחודש`}
      form={
        <>
          <Section title="מסלול שכיר">
            <FormGrid>
              <NumberField form={form} name="gross_offer" label="הצעת שכר ברוטו חודשי" unit="₪" />
              <NumberField form={form} name="employer_extras_monthly" label="שווי תוספות מעסיק (הערכתך, חודשי)" unit="₪" optional hint="למשל רכב או ארוחות; הערכה שלך, ללא חישוב מס." />
              <NumberField form={form} name="pension_pct" label="אחוז הפקדת עובד לפנסיה" unit="%" hint="לפי הנתונים שפורסמו (ביטחון נמוך)." />
              <NumberField form={form} name="hishtalmut_pct" label="אחוז הפקדת עובד לקרן השתלמות" unit="%" />
            </FormGrid>
          </Section>
          <Section title="מסלול עצמאי">
            <FormGrid>
              <NumberField form={form} name="freelancer_rate" label="תעריף עצמאי לשעה (לפני מע״מ)" unit="₪" />
              <NumberField form={form} name="billable_hours_month" label="שעות חיוב בחודש" />
              <NumberField form={form} name="business_expenses_monthly" label="הוצאות עסקיות חודשיות" unit="₪" optional />
              <NumberField form={form} name="freelancer_pension_monthly" label="הפקדה חודשית לפנסיה (עצמאי)" unit="₪" optional />
            </FormGrid>
          </Section>
          <NumberField form={form} name="credit_points" label="נקודות זיכוי (לשני המסלולים)" hint="נקודות בסיס: 2.25 לגבר, 2.75 לאישה." />
        </>
      }
      renderResult={(r) => (
        <>
          <Notice>ההשוואה היא של נטו במזומן בלבד. זכויות לא כספיות (חופשה, מחלה, ביטחון תעסוקתי) אינן מתומחרות, ושיעורי הביטוח הלאומי לעצמאי מחושבים בקירוב לפי שיעורי עובד.</Notice>
          <ResultList>
            <ResultRow label="נטו שכיר במזומן (אחרי הפקדות עובד)" value={<Money v={r.employee_net_monthly} />} />
            <ResultRow label="נטו שכיר כולל שווי תוספות מעסיק" value={<Money v={r.employee_net_plus_extras_monthly} />} />
            <ResultRow label="מחזור עצמאי חודשי" value={<Money v={r.freelancer_revenue_monthly} />} />
            <ResultRow label="נטו עצמאי (אחרי מס וביטוח)" value={<Money v={r.freelancer_net_monthly} />} />
            <ResultRow strong label="נטו עצמאי אחרי הפקדת פנסיה" value={<Money v={r.freelancer_net_after_deposits_monthly} />} />
            <ResultRow label="הפרש מול נטו שכיר במזומן" value={<Money v={r.difference_vs_employee_net} />} />
            <ResultRow label="הפרש מול נטו שכיר כולל תוספות" value={<Money v={r.difference_vs_employee_total} />} />
          </ResultList>
          <Section title="נקודת איזון">
            <ResultList>
              <ResultRow label="תעריף לשעה לאיזון מול נטו שכיר" value={r.breakeven_rate === null ? <NaText /> : <Money v={r.breakeven_rate} />} note={r.breakeven_revenue_monthly === null ? undefined : <>מחזור חודשי: <Money v={r.breakeven_revenue_monthly} /></>} />
              <ResultRow label="תעריף לשעה לאיזון מול נטו כולל תוספות" value={r.breakeven_total_rate === null ? <NaText /> : <Money v={r.breakeven_total_rate} />} note={r.breakeven_total_revenue_monthly === null ? undefined : <>מחזור חודשי: <Money v={r.breakeven_total_revenue_monthly} /></>} />
            </ResultList>
          </Section>
          <LowConfidenceBadge />
        </>
      )}
    />
  );
}
