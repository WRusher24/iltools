// Lead form definitions + Zod validation (shared by the client form and the server handler). Hebrew messages.
import { z } from 'zod';

export const LEAD_TYPES = ['accountant', 'pension-information', 'mortgage-information'] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export interface Option { value: string; label: string }
export interface LeadStep { id: string; title: string; fields: LeadField[] }
export interface LeadField {
  name: string; label: string; kind: 'text' | 'email' | 'tel' | 'select' | 'textarea'; required?: boolean; options?: Option[]; hint?: string; autoComplete?: string;
}

const BUSINESS_TYPES: Option[] = [
  { value: 'osek-patur', label: 'עוסק פטור' },
  { value: 'osek-murshe', label: 'עוסק מורשה' },
  { value: 'company', label: 'חברה בע״מ' },
  { value: 'not-started', label: 'טרם התחלתי עסק' },
];

const CONTACT_STEP: LeadStep = {
  id: 'contact',
  title: 'פרטי קשר',
  fields: [
    { name: 'name', label: 'שם', kind: 'text', required: true, autoComplete: 'name' },
    { name: 'phone', label: 'טלפון', kind: 'tel', required: true, autoComplete: 'tel', hint: 'לדוגמה: 0501234567' },
    { name: 'email', label: 'אימייל', kind: 'email', required: false, autoComplete: 'email', hint: 'אופציונלי — לקבלת אישור קבלה' },
  ],
};

export const LEAD_FORMS: Record<LeadType, { title: string; steps: LeadStep[] }> = {
  accountant: {
    title: 'פנייה בנושא רואה חשבון',
    steps: [
      {
        id: 'topic', title: 'במה מדובר',
        fields: [
          { name: 'businessType', label: 'סוג העסק', kind: 'select', required: true, options: BUSINESS_TYPES },
          { name: 'topic', label: 'נושא הפנייה', kind: 'select', required: true, options: [
            { value: 'open-business', label: 'פתיחת עסק' },
            { value: 'bookkeeping', label: 'הנהלת חשבונות שוטפת' },
            { value: 'annual-report', label: 'דוח שנתי' },
            { value: 'other', label: 'אחר' },
          ] },
        ],
      },
      CONTACT_STEP,
    ],
  },
  'pension-information': {
    title: 'פנייה בנושא פנסיה — מידע מבעל/ת מקצוע מורשה/ית',
    steps: [
      {
        id: 'topic', title: 'במה מדובר',
        fields: [
          { name: 'employmentStatus', label: 'מעמד תעסוקתי', kind: 'select', required: true, options: [
            { value: 'employee', label: 'שכיר/ה' },
            { value: 'self-employed', label: 'עצמאי/ת' },
            { value: 'both', label: 'שכיר/ה ועצמאי/ת' },
          ] },
          { name: 'topic', label: 'נושא הפנייה', kind: 'select', required: true, options: [
            { value: 'general', label: 'מידע כללי' },
            { value: 'fees', label: 'הבנת דמי ניהול' },
            { value: 'self-employed', label: 'פנסיה לעצמאים' },
          ] },
        ],
      },
      CONTACT_STEP,
    ],
  },
  'mortgage-information': {
    title: 'פנייה בנושא משכנתא — מידע מבעל/ת מקצוע מורשה/ית',
    steps: [
      {
        id: 'topic', title: 'במה מדובר',
        fields: [
          { name: 'purpose', label: 'מטרה', kind: 'select', required: true, options: [
            { value: 'first-home', label: 'דירה ראשונה' },
            { value: 'refinance', label: 'מחזור משכנתא' },
            { value: 'investment', label: 'נכס להשקעה' },
            { value: 'other', label: 'אחר' },
          ] },
        ],
      },
      CONTACT_STEP,
    ],
  },
};

/** Fields whose values are encrypted at rest (personal data). Everything else is a coarse category selection. */
export const SENSITIVE_FIELDS = ['name', 'phone', 'email', 'message'] as const;

const phoneRe = /^(?:\+?972|0)(?:[23489]|5\d|7\d)\d{7}$/;
const base = {
  name: z.string().trim().min(2, 'יש להזין שם (לפחות 2 תווים)').max(80, 'השם ארוך מדי'),
  phone: z.string().trim().transform((v) => v.replace(/[\s-]/g, '')).refine((v) => phoneRe.test(v), 'מספר טלפון לא תקין'),
  email: z.union([z.literal(''), z.string().trim().email('כתובת אימייל לא תקינה').max(120)]).optional(),
  consent: z.literal(true, { error: 'יש לסמן את תיבת ההסכמה כדי להמשיך' }),
  consentVersion: z.string().min(1),
  website: z.string().max(0).optional(), // honeypot
  turnstile: z.string().optional(),
};

const opts = (o: Option[]) => z.enum(o.map((x) => x.value) as [string, ...string[]], { error: 'יש לבחור ערך מהרשימה' });
const fieldOptions = (type: LeadType, name: string) => LEAD_FORMS[type].steps.flatMap((s) => s.fields).find((f) => f.name === name)!.options!;

export const leadSchemas = {
  accountant: z.object({ type: z.literal('accountant'), ...base, businessType: opts(fieldOptions('accountant', 'businessType')), topic: opts(fieldOptions('accountant', 'topic')) }),
  'pension-information': z.object({ type: z.literal('pension-information'), ...base, employmentStatus: opts(fieldOptions('pension-information', 'employmentStatus')), topic: opts(fieldOptions('pension-information', 'topic')) }),
  'mortgage-information': z.object({ type: z.literal('mortgage-information'), ...base, purpose: opts(fieldOptions('mortgage-information', 'purpose')) }),
} as const;

export const leadSchema = z.discriminatedUnion('type', [leadSchemas.accountant, leadSchemas['pension-information'], leadSchemas['mortgage-information']]);
export type LeadInput = z.infer<typeof leadSchema>;
