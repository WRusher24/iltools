import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';
import { ContentPage } from '@/components/content/ContentPage';
import { LeadForm } from '@/components/forms/LeadForm';
import { LEAD_TYPES, type LeadType } from '@/lib/lead-schema';
import { getLegal } from '@/lib/legal';
import { legalNode, LegalBlock } from '@/components/content/Legal';
import { leadAvailable } from '@/lib/lead-availability';
import { t } from '@/lib/ui';
import { splitSections } from '@/lib/markdown';

export const dynamicParams = false;
export const revalidate = 300;
export const generateStaticParams = () => LEAD_TYPES.map((type) => ({ type }));
type P = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { type } = await params;
  return buildMetadata({ path: `/lead/${type}` });
}

export default async function Page({ params }: P) {
  const { type } = await params;
  if (!(LEAD_TYPES as readonly string[]).includes(type)) notFound();
  const base = getContent(`/lead/${type}`);
  if (!base) notFound();
  // The MDX "הטופס" section is a text mock-up (hard-coded consent text, finding L-004). It is replaced by the real, accessible form whose
  // consent text/version come from legal-texts.json; the page's updated stamp is re-attached.
  const body = `${splitSections(base.body).filter((s) => s.heading !== 'הטופס').map((s) => s.md).join('')}\n{{updated:${base.fm.updated}}}\n`;
  const item = { ...base, body };
  const available = await leadAvailable(type as LeadType);
  const consentVersion = getLegal('LEGAL-LEAD-TERMS').version;
  const after = available ? (
    <section aria-label="טופס פנייה" className="my-8">
      <LeadForm
        type={type as LeadType}
        consentVersion={consentVersion}
        leadTermsNode={legalNode('LEGAL-LEAD-TERMS')}
        discLeadNode={<LegalBlock id="DISC-LEAD" />}
        strings={{
          next: t('common.next'), back: t('common.back'), submit: t('form.submit'), sending: t('loading.submit'), consent: t('form.consent.label'), consentHint: t('form.consent.hint'),
          required: t('form.requiredMark'), optional: t('form.optional'), ok: t('success.form'), errorGeneric: t('error.form'), stepOf: 'שלב {n} מתוך {total}',
          consentError: t('validation.consent'), requiredError: t('validation.required'), waitlist: 'בקרוב',
        }}
      />
    </section>
  ) : (
    <section aria-label="בקרוב" className="card my-8 border-2 border-teal" data-testid="lead-waitlist">
      <h2 className="m-0 text-xl">בקרוב</h2>
      <p>כרגע אין שותף מורשה מאומת שמקבל פניות מסוג זה, ולכן טופס הפנייה אינו פעיל ולא יועברו פרטים. אפשר להירשם לניוזלטר בתחתית העמוד כדי לקבל עדכון כשהשירות יתחיל.</p>
    </section>
  );
  return <ContentPage item={item} after={after} />;
}
