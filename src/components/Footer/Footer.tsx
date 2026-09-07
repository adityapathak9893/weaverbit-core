import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterProps {
  /** Copyright / colophon line, e.g. "© 2026 Weaverbit". */
  copyright?: ReactNode;
  /** Product links, social, RSS, etc. */
  links?: FooterLink[];
  children?: ReactNode;
  className?: string;
}

/**
 * Minimal footer: copyright + a short list of links (product/social/RSS) (SPEC §5).
 * Deliberately quiet — calm over decorative (BRAND.md §1).
 */
export function Footer({ copyright, links = [], children, className }: FooterProps) {
  return (
    <footer className={cx('wb-footer', className)}>
      {copyright !== undefined && <span className="wb-footer__copyright">{copyright}</span>}
      {links.length > 0 && (
        <ul className="wb-footer__links">
          {links.map((link) => (
            <li key={link.href}>
              <a className="wb-footer__link" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      {children}
    </footer>
  );
}
