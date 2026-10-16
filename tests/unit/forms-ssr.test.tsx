import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { LeadForm } from '@/components/forms/LeadForm';
import { LEAD_TYPES } from '@/lib/lead-schema';

const strings = { next: 'הבא', back: 'חזרה', submit: 'שליחה', sending: 'שולח…', consent: 'אני מאשר/ת', consentHint: 'לא מסומנת', required: 'חובה', optional: 'אופציונלי', ok: 'נשלח', errorGeneric: 'שגיאה', stepOf: 'שלב {n} מתוך {total}', consentError: 'חובה לאשר', requiredError: 'שדה חובה', waitlist: 'בקרוב' };

describe('LeadForm (server render)', () => {
  for (const type of LEAD_TYPES) {
    it(`${type}: step 1 renders labelled fields, honeypot, no pre-ticked consent`, () => {
      const html = renderToStaticMarkup(createElement(LeadForm, { type, consentVersion: '1.0', leadTermsNode: 'תנאים', discLeadNode: 'גילוי', strings }));
      expect(html).toContain('<label');
      expect(html).toContain('name="website"'); // honeypot
      expect(html).not.toMatch(/type="checkbox"[^>]*checked/);
      expect(html).toContain('שלב 1 מתוך 2');
    });
  }
});
