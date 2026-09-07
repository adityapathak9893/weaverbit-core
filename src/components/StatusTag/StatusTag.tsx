import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';

/** Which token colours the dot. Maps to --wb-positive / --wb-warning / --wb-accent / --wb-ink-faint. */
export type StatusKind = 'positive' | 'warning' | 'accent' | 'neutral';

export interface StatusDotProps {
  status?: StatusKind;
  className?: string;
}

/**
 * The coloured dot. Decorative ONLY — colour never conveys meaning on its own
 * (BRAND.md §4b, SPEC §5), so it's hidden from assistive tech; the StatusTag label
 * carries the meaning. Use StatusTag unless you're composing your own label.
 */
export function StatusDot({ status = 'neutral', className }: StatusDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cx('wb-status-dot', `wb-status-dot--${status}`, className)}
    />
  );
}

export interface StatusTagProps {
  status?: StatusKind;
  /** The label text, e.g. "LIVE" / "UPCOMING" — this is what conveys the status. */
  children: ReactNode;
  className?: string;
}

/**
 * Status indicator = coloured dot + mono label, never colour alone (SPEC §5). The
 * label text uses `ink` (not the status colour) so it always meets AA; the dot adds
 * the at-a-glance colour cue. (docs/DESIGN_GUIDE.md §2.3.)
 */
export function StatusTag({ status = 'neutral', children, className }: StatusTagProps) {
  return (
    <span className={cx('wb-status-tag', className)}>
      <StatusDot status={status} />
      <span className="wb-status-tag__label">{children}</span>
    </span>
  );
}
