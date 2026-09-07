// `prepare` lifecycle hook. npm runs this after install — including when a
// Weaverbit product installs this package from GitHub — so the consumer gets a
// freshly built dist/ without us committing build artifacts or publishing to npm.
//
// During this repo's OWN early scaffolding there is no public entry yet, so a
// local `npm install` must not fail here. We therefore skip silently when
// src/index.ts is absent, and otherwise build (failing loudly if the build is
// broken — a consumer must never receive a half-built package).
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const entry = fileURLToPath(new URL('../src/index.ts', import.meta.url));

if (!existsSync(entry)) {
  console.log('[weaverbit-core] prepare: src/index.ts not present yet — skipping build.');
  process.exit(0);
}

execSync('npm run build', { stdio: 'inherit' });
