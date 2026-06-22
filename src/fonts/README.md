# `src/fonts/` — self-hosted brand fonts

The three brand typefaces (BRAND.md §2), vendored as files so every Weaverbit
product renders identical type with **no third-party font request** (GDPR-clean,
no runtime CDN — see `docs/SYSTEM_DESIGN.md` §7).

## What's here

| File | Purpose |
|---|---|
| `fonts.css` | The `@font-face` declarations. Consumers import this once (`weaverbit-core/fonts.css`). |
| `files/*.woff2` | The font binaries — one **variable** woff2 per face (full weight axis in a single file). |

| Face | Family | Role | Weight axis |
|---|---|---|---|
| `space-grotesk-latin-wght-normal.woff2` | Space Grotesk | Headings | 300–700 |
| `inter-latin-wght-normal.woff2` | Inter | Body | 100–900 |
| `inter-latin-wght-italic.woff2` | Inter (italic) | Body emphasis | 100–900 |
| `jetbrains-mono-latin-wght-normal.woff2` | JetBrains Mono | Technical / signature | 100–800 |

## Convention / gotchas
- **woff2 + latin subset only.** Smallest payload that covers our content; `font-display: swap`. Don't add static per-weight files — the variable face already covers every weight.
- **Paths are relative** (`./files/…`). The build (`copy-assets.mjs`) mirrors this folder into `dist/fonts/`, so the relative `url()`s keep resolving for consumers.
- The mono face choice (JetBrains Mono over IBM Plex Mono) is the brand signature — see `docs/DESIGN_GUIDE.md` §5, §8.

## Provenance & license
All three are licensed under the **SIL Open Font License 1.1** (full text:
<https://openfontlicense.org>). Vendored from the Fontsource latin variable builds
(jsDelivr). Copyright notices:
- **Inter** — © 2016 The Inter Project Authors (<https://github.com/rsms/inter>)
- **Space Grotesk** — © 2020 The Space Grotesk Project Authors (<https://github.com/floriankarsten/space-grotesk>)
- **JetBrains Mono** — © 2020 The JetBrains Mono Project Authors (<https://github.com/JetBrains/JetBrainsMono>)

To refresh a face, re-download the corresponding `…:vf@latest/latin-wght-*.woff2`
from Fontsource and replace the file in `files/` (keep the same name).
