/**
 * The Tailwind preset must expose every color role and the type/spacing/radius
 * scales, each pointing at a CSS variable — never a hardcoded value. That is what
 * keeps tokens.css the single source of truth while giving Tailwind products
 * ergonomic utilities. (SYSTEM_DESIGN §2.)
 */
import { describe, expect, it } from 'vitest';
import weaverbitPreset from '../src/tailwind-preset';
import { COLOR_ROLES } from '../src/tokens/roles';

describe('tailwind preset', () => {
  const { colors, fontFamily, fontSize, spacing, borderRadius } = weaverbitPreset.theme.extend;

  it('maps every color role to its CSS variable', () => {
    for (const role of COLOR_ROLES) {
      expect(colors[role]).toBe(`var(--wb-${role})`);
    }
  });

  it('exposes the three font families as variables', () => {
    expect(fontFamily.mono).toBe('var(--wb-font-mono)');
    expect(fontFamily.display).toBe('var(--wb-font-display)');
    expect(fontFamily.sans).toBe('var(--wb-font-body)');
  });

  it('points every scale entry at a token variable (no hardcoded values)', () => {
    for (const map of [fontSize, spacing, borderRadius]) {
      expect(Object.keys(map).length).toBeGreaterThan(0);
      for (const value of Object.values(map)) {
        expect(value).toMatch(/^var\(--wb-/);
      }
    }
  });
});
