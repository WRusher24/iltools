import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Receives CSP report-only violations (browser-sent, no personal data beyond the blocked URL). Logged compactly for tightening the policy. */
export async function POST(req: Request) {
  try {
    const text = (await req.text()).slice(0, 4000);
    const r = JSON.parse(text)['csp-report'] ?? {};
    console.info(JSON.stringify({ evt: 'csp_report', directive: r['violated-directive'], blocked: String(r['blocked-uri'] ?? '').slice(0, 160), doc: String(r['document-uri'] ?? '').replace(/\?.*$/, '').slice(0, 160) }));
  } catch { /* ignore malformed */ }
  return new NextResponse(null, { status: 204 });
}
