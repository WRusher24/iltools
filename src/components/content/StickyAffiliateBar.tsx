'use client';
import { useEffect, useState } from 'react';
import { goHref, SponsorBadge } from './AffiliateBits';

/** AFF-3: mobile sticky CTA. Appears after 40% scroll, dismissible, hidden while the consent banner is open (never covers it). */
export function StickyAffiliateBar({ providerId, page }: { providerId: string; page: string }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setVisible(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) > 0.4);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible || dismissed) return null;
  return (
    <div role="region" aria-label="הצעה" className="sticky-aff fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-2 border-t-2 border-brand bg-surface p-3 md:hidden">
      <a className="btn btn-cta" href={goHref(providerId, page, 'AFF-3')} rel="sponsored nofollow noopener" target="_blank">בדקו מחיר באתר הספק</a>
      <SponsorBadge />
      <button type="button" className="btn btn-ghost" onClick={() => setDismissed(true)} aria-label="סגירה">✕</button>
    </div>
  );
}
