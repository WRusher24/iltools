// Legal texts: single source of truth is data/legal/legal-texts.json (generated from LEGAL_COMPLIANCE.md).
// This module only substitutes runtime placeholders; it never rewrites wording.
import legalTexts from '../../data/legal/legal-texts.json';
import ownerFacts from '../../data/legal/owner-facts.json';
import { formatDateHe } from './format';

export interface LegalText {
  id: string;
  version: string;
  lang: string;
  placement: string;
  markdown: string;
  effective_date: string;
}

const TEXTS = legalTexts as LegalText[];
const BY_ID = new Map(TEXTS.map((t) => [t.id, t]));

/** Blank keys the owner may fill (exact bracket strings). Longest first so "[להשלמה — …]" wins over "[להשלמה]". */
export const OWNER_BLANK_KEYS: string[] = Object.keys(ownerFacts)
  .filter((k) => k.startsWith('['))
  .sort((a, b) => b.length - a.length);

const FACTS = ownerFacts as Record<string, string>;

export function getLegal(id: string): LegalText {
  const t = BY_ID.get(id);
  if (!t) throw new Error(`Legal text "${id}" is missing from data/legal/legal-texts.json (see docs/engineering/BLOCKERS.md)`);
  return t;
}
export function hasLegal(id: string): boolean {
  return BY_ID.has(id);
}
export function allLegal(): LegalText[] {
  return TEXTS;
}

/** Internal routes for {{לינק_…}} placeholders (LEGAL_COMPLIANCE.md §1.7/§10.3). */
export const LEGAL_LINKS: Record<string, string> = {
  'לינק_לעמוד_יצירת_קשר': '/contact',
  'לינק_גילוי_נאות': '/legal/affiliate-disclosure',
  'לינק_הצהרת_אחריות': '/legal/disclaimer',
  'לינק_תנאי_שימוש': '/legal/terms',
  'לינק_מדיניות_פרטיות': '/legal/privacy',
  'לינק_עוגיות': '/legal/cookies',
  'לינק_נגישות': '/legal/accessibility',
  'לינק_שיטת_הדירוג': '/methodology',
  'לינק_מדיניות_מערכת': '/editorial-policy',
};

export interface LegalVars {
  /** ISO date of the page's {{updated:…}} (fills {date} and {{תאריך_עדכון_אחרון}}) */
  updated?: string;
  /** human readable source list for {sources} */
  sources?: string;
}

/** Substitute runtime placeholders + owner facts. Never leaves a raw {date}/{sources}/{{לינק_…}}/{{תאריך_עדכון_אחרון}}. */
export function substitute(markdown: string, vars: LegalVars = {}): string {
  const updatedIso = vars.updated ?? latestEffectiveDate();
  const dateHe = formatDateHe(updatedIso);
  let out = markdown
    .replace(/\{\{תאריך_עדכון_אחרון\}\}/g, dateHe)
    .replace(/\{date\}/g, dateHe)
    .replace(/\{sources\}/g, vars.sources && vars.sources.length ? vars.sources : 'המקורות הרשמיים המפורטים בעמוד');
  out = out.replace(/\{\{(לינק_[^}]+)\}\}/g, (_m, key: string) => LEGAL_LINKS[key] ?? '/contact');
  for (const k of OWNER_BLANK_KEYS) {
    const v = FACTS[k];
    if (v && v.trim()) out = out.split(k).join(v.trim());
  }
  return out;
}

export function latestEffectiveDate(): string {
  return TEXTS.map((t) => t.effective_date).sort().at(-1) ?? '2026-10-16';
}

/** Unfilled owner blanks still present in the texts (for the BLOCKERS report / compliance trace). */
export function unfilledBlanks(): { id: string; blank: string }[] {
  const res: { id: string; blank: string }[] = [];
  for (const t of TEXTS) {
    for (const k of OWNER_BLANK_KEYS) {
      if (t.markdown.includes(k) && !(FACTS[k] && FACTS[k].trim())) res.push({ id: t.id, blank: k });
    }
  }
  return res;
}

/** Cookie-banner text is split around its [button] tokens so the UI can render real buttons. */
export function bannerParts(): { text: string; labels: { acceptAll: string; reject: string; prefs: string }; policyHref: string } {
  const raw = getLegal('LEGAL-COOKIE-BANNER').markdown;
  const text = raw.split('[אישור הכל]')[0].trim();
  return {
    text: text.replace(/\*\*/g, ''),
    labels: { acceptAll: 'אישור הכל', reject: 'דחייה', prefs: 'העדפות' },
    policyHref: '/legal/cookies',
  };
}
