import { EXPLICIT_MODES, MODE_STORAGE_KEY } from './types';

/**
 * Inline script a consuming product drops into <head>, BEFORE any content, to
 * prevent a flash of the wrong theme on first paint (FOUC). It synchronously reads
 * the stored mode and sets [data-mode] before the browser paints.
 *
 * Why a raw string (not a component that runs in React): React runs too late — the
 * page has already painted by the time hydration occurs. Next.js consumers render
 * it via <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />; Vite/plain
 * consumers can inline it in index.html. It only ever WRITES a known attribute, so
 * there is no injection surface (SYSTEM_DESIGN §7).
 *
 * 'system' (or no stored value) is left as the absence of [data-mode] so CSS
 * prefers-color-scheme governs. The allow-list rejects any tampered storage value.
 */
// The allow-list is generated from EXPLICIT_MODES so a new mode can never silently
// fall out of the no-flash path — the single source of truth is types.ts.
const allowList = EXPLICIT_MODES.map((m) => `${JSON.stringify(m)}:1`).join(',');

export const noFlashScript = `(function(){try{var m=sessionStorage.getItem(${JSON.stringify(
  MODE_STORAGE_KEY,
)});var ok={${allowList}};if(m&&ok[m]===1){document.documentElement.setAttribute('data-mode',m);}}catch(e){}})();`;
