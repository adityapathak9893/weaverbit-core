# `scripts/` — build scripts

Cross-platform Node scripts (run on Windows + CI Ubuntu). No bash-only commands.

| File | Role |
|---|---|
| `prepare-build.mjs` | Runs on the `prepare` lifecycle hook — i.e. when a product installs this package from GitHub — and builds `dist/`. **Gotcha:** it skips silently when `src/index.ts` is absent so this repo's own early `npm install` (mid-scaffold) never wedges; once the entry exists it builds and fails loudly on a broken build (a consumer must never receive a half-built package). |
| `copy-assets.mjs` | After `tsc` emits JS/types, copies `.css` + `.woff2` from `src/` into `dist/`, mirroring the structure so `@import` and `url()` references keep resolving for consumers. |

Build flow: `npm run build` → `tsc -p tsconfig.build.json` (emits `dist/`) → `copy-assets.mjs`
(adds the CSS/fonts). See [`docs/SYSTEM_DESIGN.md` §2–3](../docs/SYSTEM_DESIGN.md).
