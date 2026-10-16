'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export const CONSENT_KEY = 'il_consent';
export const CONSENT_VERSION = '1.0';

export interface ConsentState {
  version: string;
  ts: string;
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  affiliate: boolean;
}

interface Ctx {
  consent: ConsentState | null;
  ready: boolean;
  prefsOpen: boolean;
  openPrefs: () => void;
  closePrefs: () => void;
  save: (c: Pick<ConsentState, 'analytics' | 'advertising' | 'affiliate'>) => void;
}
const ConsentCtx = createContext<Ctx | null>(null);

export function useConsent(): Ctx {
  const v = useContext(ConsentCtx);
  if (!v) throw new Error('useConsent outside ConsentProvider');
  return v;
}

function readStored(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as ConsentState;
    // re-consent if the legal text version changed
    return c && c.version === CONSENT_VERSION ? c : null;
  } catch {
    return null;
  }
}

function anonId(): string {
  try {
    let id = localStorage.getItem('il_anon_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('il_anon_id', id);
    }
    return id;
  } catch {
    return 'unknown';
  }
}

function gtagInit() {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
}

/** Consent Mode v2 semantics: everything denied by default, updated on consent. */
function applyConsentMode(c: ConsentState | null) {
  gtagInit();
  const g = (v: boolean) => (v ? 'granted' : 'denied');
  window.gtag!('consent', c ? 'update' : 'default', {
    analytics_storage: g(!!c?.analytics),
    ad_storage: g(!!c?.advertising),
    ad_user_data: g(!!c?.advertising),
    ad_personalization: g(!!c?.advertising),
    wait_for_update: c ? undefined : 500,
  });
  window.__ilAnalyticsGranted = !!c?.analytics;
}

function loadScriptOnce(id: string, src: string, attrs: Record<string, string> = {}) {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.async = true;
  s.src = src;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.head.appendChild(s);
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    const c = readStored();
    setConsent(c);
    applyConsentMode(c);
    setReady(true);
  }, []);

  // Non-essential scripts load ONLY after consent.
  useEffect(() => {
    if (!consent) return;
    const ga = process.env.NEXT_PUBLIC_GA_ID;
    if (consent.analytics && ga && /^G-[A-Z0-9]+$/.test(ga)) {
      loadScriptOnce('il-ga', `https://www.googletagmanager.com/gtag/js?id=${ga}`);
      window.gtag!('js', new Date());
      window.gtag!('config', ga, { anonymize_ip: true });
    }
    const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    if (consent.advertising && client && /^ca-pub-\d+$/.test(client)) {
      loadScriptOnce('il-adsense', `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`, {
        crossorigin: 'anonymous',
      });
    }
  }, [consent]);

  const save = useCallback((c: Pick<ConsentState, 'analytics' | 'advertising' | 'affiliate'>) => {
    const full: ConsentState = { version: CONSENT_VERSION, ts: new Date().toISOString(), necessary: true, ...c };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(full));
      document.cookie = `${CONSENT_KEY}=${encodeURIComponent(`${full.version}:${+full.analytics}${+full.advertising}${+full.affiliate}`)}; Max-Age=31536000; Path=/; SameSite=Lax`;
    } catch {
      /* private mode: choice lasts for this page view only */
    }
    setConsent(full);
    applyConsentMode(full);
    setPrefsOpen(false);
    // anonymous consent log (anon_id only — no IP stored server-side)
    void fetch('/api/consent', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ anon_id: anonId(), version: full.version, analytics: full.analytics, advertising: full.advertising, affiliate: full.affiliate }),
      keepalive: true,
    }).catch(() => undefined);
    window.dispatchEvent(new CustomEvent('il:consent', { detail: full }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({ consent, ready, prefsOpen, openPrefs: () => setPrefsOpen(true), closePrefs: () => setPrefsOpen(false), save }),
    [consent, ready, prefsOpen, save],
  );
  return <ConsentCtx.Provider value={value}>{children}</ConsentCtx.Provider>;
}

export interface BannerProps {
  text: string;
  labels: { acceptAll: string; reject: string; prefs: string };
  policyHref: string;
  ui: {
    save: string; necessary: string; necessaryDesc: string; analytics: string; analyticsDesc: string;
    advertising: string; advertisingDesc: string; affiliate: string; affiliateDesc: string; title: string; close: string; policy: string;
  };
}

/** Bottom-sheet banner (overlay, no reflow). Non-modal: it never traps focus and never covers the top disclosure strip. */
export function ConsentBanner(props: BannerProps) {
  const { consent, ready, prefsOpen, openPrefs, closePrefs, save } = useConsent();
  const [draft, setDraft] = useState({ analytics: false, advertising: false, affiliate: false });
  const dialogRef = useRef<HTMLDivElement>(null);
  const visible = ready && (!consent || prefsOpen);

  useEffect(() => {
    if (prefsOpen && consent) setDraft({ analytics: consent.analytics, advertising: consent.advertising, affiliate: consent.affiliate });
  }, [prefsOpen, consent]);

  const [showPrefs, setShowPrefs] = useState(false);
  useEffect(() => {
    if (prefsOpen) {
      setShowPrefs(true);
      requestAnimationFrame(() => dialogRef.current?.focus());
    }
  }, [prefsOpen]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && consent) closePrefs();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, consent, closePrefs]);

  if (!visible) return null;
  const { ui } = props;
  const row = (k: 'analytics' | 'advertising' | 'affiliate', label: string, desc: string) => (
    <div className="flex items-start gap-3" key={k}>
      <input id={`consent-${k}`} type="checkbox" className="mt-1.5 h-5 w-5 shrink-0" checked={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.checked })} />
      <label htmlFor={`consent-${k}`} className="cursor-pointer">
        <span className="font-semibold">{label}</span>
        <span className="block text-sm text-muted">{desc}</span>
      </label>
    </div>
  );

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label={ui.title}
      data-testid="consent-banner"
      className="consent-banner fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto border-t-2 border-brand bg-surface p-4 shadow-[0_-6px_24px_rgba(0,0,0,.15)] md:inset-x-auto md:bottom-4 md:end-4 md:w-[28rem] md:rounded-xl md:border-2"
    >
      <p className="mb-3 text-[0.95rem]" data-testid="consent-banner-text">
        {props.text}{' '}
        <a className="underline text-teal" href={props.policyHref}>{ui.policy}</a>
      </p>
      {showPrefs && (
        <div className="mb-3 grid gap-3 rounded-lg bg-surface-2 p-3">
          <div className="flex items-start gap-3">
            <input type="checkbox" checked disabled className="mt-1.5 h-5 w-5 shrink-0" id="consent-necessary" />
            <label htmlFor="consent-necessary"><span className="font-semibold">{ui.necessary}</span><span className="block text-sm text-muted">{ui.necessaryDesc}</span></label>
          </div>
          {row('analytics', ui.analytics, ui.analyticsDesc)}
          {row('advertising', ui.advertising, ui.advertisingDesc)}
          {row('affiliate', ui.affiliate, ui.affiliateDesc)}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {showPrefs ? (
          <button type="button" className="btn btn-primary" onClick={() => save(draft)}>{ui.save}</button>
        ) : (
          <>
            <button type="button" className="btn btn-primary" onClick={() => save({ analytics: true, advertising: true, affiliate: true })}>{props.labels.acceptAll}</button>
            <button type="button" className="btn btn-ghost" onClick={() => save({ analytics: false, advertising: false, affiliate: false })}>{props.labels.reject}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowPrefs(true); openPrefs(); }}>{props.labels.prefs}</button>
          </>
        )}
        {consent && <button type="button" className="btn btn-ghost" onClick={closePrefs}>{ui.close}</button>}
      </div>
    </div>
  );
}

export function ConsentPrefsButton({ children, className }: { children: ReactNode; className?: string }) {
  const { openPrefs } = useConsent();
  return (
    <button type="button" className={className} onClick={openPrefs} data-testid="consent-prefs-link">
      {children}
    </button>
  );
}
