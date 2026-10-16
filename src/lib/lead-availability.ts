import { unstable_cache } from 'next/cache';
import type { LeadType } from './lead-schema';
import { eligiblePartners } from '@/server/leads';

/** True only when at least one ACTIVE + licence-verified partner covers this lead type. Any DB trouble ⇒ false ("בקרוב"). */
export const leadAvailable = unstable_cache(
  async (type: LeadType): Promise<boolean> => {
    try {
      return (await eligiblePartners(type)).length > 0;
    } catch {
      return false;
    }
  },
  ['lead-available'],
  { revalidate: 300, tags: ['lead-partners'] },
);
