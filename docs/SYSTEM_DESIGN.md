# SYSTEM_DESIGN.md — weaverbit-core

> **What this is:** the third planning document — the technical plan. Architecture, the tools used, where files go, data stores, security, and how it holds up under load. Filled from the brief + the two docs above, approved by Aditya before code. (See `PROCESS.md` §3 and `STRUCTURE.md`.)
>
> Replace every `[ ... ]`.
>
> **Status:** ☑ Draft  ☑ Approved by Aditya on 2026-06-22

---

## 1. Archetype
> Which kind of app is this (per STRUCTURE.md §4): content site, interactive app, or service/API? This decides the per-archetype folder extensions.

**None of the three.** weaverbit-core is a **shared package / component library** — an archetype `STRUCTURE.md` §4 does not yet define (it lists only content-site, interactive-app, service/API). Per `STRUCTURE.md` §3 ("if a product genuinely needs a structure this doc doesn't cover, the agent STOPS and asks") and §4 ("Adding an archetype is a deliberate revision to this doc"), **I am flagging this rather than inventing**: see §11 Q1. The structure proposed in §4 below is my recommendation for that new archetype; it keeps the spirit of the spine (self-contained, colocated modules; one explicit public API) but drops the parts that only make sense for a deployable app (`app/` routes, product `features/`, `lib/` clients, `content/`).

## 2. The stack (tools we'll use, and why)
> List the main technologies and a one-line reason for each. Prefer boring, conventional choices. Justify anything unusual.

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript | Non-negotiable across the portfolio; ships `.d.ts` so consumers get typed tokens/props. |
| Components | React (function components) | The consuming products (weaverbit.com = Next.js, Cite) are React. React is a **peerDependency**, never bundled, so the consumer's React is reused. The framework choice applies to the *components only* — it is deliberately **not** locked in as "all products must be React" (§11 Q3); the token/font layer below stays framework-agnostic. |
| Tokens | Plain **CSS custom properties** (single source of truth), shipped as `tokens.css` | Framework-agnostic — any product (Tailwind or not, React or not) consumes them. Resolves per mode with zero JS. (SPEC §3, §6.) |
| Component styling | Plain, **namespaced (`wb-*`) CSS** shipped as `components.css`, referencing the token variables | Leanest portable option: needs no CSS-Modules/bundler features in the consumer; one stylesheet import. Prefix prevents collisions. *(Alt = CSS Modules — §11 Q2.)* |
| Tailwind interop | A thin optional **Tailwind preset** mapping semantic names → the same CSS variables | weaverbit.com uses Tailwind; this gives `bg-bg`, `text-ink`, `font-mono` ergonomics **without** a second source of truth (it points at the CSS vars). *(Ship it? §11 Q5.)* |
| Fonts | **Self-hosted** woff2 (Space Grotesk, Inter, + one mono), shipped in-package with `@font-face` CSS | No Google Fonts / third-party CDN → identical everywhere, GDPR-clean (no third-party request), `font-display: swap`. *(Self-host vs `@fontsource`: §11 Q6.)* |
| Build | `tsc` (emit ESM + `.d.ts`) + a small **cross-platform Node copy script** for CSS/fonts | Avoids a bundler dependency entirely; `tsc` is already required for typecheck. Cross-platform so it runs on Aditya's Windows + CI Ubuntu. |
| Distribution | Installed from GitHub by tag; build runs via the **`prepare`** lifecycle script on install | No npm publish (`PROCESS.md` §2). `prepare` is npm's blessed hook for git dependencies. *(Confirm: §11 Q4.)* |
| Unit tests | Vitest (+ jsdom + @testing-library/react) | Portfolio standard (`CLAUDE.md` §2). Drives the deterministic **contrast gate** (below) and component-render assertions. |
| Visual / e2e | Playwright against a **local-only** Vite demo (`dev/`, never shipped) | Operationalizes the SPEC's "verify in-browser in all four modes": switch modes, screenshot, assert no-flash. This is "e2e if applicable" for a package. |
| Lint / format | ESLint (`--max-warnings 0`) + Prettier | Portfolio gates (`CLAUDE.md` §3). |

**New dependencies introduced (all justified above; consolidated for sign-off in §11 Q7):** runtime — *none* (React is a peer, fonts are assets). Dev only — `typescript`, `react`/`react-dom` (peer + dev for tests), `@types/react`, `vitest`, `jsdom`, `@testing-library/react`, `@playwright/test`, `vite` (dev demo server only), `eslint` + config, `prettier`. No bundler (tsup/rollup/webpack) — deliberately avoided to stay lean.

## 3. How pages are built (rendering)
> Static (built ahead of time), server-rendered, or client-side? For each main area. Static is preferred unless there's a real reason.

**No pages exist** (not an app — see WORKFLOW_DATAFLOW §2). What matters is *how the package's output is built and how its runtime behaves in a consumer*:

- **Tokens & fonts:** fully static CSS/assets, zero runtime cost. A consumer imports them once at its root.
- **Components:** ship as ESM React components. They are render-environment-agnostic — a Next.js consumer can use them in Server or Client Components, **except** `ModeSwitcher` and the mode hook, which are interactive and must run on the client (they will carry `"use client"` so Next.js App Router treats them correctly). This is the one rendering subtlety and it is handled in the package, not pushed onto the consumer.
- **No-flash mode application:** a tiny inline script (shipped as a string export + documented snippet) sets `data-mode` from `sessionStorage` **before first paint**, so SSR/SSG consumers never flash the wrong theme. System-auto needs no JS (pure CSS `prefers-color-scheme`).
- **The build itself:** `tsc` produces `dist/` (ESM + types) ahead of time; runs on install via `prepare`.

## 4. Folder structure
> Confirm the shared spine (STRUCTURE.md §2) and list this product's `features/`. Note any per-archetype extension.

The product spine assumes a deployable app (`src/app/`, product `features/`, `lib/` clients, `content/`) — most of which **does not apply** to a package (see §1, §11 Q1). Planning docs live in `docs/` (this repo's existing convention; note `STRUCTURE.md` §2 says "root" — minor divergence already set by the template, followed here per the brief). Proposed structure:

```
weaverbit-core/
├── docs/                       # the four planning docs (this repo's convention)
├── src/
│   ├── tokens/                 # the SINGLE source of truth for design tokens
│   │   ├── tokens.css          #   semantic CSS custom properties, per-mode blocks (the VALUES)
│   │   ├── roles.ts            #   role NAMES (COLOR_ROLES + colorVar) for the preset + tests
│   │   └── README.md
│   ├── fonts/                  # self-hosted woff2 (files/) + fonts.css (@font-face) + README
│   ├── mode/                   # the mode system
│   │   ├── ModeProvider.tsx    #   context + apply/persist logic ("use client")
│   │   ├── useMode.ts          #   hook to read/set the mode ("use client")
│   │   ├── no-flash-script.ts  #   the pre-paint inline script (string export)
│   │   ├── types.ts            #   Mode union, MODES/EXPLICIT_MODES, storage key, isMode
│   │   └── README.md
│   ├── components/             # the shared building blocks (each self-contained folder)
│   │   ├── Wordmark/  Nav/  Footer/  ModeSwitcher/
│   │   └── StatusTag/  SectionLabel/  Prose/
│   ├── styles/                 # base.css (brand baseline) + components.css (wb-*) + index.css
│   ├── internal/               # private helpers (cx) — never in the public barrel; + README
│   ├── tailwind-preset.ts      # optional Tailwind preset (maps role names → CSS vars)
│   └── index.ts                # PUBLIC API barrel — the only entry consumers import from
├── dev/                        # LOCAL-ONLY demo/preview (Vite) — NOT shipped, NOT deployed
├── tests/                      # vitest unit + contrast gate, mirroring src
├── e2e/                        # Playwright mode/contrast/screenshot specs
├── scripts/                    # cross-platform build scripts (prepare-build, copy-assets)
├── package.json                # exports map, peerDeps, prepare build, files allowlist
├── tsconfig(.build).json · eslint · prettier · vitest · playwright · vite configs
└── README.md                   # what it is + how a product installs & consumes it
```

- **"Features" of this package = its building blocks.** Each `components/<Block>/` folder is self-contained (the spine's colocation principle), and `src/index.ts` is the single explicit public API (the spine's barrel rule, `STRUCTURE.md` §3). Deep imports into the package are not part of the contract.
- **Token exposure:** consumers import `weaverbit-core/tokens.css` and `weaverbit-core/fonts.css` once; components from `weaverbit-core`; the preset from `weaverbit-core/tailwind-preset`. These paths are declared in the `exports` map.

## 5. Data stores and shapes
> If there's a database: what tables/collections, and what's in each (plain description, not full SQL yet).

**None.** No database, no persisted server data, no schema. The only client-side state is the chosen display mode in `sessionStorage` (a single string; see WORKFLOW_DATAFLOW §3–4). No PII, ever.

## 6. The brand
> Confirm: this product installs `weaverbit-core` and uses it for all fonts/colors/modes. List any product-specific design extension (which also goes in DESIGN_GUIDE.md).

**Inverted here — this package *is* the brand source, it does not install itself.** It encodes `BRAND.md` and the SPEC into the real tokens, fonts, modes, and building blocks that every *other* product then installs. There are no product-specific extensions in this repo by design (extensions live in each product's own `DESIGN_GUIDE.md`; SPEC §6, `BRAND.md` §5). The brand→values mapping is detailed in this repo's `docs/DESIGN_GUIDE.md`.

- Installs weaverbit-core: ☐ yes — **N/A; it is weaverbit-core.**
- Extensions: none (shared core only).

## 7. Security & privacy
> Inputs validated where? Secrets kept where? Personal data — collected minimally and handled how? Which display-respecting / privacy choices apply (e.g. cookieless analytics)?

- **Attack surface is minimal:** no server, no inputs from the network, no database, no auth. The package runs as static assets + client components inside a consumer.
- **Inputs:** the only inputs are component props supplied by the consuming product (e.g. nav links, status label). React escapes rendered content by default; we add **no `dangerouslySetInnerHTML`**. The `Prose` component renders consumer-provided long-form content — it styles a container but does **not** itself parse/inject raw HTML (the consumer owns sanitizing any HTML/MDX it passes in; this boundary will be documented). Mode read from `sessionStorage` is validated against the known `Mode` union before being applied (defends against a tampered storage value).
- **Secrets:** none — the package has no secrets and needs none. No `.env` required. (`.env.example` stays empty/absent; noted for the gate in `CLAUDE.md` §3.8.)
- **Privacy / GDPR:** no PII, no cookies, no analytics, no third-party requests. Fonts self-hosted (no Google Fonts beacon). Mode preference is `sessionStorage` on-device only. This is the cleanest possible posture and aligns with `PROCESS.md` §5.
- **Supply chain:** zero runtime dependencies keeps the consumer's transitive tree clean; dev deps are mainstream and pinned via lockfile.

## 8. Holding up under load / scale
> Realistically, what load is expected, and what makes this not fall over? (For most static sites: "served from the edge, effectively unlimited reads." Be honest about the one dynamic part if there is one.)

**No runtime load to speak of** — it is a build-time dependency, not a running service. The relevant "scale" axes are different:
- **Payload:** keep the shipped CSS small and fonts subset (latin, variable where available, `swap`) so consuming products stay fast. This is the real performance lever and is a build acceptance criterion (§10).
- **Tree-shaking:** ESM + per-component exports so a consumer importing only `<StatusTag>` doesn't pull the whole library.
- **Maintenance scale:** "scales" across products by being installed at a pinned tag; a brand change is made once and adopted deliberately (SPEC §6). No per-product divergence to maintain.

## 9. What Aditya sets up (infra)
> The things only Aditya does: repos, deploy targets, databases, secrets, domains. List them so nothing's assumed.

- **The GitHub repo** `weaverbit-core` and its **release tags** (the version mechanism products install from). I open PRs; Aditya reviews, merges, and tags.
- **No deploy target, no database, no domain, no secrets** — none are needed (it is never deployed or hosted).
- Decisions only Aditya can make: the open questions in §11 (archetype/structure revision to `STRUCTURE.md`, styling approach, mono face, dependency set) — these are governance/brand calls, not agent calls.

## 10. Acceptance criteria (architecture)
> The checkable technical conditions for "done." The build is measured against these.

- A consumer can `npm i github:<owner>/weaverbit-core#<tag>`, import tokens + fonts + a component, and render it correctly with **no local restyling** (verified by the `dev/` demo standing in for a consumer).
- **Tokens are the only source of color/font/spacing**; no raw hex appears in any component (enforced by lint rule + code-reviewer; SPEC §6).
- All **five modes** implemented; System-auto is the default and resolves via `prefers-color-scheme` with no JS; the four explicit looks apply via `data-mode`.
- **Contrast gate passes** in vitest for every token text-pair in every mode (body text ≥ AA 4.5; High-contrast higher), and Playwright confirms the rendering in a real browser across all four looks. Final measured values reported in the PR (per the brief and SPEC §4).
- All **seven building blocks** render correctly and meet the a11y floor in **all four looks** (keyboard focus visible, status never color-alone, semantic HTML).
- `typecheck`, `lint` (0 warnings), `test`, `build`, and `e2e` all green locally and in CI.
- The package ships **only** what consumers need (an `exports` map + `files` allowlist; the `dev/` demo and tests are excluded from the install).
- Zero runtime dependencies; every dev dependency justified (§2 / §11 Q7).

## 11. Open questions for Aditya
> *(Consolidated here — these are the decisions I will not invent. My recommendation is given for each so you can mostly say "yes, recommended." Nothing is built until these are settled and all four docs approved.)*

1. **New archetype in `STRUCTURE.md`.** weaverbit-core is a "shared package" — an archetype `STRUCTURE.md` §4 doesn't define. Per the process, adding one is a deliberate revision *you* make to that doc. **Rec:** approve the §4 structure above as the "shared package/library" archetype, and (you) add it to `STRUCTURE.md` §4 so future packages reuse it. Agents don't edit `STRUCTURE.md`/`PROCESS.md`.
2. **Component styling mechanism.** **Rec:** plain namespaced `wb-*` CSS in one `components.css` (leanest, most portable, no bundler needed in consumers). Alternative: CSS Modules (more scoping, but needs build/consumer tooling). OK with the lean option?
3. **Framework for components (resolved — not hard-locked).** Components are React (the right fit for today's products). This is **not** a standing rule that every future product must be React: the token + font layer is framework-agnostic, so a non-React product can still adopt the full visual brand and simply skip the React wrappers. Room for that exception is kept open by design.
4. **Build-on-install via `prepare`** (no committed `dist/`, no npm publish). **Rec:** yes — npm's standard path for GitHub deps. Confirm you're fine with the consumer running the build on install (it requires devDeps at install time, which npm provides for git deps).
5. **Ship the Tailwind preset?** **Rec:** yes — weaverbit.com uses Tailwind; the preset references the same CSS vars (no second source of truth) and is opt-in for non-Tailwind consumers.
6. **Font hosting.** **Rec:** self-host woff2 in-package (no CDN, GDPR-clean, identical everywhere). Alternative: depend on `@fontsource/*` packages (less to vendor, but adds deps + indirection). OK to self-host?
7. **Dependency set sign-off** (`CLAUDE.md` §7 / brief: no new dep without approval). Runtime: **none**. Dev: `typescript, react, react-dom, @types/react, vitest, jsdom, @testing-library/react, @playwright/test, vite, eslint(+config), prettier`. Approve this set? (I deliberately avoided a bundler.)
8. **Mono face** — carried in `DESIGN_GUIDE.md` §8 (it's a brand/visual call). **Rec:** JetBrains Mono.
9. **Harness fit:** the `new-post` slash command and the analytics/feedback language in `CLAUDE.md` are SITE (blog/app) concerns with no meaning for a package. **Rec:** in the build PR, remove/neutralize the blog-specific `new-post` command for this repo (keep the rest of the harness). Agree?

---
*Approval gate: Aditya approves before code. (PROCESS.md §3)*
