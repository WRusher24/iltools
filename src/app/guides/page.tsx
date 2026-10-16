import type { Metadata } from 'next';
import { ListingPage } from '@/components/content/ListingPage';
import { groupedBy, GUIDE_CLUSTERS } from '@/lib/hubs';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 86400;
export const metadata: Metadata = buildMetadata({ path: '/guides', title: 'מדריכים לעצמאים ולעסקים קטנים', description: 'מדריכים מעשיים: פתיחת עסק, מיסים, מע״מ, פנסיה, בנקאות ועסק אונליין — עם מקורות ותאריך עדכון.' });

export default function Page() {
  
  return (
    <ListingPage
      path="/guides"
      metaTitle='מדריכים לעצמאים ולעסקים קטנים'
      metaDescription='מדריכים מעשיים: פתיחת עסק, מיסים, מע״מ, פנסיה, בנקאות ועסק אונליין — עם מקורות ותאריך עדכון.'
      h1='מדריכים'
      intro='מדריכי "איך עושים" בעברית פשוטה, לפי נושאים: פתיחת עסק, מיסים, פנסיה, בנקאות ועוד.'
      crumbs={[{ name: 'דף הבית', href: '/' }, { name: 'מדריכים' }]}
      groups={groupedBy('/guides/', (c) => c.cluster ?? '', (k) => GUIDE_CLUSTERS[k] ?? k)}
    />
  );
}
