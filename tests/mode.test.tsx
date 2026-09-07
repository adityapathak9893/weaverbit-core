/**
 * Mode system internals: the runtime guard, the no-flash script's safety
 * properties, and that useMode requires a provider. ModeProvider's apply/persist
 * behavior is covered through the ModeSwitcher in components.test.tsx.
 */
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { EXPLICIT_MODES, isMode, MODE_STORAGE_KEY, MODES } from '../src';
import { noFlashScript } from '../src';
import { useMode } from '../src';

describe('isMode guard', () => {
  it('accepts every declared mode', () => {
    for (const m of MODES) expect(isMode(m)).toBe(true);
  });
  it('rejects unknown / tampered values', () => {
    expect(isMode('rainbow')).toBe(false);
    expect(isMode(null)).toBe(false);
    expect(isMode(42)).toBe(false);
  });
});

describe('noFlashScript', () => {
  it('reads the storage key and only ever writes the data-mode attribute', () => {
    expect(noFlashScript).toContain(MODE_STORAGE_KEY);
    expect(noFlashScript).toContain("setAttribute('data-mode'");
  });
  it('allow-lists every explicit mode (derived from EXPLICIT_MODES, so it cannot drift)', () => {
    // Iterate the canonical constant — if a mode is added to EXPLICIT_MODES but the
    // script stops covering it, this fails. 'system' is intentionally absent (it is
    // represented by the absence of the attribute).
    for (const m of EXPLICIT_MODES) {
      expect(noFlashScript).toContain(`"${m}":1`);
    }
    expect(noFlashScript).not.toContain('eval');
  });
});

describe('useMode', () => {
  it('throws a clear error when used outside a ModeProvider', () => {
    function Consumer() {
      useMode();
      return null;
    }
    // React logs the thrown render error; silence it to keep test output clean.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/ModeProvider/);
    spy.mockRestore();
  });
});
