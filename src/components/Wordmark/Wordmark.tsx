import { cx } from '../../internal/cx';

export interface WordmarkProps {
  /** Optional link target. When set, the mark renders as an <a> (e.g. links home). */
  href?: string;
  className?: string;
}

/** The brand text. Always lowercase and in the mono signature face. */
const WORDMARK_TEXT = 'weaverbit';

/**
 * The "weaverbit" wordmark, set in the mono signature face (BRAND.md §4). Renders a
 * <span> by default, or an <a> when `href` is given so it can link home in a Nav.
 */
export function Wordmark({ href, className }: WordmarkProps) {
  const classes = cx('wb-wordmark', className);
  if (href !== undefined) {
    return (
      <a className={classes} href={href}>
        {WORDMARK_TEXT}
      </a>
    );
  }
  return <span className={classes}>{WORDMARK_TEXT}</span>;
}
