import Link from 'next/link';
import { NAV, FOOTER_LEGAL, FOOTER_SITE } from '@/config/nav';
import { SiteNav } from './SiteNav';
import { SearchBox } from './SearchBox';
import { LegalBlock, legalNode } from '@/components/content/Legal';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { ConsentPrefsButton } from '@/components/consent/ConsentManager';
import { t } from '@/lib/ui';

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[var(--content-max)] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
        <Link href="/" className="me-2 inline-flex items-center gap-2 text-2xl font-extrabold text-brand no-underline">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 64 64" className="h-9 w-9"><use href="/icon.svg#logo" /></svg>
          <bdi>IL-Tools</bdi>
        </Link>
        <SiteNav nav={NAV} labels={{ open: t('nav.openMenu'), close: t('nav.closeMenu'), menu: t('nav.menu') }} />
        <div className="ms-auto flex items-center gap-2 no-print">
          <SearchBox label={t('nav.search')} placeholder={t('nav.search')} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer role="contentinfo" className="mt-16 bg-brand text-brand-ink">
      <div className="mx-auto grid max-w-[var(--content-max)] gap-8 px-4 py-10 md:grid-cols-3">
        <div className="[&_a]:text-brand-ink">
          <h2 className="mb-2 text-lg text-brand-ink">IL-Tools</h2>
          <ul className="m-0 grid list-none gap-1 p-0">
            {FOOTER_SITE.map((l) => (<li key={l.href}><Link className="underline" href={l.href}>{l.label}</Link></li>))}
          </ul>
        </div>
        <nav aria-label="מידע משפטי ומדיניות" className="[&_a]:text-brand-ink">
          <h2 className="mb-2 text-lg text-brand-ink">מידע משפטי</h2>
          <ul className="m-0 grid list-none gap-1 p-0">
            {FOOTER_LEGAL.map((l) => (<li key={l.href}><Link className="underline" href={l.href}>{l.label}</Link></li>))}
            <li><ConsentPrefsButton className="underline text-start">העדפות עוגיות</ConsentPrefsButton></li>
          </ul>
        </nav>
        <div className="[&_.input]:text-ink [&_a]:text-brand-ink">
          <NewsletterForm
            termsNode={legalNode('LEGAL-NEWSLETTER-TERMS')}
            labels={{ title: 'הניוזלטר של IL-Tools', email: t('form.email.label'), submit: 'הרשמה לניוזלטר', consent: 'אני מאשר/ת קבלת דיוור, לרבות פרסומי, בהתאם לתנאי ההרשמה', ok: 'שלחנו אליך הודעת אימות. ההרשמה תושלם רק לאחר אישור הכתובת.', sending: t('loading.submit'), errorGeneric: t('error.form') }}
          />
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="mx-auto max-w-[var(--content-max)] px-4 py-4 text-sm [&_a]:underline [&_p]:m-0">
          <LegalBlock id="DISC-GENERAL" className="!border-white/30 !bg-transparent !text-brand-ink [&_*]:!text-brand-ink" testId="footer-disclaimer" />
          <p className="mt-2 text-xs opacity-90">© {new Date().getFullYear()} IL-Tools</p>
        </div>
      </div>
    </footer>
  );
}
