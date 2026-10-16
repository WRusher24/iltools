import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';
import { ContentPage } from '@/components/content/ContentPage';

const PAGES = ['about', 'methodology', 'editorial-policy', 'advertise', 'contact'];
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return PAGES.map((page) => ({ page }));
}

type P = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { page } = await params;
  return buildMetadata({ path: `/${page}` });
}

export default async function Page({ params }: P) {
  const { page } = await params;
  const item = PAGES.includes(page) ? getContent(`/${page}`) : undefined;
  if (!item) notFound();
  return <ContentPage item={item} />;
}
