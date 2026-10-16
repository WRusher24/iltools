import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric, uuid, date, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Postgres schema (Neon primary; Supabase works with DATABASE_URL only). Public site content is served from files —
// these tables hold operational data (clicks, leads, consent, newsletter) and a mirror of /data for querying.

export const categories = pgTable('categories', {
  slug: text('slug').primaryKey(),
  labelHe: text('label_he').notNull(),
});

export const providers = pgTable('providers', {
  id: text('id').notNull(),
  category: text('category').notNull(),
  nameHe: text('name_he').notNull(),
  nameEn: text('name_en'),
  website: text('website'),
  informationalOnly: boolean('informational_only').notNull().default(false),
  lastVerified: date('last_verified'),
  confidence: text('confidence'),
  data: jsonb('data').notNull(),
}, (t) => [uniqueIndex('providers_id_category_uq').on(t.id, t.category)]);

export const providerPlans = pgTable('provider_plans', {
  id: serial('id').primaryKey(),
  providerId: text('provider_id').notNull(),
  category: text('category').notNull(),
  planId: text('plan_id').notNull(),
  nameHe: text('name_he'),
  priceMonthly: numeric('price_monthly'),
  priceAnnually: numeric('price_annually'),
  billingCycle: text('billing_cycle'),
  limits: jsonb('limits'),
  sourceId: text('source_id'),
  accessedOn: date('accessed_on'),
}, (t) => [index('provider_plans_provider_idx').on(t.providerId)]);

export const providerFeeRules = pgTable('provider_fee_rules', {
  id: serial('id').primaryKey(),
  providerId: text('provider_id').notNull(),
  category: text('category').notNull(),
  rule: jsonb('rule').notNull(),
  sourceId: text('source_id'),
});

/** PRIVATE — never exposed to the client. The source file data/internal/affiliate_programs.json is currently empty. */
export const affiliatePrograms = pgTable('affiliate_programs', {
  id: serial('id').primaryKey(),
  providerId: text('provider_id').notNull(),
  network: text('network'),
  commissionModel: text('commission_model'),
  terms: jsonb('terms'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const affiliateLinks = pgTable('affiliate_links', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  destinationUrl: text('destination_url').notNull(),
  network: text('network'),
  status: text('status').notNull().default('active'), // active | paused
});

export const clickEvents = pgTable('click_events', {
  id: serial('id').primaryKey(),
  providerSlug: text('provider_slug').notNull(),
  slotId: text('slot_id'),
  page: text('page'),
  referrerHost: text('referrer_host'),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
  sessionHash: text('session_hash'), // salted daily hash of ip+ua; the raw IP is never stored
}, (t) => [index('click_events_provider_ts_idx').on(t.providerSlug, t.ts)]);

export const leadPartners = pgTable('lead_partners', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  licenceNumber: text('licence_number'),
  verifiedOn: date('verified_on'), // null = not verified → never routed to
  webhookUrl: text('webhook_url'),
  leadTypes: text('lead_types').array().notNull().default([]),
  active: boolean('active').notNull().default(false),
});

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(), // accountant | pension-information | mortgage-information
  payloadJson: jsonb('payload_json').notNull(), // sensitive fields hold AES-GCM ciphertext (v1.iv.tag.data)
  consentTextVersion: text('consent_text_version').notNull(),
  consentTs: timestamp('consent_ts', { withTimezone: true }).notNull(),
  partnerId: integer('partner_id'),
  status: text('status').notNull().default('queued'), // queued | sent | failed
  ipHash: text('ip_hash'),
  uaHash: text('ua_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [index('leads_created_idx').on(t.createdAt)]);

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  doubleOptInToken: text('double_opt_in_token'),
  unsubscribeToken: text('unsubscribe_token').notNull(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  consentTextVersion: text('consent_text_version').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const consentLog = pgTable('consent_log', {
  id: serial('id').primaryKey(),
  anonId: text('anon_id').notNull(),
  categories: jsonb('categories').notNull(),
  version: text('version').notNull(),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
});

export const ratesVersions = pgTable('rates_versions', {
  id: serial('id').primaryKey(),
  taxYear: integer('tax_year').notNull().unique(),
  checksum: text('checksum').notNull(),
  data: jsonb('data').notNull(),
  loadedAt: timestamp('loaded_at', { withTimezone: true }).defaultNow().notNull(),
});

export const contentIndex = pgTable('content_index', {
  path: text('path').primaryKey(),
  type: text('type').notNull(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  category: text('category'),
  updated: date('updated'),
  regulated: boolean('regulated').notNull().default(false),
});

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true }).defaultNow().notNull(),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  entity: text('entity'),
  entityId: text('entity_id'),
  meta: jsonb('meta'),
});
