import type { Metadata } from 'next';
import { ListingPage } from '@/components/content/ListingPage';
import { itemsOf } from '@/lib/hubs';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 86400;
export const metadata: Metadata = buildMetadata({ path: '/calculators', title: 'מחשבונים לעצמאים, שכירים ועסקים', description: 'מחשבוני נטו, מע״מ, שכר, סליקה, קרן השתלמות, פנסיה, פיצויים ועוד — להערכה בלבד.' });

export default function Page() {
  
  return (
    <ListingPage
      path="/calculators"
      metaTitle='מחשבונים לעצמאים, שכירים ועסקים'
      metaDescription='מחשבוני נטו, מע״מ, שכר, סליקה, קרן השתלמות, פנסיה, פיצויים ועוד — להערכה בלבד.'
      h1='מחשבונים'
      intro='מחשבונים לעצמאים, שכירים ובעלי עסקים: נטו, מע״מ, סליקה, חיסכון ועוד. התוצאות להערכה בלבד.'
      crumbs={[{ name: 'דף הבית', href: '/' }, { name: 'מחשבונים' }]}
      items={itemsOf('/calculators/')}
    />
  );
}
