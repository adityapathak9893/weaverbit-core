'use client';

import { cx } from '../../internal/cx';
import { useMode } from '../../mode/useMode';
import type { Mode } from '../../mode/types';

/** Short, human labels for each mode. Kept terse so the control stays compact. */
const MODE_LABELS: Record<Mode, string> = {
  system: 'Auto',
  light: 'Light',
  dark: 'Dark',
  'high-contrast': 'Contrast',
  dim: 'Dim',
};

export interface ModeSwitcherProps {
  className?: string;
  /** Accessible name for the group of buttons. */
  label?: string;
}

/**
 * The control that switches display mode (all five; System-auto default). Rendered
 * as a group of toggle buttons using aria-pressed for the current selection, so it's
 * fully keyboard- and screen-reader-operable. Must live under a <ModeProvider>.
 * (SPEC §5, BRAND.md §4b.)
 */
export function ModeSwitcher({ className, label = 'Display mode' }: ModeSwitcherProps) {
  const { mode, setMode, modes } = useMode();

  return (
    <div role="group" aria-label={label} className={cx('wb-mode-switcher', className)}>
      {modes.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === mode}
          className="wb-mode-switcher__option"
          onClick={() => setMode(option)}
        >
          {MODE_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
