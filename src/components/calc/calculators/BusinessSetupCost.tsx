'use client';
import { useCallback } from 'react';
import { businessSetupCost as k } from '@/lib/calc';
import { CalcShell } from '../CalcShell';
import { COMPARE_LINKS } from '../classes';
import { CheckboxField, Money, NumberField, Notice, RadioGroup, ResultList, ResultRow } from '../primitives';
import { formatILS } from '@/lib/format';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function BusinessSetupCost({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i), []);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  const status = form.raw.status;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון עלות הקמת עסק"
      state={state}
      ctx={ctx}
      shareSummary={(r) => `עלות שנה ראשונה לפי הסכומים שהוזנו: ${formatILS(r.total_first_year)}`}
      intro={<Notice>אין בנתוני האתר עלויות להקמת עסק. כל סכום כאן הוא סכום שאתם מזינים בעצמכם, והכלי רק מסכם אותו. מחירי השוואה מפורסמים בעמודי ההשוואה.</Notice>}
      form={
        <>
          <RadioGroup
            form={form}
            name="status"
            label="סטטוס העסק"
            options={[
              { value: 'patur', label: 'עוסק פטור' },
              { value: 'murshe', label: 'עוסק מורשה' },
              { value: 'company', label: 'חברה בע״מ' },
            ]}
          />
          {k.SETUP_ITEMS.filter((it) => it.statuses.includes(status as k.BizStatus)).map((it) => (
            <fieldset key={it.id} className="grid gap-3 rounded-lg border border-line p-3">
              <legend className="px-1 font-semibold">{it.label}</legend>
              <CheckboxField form={form} name={`inc_${it.id}`} label="לכלול בסיכום" />
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField form={form} name={`once_${it.id}`} label="עלות חד-פעמית" unit="₪" optional />
                <NumberField form={form} name={`monthly_${it.id}`} label="עלות חודשית" unit="₪" optional />
              </div>
              {it.compare ? (
                <a href={COMPARE_LINKS[it.compare].href} className="text-teal underline">
                  {COMPARE_LINKS[it.compare].label}
                </a>
              ) : null}
            </fieldset>
          ))}
        </>
      }
      renderResult={(r) => (
        <>
          <ResultList>
            <ResultRow label="סה״כ עלויות חד-פעמיות" value={<Money v={r.total_once} />} />
            <ResultRow label="סה״כ עלויות חודשיות" value={<Money v={r.total_monthly} />} />
            <ResultRow strong label="סה״כ שנה ראשונה" value={<Money v={r.total_first_year} />} note="חד-פעמי + חודשי × 12" />
          </ResultList>
          {r.company_note ? <Notice tone="warn">{r.company_note}</Notice> : null}
          {r.missing_labels.length > 0 ? (
            <section aria-labelledby="bsc-missing">
              <h3 id="bsc-missing" className="mb-2 mt-0 text-base">סעיפים שלא הוזן בהם סכום (לא נספרו)</h3>
              <ul className="m-0 ps-5">{r.missing_labels.map((l) => <li key={l}>{l} — לא הוזן</li>)}</ul>
            </section>
          ) : null}
        </>
      )}
    />
  );
}
