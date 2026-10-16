import { readFileSync } from 'node:fs';

const redirectsFile = JSON.parse(readFileSync(new URL('./seo/redirects.json', import.meta.url), 'utf8'));

/**
 * Redirects come from seo/redirects.json:
 *  - path rules → next redirects (permanent:true → 308/301-equivalent; permanent:false → 307/302-equivalent temporary);
 *  - `host_level` rules (http→https is handled by the platform; www→apex below) become host-conditional redirects;
 *  - trailing slash: `trailingSlash: false` (Next strips it with a redirect) — no catch-all rule.
 */
// /tax-year/* is deferred (no content → no page): a redirect into a non-existent page would only create a 404 chain, so it is not shipped.
const pathRedirects = redirectsFile.rules
  .filter((r) => !r.destination.startsWith('/tax-year/') && r.source !== '/:path*/') // trailing-slash catch-all is handled by trailingSlash:false
  .map((r) => ({ source: r.source, destination: r.destination, statusCode: r.permanent === true ? 301 : 302 }));
const wwwRedirect = {
  source: '/:path*',
  has: [{ type: 'host', value: 'www.il-tools.co.il' }],
  destination: 'https://il-tools.co.il/:path*',
  statusCode: 301,
};

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];

/**
 * CSP — REPORT-ONLY first (see docs/engineering/ARCHITECTURE.md "CSP tightening"). Static/ISR pages cannot carry per-request
 * nonces, so script-src keeps 'unsafe-inline' for Next's inline bootstrap in this phase; hosts are limited to the consented
 * Google endpoints. Tightening step: move to nonce + 'strict-dynamic' via proxy.ts once the report-only log is clean.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.g.doubleclick.net https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://www.google-analytics.com https://*.googlesyndication.com https://*.g.doubleclick.net https://pagead2.googlesyndication.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googlesyndication.com https://*.g.doubleclick.net https://pagead2.googlesyndication.com",
  "frame-src https://*.googlesyndication.com https://*.g.doubleclick.net https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'report-uri /api/csp-report',
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    return [wwwRedirect, ...pathRedirects];
  },
  async headers() {
    return [
      { source: '/:path*', headers: [...securityHeaders, { key: 'Content-Security-Policy-Report-Only', value: csp }] },
      { source: '/go/:slug*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
      { source: '/search', headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }] },
      { source: '/newsletter/:state', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;
