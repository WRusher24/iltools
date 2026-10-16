import Link from 'next/link';
import { t } from '@/lib/ui';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center" data-testid="not-found">
      <h1 className="text-4xl font-extrabold">{t('error404.title')}</h1>
      <p className="my-4 text-lg">{t('error404.message')}</p>
      <Link className="btn btn-primary" href="/">{t('error404.cta')}</Link>
    </div>
  );
}
