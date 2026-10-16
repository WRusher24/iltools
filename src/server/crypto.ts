// Field-level AES-256-GCM encryption + salted hashing of ip/ua (rotating daily salt). Node runtime only.
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';
import { env } from './env';

function key(): Buffer {
  const k = env().ENCRYPTION_KEY;
  if (!k) throw new Error('ENCRYPTION_KEY is not configured');
  const buf = Buffer.from(k.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY must decode to 32 bytes');
  return buf;
}

/** Output format: v1.<iv>.<tag>.<ciphertext> (base64url). */
export function encryptField(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return ['v1', iv.toString('base64url'), c.getAuthTag().toString('base64url'), enc.toString('base64url')].join('.');
}

export function decryptField(token: string): string {
  const [v, iv, tag, data] = token.split('.');
  if (v !== 'v1' || !iv || !tag || !data) throw new Error('Malformed ciphertext');
  const d = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'));
  d.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([d.update(Buffer.from(data, 'base64url')), d.final()]).toString('utf8');
}

/** Rotating salt: HMAC(secret, YYYY-MM-DD) so hashes cannot be correlated across days. */
export function dailySalt(date = new Date()): string {
  const secret = env().HASH_SALT_SECRET ?? env().ENCRYPTION_KEY ?? 'il-tools-default-salt-not-for-production';
  return createHmac('sha256', secret).update(date.toISOString().slice(0, 10)).digest('hex');
}

export function hashWithSalt(value: string, date = new Date()): string {
  return createHash('sha256').update(`${dailySalt(date)}|${value}`).digest('hex').slice(0, 40);
}

export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString('base64url');
}
