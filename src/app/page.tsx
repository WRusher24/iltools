import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';
import { ContentPage } from '@/components/content/ContentPage';

export const revalidate = 86400;
export const generateMetadata = (): Metadata => buildMetadata({ path: '/' });

export default function Home() {
  const item = getContent('/');
  if (!item) notFound();
  return <ContentPage item={item} />;
}
