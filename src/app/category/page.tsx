import type { Metadata } from 'next';
import { ListingPage } from '@/components/content/ListingPage';
import { itemsOf } from '@/lib/hubs';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 86400;
export const metadata: Metadata = buildMetadata({ path: '/category', title: 'קטגוריות — מרכזי מידע והשוואה', description: 'מרכזי מידע לכל קטגוריה: חשבוניות, סליקה, בנקים, CRM ופנסיה (מידע בלבד).' });

export default function Page() {
  
  return (
    <ListingPage
      path="/category"
      metaTitle='קטגוריות — מרכזי מידע והשוואה'
      metaDescription='מרכזי מידע לכל קטגוריה: חשבוניות, סליקה, בנקים, CRM ופנסיה (מידע בלבד).'
      h1='כל הקטגוריות'
      intro='מרכזי מידע לכל קטגוריה: מה לבדוק, איך משווים וקישורים להשוואות, לביקורות ולמדריכים.'
      crumbs={[{ name: 'דף הבית', href: '/' }, { name: 'קטגוריות' }]}
      items={itemsOf('/category/')}
    />
  );
}
