/**
 * Mode system types & constants (no React — safe to import anywhere, incl. the
 * pre-paint script and server components). The display modes are BRAND.md §4b /
 * SPEC §4. 'system' (the default) is represented at runtime by the ABSENCE of the
 * [data-mode] attribute, so CSS prefers-color-scheme governs with no JS.
 */

/** All selectable modes. 'system' is the default. */
export const MODES = ['system', 'light', 'dark', 'high-contrast', 'dim'] as const;

export type Mode = (typeof MODES)[number];

/** Modes that map to an explicit [data-mode] CSS block (everything except 'system'). */
export const EXPLICIT_MODES = ['light', 'dark', 'high-contrast', 'dim'] as const;

/**
 * sessionStorage key for the chosen mode. Per-session memory by design — the SPEC
 * scopes the choice to the session, not forever, so a new session returns to
 * System-auto. (SPEC §4; docs/WORKFLOW_DATAFLOW.md §4.)
 */
export const MODE_STORAGE_KEY = 'wb-mode';

/** Runtime guard — used to reject tampered/legacy storage values before applying. */
export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}
