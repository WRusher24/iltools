'use client';
import { useCallback } from 'react';
import { taxCalendar as k } from '@/lib/calc';
import { formatDateHe } from '@/lib/format';
import { CalcShell } from '../CalcShell';
import { CheckboxField, FormGrid, NumberField, Notice, ResultTable, SelectField, Section, TextField } from '../primitives';
import type { CalcProps } from '../types';
import { useCalc } from '../useCalc';

const PERIODS = [
  { value: 'monthly', label: 'חודשי' },
  { value: 'bimonthly', label: 'דו-חודשי' },
];

export default function TaxCalendar({ slug, ctx }: CalcProps) {
  const calculate = useCallback((i: k.Inputs) => k.calculate(i), []);
  const state = useCalc({ initial: ctx.initialValues, defaults: k.INPUT_DEFAULTS, validate: k.validate, calculate });
  const { form } = state;

  const download = (events: k.CalEvent[], reminder: number) => {
    const ics = k.buildIcs(events, { nowIso: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), reminderDays: reminder });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tax-calendar.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const recurring = (t: k.RecurringType, title: string) => (
    <Section title={title}>
      <CheckboxField form={form} name={`${t}_on`} label="להוסיף ללוח" />
      {form.raw[`${t}_on`] === true ? (
        <FormGrid>
          <NumberField form={form} name={`${t}_day`} label="יום הדיווח לפי הודעת רשות המסים / ביטוח לאומי" hint="יום בחודש (1–31). האתר אינו מכיל מועדים קבועים; יש להזין לפי ההודעה הרשמית שלכם." />
          <SelectField form={form} name={`${t}_period`} label="תדירות" options={PERIODS} />
          <TextField form={form} name={`${t}_start`} label="חודש המועד הראשון" type="month" />
        </FormGrid>
      ) : null}
    </Section>
  );

  return (
    <CalcShell
      slug={slug}
      title="לוח מועדי מס"
      state={state}
      ctx={ctx}
      intro={<Notice>מועדי הדיווח אינם בנתוני האתר. הלוח נבנה אך ורק מהמועדים שאתם מזינים, ואפשר לייצא אותו ליומן (קובץ iCalendar). יש לאמת כל מועד מול הפרסום הרשמי.</Notice>}
      form={
        <>
          {recurring('vat', 'דיווח מע״מ')}
          {recurring('advance', 'מקדמות מס הכנסה')}
          {recurring('ni', 'ביטוח לאומי')}
          <Section title="דוח שנתי">
            <CheckboxField form={form} name="annual_on" label="להוסיף ללוח" />
            {form.raw.annual_on === true ? <TextField form={form} name="annual_date" label="תאריך הגשה לפי הודעה רשמית" type="date" /> : null}
          </Section>
          <NumberField form={form} name="reminder_days" label="תזכורת ביומן (ימים לפני)" optional hint="0 ללא תזכורת." />
        </>
      }
      renderResult={(r) => (
        <>
          {r.events.length === 0 ? (
            <p className="m-0 text-muted">לא נבחרו מועדים. הוסיפו סוג דיווח והזינו יום ותחילת תקופה.</p>
          ) : (
            <>
              <ResultTable caption="המועדים שהוזנו" columns={[{ header: 'תאריך' }, { header: 'מטלה' }]} rows={r.events.map((e) => [<bdi key="d">{formatDateHe(e.date)}</bdi>, e.title])} />
              <div className="no-print">
                <button type="button" className="btn btn-primary" onClick={() => download(r.events, r.reminder_days)}>
                  ייצוא ליומן (.ics)
                </button>
              </div>
            </>
          )}
        </>
      )}
    />
  );
}
