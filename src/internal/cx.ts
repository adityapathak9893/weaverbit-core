/**
 * Tiny class-name joiner used across the building blocks (internal — not part of
 * the public API). Drops falsy values so callers can pass an optional `className`
 * straight through: cx('wb-nav', className).
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
