// AdSense slot configuration. Slot ids come from env (NEXT_PUBLIC_ADSENSE_SLOT_AD_1…5); no slot id ⇒ nothing renders.
// Auto-ads are OFF: units are placed manually through <AdSlot>, only after advertising consent.
export type AdId = 'AD-1' | 'AD-2' | 'AD-3' | 'AD-4' | 'AD-5';

export interface AdSlotConfig {
  id: AdId;
  label: string;
  /** reserved heights in px (prevents CLS) */
  minHeight: { base: number; md: number };
  format: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  /** where the layout may place it */
  placement: string;
  /** desktop only? */
  desktopOnly?: boolean;
}

export const AD_SLOTS: Record<AdId, AdSlotConfig> = {
  'AD-1': { id: 'AD-1', label: 'Leaderboard 970×90 / 320×100', minHeight: { base: 100, md: 90 }, format: 'horizontal', placement: 'after first content block, never above H1' },
  'AD-2': { id: 'AD-2', label: 'Sidebar 300×600 (sticky)', minHeight: { base: 0, md: 600 }, format: 'vertical', placement: 'desktop sidebar', desktopOnly: true },
  'AD-3': { id: 'AD-3', label: 'In-article (after section 2)', minHeight: { base: 280, md: 280 }, format: 'rectangle', placement: 'in-article' },
  'AD-4': { id: 'AD-4', label: 'In-article (mid)', minHeight: { base: 280, md: 280 }, format: 'rectangle', placement: 'in-article' },
  'AD-5': { id: 'AD-5', label: 'Before FAQ', minHeight: { base: 280, md: 250 }, format: 'auto', placement: 'before FAQ' },
};

/** Density guardrails (blueprint §1.4.2): ≤3 units visible per desktop viewport, ≤2 on mobile; ≥24px from CTAs. */
export const AD_RULES = {
  maxPerViewportDesktop: 3,
  maxPerViewportMobile: 2,
  minDistanceFromCtaPx: 24,
  neverAboveH1: true,
  neverInsideCalculatorInputs: true,
  autoAds: false,
} as const;

export function adClient(): string | undefined {
  const v = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  return v && /^ca-pub-\d+$/.test(v) ? v : undefined;
}

export function adSlotId(id: AdId): string | undefined {
  // NEXT_PUBLIC vars are inlined statically, so list them explicitly.
  const map: Record<AdId, string | undefined> = {
    'AD-1': process.env.NEXT_PUBLIC_ADSENSE_SLOT_AD_1,
    'AD-2': process.env.NEXT_PUBLIC_ADSENSE_SLOT_AD_2,
    'AD-3': process.env.NEXT_PUBLIC_ADSENSE_SLOT_AD_3,
    'AD-4': process.env.NEXT_PUBLIC_ADSENSE_SLOT_AD_4,
    'AD-5': process.env.NEXT_PUBLIC_ADSENSE_SLOT_AD_5,
  };
  const v = map[id];
  return v && /^\d+$/.test(v) ? v : undefined;
}
