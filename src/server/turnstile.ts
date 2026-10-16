// Cloudflare Turnstile (or hCaptcha-compatible siteverify) hook. Disabled unless TURNSTILE_SECRET_KEY is set.
import { env } from './env';

export async function verifyCaptcha(token: unknown, ip: string): Promise<boolean> {
  const secret = env().TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured → honeypot + rate limit only
  if (typeof token !== 'string' || !token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(3000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
