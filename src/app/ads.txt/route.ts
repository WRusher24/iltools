import { env } from '@/server/env';

export const dynamic = 'force-dynamic';

/** ads.txt from ADSENSE_PUBLISHER_ID (no value ⇒ an explanatory comment only; nothing is invented). */
export function GET() {
  const pub = env().ADSENSE_PUBLISHER_ID;
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '# ads.txt: ADSENSE_PUBLISHER_ID is not configured yet.\n';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
