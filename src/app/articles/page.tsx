import type { Metadata } from 'next';
import { ListingPage } from '@/components/content/ListingPage';
import { groupedBy, CATEGORY_LABELS } from '@/lib/hubs';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 86400;
export const metadata: Metadata = buildMetadata({ path: '/articles', title: 'מאמרים ונתונים לעצמאים ולעסקים', description: 'מאמרים מבוססי נתונים על מיסים, עסקים, תשלומים, בנקאות וחיסכון — עם גרפים ומקורות.' });

export default function Page() {
  
  return (
    <ListingPage
      path="/articles"
      metaTitle='מאמרים ונתונים לעצמאים ולעסקים'
      metaDescription='מאמרים מבוססי נתונים על מיסים, עסקים, תשלומים, בנקאות וחיסכון — עם גרפים ומקורות.'
      h1='מאמרים ונתונים'
      intro='מאמרים מבוססי נתונים על מיסים, עסקים, תשלומים וחיסכון — עם גרפים, מקורות ותאריך עדכון.'
      crumbs={[{ name: 'דף הבית', href: '/' }, { name: 'מאמרים' }]}
      groups={groupedBy('/articles/', (c) => c.fm.category, (k) => CATEGORY_LABELS[k] ?? k)}
    />
  );
}
