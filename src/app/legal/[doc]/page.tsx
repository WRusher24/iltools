import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/content/JsonLd';
import { legalNode } from '@/components/content/Legal';
import { getLegal, allLegal, unfilledBlanks, latestEffectiveDate } from '@/lib/legal';
import { breadcrumbLd, webPageLd, buildMetadata } from '@/lib/seo';
import { formatDateHe } from '@/lib/format';

/** /legal/* routes are built from each text's `placement` field in legal-texts.json (page:/legal/<doc>); several texts may share a route. */
interface Doc { slug: string; title: string; description: string; ids: string[] }
const DOCS: Doc[] = [
  { slug: 'disclaimer', title: 'הצהרת אחריות', description: 'הצהרת אחריות ואי-תחליפיות: IL-Tools הוא אתר מידע והשוואה ואינו נותן ייעוץ פיננסי, פנסיוני, מיסויי או משפטי.', ids: ['DISC-FULL'] },
  { slug: 'terms', title: 'תנאי שימוש', description: 'תנאי השימוש באתר IL-Tools, לרבות אי-תחליפיות, קניין רוחני, הגבלת אחריות ודין חל.', ids: ['LEGAL-TERMS'] },
  { slug: 'privacy', title: 'מדיניות פרטיות', description: 'מדיניות הפרטיות של IL-Tools: איזה מידע נאסף, למה, למי הוא מועבר, כמה זמן נשמר ומהן זכויותיך.', ids: ['LEGAL-PRIVACY'] },
  { slug: 'affiliate-disclosure', title: 'גילוי נאות (אפיליאייט)', description: 'איך IL-Tools מתפרנס: קישורי שותפים, פרסום ותוכן ממומן, ומה אנחנו שומרים עליו.', ids: ['DISC-AFFILIATE-FULL'] },
  { slug: 'cookies', title: 'מדיניות עוגיות', description: 'מדיניות עוגיות והסכמה: קטגוריות, ברירות מחדל, טבלת עוגיות ופרסום של Google.', ids: ['LEGAL-COOKIES', 'DISC-ADSENSE'] },
  { slug: 'accessibility', title: 'הצהרת נגישות', description: 'הצהרת הנגישות של IL-Tools: רמת נגישות, אמצעים, מגבלות ידועות ופנייה לרכז/ת הנגישות.', ids: ['LEGAL-ACCESSIBILITY'] },
];

/** Verify every route placement is covered (page:/legal/<slug> in legal-texts.json). */
function placementCovered(): boolean {
  const placed = allLegal().filter((t) => t.placement.startsWith('page:/legal/')).map((t) => t.placement.replace('page:/legal/', ''));
  return placed.every((p) => DOCS.some((d) => d.slug === p));
}

export const dynamicParams = false;
export const generateStaticParams = () => DOCS.map((d) => ({ doc: d.slug }));
type P = { params: Promise<{ doc: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { doc } = await params;
  const d = DOCS.find((x) => x.slug === doc);
  return d ? buildMetadata({ path: `/legal/${doc}`, title: d.title, description: d.description }) : {};
}

export default async function Page({ params }: P) {
  const { doc } = await params;
  const d = DOCS.find((x) => x.slug === doc);
  if (!d || !placementCovered()) notFound();
  const blanks = unfilledBlanks().filter((b) => d.ids.includes(b.id));
  const crumbs = [{ name: 'דף הבית', href: '/' }, { name: 'מידע משפטי' }, { name: d.title }];
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 pt-6">
      <Breadcrumbs items={crumbs} />
      {blanks.length > 0 && (
        <p role="note" className="mb-4 rounded-lg border border-[#e2b24a] bg-warn-soft px-4 py-3 text-sm" data-testid="legal-draft-banner">
          טיוטה: העמוד כולל שדות שטרם הושלמו (מסומנים בצהוב) והוא נמצא בבדיקת עורך דין.
        </p>
      )}
      <div className="prose-il" data-testid={`legal-page-${doc}`}>
        {d.ids.map((id) => (
          <section key={id} data-legal-id={id} data-legal-version={getLegal(id).version}>
            {legalNode(id, { updated: latestEffectiveDate() })}
          </section>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">נוסח בתוקף מ-{formatDateHe(latestEffectiveDate())}</p>
      <JsonLd data={[breadcrumbLd(crumbs), webPageLd({ path: `/legal/${doc}`, title: d.title, description: d.description })]} />
    </div>
  );
}
