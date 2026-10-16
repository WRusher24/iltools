// Site-wide constants. Owner facts are NOT invented here; unfilled facts live in legal texts as "[...]" blanks (see BLOCKERS.md).
export const SITE = {
  name: 'IL-Tools',
  nameHe: 'IL-Tools',
  tagline: 'המרכז הישראלי להשוואת כלים פיננסיים ועסקיים',
  domain: 'il-tools.co.il',
  locale: 'he_IL',
  hreflang: 'he-IL',
  editorialAuthor: 'צוות המערכת של IL-Tools',
} as const;

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://il-tools.co.il';
  return raw.replace(/\/+$/, '');
}

/** Staging/preview hosts must never be indexed (TECH_SEO_SPEC §3). */
export function isProductionSite(): boolean {
  if (process.env.NEXT_PUBLIC_FORCE_NOINDEX === '1') return false;
  return (process.env.VERCEL_ENV ?? 'production') === 'production';
}
