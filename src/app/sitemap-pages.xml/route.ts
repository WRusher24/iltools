import { xml, pageEntries, urlset } from '@/lib/sitemaps';

export const dynamic = 'force-static';

export const GET = () => xml(urlset(pageEntries()));
