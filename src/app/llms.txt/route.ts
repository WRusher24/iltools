import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const dynamic = 'force-static';

export function GET() {
  const txt = readFileSync(join(process.cwd(), 'seo/llms.txt'), 'utf8');
  return new Response(txt, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
