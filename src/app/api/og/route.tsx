import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { urlMap } from '@/lib/data';

export const runtime = 'nodejs';

const font = (name: string) => readFileSync(join(process.cwd(), 'src/assets', name));
let fonts: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] | null = null;
function loadFonts() {
  // Heebo (Hebrew + Latin subsets, woff) bundled in the repo — satori needs real font data to shape Hebrew.
  return (fonts ??= [
    { name: 'Heebo', data: font('heebo-hebrew-700-normal.woff'), weight: 700, style: 'normal' },
    { name: 'Heebo', data: font('heebo-hebrew-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'HeeboLatin', data: font('heebo-latin-700-normal.woff'), weight: 700, style: 'normal' },
    { name: 'HeeboLatin', data: font('heebo-latin-400-normal.woff'), weight: 400, style: 'normal' },
  ]);
}

const TYPE_LABEL: Record<string, string> = {
  compare: 'השוואה', best: 'הכי מתאים', review: 'סקירה', guide: 'מדריך', article: 'מאמר', calculator: 'מחשבון', category: 'קטגוריה', page: 'IL-Tools',
};

/**
 * Satori has no bidi engine: it lays glyphs out left-to-right. To get correct Hebrew we convert each logical line to VISUAL order
 * ourselves (reverse Hebrew runs' characters, reverse the order of runs/words) and render it with direction:ltr, right-aligned.
 */
const HEB = /[\u0590-\u05FF]/;
function visualLine(line: string): string {
  const words = line.split(' ');
  const out = words.map((w) => {
    const runs = w.match(/[\u0590-\u05FF]+|[^\u0590-\u05FF]+/g) ?? [w];
    if (!runs.some((r) => HEB.test(r))) return w;
    return runs.map((r) => (HEB.test(r) ? [...r].reverse().join('') : r)).reverse().join('');
  });
  return out.reverse().join(' ');
}
function wrapVisual(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const word of text.split(/\s+/)) {
    if (cur && (cur + ' ' + word).length > maxChars) { lines.push(cur); cur = word; } else cur = cur ? `${cur} ${word}` : word;
  }
  if (cur) lines.push(cur);
  return lines.map(visualLine);
}

const clean = (v: string | null, max: number) => (v ?? '').replace(/[<>{}]/g, '').slice(0, max);

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const type = clean(sp.get('type'), 20) || 'page';
  const slug = clean(sp.get('slug'), 80);
  const entry = urlMap().pages.find((p) => p.slug === slug && (p.type === type || type === 'page' || (type === 'calculator' && p.type === 'calculator')));
  const title = entry?.title ?? 'השוואות ומחשבונים לעצמאים ולעסקים';
  // optional calculator result (ephemeral — rendered into the image, never stored)
  const resultLabel = clean(sp.get('l'), 40);
  const resultValue = clean(sp.get('v'), 24);

  const titleSize = title.length > 40 ? 58 : 70;
  const label = TYPE_LABEL[entry?.type ?? type] ?? 'IL-Tools';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 64,
          background: 'linear-gradient(135deg,#0b2545 0%,#13315c 100%)', color: '#fff', direction: 'rtl', fontFamily: 'Heebo, HeeboLatin',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#f59e0b' }}>{visualLine(label)}</div>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, fontFamily: 'HeeboLatin' }}>IL-Tools</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: titleSize, fontWeight: 700, lineHeight: 1.25, direction: 'ltr' }}>
            {wrapVisual(title, Math.floor(1070 / (titleSize * 0.5))).map((l, i) => (<div key={i} style={{ display: 'flex' }}>{l}</div>))}
          </div>
          {resultValue ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 28, background: '#fff', color: '#0b2545', borderRadius: 20, padding: '18px 28px' }}>
              <div style={{ display: 'flex', fontSize: 30 }}>{visualLine(resultLabel || 'התוצאה')}</div>
              <div style={{ display: 'flex', fontSize: 64, fontWeight: 700 }}>{visualLine(resultValue)}</div>
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#cbd5e1', direction: 'ltr' }}>{visualLine('מידע, השוואה ומחשבונים — לא ייעוץ פיננסי')}</div>
      </div>
    ),
    { width: 1200, height: 630, fonts: loadFonts(), headers: { 'cache-control': 'public, max-age=86400, s-maxage=86400' } },
  );
}
