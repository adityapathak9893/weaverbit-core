/**
 * Behavioral tests for the building blocks: that each renders the right structure,
 * meets the relevant a11y contract (status never color-only; switcher keyboard-
 * operable), and that the ModeSwitcher actually drives the mode. Asserts behavior,
 * not implementation detail.
 */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  Footer,
  ModeProvider,
  ModeSwitcher,
  Nav,
  Prose,
  SectionLabel,
  StatusDot,
  StatusTag,
  Wordmark,
} from '../src';

describe('Wordmark', () => {
  it('renders the brand text', () => {
    render(<Wordmark />);
    expect(screen.getByText('weaverbit')).toBeTruthy();
  });

  it('renders a link when href is given', () => {
    render(<Wordmark href="/home" />);
    const link = screen.getByText('weaverbit');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/home');
  });
});

describe('SectionLabel', () => {
  it('renders its text and can be referenced by id', () => {
    render(<SectionLabel id="lbl">Portfolio</SectionLabel>);
    const el = screen.getByText('Portfolio');
    expect(el.id).toBe('lbl');
  });
});

describe('StatusTag', () => {
  it('shows the label text (meaning is never color-only) and hides the dot from AT', () => {
    const { container } = render(<StatusTag status="positive">Live</StatusTag>);
    // Label text present → screen readers convey status without relying on color.
    expect(screen.getByText('Live')).toBeTruthy();
    const dot = container.querySelector('.wb-status-dot');
    expect(dot?.getAttribute('aria-hidden')).toBe('true');
    expect(dot?.className).toContain('wb-status-dot--positive');
  });

  it('StatusDot defaults to neutral and is decorative', () => {
    const { container } = render(<StatusDot />);
    const dot = container.querySelector('.wb-status-dot');
    expect(dot?.className).toContain('wb-status-dot--neutral');
    expect(dot?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('Prose', () => {
  it('wraps children in the prose container', () => {
    const { container } = render(
      <Prose>
        <p>Body copy</p>
      </Prose>,
    );
    expect(container.querySelector('.wb-prose')).toBeTruthy();
    expect(screen.getByText('Body copy')).toBeTruthy();
  });
});

describe('Footer', () => {
  it('renders copyright and links', () => {
    render(<Footer copyright="© 2026 Weaverbit" links={[{ label: 'RSS', href: '/rss' }]} />);
    expect(screen.getByText('© 2026 Weaverbit')).toBeTruthy();
    expect(screen.getByText('RSS').getAttribute('href')).toBe('/rss');
  });
});

describe('Nav', () => {
  it('renders the wordmark, links, and the mode switcher', () => {
    render(
      <ModeProvider>
        <Nav links={[{ label: 'Writing', href: '/writing' }]} />
      </ModeProvider>,
    );
    expect(screen.getByText('weaverbit')).toBeTruthy();
    expect(screen.getByText('Writing').getAttribute('href')).toBe('/writing');
    expect(screen.getByRole('group', { name: 'Display mode' })).toBeTruthy();
  });
});

describe('ModeSwitcher', () => {
  it('renders all five modes as toggle buttons, with System (Auto) selected by default', () => {
    render(
      <ModeProvider>
        <ModeSwitcher />
      </ModeProvider>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    const auto = screen.getByRole('button', { name: 'Auto' });
    expect(auto.getAttribute('aria-pressed')).toBe('true');
  });

  it('applies and persists the chosen mode, and clears it for System', () => {
    render(
      <ModeProvider>
        <ModeSwitcher />
      </ModeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
    expect(sessionStorage.getItem('wb-mode')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Dark' }).getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    expect(document.documentElement.hasAttribute('data-mode')).toBe(false);
    expect(sessionStorage.getItem('wb-mode')).toBe('system');
  });
});
