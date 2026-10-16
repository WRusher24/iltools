// Provider-agnostic email: Resend REST API when RESEND_API_KEY is set; otherwise a no-op that never logs message content.
import { env } from './env';
import { siteUrl } from '@/lib/site';

export interface Mail { to: string; subject: string; html: string; text: string; headers?: Record<string, string> }

export async function sendMail(m: Mail): Promise<boolean> {
  const e = env();
  if (!e.RESEND_API_KEY || !e.EMAIL_FROM) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${e.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: e.EMAIL_FROM, to: [m.to], subject: m.subject, html: m.html, text: m.text, headers: m.headers }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Hebrew RTL email shell (inline styles only; no remote assets). */
export function rtlEmail(title: string, bodyHtml: string, footerHtml = ''): string {
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f3f6fa;font-family:Arial,Heebo,sans-serif;direction:rtl;text-align:right">
<table role="presentation" width="100%" style="padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" style="max-width:600px;background:#fff;border-radius:12px;padding:24px;direction:rtl;text-align:right">
<tr><td><h1 style="font-size:22px;color:#0b2545;margin:0 0 12px">${esc(title)}</h1>${bodyHtml}${footerHtml}</td></tr></table></td></tr></table></body></html>`;
}

export function newsletterConfirmMail(email: string, token: string): Mail {
  const link = `${siteUrl()}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
  return {
    to: email,
    subject: 'אישור הרשמה לניוזלטר של IL-Tools',
    text: `התקבלה בקשה להרשמה לניוזלטר של IL-Tools. כדי להשלים את ההרשמה אשרו את הכתובת בקישור: ${link}\nאם לא ביקשתם להירשם, התעלמו מההודעה ולא תישלחנה אליכם הודעות.`,
    html: rtlEmail(
      'אישור הרשמה לניוזלטר',
      `<p>התקבלה בקשה להרשמה לניוזלטר של IL-Tools. כדי להשלים את ההרשמה, אשרו את הכתובת:</p>
<p><a href="${esc(link)}" style="display:inline-block;background:#0b2545;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">אישור ההרשמה</a></p>
<p style="font-size:13px;color:#4b5563">אם לא ביקשתם להירשם, התעלמו מהודעה זו ולא תישלחנה אליכם הודעות.</p>`,
    ),
  };
}

export function leadConfirmMail(email: string): Mail {
  return {
    to: email,
    subject: 'קיבלנו את פנייתך — IL-Tools',
    text: 'קיבלנו את פנייתך והעברנו אותה, בהתאם להסכמתך, לבעל/ת מקצוע מורשה/ית. IL-Tools אינו נותן ייעוץ ואינו צד להתקשרות עם בעל/ת המקצוע. ניתן לבקש מחיקת הפרטים בכל עת דרך עמוד יצירת הקשר.',
    html: rtlEmail(
      'קיבלנו את פנייתך',
      `<p>קיבלנו את פנייתך והעברנו אותה, בהתאם להסכמתך, לבעל/ת מקצוע מורשה/ית.</p>
<p>IL-Tools אינו נותן ייעוץ ואינו צד להתקשרות עם בעל/ת המקצוע. ניתן לבקש מחיקת הפרטים בכל עת דרך <a href="${esc(siteUrl())}/contact">עמוד יצירת הקשר</a>.</p>`,
    ),
  };
}
