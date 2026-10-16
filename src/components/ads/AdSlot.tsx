'use client';
import { useEffect, useRef, useState } from 'react';
import { AD_SLOTS, adClient, adSlotId, type AdId } from '@/config/ads';
import { useConsent } from '@/components/consent/ConsentManager';
import { trackEvent } from '@/lib/analytics';

/**
 * Manual AdSense unit. Renders nothing unless: publisher id + slot id are configured AND advertising consent was given.
 * Reserved min-height per breakpoint (no CLS); lazy: the unit is requested only when it approaches the viewport.
 * Never place inside a calculator input area or above the H1 (enforced by <ContentLayout>, see src/config/ads.ts).
 */
export function AdSlot({ id, className = '' }: { id: AdId; className?: string }) {
  const { consent, ready } = useConsent();
  const ref = useRef<HTMLDivElement>(null);
  const [pushed, setPushed] = useState(false);
  const cfg = AD_SLOTS[id];
  const client = adClient();
  const slot = adSlotId(id);
  const enabled = ready && !!consent?.advertising && !!client && !!slot;

  useEffect(() => {
    if (!enabled || pushed || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setPushed(true);
            trackEvent('adslot_view', { slot: id });
          } catch {
            /* ad blockers */
          }
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, pushed, id]);

  if (!enabled) return null;
  return (
    <aside
      aria-label="פרסומת"
      data-ad-slot={id}
      className={`my-8 ${cfg.desktopOnly ? 'hidden md:block' : ''} ${className}`}
      style={{ ['--ad-h' as string]: `${cfg.minHeight.base}px`, ['--ad-h-md' as string]: `${cfg.minHeight.md}px` }}
    >
      <p className="mb-1 text-xs text-muted">פרסומת</p>
      <div ref={ref} className="ad-box overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: 'inherit' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={cfg.format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
