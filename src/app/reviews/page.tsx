import type { Metadata } from 'next';
import { ListingPage } from '@/components/content/ListingPage';
import { itemsOf } from '@/lib/hubs';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 86400;
export const metadata: Metadata = buildMetadata({ path: '/reviews', title: 'ביקורות ספקים — מחירים, חוזקות וחולשות', description: 'סקירות ספקים לפי מידע שפורסם באתרי הספקים: מחירים, חוזקות, חולשות ותאריך בדיקה.' });

export default function Page() {
  
  return (
    <ListingPage
      path="/reviews"
      metaTitle='ביקורות ספקים — מחירים, חוזקות וחולשות'
      metaDescription='סקירות ספקים לפי מידע שפורסם באתרי הספקים: מחירים, חוזקות, חולשות ותאריך בדיקה.'
      h1='ביקורות ספקים'
      intro='סקירות ספקים לפי מידע שפורסם באתרי הספקים, עם מחירים, חוזקות וחולשות ותאריך בדיקה.'
      crumbs={[{ name: 'דף הבית', href: '/' }, { name: 'ביקורות' }]}
      items={itemsOf('/reviews/')}
    />
  );
}
