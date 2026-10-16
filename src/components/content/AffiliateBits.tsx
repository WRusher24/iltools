// Client-safe affiliate primitives (no data/fs imports) — shared by server and client components.
export function goHref(providerId: string, page: string, slot: string): string {
  return `/go/${providerId}?p=${encodeURIComponent(page)}&s=${encodeURIComponent(slot)}`;
}

/** Label required next to every monetised item (DISC-SPONSORED: "שותף" next to affiliate links, "ממומן" for paid items). */
export function SponsorBadge({ kind = 'שותף' }: { kind?: 'שותף' | 'ממומן' | 'בשיתוף' | 'פרסומת' }) {
  return (
    <span className="badge ms-1 align-middle" data-testid="sponsor-badge">
      {kind}
    </span>
  );
}
