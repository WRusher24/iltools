'use client';
import { useCallback } from 'react';
import { businessStructureQuiz as k } from '@/lib/calc';
import { CalcShell } from '../CalcShell';
import { FormGrid, Money, NaText, NumberField, Notice, RadioGroup, ResultList, ResultRow, SelectField } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

export default function BusinessStructureQuiz({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i, ctx.rates), [ctx.rates]);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;
  const monthly = form.raw.turnover_mode === 'monthly';
  return (
    <CalcShell
      slug={slug}
      title="בוחן מבנה עסקי"
      state={state}
      ctx={ctx}
      intro={<Notice>מידע כללי בלבד. הבוחן מסכם מאפיינים לפי התשובות ואינו ייעוץ משפטי או מיסויי.</Notice>}
      form={
        <>
          <RadioGroup form={form} name="turnover_mode" label="סוג הזנת מחזור" options={[{ value: 'monthly', label: 'חודשי' }, { value: 'annual', label: 'שנתי' }]} />
          <FormGrid>
            <NumberField form={form} name="turnover" label={monthly ? 'מחזור חודשי צפוי (לפני מע״מ)' : 'מחזור שנתי צפוי (לפני מע״מ)'} unit="₪" />
            <NumberField form={form} name="expenses_monthly" label="הוצאות עסקיות חודשיות" unit="₪" optional />
            <NumberField form={form} name="partners" label="מספר שותפים/בעלים" />
            <NumberField form={form} name="credit_points" label="נקודות זיכוי" hint="נקודות בסיס: 2.25 לגבר, 2.75 לאישה." />
            <SelectField form={form} name="customers" label="סוג לקוחות" options={[{ value: 'private', label: 'לקוחות פרטיים' }, { value: 'business', label: 'לקוחות עסקיים' }, { value: 'mixed', label: 'מעורב' }]} />
            <SelectField form={form} name="risk" label="רמת חשיפה לסיכון משפטי" options={[{ value: 'low', label: 'נמוכה' }, { value: 'medium', label: 'בינונית' }, { value: 'high', label: 'גבוהה' }]} />
          </FormGrid>
        </>
      }
      renderResult={(r) => (
        <div className="grid gap-4">
          <ResultList>
            <ResultRow label="מחזור שנתי" value={<Money v={r.turnover_annual} />} />
          </ResultList>
          {r.structures.map((s) => (
            <section key={s.id} aria-labelledby={`q-${s.id}`} className="grid gap-2 rounded-lg border border-line p-3">
              <h3 id={`q-${s.id}`} className="m-0 text-lg">{s.name}</h3>
              <p className="m-0 font-semibold">{s.status_text}</p>
              <ul className="m-0 grid gap-1 ps-5">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
              {s.simulation ? (
                <ResultList>
                  <ResultRow label="רווח חייב (חודשי)" value={<Money v={s.simulation.profit_monthly} />} />
                  <ResultRow label="מס הכנסה (חודשי)" value={<Money v={s.simulation.income_tax_monthly} />} />
                  <ResultRow label="ביטוח לאומי ומס בריאות (משולב, חודשי)" value={<Money v={s.simulation.ni_combined_monthly} />} />
                  <ResultRow strong label="נטו משוער (חודשי)" value={<Money v={s.simulation.net_monthly} />} />
                </ResultList>
              ) : s.simulation_text ? (
                <p className="m-0"><NaText /> — {s.simulation_text.replace(/^לא זמין — /, '')}</p>
              ) : null}
            </section>
          ))}
        </div>
      )}
    />
  );
}
