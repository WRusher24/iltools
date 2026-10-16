import { xml, sitemapIndex } from '@/lib/sitemaps';

export const dynamic = 'force-static';

export const GET = () => xml(sitemapIndex());
