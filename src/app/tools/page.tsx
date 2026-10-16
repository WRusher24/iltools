import type { Metadata } from 'next';
import { ListingPage } from '@/components/content/ListingPage';
import { itemsOf } from '@/lib/hubs';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 86400;
export const metadata: Metadata = buildMetadata({ path: '/tools', title: 'כלים אינטראקטיביים לעצמאים ולעסקים', description: 'תעריף שעתי, מפענח תלוש, עלות הקמת עסק, בוחן מבנה עסקי, לוח שנה, בדיקת עמלות בנק והחזר מס.' });

export default function Page() {
  
  return (
    <ListingPage
      path="/tools"
      metaTitle='כלים אינטראקטיביים לעצמאים ולעסקים'
      metaDescription='תעריף שעתי, מפענח תלוש, עלות הקמת עסק, בוחן מבנה עסקי, לוח שנה, בדיקת עמלות בנק והחזר מס.'
      h1='כלים אינטראקטיביים'
      intro='כלים נוספים: תעריף שעתי, מפענח תלוש, עלות הקמת עסק, בוחן מבנה עסקי, לוח שנה פיננסי ועוד.'
      crumbs={[{ name: 'דף הבית', href: '/' }, { name: 'כלים' }]}
      items={itemsOf('/tools/')}
    />
  );
}
