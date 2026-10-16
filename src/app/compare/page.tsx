import type { Metadata } from 'next';
import { ListingPage } from '@/components/content/ListingPage';
import { itemsOf } from '@/lib/hubs';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 86400;
export const metadata: Metadata = buildMetadata({ path: '/compare', title: 'השוואות ספקים ומוצרים לעצמאים', description: 'כל ההשוואות באתר: תוכנות חשבוניות, סליקה, CRM, בנקים ועוד — לפי נתונים שפורסמו ומקורות מצוינים.' });

export default function Page() {
  
  return (
    <ListingPage
      path="/compare"
      metaTitle='השוואות ספקים ומוצרים לעצמאים'
      metaDescription='כל ההשוואות באתר: תוכנות חשבוניות, סליקה, CRM, בנקים ועוד — לפי נתונים שפורסמו ומקורות מצוינים.'
      h1='כל ההשוואות'
      intro='השוואות "A או B" מבוססות נתונים שפורסמו, עם מקורות ותאריך עדכון. ההשוואות מציגות מידע ואינן המלצה או ייעוץ.'
      crumbs={[{ name: 'דף הבית', href: '/' }, { name: 'השוואות' }]}
      items={itemsOf('/compare/')}
    />
  );
}
