'use client';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { S } from './strings';

export interface DisclaimerModalProps {
  /** disclaimer class, e.g. TAX */
  cls: string;
  version: string;
  title: string;
  content: ReactNode;
}

const key = (cls: string) => `il_calc_disc_${cls}`;

function alreadyAcknowledged(cls: string, version: string): boolean {
  try {
    const raw = window.localStorage.getItem(key(cls));
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { version?: string };
    return parsed.version === version;
  } catch {
    return false;
  }
}

function persist(cls: string, version: string) {
  try {
    window.localStorage.setItem(key(cls), JSON.stringify({ version, date: new Date().toISOString() }));
  } catch {
    /* storage unavailable: fall through, modal will show again next visit */
  }
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/** First-run disclaimer dialog. Closed on the server and on first client render; opened in an effect. */
export function DisclaimerModal({ cls, version, title, content }: DisclaimerModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!alreadyAcknowledged(cls, version)) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    }
  }, [cls, version]);

  const acknowledge = useCallback(() => {
    persist(cls, version);
    setOpen(false);
  }, [cls, version]);

  // focus management, Esc, focus trap, inert background
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const confirm = dialog?.querySelector<HTMLElement>('[data-autofocus]');
    confirm?.focus();

    const hidden: { el: Element; inert: string | null; ariaHidden: string | null }[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el.hasAttribute('data-calc-disclaimer-root')) continue;
      hidden.push({ el, inert: el.getAttribute('inert'), ariaHidden: el.getAttribute('aria-hidden') });
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        acknowledge();
        return;
      }
      if (e.key !== 'Tab' || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => !n.hasAttribute('disabled'));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      for (const h of hidden) {
        if (h.inert === null) h.el.removeAttribute('inert');
        else h.el.setAttribute('inert', h.inert);
        if (h.ariaHidden === null) h.el.removeAttribute('aria-hidden');
        else h.el.setAttribute('aria-hidden', h.ariaHidden);
      }
      const back = returnFocus.current;
      if (back && document.contains(back)) back.focus();
    };
  }, [open, acknowledge]);

  if (!mounted || !open) return null;
  return createPortal(
    <div data-calc-disclaimer-root="" dir="rtl" className="no-print fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={acknowledge} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="calc-disclaimer-modal"
        className="card relative max-h-[90vh] w-full max-w-xl overflow-y-auto shadow-xl"
      >
        <h2 id={titleId} className="mt-0 text-xl">
          {title}
        </h2>
        <div className="prose-il">{content}</div>
        <div className="mt-4 flex justify-end">
          <button type="button" className="btn btn-primary" data-autofocus="" onClick={acknowledge}>
            {S.disclaimerAck}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
