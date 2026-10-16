import { xml, imageUrlset } from '@/lib/sitemaps';

export const dynamic = 'force-static';

export const GET = () => xml(imageUrlset());
