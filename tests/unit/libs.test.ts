import { describe, expect, it, vi, beforeAll } from 'vitest';
import { scanTokens, findUnknownTokens, splitSections, parseSourcesArg } from '@/lib/markdown';
import { totalScore, WEIGHTS_SUM } from '@/lib/scoring';
import { substitute, unfilledBlanks, getLegal, allLegal, OWNER_BLANK_KEYS } from '@/lib/legal';
import { leadSchema } from '@/lib/lead-schema';
import { renderTitle, extractFaq } from '@/lib/seo';
import { getRates } from '@/lib/rates';
import { csrfCheck, sanitizeText } from '@/server/http';
import { rateLimit } from '@/server/rate-limit';

beforeAll(() => {
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
  process.env.HASH_SALT_SECRET = 'x'.repeat(32);
});

describe('token scanner', () => {
  it('finds tokens, ignores code spans', () => {
    const md = 'a {{aff:icount}} b `{{slot:CALC-RESULT-CTA}}` {{sources:[src_a, src_b]}}';
    expect(scanTokens(md).map((t) => `${t.kind}:${t.arg}`)).toEqual(['aff:icount', 'sources:[src_a, src_b]']);
    expect(parseSourcesArg('[src_a, src_b]')).toEqual(['src_a', 'src_b']);
  });
  it('flags unknown tokens', () => {
    expect(findUnknownTokens('x {{foo:bar}} {{link:a}}')).toEqual(['{{foo:bar}}']);
  });
  it('splits sections at H2', () => {
    const s = splitSections('# T\nintro\n## A\na\n## B\nb');
    expect(s.map((x) => x.heading)).toEqual([null, 'A', 'B']);
  });
});

describe('scoring', () => {
  it('weights sum to 1 and total requires all five sub-scores', () => {
    expect(WEIGHTS_SUM).toBeCloseTo(1, 10);
    expect(totalScore({ price: 100, fit: 100, support: 100, reliability: 100, transparency: 100 })).toBe(100);
    expect(totalScore({ price: 50, fit: 50, support: 50, reliability: 50, transparency: 50 })).toBe(50);
    expect(totalScore({ price: 80, fit: 60 })).toBeNull();
  });
});

describe('legal substitution', () => {
  it('never leaves raw placeholders', () => {
    for (const t of allLegal()) {
      const out = substitute(t.markdown, { updated: '2026-10-16', sources: 'מקור' });
      expect(out, t.id).not.toMatch(/\{date\}|\{sources\}|\{\{לינק_|\{\{תאריך_עדכון_אחרון\}\}/);
    }
  });
  it('DISC-RATES-DATE gets the page date', () => {
    expect(substitute(getLegal('DISC-RATES-DATE').markdown, { updated: '2026-10-16' })).toContain('2026');
  });
  it('owner blanks are tracked as launch blockers until filled', () => {
    expect(OWNER_BLANK_KEYS.length).toBeGreaterThan(5);
    expect(unfilledBlanks().length).toBeGreaterThan(0);
  });
});

describe('lead schema', () => {
  const ok = { type: 'accountant', name: 'דנה כהן', phone: '050-1234567', email: '', businessType: 'osek-patur', topic: 'bookkeeping', consent: true, consentVersion: '1.0' };
  it('accepts a valid lead', () => expect(leadSchema.safeParse(ok).success).toBe(true));
  it('blocks submission without consent (never pre-ticked)', () => {
    expect(leadSchema.safeParse({ ...ok, consent: false }).success).toBe(false);
    const { consent: _c, ...noConsent } = ok;
    void _c;
    expect(leadSchema.safeParse(noConsent).success).toBe(false);
  });
  it('rejects bad phone and unknown option', () => {
    expect(leadSchema.safeParse({ ...ok, phone: '123' }).success).toBe(false);
    expect(leadSchema.safeParse({ ...ok, topic: 'x' }).success).toBe(false);
  });
});

describe('seo helpers', () => {
  it('title suffix only if it stays ≤60', () => {
    expect(renderTitle('קצר')).toBe('קצר | IL-Tools');
    const long = 'א'.repeat(55);
    expect(renderTitle(long)).toBe(long);
    expect(renderTitle('x | IL-Tools')).toBe('x | IL-Tools');
  });
  it('extracts visible FAQ', () => {
    const faq = extractFaq('## שאלות נפוצות\n\n**שאלה?**\nתשובה {{sources:[a]}}\n\n**עוד?**\nכן\n\n## הבא\n', (s) => s);
    expect(faq).toEqual([{ q: 'שאלה?', a: 'תשובה' }, { q: 'עוד?', a: 'כן' }]);
  });
});

describe('rates loader', () => {
  it('selects the year by date, falling back to the earliest', () => {
    expect(getRates(new Date('2026-05-01')).tax_year).toBe(2026);
    expect(getRates(new Date('2031-01-01')).tax_year).toBe(2026);
    expect(getRates(new Date('2019-01-01')).tax_year).toBe(2026);
  });
});

describe('http helpers', () => {
  const mk = (h: Record<string, string>) => new Request('http://localhost/api/x', { method: 'POST', headers: h });
  it('csrf requires custom header + json + same origin', () => {
    expect(csrfCheck(mk({ 'content-type': 'application/json', 'x-il-csrf': '1', origin: 'http://localhost' , host: 'localhost' }))).toBe(true);
    expect(csrfCheck(mk({ 'content-type': 'application/json' }))).toBe(false);
    expect(csrfCheck(mk({ 'content-type': 'text/plain', 'x-il-csrf': '1' }))).toBe(false);
    expect(csrfCheck(mk({ 'content-type': 'application/json', 'x-il-csrf': '1', origin: 'https://evil.example', host: 'localhost' }))).toBe(false);
    expect(csrfCheck(mk({ 'content-type': 'application/json', 'x-il-csrf': '1', 'sec-fetch-site': 'cross-site' }))).toBe(false);
  });
  it('sanitises markup and control chars', () => {
    expect(sanitizeText('<b>שלום</b>\u0000  עולם')).toBe('שלום עולם');
  });
  it('in-memory rate limit blocks after the limit', async () => {
    const k = `t${Math.random()}`;
    const r = [];
    for (let i = 0; i < 4; i++) r.push((await rateLimit(k, 3, 60)).ok);
    expect(r).toEqual([true, true, true, false]);
  });
});

describe('field encryption + hashing', () => {
  it('AES-GCM round-trips and ciphertext is non-deterministic; tamper fails', async () => {
    const { encryptField, decryptField, hashWithSalt } = await import('@/server/crypto');
    const a = encryptField('050-1234567');
    expect(a).not.toContain('050');
    expect(a).not.toBe(encryptField('050-1234567'));
    expect(decryptField(a)).toBe('050-1234567');
    const parts = a.split('.');
    parts[3] = Buffer.from('zzzz').toString('base64url');
    expect(() => decryptField(parts.join('.'))).toThrow();
    expect(hashWithSalt('1.2.3.4')).toHaveLength(40);
    expect(hashWithSalt('1.2.3.4', new Date('2026-01-01'))).not.toBe(hashWithSalt('1.2.3.4', new Date('2026-01-02')));
  });
  it('payload encryption touches only sensitive fields', async () => {
    const { encryptPayload } = await import('@/server/leads');
    const p = encryptPayload({ name: 'דנה', phone: '0501234567', topic: 'fees' });
    expect(String(p.name)).toMatch(/^v1\./);
    expect(String(p.phone)).toMatch(/^v1\./);
    expect(p.topic).toBe('fees');
  });
});

describe('/go/[slug] redirect logging', () => {
  it('redirects 302 to the official site and logs a click without IP/UA', async () => {
    const { GET } = await import('@/app/go/[slug]/route');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const res = await GET(new Request('http://localhost/go/green_invoice?p=/compare/x&s=AFF-1', { headers: { 'x-forwarded-for': '9.9.9.9', 'user-agent': 'UA-secret', referer: 'https://google.com/search' } }), { params: Promise.resolve({ slug: 'green_invoice' }) });
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toMatch(/^https:\/\//);
    expect(res.headers.get('x-robots-tag')).toContain('noindex');
    const line = spy.mock.calls.map((c) => String(c[0])).find((l) => l.includes('affiliate_click'))!;
    expect(line).toBeTruthy();
    expect(line).not.toContain('9.9.9.9');
    expect(line).not.toContain('UA-secret');
    expect(JSON.parse(line)).toMatchObject({ provider_slug: 'green_invoice', slot_id: 'AFF-1', page: '/compare/x', referrer_host: 'google.com' });
    const bad = await GET(new Request('http://localhost/go/nope'), { params: Promise.resolve({ slug: 'nope' }) });
    expect(bad.status).toBe(404);
    spy.mockRestore();
  });
});
