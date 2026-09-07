/**
 * THE contrast gate (SPEC §4, docs/DESIGN_GUIDE.md §2.3). Asserts that every text
 * token pair clears WCAG AA (4.5:1) on both bg and surface in every mode, that
 * High-contrast genuinely aims higher, and that status dots clear the 3.0:1 UI
 * threshold. Runs against the real tokens.css, so it fails the moment any value
 * regresses below the floor.
 */
import { describe, expect, it } from 'vitest';
import { contrastRatio } from './helpers/contrast';
import { palettes, darkPalettes } from './helpers/parse-tokens';
import type { ColorRole } from '../src/tokens/roles';

const AA_TEXT = 4.5; // normal-size text (WCAG AA)
const UI_NON_TEXT = 3.0; // dots, focus rings, component boundaries
const HC_PRIMARY = 7.0; // High-contrast primary ink must clearly exceed AA (≈ AAA)

/** Text roles that must be legible wherever body/label text is placed (AA in every mode). */
const TEXT_ROLES: ColorRole[] = ['ink', 'ink-soft', 'ink-faint', 'accent'];
/** Primary ink roles that High-contrast holds to a higher (AAA) bar. */
const HC_PRIMARY_ROLES: ColorRole[] = ['ink', 'ink-soft', 'ink-faint'];
/** Status dot colors (non-text cue, always paired with a label). */
const DOT_ROLES: ColorRole[] = ['positive', 'warning', 'accent', 'ink-faint'];

describe('text tokens meet WCAG AA in every mode', () => {
  for (const { mode, palette } of palettes) {
    describe(mode, () => {
      for (const role of TEXT_ROLES) {
        it(`${role} on bg ≥ ${AA_TEXT}:1`, () => {
          expect(contrastRatio(palette[role], palette.bg)).toBeGreaterThanOrEqual(AA_TEXT);
        });
        it(`${role} on surface ≥ ${AA_TEXT}:1`, () => {
          expect(contrastRatio(palette[role], palette.surface)).toBeGreaterThanOrEqual(AA_TEXT);
        });
      }

      for (const role of DOT_ROLES) {
        it(`${role} dot on bg ≥ ${UI_NON_TEXT}:1`, () => {
          expect(contrastRatio(palette[role], palette.bg)).toBeGreaterThanOrEqual(UI_NON_TEXT);
        });
      }
    });
  }
});

describe('High-contrast aims higher (primary ink ≈ AAA)', () => {
  const hc = palettes.find((p) => p.mode === 'high-contrast')!.palette;
  for (const role of HC_PRIMARY_ROLES) {
    it(`${role} on bg ≥ ${HC_PRIMARY}:1`, () => {
      expect(contrastRatio(hc[role], hc.bg)).toBeGreaterThanOrEqual(HC_PRIMARY);
    });
  }
});

describe('mode consistency', () => {
  it('System-auto dark palette equals the explicit Dark palette', () => {
    expect(darkPalettes.auto).toEqual(darkPalettes.explicit);
  });
});
