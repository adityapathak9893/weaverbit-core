# weaverbit-core

The shared **brand package** every Weaverbit product installs: design tokens, self-hosted
fonts, the five display modes + switcher, and the small set of shared UI building blocks.
Install it and a product inherits the whole Weaverbit look — **with zero local restyling**.

> Not a website — nobody visits it. It's a dependency. The reasoning behind the brand lives
> in [`BRAND.md`](./BRAND.md); the encoded plan in [`docs/`](./docs); the spec in
> [`weaverbit-core-SPEC.md`](./weaverbit-core-SPEC.md).

## What you get

- **Design tokens** — `bg`, `surface`, `border`, `ink`, `ink-soft`, `ink-faint`, `accent`,
  `accent-soft`, `positive`, `warning`, plus type/spacing/radius scales — as semantic CSS
  variables that resolve per mode. **Never raw hex in a product.**
- **Five display modes** — Light, Dark, High-contrast, Dim, and **System-auto (default)**.
  Every text token meets **WCAG AA** in every mode (High-contrast aims higher); see
  [`docs/DESIGN_GUIDE.md` §2.3](./docs/DESIGN_GUIDE.md) for the measured values.
- **Self-hosted fonts** — Space Grotesk (headings), Inter (body), JetBrains Mono (technical) —
  no Google Fonts / CDN call.
- **Building blocks** — `Wordmark`, `Nav`, `Footer`, `ModeSwitcher`, `StatusTag`/`StatusDot`,
  `SectionLabel`, `Prose`.
- **A Tailwind preset** (optional) that maps the tokens to ergonomic utilities.

## Install

Installed from GitHub by tag (no npm registry). The `prepare` hook builds it on install.

```bash
npm install github:<owner>/weaverbit-core#v0.1.0
```

`react` and `react-dom` (≥18) are peer dependencies — the consumer provides them.

## Use it

**1. Import the styles once** at your app root (tokens + fonts + base + components):

```ts
import 'weaverbit-core/styles.css';
// or granular: 'weaverbit-core/tokens.css', 'weaverbit-core/fonts.css'
```

**2. Prevent a theme flash** — run the no-flash script in `<head>` before content. Next.js:

```tsx
import { noFlashScript } from 'weaverbit-core';
// in <head>:
<script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
```

(Plain HTML/Vite consumers can inline the same snippet in `index.html`.)

**3. Wrap the app in `ModeProvider`** and use the components:

```tsx
import { ModeProvider, Nav, SectionLabel, StatusTag, Prose } from 'weaverbit-core';

export function App() {
  return (
    <ModeProvider>
      <Nav links={[{ label: 'Writing', href: '/writing' }]} />
      <main>
        <SectionLabel>Portfolio</SectionLabel>
        <StatusTag status="positive">Live</StatusTag>
        <Prose>{/* your MDX/content */}</Prose>
      </main>
    </ModeProvider>
  );
}
```

The `ModeSwitcher` (built into `Nav`, or used standalone) lets visitors change mode; the
choice is remembered for the session. System-auto follows the device with no JS.

### Tokens directly (any framework)

```css
.thing {
  color: var(--wb-ink);
  background: var(--wb-surface);
  border: var(--wb-hairline) solid var(--wb-border);
}
```

### Tailwind (optional)

```ts
// tailwind.config.ts
import weaverbitPreset from 'weaverbit-core/tailwind-preset';
export default { presets: [weaverbitPreset] /* … */ };
// → bg-bg, text-ink, text-accent, font-mono, p-4, rounded-md …
```

The preset points at the same CSS variables, so there is one source of truth and mode
switching still works.

## Develop

```bash
npm run dev         # local demo (all blocks, all modes) at http://localhost:5173
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (zero warnings) + prettier --check
npm run test        # vitest: contrast gate, no-raw-hex, components, mode, preset
npm run e2e         # playwright: every mode + no-flash, in a real browser
npm run build       # tsc → dist + copy css/fonts
npm run format:write # apply prettier formatting (lint only checks it)
```

## How it's structured

`src/tokens` (the source of truth) · `src/styles` (CSS wiring) · `src/fonts` (self-hosted) ·
`src/mode` (the mode system) · `src/components` (the building blocks) · `src/index.ts` (the
public API). See [`STRUCTURE.md` §4.4](./STRUCTURE.md) and
[`docs/SYSTEM_DESIGN.md`](./docs/SYSTEM_DESIGN.md).

## Versioning

Products pin a git tag and upgrade deliberately. A change to a brand *decision* goes back to
`BRAND.md` first, then is encoded here (SPEC §7).
