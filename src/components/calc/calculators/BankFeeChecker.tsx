'use client';
import { useCallback } from 'react';
import { bankFeeChecker as k } from '@/lib/calc';
import { CalcShell } from '../CalcShell';
import { Money, NaText, NumberField, Notice, ResultList, ResultRow, ResultTable, SelectField, TextField } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

const cats = (Object.keys(k.CATEGORY_LABEL) as k.FeeCategory[]).map((c) => ({ value: c, label: k.CATEGORY_LABEL[c] }));

export default function BankFeeChecker({ slug, ctx }: CalcProps) {
  const banking = ctx.providers?.['business-banking'];
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates, { businessBanking: banking }), [ctx.rates, banking]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="בודק עמלות בנק"
      state={state}
      ctx={ctx}
      intro={<Notice>ההזנה ידנית: הכלי אינו מתחבר לחשבון הבנק ואינו קורא קבצים. עמלות בנקים לעסק אינן מפורסמות בנתוני האתר כסכומים קבועים, ולכן אין השוואה מחייבת.</Notice>}
      form={
        <div className="grid gap-4">
          {Array.from({ length: k.FEE_LINES }, (_, idx) => idx + 1).map((n) => (
            <fieldset key={n} className="grid gap-3 rounded-lg border border-line p-3 sm:grid-cols-4">
              <legend className="px-1 font-semibold">סעיף עמלה {n}</legend>
              <TextField form={form} name={`name_${n}`} label="שם הסעיף" optional />
              <SelectField form={form} name={`cat_${n}`} label="סוג" options={cats} />
              <NumberField form={form} name={`amount_${n}`} label="סכום" unit="₪" optional />
              <SelectField form={form} name={`freq_${n}`} label="תדירות" options={[{ value: 'monthly', label: 'חודשי' }, { value: 'annual', label: 'שנתי' }]} />
            </fieldset>
          ))}
        </div>
      }
      renderResult={(r) => (
        <>
          <ResultList>
            <ResultRow label="סה״כ עמלות חודשי" value={<Money v={r.total_monthly} />} />
            <ResultRow strong label="סה״כ עמלות שנתי" value={<Money v={r.total_annual} />} />
          </ResultList>
          <ResultTable caption="לפי סוג" columns={[{ header: 'סוג' }, { header: 'חודשי' }]} rows={r.by_category.map((c) => [c.label, <Money key="m" v={c.monthly} />])} />
          <ResultTable
            caption="סעיפים לבירור מול הבנק (מהיקר לזול, עלות שנתית)"
            columns={[{ header: 'סעיף' }, { header: 'עלות שנתית' }, { header: 'הערה' }]}
            rows={r.review.map((x) => [x.name, <Money key="a" v={x.annual} />, x.reasons.join('; ') || 'כדאי לבקש הסבר על החיוב'])}
          />
          <section aria-labelledby="bf-cmp">
            <h3 id="bf-cmp" className="mb-2 mt-0 text-base">השוואה לנתונים שפורסמו</h3>
            {r.comparison_available ? (
              <ResultTable
                caption={r.comparison_text}
                columns={[{ header: 'בנק' }, { header: 'מינימום חודשי שפורסם' }, { header: 'דמי הקמה שפורסמו' }]}
                rows={r.benchmarks.map((b) => [b.provider_name, b.monthly_minimum === null ? <NaText key="a" /> : <Money key="a" v={b.monthly_minimum} />, b.setup_fee === null ? <NaText key="b" /> : <Money key="b" v={b.setup_fee} />])}
              />
            ) : (
              <p className="m-0">{r.comparison_text}</p>
            )}
          </section>
        </>
      )}
    />
  );
}
