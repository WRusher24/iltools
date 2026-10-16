// Shared route-handler helpers: Hebrew error responses, same-origin/CSRF checks, sanitisation, client fingerprint inputs.
import { NextResponse } from 'next/server';
import { siteUrl } from '@/lib/site';

export const ERR = {
  badRequest: 'הבקשה אינה תקינה. בדקו את הנתונים ונסו שוב.',
  forbidden: 'הבקשה נדחתה מטעמי אבטחה. רעננו את הדף ונסו שוב.',
  rateLimited: 'בוצעו יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.',
  server: 'אירעה תקלה זמנית. נסו שוב מאוחר יותר.',
  unavailable: 'השירות אינו זמין כרגע. נסו שוב מאוחר יותר.',
  spam: 'לא ניתן היה לאמת את הבקשה.',
} as const;

export function jsonError(status: number, error: string, fields?: Record<string, string>) {
  return NextResponse.json({ ok: false, error, ...(fields ? { fields } : {}) }, { status, headers: { 'cache-control': 'no-store' } });
}
export function jsonOk(data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...data }, { headers: { 'cache-control': 'no-store' } });
}

/**
 * CSRF: state-changing JSON endpoints require (1) application/json (forces a CORS preflight cross-site),
 * (2) the custom `x-il-csrf` header, and (3) a same-origin Origin/Sec-Fetch-Site. SameSite=Lax cookies add depth.
 */
export function csrfCheck(req: Request): boolean {
  if (req.headers.get('x-il-csrf') !== '1') return false;
  if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return false;
  const site = req.headers.get('sec-fetch-site');
  if (site && !['same-origin', 'same-site', 'none'].includes(site)) return false;
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      const o = new URL(origin);
      const allowed = new Set([new URL(siteUrl()).host, req.headers.get('host') ?? '']);
      if (!allowed.has(o.host)) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function clientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  return (xf?.split(',')[0] ?? req.headers.get('x-real-ip') ?? '0.0.0.0').trim();
}

/** Strip control chars/markup from free text; collapse whitespace; cap length. */
export function sanitizeText(v: unknown, max = 500): string {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export async function readJson(req: Request, maxBytes = 20_000): Promise<unknown | null> {
  const text = await req.text();
  if (text.length > maxBytes) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
