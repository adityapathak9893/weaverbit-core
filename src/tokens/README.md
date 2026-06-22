# `src/tokens/` — the design tokens (single source of truth)

| File | Role |
|---|---|
| `tokens.css` | **The source of truth for token VALUES.** Hand-authored CSS custom properties (`--wb-*`), one block per mode. Editing a value here changes every consuming product. |
| `roles.ts` | The source of truth for token **names** — `COLOR_ROLES` + `colorVar()`. Used by the Tailwind preset and tests so role names aren't duplicated. Holds no values. |

## Conventions / gotchas
- **No drift by construction:** the contrast gate (`tests/tokens-contrast.test.ts`) parses
  `tokens.css` directly and asserts WCAG AA per mode — so it tests the *actual shipped values*,
  and there is no separate values mirror to keep in sync.
- **Modes:** Light is the `:root` base; System-auto is the *absence* of `[data-mode]`
  (CSS `prefers-color-scheme` picks Light/Dark, no JS). The Dark palette appears twice on
  purpose — once for explicit Dark, once inside the `prefers-color-scheme` media query — because
  CSS can't share one block across a media query and a plain selector.
- **AA adjustments:** a few Light/Dark/Dim values were shifted from the SPEC's first-pass to meet
  AA (luminance only, hue kept). Each is flagged inline; rationale + measured ratios in
  [`docs/DESIGN_GUIDE.md` §2.3](../../docs/DESIGN_GUIDE.md).
- Tokens are the **only** source of color/font/spacing — no raw hex in components
  (enforced by `tests/no-raw-hex.test.ts`).
