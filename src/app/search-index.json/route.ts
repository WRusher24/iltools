import { NextResponse } from 'next/server';
import { buildSearchIndex } from '@/lib/search-index';

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  return NextResponse.json(buildSearchIndex(), { headers: { 'cache-control': 'public, max-age=3600, s-maxage=86400' } });
}
