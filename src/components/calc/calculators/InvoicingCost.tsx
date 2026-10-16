'use client';
import { useCallback } from 'react';
import { invoicingCost as k } from '@/lib/calc';
import { formatILS } from '@/lib/format';
import { CalcShell } from '../CalcShell';
import { CheckboxField, FormGrid, Money, NaText, NumberField, Notice, ResultList, ResultRow, ResultTable } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function InvoicingCost({ slug, ctx }: CalcProps) {
  const invoicing = ctx.providers?.invoicing;
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates, { invoicing }), [ctx.rates, invoicing]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  return (
    <CalcShell
      slug={slug}
      title="מחשבון עלות תוכנת חשבוניות"
      state={state}
      ctx={ctx}
      shareSummary={(r) => (r.cheapest ? `עלות שנתית מ-${formatILS(r.cheapest.total_annual)} לפי מחירים שפורסמו` : 'השוואת עלות תוכנות חשבוניות')}
      form={
        <>
          <FormGrid>
            <NumberField form={form} name="docs_per_month" label="מסמכים בחודש" />
            <NumberField form={form} name="users" label="מספר משתמשים" />
          </FormGrid>
          <CheckboxField form={form} name="need_api" label="נדרש API" />
          <CheckboxField form={form} name="need_allocation" label="נדרשת תמיכה במספר הקצאה" />
        </>
      }
      renderResult={(r) => (
        <>
          {!r.available ? <Notice tone="warn">נתוני הספקים אינם זמינים כרגע. <NaText /></Notice> : null}
          {r.cheapest ? (
            <ResultList>
              <ResultRow strong label="העלות השנתית הנמוכה ביותר מבין המסלולים המתאימים" value={<Money v={r.cheapest.total_annual} />} note={`${r.cheapest.provider_name} — ${r.cheapest.plan_name}. הסדר לפי עלות והתאמת יכולות בלבד, לא המלצה.`} />
            </ResultList>
          ) : (
            <p className="m-0 text-muted">אין מסלול מפורסם שמתאים לנתונים שהוזנו.</p>
          )}
          {r.rows.length > 0 ? (
            <ResultTable
              caption="מסלולים מתאימים לפי עלות שנתית"
              columns={[{ header: 'ספק ומסלול' }, { header: 'מחיר חודשי שפורסם' }, { header: 'מחיר שנתי' }, { header: 'מסמכים חריגים (חודשי)' }, { header: 'סה״כ שנתי' }, { header: 'כולל מע״מ' }, { header: 'הערות' }]}
              rows={r.rows.map((x) => [
                `${x.provider_name} — ${x.plan_name}`,
                x.price_monthly === null ? <NaText key="a" /> : <Money key="a" v={x.price_monthly} />,
                <Money key="b" v={x.annual_base} />,
                x.extra_documents > 0 ? <bdi key="c">{x.extra_documents} · {formatILS(x.extra_documents_cost_monthly, true)}</bdi> : '—',
                <Money key="d" v={x.total_annual} />,
                x.total_annual_incl_vat === null ? <NaText key="e" /> : <Money key="e" v={x.total_annual_incl_vat} />,
                [x.vat_note, ...x.notes].join('; '),
              ])}
            />
          ) : null}
          {r.quote_only.length > 0 ? (
            <section aria-labelledby="inv-quote">
              <h3 id="inv-quote" className="mb-2 mt-0 text-base">הצעת מחיר בלבד — לא נכלל בחישוב</h3>
              <ul className="m-0 ps-5">{r.quote_only.map((q) => <li key={q.provider_id}>{q.provider_name}</li>)}</ul>
            </section>
          ) : null}
          {r.rejected.length > 0 ? (
            <section aria-labelledby="inv-rej">
              <h3 id="inv-rej" className="mb-2 mt-0 text-base">לא נכלל בחישוב</h3>
              <ul className="m-0 ps-5">
                {r.rejected.map((q, i) => (
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
