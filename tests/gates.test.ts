/**
 * Guards the five gates against the one failure mode the harness exists to prevent:
 * a gate that reports success while checking nothing (CLAUDE.md §3, STRUCTURE.md §2).
 *
 * Backported from weaverbit-template. The placeholder assertions below are scoped to
 * "there is no product code yet" — this repo has `src/`, so they are live and will fail
 * if a real gate script is ever replaced by a template stub. That is the check a README
 * paragraph cannot make.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Paths resolve from the project root (vitest's cwd) rather than `import.meta.url`:
// this repo runs its suite in jsdom, where import.meta.url is not a file: URL and
// `new URL('../x', import.meta.url)` throws. Same reason as tests/helpers/parse-tokens.ts.
const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};

const GATES = ['typecheck', 'lint', 'test', 'e2e', 'build'] as const;

/** Recursively: does src/ hold any file at all? An empty or absent dir means "no product yet". */
function hasSourceFiles(dir: string): boolean {
  if (!existsSync(dir)) return false;
  return readdirSync(dir, { withFileTypes: true }).some((entry) =>
    entry.isDirectory() ? hasSourceFiles(join(dir, entry.name)) : true,
  );
}

const productHasCode = hasSourceFiles(resolve(process.cwd(), 'src'));

describe('the five gates are defined', () => {
  for (const gate of GATES) {
    it(`package.json defines "${gate}"`, () => {
      expect(pkg.scripts?.[gate], `missing script: ${gate}`).toBeTruthy();
    });
  }
});

describe('the five gates still check something', () => {
  // `it.skipIf` rather than a bare early return: a skipped test is visible in the run,
  // a silently-passing one is exactly the problem being guarded against.
  it.skipIf(!productHasCode)('dev and build are no longer placeholders', () => {
    for (const script of ['dev', 'build'] as const) {
      expect(
        pkg.scripts[script],
        `src/ has code, so "${script}" must be the product's real command, not the template placeholder`,
      ).not.toContain('no app yet');
    }
  });

  it.skipIf(!productHasCode)('the test runners no longer pass with zero specs', () => {
    expect(
      pkg.scripts.test,
      'src/ has code, so the unit gate must fail on an empty suite: drop --passWithNoTests',
    ).not.toContain('passWithNoTests');
    expect(
      pkg.scripts.e2e,
      'src/ has code, so the e2e gate must fail on an empty suite: drop --pass-with-no-tests',
    ).not.toContain('pass-with-no-tests');
  });
});
