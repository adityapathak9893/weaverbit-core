import { defineConfig } from 'vitest/config';

// Unit/integration tests run in jsdom (components render; the contrast gate
// reads the real tokens.css from disk). Components apply class names rather than
// importing CSS, so no CSS transform is needed here.
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
