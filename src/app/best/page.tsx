import type { Metadata } from 'next';
import { ListingPage } from '@/components/content/ListingPage';
import { itemsOf } from '@/lib/hubs';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 86400;
export const metadata: Metadata = buildMetadata({ path: '/best', title: 'הכי מתאים ל… — רשימות לפי קריטריונים', description: 'רשימות מתאימות לפי סוג עסק וצורך, עם קריטריונים גלויים ושיטת דירוג מפורסמת.' });

export default function Page() {
  
  return (
    <ListingPage
      path="/best"
      metaTitle='הכי מתאים ל… — רשימות לפי קריטריונים'
      metaDescription='רשימות מתאימות לפי סוג עסק וצורך, עם קריטריונים גלויים ושיטת דירוג מפורסמת.'
      h1='הכי מתאים ל…'
      intro='רשימות "הכי מתאים ל…" לפי קריטריונים גלויים ושיטת דירוג מפורסמת. תשלום מספק אינו משנה את הדירוג המערכתי.'
      crumbs={[{ name: 'דף הבית', href: '/' }, { name: 'הכי מתאים ל…' }]}
      items={itemsOf('/best/')}
    />
  );
}
