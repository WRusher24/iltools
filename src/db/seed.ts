// pnpm db:seed — mirrors /data/** and the content index into Postgres so DB and files stay in sync (idempotent).
import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { getDb, schema } from './client';
import { loadProvidersByCategory, affiliatePrograms } from '@/lib/data';
import { allContent, CATEGORY_LABELS } from '@/lib/content';
import { AVAILABLE_YEARS, getRatesForYear } from '@/lib/rates';

async function main() {
  const db = getDb();
  if (!db) {
    console.error('db:seed — DATABASE_URL is not set. Nothing to do (the site runs from static files without a database).');
    process.exit(0);
  }
  const byCat = loadProvidersByCategory();

  for (const [slug, labelHe] of Object.entries(CATEGORY_LABELS)) {
    await db.insert(schema.categories).values({ slug, labelHe }).onConflictDoUpdate({ target: schema.categories.slug, set: { labelHe } });
  }

  await db.delete(schema.providerPlans);
  await db.delete(schema.providerFeeRules);
  let nProv = 0, nPlans = 0;
  for (const [file, list] of Object.entries(byCat)) {
    for (const p of list) {
      nProv++;
      await db.insert(schema.providers).values({
        id: p.id, category: file, nameHe: p.name.he, nameEn: p.name.en, website: p.website,
        informationalOnly: !!p.informational_only, lastVerified: p.last_verified ?? null, confidence: p.confidence ?? null, data: p as unknown as Record<string, unknown>,
      }).onConflictDoUpdate({
        target: [schema.providers.id, schema.providers.category],
        set: { nameHe: p.name.he, nameEn: p.name.en, website: p.website, informationalOnly: !!p.informational_only, lastVerified: p.last_verified ?? null, confidence: p.confidence ?? null, data: p as unknown as Record<string, unknown> },
      });
      for (const plan of (p.pricing?.plans ?? []) as Record<string, unknown>[]) {
        nPlans++;
        await db.insert(schema.providerPlans).values({
          providerId: p.id, category: file, planId: String(plan.id),
          nameHe: (plan.name as { he?: string } | undefined)?.he ?? null,
          priceMonthly: plan.price_monthly == null ? null : String(plan.price_monthly),
          priceAnnually: plan.price_annually == null ? null : String(plan.price_annually),
          billingCycle: (plan.billing_cycle as string) ?? null, limits: (plan.limits as object) ?? null,
          sourceId: (plan.source_id as string) ?? null, accessedOn: (plan.accessed_on as string) ?? null,
        });
      }
      if (p.pricing?.transaction_fees) {
        await db.insert(schema.providerFeeRules).values({ providerId: p.id, category: file, rule: p.pricing.transaction_fees as object, sourceId: (p.pricing.source_id as string) ?? null });
      }
    }
  }

  for (const year of AVAILABLE_YEARS) {
    const data = getRatesForYear(year)!;
    const checksum = createHash('sha256').update(JSON.stringify(data)).digest('hex');
    await db.insert(schema.ratesVersions).values({ taxYear: year, checksum, data: data as unknown as object })
      .onConflictDoUpdate({ target: schema.ratesVersions.taxYear, set: { checksum, data: data as unknown as object, loadedAt: sql`now()` } });
  }

  for (const c of allContent()) {
    await db.insert(schema.contentIndex).values({ path: c.path, type: c.fm.type, slug: c.fm.slug, title: c.fm.title, category: c.fm.category, updated: c.fm.updated, regulated: c.fm.regulated })
      .onConflictDoUpdate({ target: schema.contentIndex.path, set: { type: c.fm.type, slug: c.fm.slug, title: c.fm.title, category: c.fm.category, updated: c.fm.updated, regulated: c.fm.regulated } });
  }

  // Affiliate programs file is currently EMPTY — handled gracefully (nothing is inserted, nothing breaks).
  const programs = affiliatePrograms();
  await db.delete(schema.affiliatePrograms);
  for (const a of programs) await db.insert(schema.affiliatePrograms).values({ providerId: a.provider_id, network: a.network ?? null, terms: a as object });
  for (const a of programs.filter((x) => x.destination_url)) {
    await db.insert(schema.affiliateLinks).values({ slug: a.provider_id, destinationUrl: a.destination_url!, network: a.network ?? null, status: a.status ?? 'active' })
      .onConflictDoUpdate({ target: schema.affiliateLinks.slug, set: { destinationUrl: a.destination_url!, network: a.network ?? null, status: a.status ?? 'active' } });
  }

  console.log(`db:seed — providers ${nProv}, plans ${nPlans}, rates ${AVAILABLE_YEARS.join(',')}, content ${allContent().length}, affiliate programs ${programs.length}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
