import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { contentOfType, getContent } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';
import { ContentPage } from '@/components/content/ContentPage';

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return contentOfType('category').filter((c) => c.path.startsWith('/category/')).map((c) => ({ slug: c.fm.slug }));
}

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  return buildMetadata({ path: `/category/${slug}` });
}

export default async function Page({ params }: P) {
  const { slug } = await params;
  const item = getContent(`/category/${slug}`);
  if (!item) notFound();
  return <ContentPage item={item} />;
}
