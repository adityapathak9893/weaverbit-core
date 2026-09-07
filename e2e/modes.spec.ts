/**
 * In-browser verification of the brand in all four explicit looks + System-auto
 * (SPEC §6 — "the build isn't done until each block is checked in each mode"). For a
 * package this is the e2e: drive the demo, switch every mode, assert the building
 * blocks render and that body text actually meets AA against the live computed
 * colors, and confirm the no-flash script applies the stored mode before paint.
 * Screenshots are captured per mode as artifacts for the human eye.
 */
import { test, expect, type Page } from '@playwright/test';

// Redefined locally (not imported from src) on purpose: importing the package would
// pull "use client" React modules into the Playwright Node runner. The shipped list is
// covered against this drift by tests/mode.test.tsx (which iterates EXPLICIT_MODES).
const EXPLICIT_MODES = ['light', 'dark', 'high-contrast', 'dim'] as const;

/** WCAG relative luminance / contrast, computed on live rendered colors. */
function luminance(rgb: [number, number, number]): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}
function contrast(a: [number, number, number], b: [number, number, number]): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
function parseRgb(value: string): [number, number, number] {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (m === null || m[1] === undefined) throw new Error(`cannot parse color: ${value}`);
  const parts = m[1].split(',').map((n) => parseFloat(n));
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

/** Read the computed color + background-color of an element by selector. */
async function colorsOf(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return { color: cs.color, background: cs.backgroundColor };
    });
}

// Run under reduced motion. The package honors it by disabling the mode colour
// cross-fade, so computed styles are FINAL immediately after a mode switch —
// otherwise getComputedStyle can read a mid-transition (interpolated) colour and the
// contrast assertions flake. This also exercises the reduced-motion path.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('display modes', () => {
  for (const mode of EXPLICIT_MODES) {
    test(`renders the building blocks and meets AA in ${mode}`, async ({ page }, testInfo) => {
      await page.goto('/');
      // Switch via the real control, the way a visitor would.
      const labels: Record<string, string> = {
        light: 'Light',
        dark: 'Dark',
        'high-contrast': 'Contrast',
        dim: 'Dim',
      };
      await page.getByRole('button', { name: labels[mode] }).click();
      await expect(page.locator('html')).toHaveAttribute('data-mode', mode);

      // Every building block is present. (The demo shows the wordmark in the Nav and
      // again as a standalone showcase, so scope this one to the Nav.)
      await expect(
        page.getByRole('navigation', { name: 'Primary' }).getByText('weaverbit'),
      ).toBeVisible();
      await expect(page.getByRole('group', { name: 'Display mode' })).toBeVisible();
      await expect(page.getByText('Live')).toBeVisible();
      await expect(page.locator('.wb-prose')).toBeVisible();
      await expect(page.locator('.wb-footer')).toBeVisible();

      // Body ink on the page background must clear AA against the LIVE colors.
      const body = await colorsOf(page, 'body');
      expect(contrast(parseRgb(body.color), parseRgb(body.background))).toBeGreaterThanOrEqual(4.5);

      // Prose link (accent) must clear AA too.
      const link = await colorsOf(page, '.wb-prose a');
      expect(contrast(parseRgb(link.color), parseRgb(body.background))).toBeGreaterThanOrEqual(4.5);

      await page.screenshot({
        path: testInfo.outputPath(`mode-${mode}.png`),
        fullPage: true,
      });
    });
  }

  test('System-auto uses no explicit attribute', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Auto' }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-mode', /.+/);
  });
});

test.describe('no-flash', () => {
  test('applies the stored mode before paint on reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.setItem('wb-mode', 'dim'));
    await page.reload();
    // The inline head script must have set the attribute synchronously, before React.
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dim');
  });
});

test.describe('keyboard accessibility', () => {
  test('mode options are reachable and operable by keyboard', async ({ page }) => {
    await page.goto('/');
    const dark = page.getByRole('button', { name: 'Dark' });
    await dark.focus();
    await expect(dark).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  });
});
