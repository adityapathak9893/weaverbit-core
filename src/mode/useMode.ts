'use client';

import { useContext } from 'react';
import { ModeContext, type ModeContextValue } from './ModeProvider';

/**
 * Read the current display mode and the setter. Must be called inside a
 * <ModeProvider> (e.g. the ModeSwitcher, or product code that wants to react to
 * the mode). Throws a clear error otherwise rather than silently no-op'ing.
 */
export function useMode(): ModeContextValue {
  const context = useContext(ModeContext);
  if (context === null) {
    throw new Error('useMode must be used within a <ModeProvider> from weaverbit-core.');
  }
  return context;
}
