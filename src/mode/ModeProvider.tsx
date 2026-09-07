'use client';

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MODES, MODE_STORAGE_KEY, isMode, type Mode } from './types';

export interface ModeContextValue {
  /** The chosen mode. 'system' means "follow the device" (no explicit choice). */
  mode: Mode;
  /** Set (and persist for the session) the display mode. */
  setMode: (mode: Mode) => void;
  /** All selectable modes, for building a switcher. */
  modes: readonly Mode[];
}

export const ModeContext = createContext<ModeContextValue | null>(null);

/** Read the persisted choice, tolerating private-mode/storage errors. */
function readStoredMode(): Mode {
  try {
    const stored = sessionStorage.getItem(MODE_STORAGE_KEY);
    return isMode(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** Apply a mode by toggling [data-mode] on <html>. 'system' = remove the attribute. */
function applyMode(mode: Mode): void {
  const root = document.documentElement;
  if (mode === 'system') {
    root.removeAttribute('data-mode');
  } else {
    root.setAttribute('data-mode', mode);
  }
}

export interface ModeProviderProps {
  children: ReactNode;
  /**
   * Initial mode used for the first (server/SSR) render. Defaults to 'system'. The
   * stored choice is read on mount, so this must match what the server renders to
   * avoid a hydration mismatch — leave it as 'system' unless you have a reason.
   */
  defaultMode?: Mode;
}

/**
 * Provides the current display mode and a setter to descendants, and keeps
 * [data-mode] + sessionStorage in sync. Pair with `noFlashScript` in <head> so the
 * correct theme is painted before React hydrates. (BRAND.md §4b, SPEC §4.)
 */
export function ModeProvider({ children, defaultMode = 'system' }: ModeProviderProps) {
  // Start from defaultMode on BOTH server and first client render (SSR-safe), then
  // reconcile with the stored choice after mount.
  const [mode, setModeState] = useState<Mode>(defaultMode);

  // Reconcile with the persisted choice on mount AND apply it here. We deliberately
  // do NOT have a separate effect that calls applyMode on every `mode` change: that
  // effect would run on the first commit (mode === defaultMode 'system') and strip
  // the [data-mode] the no-flash script already set, causing a one-frame flash before
  // reconciliation. Applying only here (mount) and in setMode (user action) keeps the
  // attribute that the no-flash script painted, so there is no flicker.
  useEffect(() => {
    const stored = readStoredMode();
    setModeState(stored);
    applyMode(stored);
  }, []);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    applyMode(next);
    try {
      sessionStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode / blocked) — the in-memory choice still
      // applies for this page; it just won't survive a reload. Acceptable.
    }
  }, []);

  const value = useMemo<ModeContextValue>(() => ({ mode, setMode, modes: MODES }), [mode, setMode]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}
