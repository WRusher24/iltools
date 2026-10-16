'use client';
import { useCallback } from 'react';
import { atzmaiNet as k } from '@/lib/calc';
import { formatILS } from '@/lib/format';
import { CalcShell } from '../CalcShell';
import { FormGrid, LowConfidenceBadge, Money, NaText, NumberField, Notice, Pct, RadioGroup, ResultList, ResultRow, SelectField } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';
import { BracketTable } from './shared';

export default function AtzmaiNet({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון נטו לעצמאי"
      state={state}
      ctx={ctx}
      shareSummary={(r) => `הכנסה חודשית ${formatILS(r.profit_monthly)} חייבת, נטו משוער ${formatILS(r.net_monthly)} לחודש`}
      form={
        <>
          <FormGrid>
            <NumberField form={form} name="revenue_monthly" label="הכנסה חודשית (לפני מע״מ)" unit="₪" />
            <NumberField form={form} name="expenses_monthly" label="הוצאות חודשיות" unit="₪" optional />
            <NumberField form={form} name="credit_points" label="נקודות זיכוי" hint="נקודות בסיס: 2.25 לגבר, 2.75 לאישה. יש להזין לפי המצב האישי." />
            <SelectField
              form={form}
              name="marital_status"
              label="מצב משפחתי"
              hint="לצורך מידע בלבד; אינו משפיע על החישוב."
              options={[
                { value: 'single', label: 'רווק/ה' },
                { value: 'married', label: 'נשוי/אה' },
                { value: 'other', label: 'אחר' },
              ]}
            />
            <NumberField form={form} name="pension_deposit" label="הפקדה חודשית לפנסיה" unit="₪" optional />
            <NumberField form={form} name="hishtalmut_deposit" label="הפקדה חודשית לקרן השתלמות" unit="₪" optional />
            <NumberField form={form} name="deductions" label="ניכויים נוספים (חודשי)" unit="₪" optional />
          </FormGrid>
          <RadioGroup
            form={form}
            name="status"
            label="סטטוס"
            options={[
              { value: 'patur', label: 'עוסק פטור' },
              { value: 'murshe', label: 'עוסק מורשה' },
            ]}
          />
        </>
      }
      renderResult={(r) => (
        <>
          <Notice>
            ביטוח לאומי ומס בריאות: בנתונים שלנו קיימים רק שיעורי עובד (מופחת/מלא), ללא שיעורי עצמאי. החישוב משתמש בהם כקירוב שמרני ומציג שורה משולבת אחת; מס בריאות נפרד אינו זמין.
          </Notice>
          <ResultList>
            <ResultRow label="הכנסה חייבת (חודשי)" value={<Money v={r.profit_monthly} />} />
            <ResultRow label="מס הכנסה (חודשי, לאחר נקודות זיכוי)" value={<Money v={r.income_tax_monthly} />} note={<>שנתי: <Money v={r.income_tax_annual} /></>} />
            <ResultRow label="ביטוח לאומי ומס בריאות (משולב, חודשי)" value={<Money v={r.ni_combined_monthly} />} note={<>שנתי: <Money v={r.ni_combined_annual} /></>} />
            <ResultRow label="מס בריאות (בנפרד)" value={<NaText />} />
            <ResultRow strong label="הכנסה נטו (חודשי)" value={<Money v={r.net_monthly} />} note={<>שנתי: <Money v={r.net_annual} /></>} />
            {r.deposits_monthly > 0 ? <ResultRow label="נטו לאחר הפקדות לפנסיה ולקרן" value={<Money v={r.net_after_deposits_monthly} />} /> : null}
            <ResultRow label="שיעור אפקטיבי (מס וביטוח מההכנסה החייבת)" value={r.effective_rate === null ? <NaText /> : <Pct v={r.effective_rate} />} />
            <ResultRow label="הערכת מקדמת מס (חודשי)" value={<Money v={r.advance_payment_monthly} />} note="הערכה: מס שנתי חלקי 12" />
          </ResultList>
          {r.deposits_monthly > 0 ? <LowConfidenceBadge /> : null}
          <BracketTable lines={r.tax_by_bracket} />
          <ResultList>
            <ResultRow label="סה״כ לפני נקודות זיכוי" value={<Money v={r.tax_before_credits} />} />
            <ResultRow label="שווי נקודות הזיכוי" value={<Money v={r.credits_value} />} />
            {r.surtax > 0 ? <ResultRow label="מס יסף" value={<Money v={r.surtax} />} /> : null}
          </ResultList>
        </>
      )}
    />
  );
}
