import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom does not implement matchMedia, but ModeProvider reads
// `prefers-color-scheme` through it. Provide a minimal stub (defaults to
// "no preference") so System-auto logic is exercisable in unit tests.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// Unmount React trees and reset mode state between tests so nothing leaks across
// cases (jsdom's sessionStorage and the <html> attribute persist within a file run).
afterEach(() => {
  cleanup();
  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }
  document.documentElement.removeAttribute('data-mode');
});
