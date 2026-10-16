// Rate limiting: Upstash Redis (REST, no SDK) when configured, in-memory sliding window fallback otherwise.
import { env } from './env';

const mem = new Map<string, number[]>();

export interface LimitResult { ok: boolean; remaining: number }

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<LimitResult> {
  const e = env();
  if (e.UPSTASH_REDIS_REST_URL && e.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const k = `rl:${key}`;
      const res = await fetch(`${e.UPSTASH_REDIS_REST_URL}/pipeline`, {
        method: 'POST',
        headers: { authorization: `Bearer ${e.UPSTASH_REDIS_REST_TOKEN}`, 'content-type': 'application/json' },
        body: JSON.stringify([['INCR', k], ['EXPIRE', k, String(windowSec), 'NX']]),
        signal: AbortSignal.timeout(1500),
      });
      const data = (await res.json()) as { result: number }[];
      const count = Number(data?.[0]?.result ?? 0);
      return { ok: count <= limit, remaining: Math.max(0, limit - count) };
    } catch {
      /* fall through to memory */
    }
  }
  const now = Date.now();
  const hits = (mem.get(key) ?? []).filter((t) => now - t < windowSec * 1000);
  hits.push(now);
  mem.set(key, hits);
  if (mem.size > 5000) for (const [k, v] of mem) if (!v.some((t) => now - t < windowSec * 1000)) mem.delete(k);
  return { ok: hits.length <= limit, remaining: Math.max(0, limit - hits.length) };
}
