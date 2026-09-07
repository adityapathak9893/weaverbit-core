/**
 * Parses the real src/tokens/tokens.css and returns the resolved color palette for
 * each mode. The contrast gate tests the ACTUAL shipped values (not a mirror), so
 * tokens.css stays the single source of truth and there is no drift to keep in sync.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { COLOR_ROLES, type ColorRole } from '../../src/tokens/roles';

export type Palette = Record<ColorRole, string>;

// Resolve from the project root (vitest's cwd). Avoids import.meta.url, which is not
// a file: URL under the jsdom test environment.
const cssPath = resolve(process.cwd(), 'src/tokens/tokens.css');
const css = readFileSync(cssPath, 'utf8');

/** Extract the declaration body for the first rule whose selector matches `re`. */
function blockBody(re: RegExp): string {
  const match = css.match(re);
  if (match === null || match[1] === undefined) {
    throw new Error(`tokens.css: could not find block for ${re}`);
  }
  return match[1];
}

/** Pull the 10 color roles out of a declaration body into a Palette. */
function paletteFrom(body: string): Palette {
  const palette = {} as Palette;
  for (const role of COLOR_ROLES) {
    const m = body.match(new RegExp(`--wb-${role}\\s*:\\s*(#[0-9a-fA-F]{3,8})`));
    if (m === null || m[1] === undefined) {
      throw new Error(`tokens.css: missing --wb-${role} in a mode block`);
    }
    palette[role] = m[1];
  }
  return palette;
}

// `:root { … }` is the Light base (selector is exactly :root, not :root: / :root[).
const light = paletteFrom(blockBody(/:root\s*\{([^}]*)\}/));
const dark = paletteFrom(blockBody(/:root\[data-mode='dark'\]\s*\{([^}]*)\}/));
const highContrast = paletteFrom(blockBody(/:root\[data-mode='high-contrast'\]\s*\{([^}]*)\}/));
const dim = paletteFrom(blockBody(/:root\[data-mode='dim'\]\s*\{([^}]*)\}/));
// The System-auto dark palette lives inside the prefers-color-scheme media query.
const autoDark = paletteFrom(
  blockBody(/:root:not\(\[data-mode\]\),\s*:root\[data-mode='system'\]\s*\{([^}]*)\}/),
);

export const palettes: { mode: string; palette: Palette }[] = [
  { mode: 'light', palette: light },
  { mode: 'dark', palette: dark },
  { mode: 'high-contrast', palette: highContrast },
  { mode: 'dim', palette: dim },
];

/** Exposed so a test can assert explicit Dark === System-auto-dark. */
export const darkPalettes = { explicit: dark, auto: autoDark };
