import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListingPage } from '@/components/content/ListingPage';
import { itemsOf, GUIDE_CLUSTERS } from '@/lib/hubs';
import { buildMetadata } from '@/lib/seo';

export const dynamicParams = false;
export const revalidate = 86400;
export const generateStaticParams = () => Object.keys(GUIDE_CLUSTERS).map((cluster) => ({ cluster }));
type P = { params: Promise<{ cluster: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { cluster } = await params;
  const label = GUIDE_CLUSTERS[cluster] ?? '';
  return buildMetadata({ path: `/guides/${cluster}`, title: `מדריכים: ${label}`, description: `מדריכים מעשיים בנושא ${label} לעצמאים ולעסקים קטנים, עם מקורות ותאריך עדכון.` });
}

export default async function Page({ params }: P) {
  const { cluster } = await params;
  const label = GUIDE_CLUSTERS[cluster];
  if (!label) notFound();
  const items = itemsOf(`/guides/${cluster}/`);
  return (
    <ListingPage
      path={`/guides/${cluster}`}
      metaTitle={`מדריכים: ${label}`}
      metaDescription={`מדריכים מעשיים בנושא ${label} לעצמאים ולעסקים קטנים.`}
      h1={`מדריכים: ${label}`}
      intro={`מדריכים מעשיים בנושא ${label}, בעברית פשוטה ועם מקורות ותאריך עדכון.`}
      crumbs={[{ name: 'דף הבית', href: '/' }, { name: 'מדריכים', href: '/guides' }, { name: label }]}
      items={items}
    />
  );
}
