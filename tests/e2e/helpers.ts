import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export interface LegalText { id: string; version: string; markdown: string }
export const LEGAL: Record<string, LegalText> = Object.fromEntries((JSON.parse(readFileSync('data/legal/legal-texts.json', 'utf8')) as LegalText[]).map((t) => [t.id, t]));

/** Markdown → comparable plain text (legal wording is rendered verbatim; only markup differs). */
export function plain(md: string, vars: Record<string, string> = {}): string {
  let s = md;
  for (const [k, v] of Object.entries(vars)) s = s.split(k).join(v);
  return s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/^[#>\-\s]+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}
export const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

export async function assertRtlHebrew(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
}

export async function assertNoOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(1);
}

export async function runAxe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(summary, 'axe violations').toEqual([]);
}

export async function acceptConsentBanner(page: Page, choice: 'reject' | 'accept' = 'reject') {
  const banner = page.getByTestId('consent-banner');
  if (await banner.isVisible().catch(() => false)) await banner.getByRole('button', { name: choice === 'reject' ? 'דחייה' : 'אישור הכל' }).click();
}
