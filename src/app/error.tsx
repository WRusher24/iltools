'use client';
import he from '../../content/ui/he.json';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center" role="alert">
      <h1 className="text-4xl font-extrabold">{he['error500.title']}</h1>
      <p className="my-4 text-lg">{he['error500.message']}</p>
      <button type="button" className="btn btn-primary" onClick={reset}>{he['error500.cta']}</button>
    </div>
  );
}
