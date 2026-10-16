import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { allContent, GUIDE_CLUSTERS } from '@/lib/content';
import { toItem, byTitle } from '@/lib/hubs';
import { buildMetadata } from '@/lib/seo';
import { FOOTER_LEGAL } from '@/config/nav';

export const metadata: Metadata = buildMetadata({ path: '/sitemap-html', title: 'מפת אתר', description: 'מפת האתר: כל ההשוואות, המחשבונים, המדריכים, המאמרים והעמודים המשפטיים של IL-Tools.' });

const SECTIONS: { title: string; prefix: string }[] = [
  { title: 'קטגוריות', prefix: '/category/' }, { title: 'השוואות', prefix: '/compare/' }, { title: 'הכי מתאים ל…', prefix: '/best/' },
  { title: 'ביקורות ספקים', prefix: '/reviews/' }, { title: 'מחשבונים', prefix: '/calculators/' }, { title: 'כלים', prefix: '/tools/' },
  { title: 'מדריכים', prefix: '/guides/' }, { title: 'מאמרים', prefix: '/articles/' },
];

export default function Page() {
  void GUIDE_CLUSTERS;
  const pages = allContent().filter((c) => c.fm.type === 'page' && c.path !== '/').map(toItem).sort(byTitle);
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 pt-6">
      <Breadcrumbs items={[{ name: 'דף הבית', href: '/' }, { name: 'מפת אתר' }]} />
      <h1 className="text-3xl font-extrabold">מפת אתר</h1>
      {SECTIONS.map((s) => {
        const items = allContent().filter((c) => c.path.startsWith(s.prefix)).map(toItem).sort(byTitle);
        return (
          <section key={s.prefix} className="mt-6" aria-label={s.title}>
            <h2 className="text-xl">{s.title}</h2>
            <ul className="m-0 columns-1 gap-6 ps-5 sm:columns-2">{items.map((i) => (<li key={i.path}><Link className="text-teal underline" href={i.path}>{i.title}</Link></li>))}</ul>
          </section>
        );
      })}
      <section className="mt-6" aria-label="עמודים"><h2 className="text-xl">עמודים</h2>
        <ul className="m-0 ps-5">{pages.map((i) => (<li key={i.path}><Link className="text-teal underline" href={i.path}>{i.title}</Link></li>))}{FOOTER_LEGAL.map((l) => (<li key={l.href}><Link className="text-teal underline" href={l.href}>{l.label}</Link></li>))}</ul>
      </section>
    </div>
  );
}
