// Tool - tax calendar. The data has NO deadline table, so every reporting day is USER-ENTERED ("per the tax authority notice").
// Events are generated from the user's own entries; .ics (RFC 5545) export is built from them. No legal day-numbers are hard-coded.
import type { RatesFile } from '../rates';
import { checkNum, checkOneOf, done, num0, type Validation } from './common';

export type Period = 'monthly' | 'bimonthly';
export type RecurringType = 'vat' | 'advance' | 'ni';
export const RECURRING_TYPES: RecurringType[] = ['vat', 'advance', 'ni'];
export const TYPE_TITLE: Record<RecurringType | 'annual', string> = {
  vat: 'דיווח מע״מ',
  advance: 'תשלום מקדמות מס הכנסה',
  ni: 'תשלום דמי ביטוח לאומי',
  annual: 'הגשת דוח שנתי',
};
export const HORIZON_MONTHS = 12;

export interface Inputs {
  vat_on: boolean;
  vat_day: number;
  vat_period: Period;
  vat_start: string;
  advance_on: boolean;
  advance_day: number;
  advance_period: Period;
  advance_start: string;
  ni_on: boolean;
  ni_day: number;
  ni_period: Period;
  ni_start: string;
  annual_on: boolean;
  annual_date: string;
  reminder_days: number;
}
export const INPUT_DEFAULTS: Inputs = {
  vat_on: true,
  vat_day: NaN,
  vat_period: 'bimonthly',
  vat_start: '',
  advance_on: false,
  advance_day: NaN,
  advance_period: 'monthly',
  advance_start: '',
  ni_on: false,
  ni_day: NaN,
  ni_period: 'monthly',
  ni_start: '',
  annual_on: false,
  annual_date: '',
  reminder_days: 3,
};

const MONTH_RE = /^(\d{4})-(\d{2})$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function validDate(s: string): boolean {
  const m = DATE_RE.exec(s);
  if (!m) return false;
  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

export function validate(i: Inputs): Validation {
  const e: Record<string, string> = {};
  for (const t of RECURRING_TYPES) {
    checkOneOf(e, i, `${t}_period`, ['monthly', 'bimonthly']);
    if (!(i as unknown as Record<string, unknown>)[`${t}_on`]) continue;
    checkNum(e, i, `${t}_day`, { label: 'יום בחודש', required: true, min: 1, max: 31, integer: true });
    const start = (i as unknown as Record<string, string>)[`${t}_start`];
    const m = MONTH_RE.exec(start ?? '');
    if (!m || +m[2] < 1 || +m[2] > 12) e[`${t}_start`] = 'יש לבחור חודש התחלה';
  }
  if (i.annual_on && !validDate(i.annual_date)) e.annual_date = 'יש להזין תאריך תקין';
  checkNum(e, i, 'reminder_days', { label: 'תזכורת', min: 0, max: 60, integer: true });
  return done(e);
}

export interface CalEvent {
  id: string;
  type: RecurringType | 'annual';
  title: string;
  /** YYYY-MM-DD */
  date: string;
}

const p2 = (n: number) => String(n).padStart(2, '0');
function lastDay(y: number, m1: number): number {
  return new Date(Date.UTC(y, m1, 0)).getUTCDate();
}

export function recurringDates(day: number, period: Period, start: string, horizonMonths = HORIZON_MONTHS): string[] {
  const m = MONTH_RE.exec(start);
  if (!m) return [];
  let y = +m[1];
  let mo = +m[2];
  const step = period === 'monthly' ? 1 : 2;
  const out: string[] = [];
  for (let k = 0; k < horizonMonths; k += step) {
    const d = Math.min(Math.max(1, Math.floor(day)), lastDay(y, mo));
    out.push(`${y}-${p2(mo)}-${p2(d)}`);
    mo += step;
    while (mo > 12) {
      mo -= 12;
      y += 1;
    }
  }
  return out;
}

export interface Result {
  events: CalEvent[];
  reminder_days: number;
  assumptions: string[];
  warnings: string[];
}

export function calculate(i: Inputs, _rates?: RatesFile): Result {
  const events: CalEvent[] = [];
  const rec = i as unknown as Record<string, unknown>;
  for (const t of RECURRING_TYPES) {
    if (!rec[`${t}_on`]) continue;
    const dates = recurringDates(num0(rec[`${t}_day`]), rec[`${t}_period`] as Period, String(rec[`${t}_start`] ?? ''));
    dates.forEach((d, idx) => events.push({ id: `${t}-${d}-${idx}`, type: t, title: TYPE_TITLE[t], date: d }));
  }
  if (i.annual_on && validDate(i.annual_date)) events.push({ id: `annual-${i.annual_date}`, type: 'annual', title: TYPE_TITLE.annual, date: i.annual_date });
  events.sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type));
  return {
    events,
    reminder_days: num0(i.reminder_days),
    assumptions: [
      'בנתוני האתר אין טבלת מועדי דיווח, ולכן הלוח אינו כולל מועדים קבועים: כל יום דיווח מוזן על ידי המשתמש לפי הודעת רשות המסים או ביטוח לאומי.',
      'המועדים נגזרים מהימים שהוזנו בלבד (חודשי או דו-חודשי) ל-12 חודשים; יום שאינו קיים בחודש קצר מוחלף ביום האחרון בחודש.',
      'הלוח מציג סדר פעולות ולא סכומים; חישוב הסכומים נעשה במחשבונים הייעודיים. שינויי חקיקה עשויים לשנות מועדים.',
      'קובץ היומן (.ics) נוצר בדפדפן מהנתונים שהוזנו ואינו נשמר או נשלח.',
    ],
    warnings: events.length === 0 ? [] : ['המועדים הם נתוני המשתמש ולא אומתו על ידי האתר; יש לאמת מול הפרסום הרשמי.'],
  };
}

// ---- iCalendar (RFC 5545) ----

export function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold a content line to at most 75 octets per line (continuation lines start with one space). */
export function icsFold(line: string): string[] {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return [line];
  const out: string[] = [];
  let cur = '';
  let curBytes = 0;
  let limit = 75;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (curBytes + b > limit) {
      out.push(out.length === 0 ? cur : ` ${cur}`);
      cur = '';
      curBytes = 0;
      limit = 74;
    }
    cur += ch;
    curBytes += b;
  }
  if (cur) out.push(out.length === 0 ? cur : ` ${cur}`);
  return out;
}

function compactDate(iso: string): string {
  return iso.replace(/-/g, '');
}
function nextDay(iso: string): string {
  const m = DATE_RE.exec(iso)!;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + 1));
  return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
}

/** `nowIso` e.g. "2026-10-16T09:30:00Z" (injected for determinism). */
export function buildIcs(events: CalEvent[], opts: { nowIso: string; reminderDays?: number }): string {
  const stamp = opts.nowIso.replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IL-Tools//Tax Calendar//HE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:לוח מועדי מס'];
  for (const ev of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@il-tools.co.il`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;VALUE=DATE:${compactDate(ev.date)}`);
    lines.push(`DTEND;VALUE=DATE:${compactDate(nextDay(ev.date))}`);
    lines.push(`SUMMARY:${icsEscape(ev.title)}`);
    lines.push(`DESCRIPTION:${icsEscape('מועד שהוזן על ידי המשתמש. יש לאמת מול הודעת רשות המסים או ביטוח לאומי.')}`);
    lines.push('TRANSP:TRANSPARENT');
    const rd = opts.reminderDays ?? 0;
    if (rd > 0) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(ev.title)}`, `TRIGGER:-P${Math.floor(rd)}D`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.flatMap(icsFold).join('\r\n') + '\r\n';
}
