import { test, expect } from '@playwright/test';
import { assertNoOverflow, assertRtlHebrew, runAxe, acceptConsentBanner } from './helpers';

/** One representative page per template: RTL/Hebrew, single H1, no overflow at 360px, axe WCAG 2.1 AA. */
const TEMPLATES: [string, string][] = [
  ['home', '/'],
  ['compare', '/compare/green-invoice-vs-morning'],
  ['compare-regulated', '/compare/pension-vs-management-insurance'],
  ['best', '/best/best-invoicing-osek-patur'],
  ['review', '/reviews/icount'],
  ['category', '/category/invoicing'],
  ['guide', '/guides/setup/open-osek-patur'],
  ['article', '/articles/accounting-document-types'],
  ['calculator', '/calculators/vat'],
  ['calculator-k1', '/calculators/atzmai-net'],
  ['tool', '/tools/payslip-decoder'],
  ['lead', '/lead/accountant'],
  ['legal-privacy', '/legal/privacy'],
  ['legal-disclaimer', '/legal/disclaimer'],
  ['hub-compare', '/compare'],
  ['search', '/search'],
  ['not-found', '/this-page-does-not-exist'],
];

for (const [name, path] of TEMPLATES) {
  test(`template ${name} (${path})`, async ({ page }, info) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(name === 'not-found' ? 404 : 200);
    await assertRtlHebrew(page);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('footer')).toBeVisible();
    await acceptConsentBanner(page, 'reject');
    if (info.project.name === 'mobile-360') await assertNoOverflow(page);
    // calculator pages open the first-run disclaimer modal: acknowledge so axe sees the page itself too
    const modal = page.getByTestId('calc-disclaimer-modal');
    if (await modal.isVisible().catch(() => false)) {
      await runAxe(page); // axe on the open dialog
      await page.keyboard.press('Escape');
    }
    await runAxe(page);
  });
}
