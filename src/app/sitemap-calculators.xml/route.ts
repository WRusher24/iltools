import { xml, calculatorEntries, urlset } from '@/lib/sitemaps';

export const dynamic = 'force-static';

export const GET = () => xml(urlset(calculatorEntries()));
