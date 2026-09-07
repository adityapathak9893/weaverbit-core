import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';

export interface ProseProps {
  children: ReactNode;
  className?: string;
}

/**
 * Styled wrapper for long-form body content (e.g. a blog post). Tunes headings,
 * paragraphs, links, lists, blockquotes, and inline code to the tokens and a
 * comfortable reading measure (BRAND.md §2, SPEC §5).
 *
 * It styles a CONTAINER only — it does not parse or inject HTML. The consumer passes
 * already-rendered React children (e.g. compiled MDX) and owns sanitising any
 * untrusted HTML before it gets here (SYSTEM_DESIGN §7).
 */
export function Prose({ children, className }: ProseProps) {
  return <div className={cx('wb-prose', className)}>{children}</div>;
}
