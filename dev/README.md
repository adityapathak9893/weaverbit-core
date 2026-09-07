# `dev/` — local verification demo (NOT shipped)

A tiny Vite app that renders every building block and all colour tokens so the brand
can be checked — by eye and by Playwright — in all five modes. It imports the library
from `src/` directly.

**This folder is never published.** It's excluded from the package (`files: ["dist"]`
in package.json) and from the build (`tsconfig.build.json` compiles only `src/`). It
exists purely so a *package* (which has no pages of its own) can still be verified in a
real browser, as the SPEC requires (SPEC §6; `docs/SYSTEM_DESIGN.md` §10).

| File | Purpose |
|---|---|
| `index.html` | Demo entry; includes the no-flash mode script (mirrors `noFlashScript`). |
| `main.tsx` | Renders Nav, StatusTag, Wordmark, SectionLabel, Prose, Footer, ModeSwitcher, and a token swatch grid, wrapped in `ModeProvider`. |
| `vite-env.d.ts` | Vite client types (lets the demo import CSS). |

Run it with `npm run dev` (serves on `http://localhost:5173`). `npm run e2e` boots this
same server automatically.
