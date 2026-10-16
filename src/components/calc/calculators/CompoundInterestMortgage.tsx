'use client';
import { useCallback } from 'react';
import { compoundInterestMortgage as k } from '@/lib/calc';
import { CalcShell } from '../CalcShell';
import { FormGrid, Money, NumberField, Notice, RadioGroup, ResultList, ResultRow, ResultTable, SelectField } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';
import { formatILS } from '@/lib/format';

export default function CompoundInterestMortgage({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  const loan = form.raw.mode === 'loan';
  return (
    <CalcShell
      slug={slug}
      title="ריבית דריבית והחזר הלוואה"
      state={state}
      ctx={ctx}
      shareSummary={(r) => (r.mode === 'loan' ? `החזר חודשי ${formatILS(r.monthly_payment)}` : `יתרה סופית ${formatILS(r.final_balance)}`)}
      form={
        <>
          <RadioGroup
            form={form}
            name="mode"
            label="סוג חישוב"
            options={[
              { value: 'compound', label: 'ריבית דריבית (חיסכון)' },
              { value: 'loan', label: 'החזר הלוואה' },
            ]}
          />
          <Notice>הריבית היא נתון שאתם מזינים בלבד. האתר אינו מספק ריבית משכנתא, פריים או אשראי, ואין כאן הצעה או שיווק של אשראי.</Notice>
          <FormGrid>
            <NumberField form={form} name="amount" label={loan ? 'סכום ההלוואה' : 'יתרה התחלתית'} unit="₪" />
            {loan ? null : <NumberField form={form} name="monthly_deposit" label="הפקדה חודשית" unit="₪" optional />}
            <NumberField form={form} name="annual_rate_pct" label="ריבית שנתית" unit="%" />
            <SelectField
              form={form}
              name="rate_basis"
              label="שיטת המרת הריבית"
              options={[
                { value: 'nominal_monthly', label: 'נומינלית שנתית, צבירה חודשית (ריבית ÷ 12)' },
                { value: 'effective_annual', label: 'אפקטיבית שנתית (מומרת לחודשית שקולה)' },
              ]}
            />
            <NumberField form={form} name="years" label="מספר שנים" />
          </FormGrid>
        </>
      }
      renderResult={(r) => (
        <>
          <ResultList>
            {r.mode === 'compound' ? (
              <>
                <ResultRow strong label="יתרה סופית" value={<Money v={r.final_balance} />} />
                <ResultRow label="סה״כ הפקדות (כולל יתרה התחלתית)" value={<Money v={r.total_deposits} />} />
                <ResultRow label="סה״כ ריבית שנצברה" value={<Money v={r.total_interest} />} />
              </>
            ) : (
              <>
                <ResultRow strong label="החזר חודשי" value={<Money v={r.monthly_payment} />} />
                <ResultRow label="סה״כ תשלומים" value={<Money v={r.total_paid} />} />
                <ResultRow label="סה״כ ריבית" value={<Money v={r.total_interest} />} />
              </>
            )}
          </ResultList>
          <ResultTable
            caption={r.mode === 'loan' ? 'לוח סילוקין שנתי' : 'צבירה לפי שנים'}
            columns={r.mode === 'loan' ? [{ header: 'שנה' }, { header: 'קרן ששולמה' }, { header: 'ריבית ששולמה' }, { header: 'יתרת קרן' }] : [{ header: 'שנה' }, { header: 'הפקדות מצטברות' }, { header: 'ריבית בשנה' }, { header: 'יתרה' }]}
            rows={r.rows.map((x) => [<bdi key="y">{x.year}</bdi>, <Money key="p" v={x.principal} />, <Money key="i" v={x.interest} />, <Money key="b" v={x.balance} />])}
          />
        </>
      )}
    />
  );
}
