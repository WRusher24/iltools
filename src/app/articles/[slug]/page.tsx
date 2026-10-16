import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { contentOfType, getContent } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';
import { ContentPage } from '@/components/content/ContentPage';

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return contentOfType('article').filter((c) => c.path.startsWith('/articles/')).map((c) => ({ slug: c.fm.slug }));
}

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  return buildMetadata({ path: `/articles/${slug}` });
}

export default async function Page({ params }: P) {
  const { slug } = await params;
  const item = getContent(`/articles/${slug}`);
  if (!item) notFound();
  return <ContentPage item={item} />;
}
