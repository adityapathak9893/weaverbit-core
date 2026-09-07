/**
 * Enforces SPEC §6 / STRUCTURE.md: tokens are the ONLY source of color. No raw hex
 * may appear in components or component styles — they must reference var(--wb-*).
 * tokens.css (the source of the values) and fonts.css are the only files allowed hex,
 * and they're excluded from this scan.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

// Matches hex color literals (#rgb / #rgba / #rrggbb / #rrggbbaa), longest first.
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;

function walk(dir: string, exts: Set<string>): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, exts));
    else if (exts.has(extname(entry.name))) out.push(full);
  }
  return out;
}

const filesToScan = [
  ...walk(resolve(root, 'src/components'), new Set(['.tsx', '.ts'])),
  resolve(root, 'src/styles/components.css'),
  resolve(root, 'src/styles/base.css'),
  resolve(root, 'src/tailwind-preset.ts'),
];

describe('no raw hex outside the token source', () => {
  for (const file of filesToScan) {
    it(`${file.replace(root, '').replace(/\\/g, '/')} uses tokens, not hex`, () => {
      const matches = readFileSync(file, 'utf8').match(HEX);
      expect(matches ?? []).toEqual([]);
    });
  }
});
