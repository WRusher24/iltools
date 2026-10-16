import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { contentOfType, getContent } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';
import { ContentPage } from '@/components/content/ContentPage';

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return contentOfType('guide').map((c) => ({ cluster: c.cluster!, slug: c.fm.slug }));
}

type P = { params: Promise<{ cluster: string; slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { cluster, slug } = await params;
  return buildMetadata({ path: `/guides/${cluster}/${slug}` });
}

export default async function Page({ params }: P) {
  const { cluster, slug } = await params;
  const item = getContent(`/guides/${cluster}/${slug}`);
  if (!item) notFound();
  return <ContentPage item={item} />;
}
