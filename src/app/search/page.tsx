import type { Metadata } from 'next';
import { SearchPageClient } from '@/components/layout/SearchPageClient';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { t } from '@/lib/ui';

export const metadata: Metadata = buildMetadata({ path: '/search', title: 'חיפוש באתר', description: 'חיפוש במדריכים, בהשוואות, במחשבונים ובספקים של IL-Tools.', robots: 'noindex, follow' });

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 pt-6">
      <Breadcrumbs items={[{ name: 'דף הבית', href: '/' }, { name: 'חיפוש' }]} />
      <h1 className="text-3xl font-extrabold">חיפוש באתר</h1>
      <SearchPageClient labels={{ search: t('nav.search'), empty: t('empty.results'), hint: t('empty.search'), loading: t('loading.default'), results: 'תוצאות' }} />
    </div>
  );
}
