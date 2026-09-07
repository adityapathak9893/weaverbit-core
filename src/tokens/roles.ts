/**
 * The canonical lists of token role names. Kept in TypeScript (separate from the
 * CSS values in tokens.css) so the Tailwind preset and the test suite can iterate
 * over roles programmatically without hardcoding them in two more places. The CSS
 * remains the source of truth for the *values*; this is the source of truth for the
 * *names*. (SPEC §3.)
 */

/** Semantic color roles. Each resolves to a different value per mode. */
export const COLOR_ROLES = [
  'bg',
  'surface',
  'border',
  'ink',
  'ink-soft',
  'ink-faint',
  'accent',
  'accent-soft',
  'positive',
  'warning',
] as const;

export type ColorRole = (typeof COLOR_ROLES)[number];

/** The CSS custom-property name for a color role, e.g. 'accent' → '--wb-accent'. */
export function colorVar(role: ColorRole): string {
  return `--wb-${role}`;
}
