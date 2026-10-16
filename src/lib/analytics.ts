'use client';
// Consent-gated GA4 event helper. No-op unless analytics consent was granted and gtag is loaded.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    adsbygoogle?: unknown[];
  }
}

export type GaEvent =
  | 'calculator_start'
  | 'calculator_complete'
  | 'affiliate_click'
  | 'lead_submit'
  | 'share_click'
  | 'adslot_view'
  | 'newsletter_submit';

export function trackEvent(name: GaEvent, params: Record<string, string | number | boolean> = {}): void {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    if (!window.__ilAnalyticsGranted) return;
    window.gtag('event', name, params);
  } catch {
    /* analytics must never break the UI */
  }
}

declare global {
  interface Window {
    __ilAnalyticsGranted?: boolean;
  }
}
