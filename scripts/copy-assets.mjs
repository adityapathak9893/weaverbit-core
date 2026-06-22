// Copies non-TypeScript assets (CSS + font files) from src/ into dist/, mirroring
// the directory structure so that @import and url() references stay valid in the
// published package. tsc only emits .js/.d.ts; these assets are what make the
// tokens, fonts, and component styles actually usable by a consumer.
import { readdir, mkdir, copyFile } from 'node:fs/promises';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(root, 'src');
const distDir = join(root, 'dist');
const ASSET_EXTENSIONS = new Set(['.css', '.woff2', '.woff']);

/** Recursively yield absolute paths of asset files under `dir`. */
async function* walkAssets(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkAssets(full);
    } else if (ASSET_EXTENSIONS.has(extname(entry.name))) {
      yield full;
    }
  }
}

let count = 0;
for await (const file of walkAssets(srcDir)) {
  const dest = join(distDir, relative(srcDir, file));
  await mkdir(dirname(dest), { recursive: true });
  await copyFile(file, dest);
  count += 1;
}

console.log(`[weaverbit-core] copied ${count} asset file(s) into dist/`);
