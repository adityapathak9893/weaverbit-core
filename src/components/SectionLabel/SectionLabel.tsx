import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';

export interface SectionLabelProps {
  children: ReactNode;
  className?: string;
  /** Set so a region can reference this label via aria-labelledby. */
  id?: string;
}

/**
 * The small mono UPPERCASE label that introduces a section (e.g. "PORTFOLIO") —
 * part of the signature (BRAND.md §4). Uppercasing and letter-spacing are applied
 * in CSS, so the child text stays readable to assistive tech and copy/paste.
 */
export function SectionLabel({ children, className, id }: SectionLabelProps) {
  return (
    <p id={id} className={cx('wb-section-label', className)}>
      {children}
    </p>
  );
}
