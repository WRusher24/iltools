import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

const STATES: Record<string, { title: string; body: string }> = {
  confirmed: { title: 'ההרשמה אושרה', body: 'תודה! הכתובת אושרה ותקבלו את הניוזלטר של IL-Tools. כל הודעה תכלול קישור להסרה בלחיצה אחת.' },
  unsubscribed: { title: 'הוסרתם מרשימת הדיוור', body: 'הכתובת הוסרה מרשימת הדיוור ולא תישלחנה אליה הודעות נוספות.' },
  invalid: { title: 'הקישור אינו תקף', body: 'הקישור שגוי או שכבר נעשה בו שימוש. אפשר להירשם מחדש מתחתית כל עמוד.' },
  unavailable: { title: 'השירות אינו זמין כרגע', body: 'לא ניתן לבצע את הפעולה כרגע. נסו שוב מאוחר יותר.' },
};
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(STATES).map((state) => ({ state }));
type P = { params: Promise<{ state: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { state } = await params;
  return buildMetadata({ path: `/newsletter/${state}`, title: STATES[state]?.title ?? 'ניוזלטר', description: 'ניהול ההרשמה לניוזלטר של IL-Tools.', robots: 'noindex, nofollow' });
}
export default async function Page({ params }: P) {
  const { state } = await params;
  const s = STATES[state];
  if (!s) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">{s.title}</h1>
      <p className="my-4 text-lg">{s.body}</p>
      <Link className="btn btn-primary" href="/">חזרה לדף הבית</Link>
    </div>
  );
}
