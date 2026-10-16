import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allContent, getContent } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';
import { CalculatorPage } from '@/components/content/CalculatorPage';

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return allContent().filter((c) => c.path.startsWith('/calculators/')).map((c) => ({ slug: c.fm.slug }));
}

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  return buildMetadata({ path: `/calculators/${slug}` });
}

export default async function Page({ params }: P) {
  const { slug } = await params;
  const item = getContent(`/calculators/${slug}`);
  if (!item) notFound();
  return <CalculatorPage item={item} />;
}
