'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { NavGroup } from '@/config/nav';

export function SiteNav({ nav, labels }: { nav: NavGroup[]; labels: { open: string; close: string; menu: string } }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpenIdx(null);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenIdx(null);
        if (drawer) {
          setDrawer(false);
          toggleRef.current?.focus();
        }
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenIdx(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [drawer]);

  // Drawer focus management: trap Tab inside while open.
  useEffect(() => {
    if (!drawer) return;
    const el = drawerRef.current;
    const focusables = () => Array.from(el?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? []);
    focusables()[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', trap); document.body.style.overflow = ''; };
  }, [drawer]);

  return (
    <>
      {/* Desktop mega-menu: first item at the right edge (RTL flow) */}
      <nav ref={navRef} aria-label="ניווט ראשי" className="hidden lg:block">
        <ul className="m-0 flex list-none items-center gap-1 p-0">
          {nav.map((g, i) => (
            <li key={g.label} className="relative">
              {g.items ? (
                <>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 font-semibold text-brand hover:bg-surface-2"
                    aria-expanded={openIdx === i}
                    aria-controls={`menu-${i}`}
                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  >
                    {g.label}
                    <span aria-hidden className="text-xs">▾</span>
                  </button>
                  {openIdx === i && (
                    <ul id={`menu-${i}`} className="absolute start-0 top-full z-30 m-0 grid min-w-60 list-none gap-0.5 rounded-lg border border-line bg-surface p-2 shadow-lg">
                      {g.href && (
                        <li><Link className="block rounded px-3 py-2 font-bold hover:bg-surface-2" href={g.href}>כל ה{g.label}</Link></li>
                      )}
                      {g.items.map((it) => (
                        <li key={it.href}><Link className="block rounded px-3 py-2 hover:bg-surface-2" href={it.href}>{it.label}</Link></li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link className="inline-flex min-h-11 items-center rounded-md px-3 font-semibold text-brand hover:bg-surface-2" href={g.href!}>{g.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile drawer: opens from the right (inline-start in RTL) */}
      <button
        ref={toggleRef}
        type="button"
        className="btn btn-ghost lg:hidden"
        aria-expanded={drawer}
        aria-controls="mobile-drawer"
        aria-label={drawer ? labels.close : labels.open}
        onClick={() => setDrawer((v) => !v)}
      >
        <span aria-hidden>☰</span> {labels.menu}
      </button>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" aria-hidden onClick={() => { setDrawer(false); toggleRef.current?.focus(); }} />
          <div
            id="mobile-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={labels.menu}
            className="absolute inset-y-0 start-0 w-[min(22rem,88vw)] overflow-y-auto bg-surface p-4 shadow-2xl"
          >
            <button type="button" className="btn btn-ghost mb-3" onClick={() => { setDrawer(false); toggleRef.current?.focus(); }}>
              ✕ {labels.close}
            </button>
            <ul className="m-0 grid list-none gap-2 p-0">
              {nav.map((g) => (
                <li key={g.label}>
                  {g.items ? (
                    <details>
                      <summary className="cursor-pointer rounded-md px-2 py-2 font-bold text-brand">{g.label}</summary>
                      <ul className="m-0 grid list-none gap-0.5 ps-3">
                        {g.href && <li><Link className="block px-2 py-2 font-semibold" href={g.href}>כל ה{g.label}</Link></li>}
                        {g.items.map((it) => (
                          <li key={it.href}><Link className="block px-2 py-2" href={it.href}>{it.label}</Link></li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <Link className="block rounded-md px-2 py-2 font-bold text-brand" href={g.href!}>{g.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
