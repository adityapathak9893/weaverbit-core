/**
 * Optional Tailwind preset. Tailwind-based products (e.g. weaverbit.com) add this to
 * `presets: [...]` to get ergonomic utilities — `bg-bg`, `text-ink`, `font-mono`,
 * `p-4`, `rounded-md` — that resolve to the SAME CSS variables defined in tokens.css.
 * It does NOT duplicate values: every entry points at a var(--wb-*), so tokens.css
 * stays the single source of truth and mode-switching still "just works". Non-Tailwind
 * products simply ignore this and use the CSS variables directly. (SYSTEM_DESIGN §2.)
 *
 * Typed structurally (not against tailwindcss's Config) so this package needs no
 * Tailwind dependency. The shape is preset-compatible with Tailwind v3/v4.
 */
import { COLOR_ROLES } from './tokens/roles';

export interface WeaverbitTailwindPreset {
  theme: {
    extend: {
      colors: Record<string, string>;
      fontFamily: Record<string, string>;
      fontSize: Record<string, string>;
      spacing: Record<string, string>;
      borderRadius: Record<string, string>;
    };
  };
}

/** role name → its CSS variable, generated from the canonical role list. */
const colors: Record<string, string> = Object.fromEntries(
  COLOR_ROLES.map((role) => [role, `var(--wb-${role})`]),
);

const weaverbitPreset: WeaverbitTailwindPreset = {
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: 'var(--wb-font-body)',
        display: 'var(--wb-font-display)',
        mono: 'var(--wb-font-mono)',
      },
      fontSize: {
        xs: 'var(--wb-text-xs)',
        sm: 'var(--wb-text-sm)',
        base: 'var(--wb-text-base)',
        lg: 'var(--wb-text-lg)',
        xl: 'var(--wb-text-xl)',
        '2xl': 'var(--wb-text-2xl)',
        '3xl': 'var(--wb-text-3xl)',
      },
      spacing: {
        1: 'var(--wb-space-1)',
        2: 'var(--wb-space-2)',
        3: 'var(--wb-space-3)',
        4: 'var(--wb-space-4)',
        6: 'var(--wb-space-6)',
        8: 'var(--wb-space-8)',
        12: 'var(--wb-space-12)',
        16: 'var(--wb-space-16)',
      },
      borderRadius: {
        sm: 'var(--wb-radius-sm)',
        md: 'var(--wb-radius-md)',
        full: 'var(--wb-radius-full)',
      },
    },
  },
};

export default weaverbitPreset;
