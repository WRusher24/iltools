import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { heeboHe, heeboLatin, assistantHe, assistantLatin } from '@/lib/fonts';
import { SiteHeader, SiteFooter } from '@/components/layout/SiteChrome';
import { ConsentProvider, ConsentBanner } from '@/components/consent/ConsentManager';
import { JsonLd } from '@/components/content/JsonLd';
import { organizationLd, websiteLd } from '@/lib/seo';
import { bannerParts } from '@/lib/legal';
import { siteUrl, isProductionSite } from '@/lib/site';
import { t } from '@/lib/ui';
import { validateEnv } from '@/server/env';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: 'IL-Tools',
  title: { default: 'IL-Tools — השוואות ומחשבונים לעצמאים ולעסקים', template: '%s' },
  robots: { index: isProductionSite(), follow: true },
  icons: { icon: '/icon.svg' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b2545' };

export default function RootLayout({ children }: { children: ReactNode }) {
  validateEnv();
  const banner = bannerParts();
  const fontVars = [heeboHe, heeboLatin, assistantHe, assistantLatin].map((f) => f.variable).join(' ');
  return (
    <html lang="he" dir="rtl" className={fontVars}>
      <body className="min-h-screen bg-surface text-ink antialiased">
        <ConsentProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-cta focus:px-4 focus:py-2 focus:text-cta-ink">
            {t('nav.skipToContent')}
          </a>
          <SiteHeader />
          <main id="main" tabIndex={-1}>{children}</main>
          <SiteFooter />
          <ConsentBanner
            text={banner.text}
            labels={banner.labels}
            policyHref={banner.policyHref}
            ui={{
              save: t('consent.banner.save'), necessary: t('consent.category.necessary'), necessaryDesc: t('consent.category.necessary.desc'),
              analytics: t('consent.category.analytics'), analyticsDesc: t('consent.category.analytics.desc'),
              advertising: t('consent.category.advertising'), advertisingDesc: t('consent.category.advertising.desc'),
              affiliate: 'שותפים', affiliateDesc: 'ייחוס המרות של קישורי שותפים.', title: 'הסכמה לעוגיות', close: t('common.close'), policy: 'מדיניות העוגיות',
            }}
          />
        </ConsentProvider>
        <JsonLd data={[organizationLd(), websiteLd()]} />
      </body>
    </html>
  );
}
