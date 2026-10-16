import { test, expect } from '@playwright/test';
import { LEGAL, plain, norm, acceptConsentBanner } from './helpers';

const DATE_RE = /\{date\}|\{sources\}|\{\{[^}]*\}\}/;

test('footer renders DISC-GENERAL verbatim on every sampled route', async ({ page }) => {
  for (const path of ['/', '/compare/green-invoice-vs-morning', '/calculators/vat', '/legal/terms']) {
    await page.goto(path);
    const footer = norm(await page.locator('footer').innerText());
    expect(footer, path).toContain(plain(LEGAL['DISC-GENERAL'].markdown));
  }
});

test('footer has the full legal link set + cookie preferences link', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  for (const href of ['/legal/disclaimer', '/legal/terms', '/legal/privacy', '/legal/affiliate-disclosure', '/legal/cookies', '/legal/accessibility', '/methodology', '/editorial-policy']) {
    await expect(footer.locator(`a[href="${href}"]`).first()).toBeVisible();
  }
  await expect(footer.getByTestId('consent-prefs-link')).toBeVisible();
});

test('affiliate strip (above the fold) on pages with affiliate tokens, with DISC-AFFILIATE-STRIP text', async ({ page }) => {
  await page.goto('/compare/green-invoice-vs-morning');
  const strip = page.getByTestId('affiliate-strip');
  await expect(strip).toBeVisible();
  expect(norm(await strip.innerText())).toBe(plain(LEGAL['DISC-AFFILIATE-STRIP'].markdown));
  const box = await strip.boundingBox();
  expect(box!.y + box!.height).toBeLessThan(page.viewportSize()!.height);
  // affiliate links carry the required rel and the in-card label
  const link = page.locator('a[data-affiliate="true"]').first();
  await expect(link).toHaveAttribute('rel', 'sponsored nofollow noopener');
  await expect(link).toHaveAttribute('href', /^\/go\//);
});

test('regulated page: DISC-PENSION shown, NO affiliate/paid module (L-UI-07, CONFLICTS_LOG #1)', async ({ page }) => {
  await page.goto('/compare/pension-vs-management-insurance');
  expect(norm(await page.getByTestId('disc-pension').innerText())).toBe(plain(LEGAL['DISC-PENSION'].markdown));
  await expect(page.getByTestId('affiliate-strip')).toHaveCount(0);
  await expect(page.locator('a[rel*="sponsored"]')).toHaveCount(0);
  await expect(page.getByTestId('top-pick-card')).toHaveCount(0);
  await expect(page.getByTestId('regulated-info-module')).toBeVisible();
  await expect(page.getByTestId('disc-compare')).toBeVisible();
});

test('compare page shows DISC-COMPARE and DISC-EDITORIAL-INDEPENDENCE; stamp shows a real date', async ({ page }) => {
  await page.goto('/compare/green-invoice-vs-morning');
  expect(norm(await page.getByTestId('disc-compare').innerText())).toBe(plain(LEGAL['DISC-COMPARE'].markdown));
  expect(norm(await page.getByTestId('disc-editorial').innerText())).toBe(plain(LEGAL['DISC-EDITORIAL-INDEPENDENCE'].markdown));
  const stamp = norm(await page.getByTestId('updated-stamp').first().innerText());
  expect(stamp).not.toMatch(DATE_RE);
  expect(stamp).toMatch(/2026/);
});

test('consent banner: exact text, all non-essential OFF by default, nothing third-party loads before consent', async ({ page }) => {
  const thirdParty: string[] = [];
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost')) thirdParty.push(r.url()); });
  await page.goto('/');
  const banner = page.getByTestId('consent-banner');
  await expect(banner).toBeVisible();
  const expected = plain(LEGAL['LEGAL-COOKIE-BANNER'].markdown).split('[אישור הכל]')[0].trim();
  expect(norm(await banner.getByTestId('consent-banner-text').innerText())).toContain(expected.replace(/\s+/g, ' '));
  await banner.getByRole('button', { name: 'העדפות' }).click();
  for (const k of ['analytics', 'advertising', 'affiliate']) await expect(page.locator(`#consent-${k}`)).not.toBeChecked();
  await page.waitForTimeout(500);
  expect(thirdParty.filter((u) => /google|doubleclick|googletagmanager|googlesyndication/.test(u))).toEqual([]);
  await banner.getByRole('button', { name: 'שמירת העדפות' }).click();
  await expect(banner).toBeHidden();
  // choice persists
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('il_consent') || 'null'));
  expect(stored).toMatchObject({ analytics: false, advertising: false, affiliate: false });
  await page.reload();
  await expect(page.getByTestId('consent-banner')).toBeHidden();
  // preferences re-open from the footer
  await page.getByTestId('consent-prefs-link').click();
  await expect(page.getByTestId('consent-banner')).toBeVisible();
});

test('calculator disclaimer modal: mapped class text, first run only, Esc closes, re-prompt on version change', async ({ page }) => {
  await page.goto('/calculators/atzmai-net'); // class TAX
  await acceptConsentBanner(page, 'reject');
  const modal = page.getByTestId('calc-disclaimer-modal');
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute('role', 'dialog');
  await expect(modal).toHaveAttribute('aria-modal', 'true');
  expect(norm(await modal.innerText())).toContain(plain(LEGAL['DISC-CALC-TAX'].markdown));
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  const ack = await page.evaluate(() => JSON.parse(localStorage.getItem('il_calc_disc_TAX') || 'null'));
  expect(ack?.version).toBe(LEGAL['DISC-CALC-TAX'].version);
  // persistent short line near the result
  expect(norm(await page.getByTestId('calc-disclaimer-persistent').innerText())).toContain(plain(LEGAL['DISC-CALC-TAX'].markdown));
  await page.reload();
  await expect(page.getByTestId('calc-disclaimer-modal')).toBeHidden();
  // version change → re-prompt
  await page.evaluate(() => localStorage.setItem('il_calc_disc_TAX', JSON.stringify({ version: '0.0', date: '2000-01-01' })));
  await page.reload();
  await expect(page.getByTestId('calc-disclaimer-modal')).toBeVisible();
});

test('every /legal/* route renders its texts verbatim (placeholders substituted, no raw {date}/{sources}/{{…}})', async ({ page }) => {
  const routes: Record<string, string[]> = {
    disclaimer: ['DISC-FULL'], terms: ['LEGAL-TERMS'], privacy: ['LEGAL-PRIVACY'], 'affiliate-disclosure': ['DISC-AFFILIATE-FULL'], cookies: ['LEGAL-COOKIES', 'DISC-ADSENSE'], accessibility: ['LEGAL-ACCESSIBILITY'],
  };
  for (const [slug, ids] of Object.entries(routes)) {
    await page.goto(`/legal/${slug}`);
    const text = norm(await page.getByTestId(`legal-page-${slug}`).innerText());
    expect(text, slug).not.toMatch(DATE_RE);
    for (const id of ids) {
      // compare the first two substantive sentences of each text
      const sample = plain(LEGAL[id].markdown).replace(/\{\{[^}]*\}\}|\{date\}|\{sources\}/g, '').split(/(?<=[.!?:])\s/).filter((x) => x.length > 25 && !/\[/.test(x)).slice(0, 2);
      for (const s of sample) expect(text, `${slug}/${id}`).toContain(norm(s));
    }
  }
});

test('lead page: waitlist ("בקרוב") when no verified partner exists — no form, no fake routing', async ({ page }) => {
  await page.goto('/lead/accountant');
  await expect(page.getByTestId('lead-waitlist')).toBeVisible();
  await expect(page.getByTestId('lead-form')).toHaveCount(0);
});
