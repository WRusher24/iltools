'use client';
import he from '../../content/ui/he.json';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '4rem 1rem' }}>
        <h1>{he['error500.title']}</h1>
        <p>{he['error500.message']}</p>
        <button type="button" onClick={reset} style={{ padding: '0.75rem 1.25rem', fontSize: '1rem' }}>{he['error500.cta']}</button>
      </body>
    </html>
  );
}
