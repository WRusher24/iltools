'use client';
import { useCallback } from 'react';
import { clearingFees as k } from '@/lib/calc';
import { formatILS } from '@/lib/format';
import { CalcShell } from '../CalcShell';
import { FormGrid, Money, NaText, NumberField, Notice, Num, ResultList, ResultRow, ResultTable } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function ClearingFees({ slug, ctx }: CalcProps) {
  const clearing = ctx.providers?.clearing;
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates, { clearing }), [ctx.rates, clearing]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון עמלות סליקה"
      state={state}
      ctx={ctx}
      shareSummary={(r) => (r.rows[0] ? `עלות סליקה חודשית לפי תעריפים שפורסמו: מ-${formatILS(r.rows[0].total_monthly)}` : 'השוואת עמלות סליקה')}
      form={
        <FormGrid>
          <NumberField form={form} name="monthly_turnover" label="מחזור חודשי בכרטיסי אשראי" unit="₪" />
          <NumberField form={form} name="avg_basket" label="סל ממוצע לעסקה" unit="₪" />
        </FormGrid>
      }
      renderResult={(r) => (
        <>
          {!r.available ? <Notice tone="warn">נתוני הספקים אינם זמינים כרגע. <NaText /></Notice> : null}
          <ResultList>
            <ResultRow label="מספר עסקאות משוער בחודש" value={<Num v={r.transactions} />} />
          </ResultList>
          {r.rows.length > 0 ? (
            <ResultTable
              caption="עלות חודשית לפי תעריפים שפורסמו (לפני מע״מ), מהזולה ליקרה"
              columns={[{ header: 'ספק' }, { header: 'עמלה' }, { header: 'דמי מנוי' }, { header: 'סה״כ חודשי' }, { header: 'סה״כ שנתי' }, { header: 'כולל מע״מ (חודשי)' }, { header: 'הערות' }]}
              rows={r.rows.map((x) => [
                x.plan_name ? `${x.provider_name} — ${x.plan_name}` : x.provider_name,
                <bdi key="c">{x.percent}%{x.fixed_per_transaction ? ` + ${formatILS(x.fixed_per_transaction, true)}` : ''}</bdi>,
                <Money key="m" v={x.plan_fee_monthly} />,
                <Money key="t" v={x.total_monthly} />,
                <Money key="a" v={x.total_annual} />,
                x.total_monthly_incl_vat === null ? <NaText key="n" /> : <Money key="v" v={x.total_monthly_incl_vat} />,
                x.notes.join('; '),
              ])}
            />
          ) : (
            <p className="m-0 text-muted">אין ספק עם תעריף שפורסם שמתאים לנתונים שהוזנו.</p>
          )}
          {r.quote_only.length > 0 ? (
            <section aria-labelledby="clr-quote">
              <h3 id="clr-quote" className="mb-2 mt-0 text-base">הצעת מחיר בלבד — לא נכלל בחישוב</h3>
              <ul className="m-0 ps-5">
                {r.quote_only.map((q) => (
                  <li key={q.provider_id}>{q.provider_name}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {r.excluded.length > 0 ? (
            <section aria-labelledby="clr-excl">
              <h3 id="clr-excl" className="mb-2 mt-0 text-base">לא נכלל בחישוב</h3>
              <ul className="m-0 ps-5">
                {r.excluded.map((q, i) => (
                  <li key={i}>
                    {q.provider_name}
                    {q.plan_name ? ` — ${q.plan_name}` : ''}: {q.reason}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    />
  );
}
