import { and, eq, isNotNull, sql, gt } from 'drizzle-orm';
import { getDb, schema } from '@/db/client';
import { SENSITIVE_FIELDS, type LeadType } from '@/lib/lead-schema';
import { encryptField, decryptField } from './crypto';

/** Partners eligible for routing: active AND licence-verified (verified_on set, within 12 months) AND covering this lead type. */
export async function eligiblePartners(type: LeadType) {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(schema.leadPartners)
    .where(and(eq(schema.leadPartners.active, true), isNotNull(schema.leadPartners.verifiedOn), gt(schema.leadPartners.verifiedOn, sql`(current_date - interval '365 days')::date`)));
  return rows.filter((p) => p.leadTypes.includes(type) && !!p.licenceNumber);
}

export function encryptPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = (SENSITIVE_FIELDS as readonly string[]).includes(k) && typeof v === 'string' && v ? encryptField(v) : v;
  }
  return out;
}

export function decryptPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = (SENSITIVE_FIELDS as readonly string[]).includes(k) && typeof v === 'string' && v.startsWith('v1.') ? decryptField(v) : v;
  }
  return out;
}
