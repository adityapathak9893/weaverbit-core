/**
 * Public API of weaverbit-core. This barrel is the ONLY surface products import from
 * (STRUCTURE.md §4.4) — internal files are private. CSS is consumed separately via the
 * package's export paths: `weaverbit-core/styles.css` (everything), or the granular
 * `weaverbit-core/tokens.css` / `weaverbit-core/fonts.css`.
 *
 * Quick start (a consuming product):
 *   import 'weaverbit-core/styles.css';
 *   import { ModeProvider, Nav, noFlashScript } from 'weaverbit-core';
 *   // render <script> with noFlashScript in <head>, wrap the app in <ModeProvider>.
 */

// ── Building blocks (SPEC §5) ──
export { Wordmark } from './components/Wordmark/Wordmark';
export type { WordmarkProps } from './components/Wordmark/Wordmark';

export { SectionLabel } from './components/SectionLabel/SectionLabel';
export type { SectionLabelProps } from './components/SectionLabel/SectionLabel';

export { StatusTag, StatusDot } from './components/StatusTag/StatusTag';
export type { StatusTagProps, StatusDotProps, StatusKind } from './components/StatusTag/StatusTag';

export { Prose } from './components/Prose/Prose';
export type { ProseProps } from './components/Prose/Prose';

export { ModeSwitcher } from './components/ModeSwitcher/ModeSwitcher';
export type { ModeSwitcherProps } from './components/ModeSwitcher/ModeSwitcher';

export { Nav } from './components/Nav/Nav';
export type { NavProps, NavLink } from './components/Nav/Nav';

export { Footer } from './components/Footer/Footer';
export type { FooterProps, FooterLink } from './components/Footer/Footer';

// ── Mode system (BRAND.md §4b, SPEC §4) ──
export { ModeProvider } from './mode/ModeProvider';
export type { ModeProviderProps, ModeContextValue } from './mode/ModeProvider';
export { useMode } from './mode/useMode';
export { noFlashScript } from './mode/no-flash-script';
export { MODES, EXPLICIT_MODES, MODE_STORAGE_KEY, isMode } from './mode/types';
export type { Mode } from './mode/types';

// ── Tokens (role names; values live in tokens.css) ──
export { COLOR_ROLES, colorVar } from './tokens/roles';
export type { ColorRole } from './tokens/roles';
