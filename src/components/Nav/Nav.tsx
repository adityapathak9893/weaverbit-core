import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Wordmark } from '../Wordmark/Wordmark';
import { ModeSwitcher } from '../ModeSwitcher/ModeSwitcher';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavProps {
  links?: NavLink[];
  /** Where the wordmark links (home by default). */
  wordmarkHref?: string;
  /** Extra content rendered between the links and the mode switcher. */
  children?: ReactNode;
  className?: string;
  /**
   * Render the built-in ModeSwitcher (default true). Turn off if the product places
   * the switcher elsewhere. When on, a <ModeProvider> ancestor is required.
   */
  showModeSwitcher?: boolean;
}

/**
 * Top bar: wordmark + links + the mode switcher (SPEC §5). Thin and brand-only —
 * products supply their own links/content; they don't restyle it away from the
 * brand. The built-in ModeSwitcher needs a <ModeProvider> ancestor.
 */
export function Nav({
  links = [],
  wordmarkHref = '/',
  children,
  className,
  showModeSwitcher = true,
}: NavProps) {
  return (
    <nav aria-label="Primary" className={cx('wb-nav', className)}>
      <Wordmark href={wordmarkHref} />
      <div className="wb-nav__spacer" />
      {links.length > 0 && (
        <ul className="wb-nav__links">
          {links.map((link) => (
            <li key={link.href}>
              <a className="wb-nav__link" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      {children}
      {showModeSwitcher && <ModeSwitcher />}
    </nav>
  );
}
