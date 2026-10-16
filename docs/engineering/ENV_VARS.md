# Environment variables

Every variable is **optional**: with none set the site builds and serves all pages from the files in `/content`, `/data`, `/seo`. Features degrade gracefully (no ads, no DB-backed forms → Hebrew "השירות אינו זמין כרגע"). Values are validated at boot by `src/server/env.ts` (Zod, fail fast with a clear message). Set them in **Vercel → Project → Settings → Environment Variables**.

| Name | Purpose | Required? | Example | Where to get it |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for canonicals, sitemaps, OG, JSON-LD | Recommended (defaults to `https://il-tools.co.il`) | `https://il-tools.co.il` | your domain |
| `NEXT_PUBLIC_FORCE_NOINDEX` | `1` forces noindex + `Disallow: /` robots | No | `1` | — (Vercel Preview is noindex automatically via `VERCEL_ENV`) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense publisher id for the consent-gated loader | For ads | `ca-pub-1234567890123456` | AdSense → Account |
| `ADSENSE_PUBLISHER_ID` | Served in `/ads.txt` | For ads | `pub-1234567890123456` | AdSense → Sites → ads.txt |
| `NEXT_PUBLIC_ADSENSE_SLOT_AD_1…5` | Ad unit ids per slot (`src/config/ads.ts`) | For ads | `1234567890` | AdSense → Ads → By ad unit |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement id (consent-gated, Consent Mode v2) | For analytics | `G-ABCDE12345` | GA4 → Admin → Data streams |
| `DATABASE_URL` | Postgres (Neon pooled URL, or Supabase pooler URL) — leads, newsletter, click log, consent log | For forms/click DB | `postgres://…?sslmode=require` | Neon console / Supabase → Database |
| `ENCRYPTION_KEY` | AES-256-GCM key for lead personal fields | **Yes if `DATABASE_URL` is set** | 44-char base64 | `openssl rand -base64 32` |
| `HASH_SALT_SECRET` | Secret for the daily-rotating salt used to hash ip/ua | Recommended with DB | 48 hex chars | `openssl rand -hex 24` |
| `LEAD_RETENTION_DAYS` | Retention for leads (cron purges older rows). Unset ⇒ no expiry applied (**launch blocker**: privacy policy §9) | Before launch | `730` | attorney/owner decision |
| `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email (newsletter double opt-in, lead confirmation) | For email | `re_…`, `IL-Tools <no-reply@…>` | resend.com (verify the sending domain) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Shared rate limiting (in-memory fallback otherwise) | No | — | Upstash console |
| `TURNSTILE_SECRET_KEY` | Server-side CAPTCHA verification hook (forms also have honeypot + rate limit) | No | — | Cloudflare Turnstile |
| `CRON_SECRET` | Authorises `/api/cron/*` (Vercel sends `Authorization: Bearer`) | For crons | 32+ chars | `openssl rand -hex 24` |
| `ADMIN_DELETE_TOKEN` | Bearer token for `DELETE /api/leads/:id` | For deletion requests | 32+ chars | `openssl rand -hex 24` |

Not environment variables (files the owner edits): `data/legal/owner-facts.json` (legal-entity facts filling the `[...]` blanks), `data/internal/affiliate_programs.json` (affiliate destinations), lead partners (DB table `lead_partners`).
