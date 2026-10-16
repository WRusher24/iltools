import localFont from 'next/font/local';

// Self-hosted (woff2 committed in src/fonts, SIL OFL). Hebrew + Latin are separate families so each loads only when its glyphs are used.
export const heeboHe = localFont({
  src: [
    { path: '../fonts/heebo-hebrew-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/heebo-hebrew-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-heebo-he',
  display: 'swap',
});
export const heeboLatin = localFont({
  src: [
    { path: '../fonts/heebo-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/heebo-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-heebo-latin',
  display: 'swap',
});
export const assistantHe = localFont({
  src: [{ path: '../fonts/assistant-hebrew-700-normal.woff2', weight: '700', style: 'normal' }],
  variable: '--font-assistant-he',
  display: 'swap',
  preload: false,
});
export const assistantLatin = localFont({
  src: [{ path: '../fonts/assistant-latin-700-normal.woff2', weight: '700', style: 'normal' }],
  variable: '--font-assistant-latin',
  display: 'swap',
  preload: false,
});
