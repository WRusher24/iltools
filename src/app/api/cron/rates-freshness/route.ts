import { NextResponse } from 'next/server';
import { env } from '@/server/env';
import { AVAILABLE_YEARS, getRates } from '@/lib/rates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Vercel Cron: flags when the active rates year is not the current year (January rollover reminder). */
export async function GET(req: Request) {
  const e = env();
  if (!e.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${e.CRON_SECRET}`) return new NextResponse('unauthorized', { status: 401 });
  const now = new Date();
  const active = getRates(now).tax_year;
  const stale = active < now.getFullYear();
  if (stale) console.warn(`[rates-freshness] active rates year ${active} < current year ${now.getFullYear()} — run docs/engineering/RUNBOOK_RATES_ROLLOVER.md`);
  return NextResponse.json({ ok: !stale, activeYear: active, available: AVAILABLE_YEARS, currentYear: now.getFullYear(), action: stale ? 'rollover required' : 'none' }, { status: stale ? 200 : 200 });
}
