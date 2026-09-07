# DESIGN_GUIDE.md — weaverbit-core

> **What this is:** the fourth planning document — how *this* product looks and behaves visually. It **extends** the shared brand (`BRAND.md` / `weaverbit-core`); it never contradicts it. Approved by Aditya before code. (See `PROCESS.md` §3.)
>
> **Inversion for this repo:** every *other* product extends the brand; **weaverbit-core IS the brand source.** So this document doesn't "extend" anything — it is where `BRAND.md`'s decisions and the SPEC's values become the canonical, encoded design. It must mirror `BRAND.md` exactly; if the two ever disagree, `BRAND.md` wins and this is corrected (SPEC §7).
>
> **Status:** ☑ Draft  ☑ Approved by Aditya on 2026-06-22

---

## 1. The brand decisions (confirmed, and encoded here — not inherited)
> These come from `BRAND.md`. In a product repo you'd just confirm them; here they are *defined*. Confirming each maps 1:1 to `BRAND.md`.

- **Feeling: calm, clean, precise — quiet confidence.** ☑ (`BRAND.md` §1) — the anchor every value below serves.
- **Fonts: Space Grotesk (headings), Inter (body), monospace (technical bits).** ☑ (`BRAND.md` §2; SPEC §2) — mono face chosen in §8 Q1.
- **Colors: soft white / soft near-black / muted teal accent, used sparingly.** ☑ (`BRAND.md` §3) — teal is rare and deliberate; if teal is everywhere we did it wrong.
- **Signature: monospace for labels & technical bits only.** ☑ (`BRAND.md` §4) — see §5.
- **Display modes: Light, Dark, High-contrast, Dim, System-auto (default).** ☑ (`BRAND.md` §4b; SPEC §4) — all five; identity constant, only brightness/contrast change.

## 2. The encoded design system (the canonical values)

### 2.1 Semantic color tokens (roles, never raw hex in components)
Roles per SPEC §3: `bg`, `surface`, `border`, `ink`, `ink-soft`, `ink-faint`, `accent`, `accent-soft`, `positive`, `warning`. Each resolves per mode. **These are the FINAL shipped values** (encoded in `src/tokens/tokens.css`). They start from SPEC §4; the values marked **★** were adjusted for WCAG AA during the build (luminance only, hue unchanged — see §2.3). Original SPEC values are noted for traceability.

| Role | Light | Dark | High-contrast | Dim |
|---|---|---|---|---|
| `bg` | `#FBFBFA` | `#0E0F10` | `#FFFFFF` | `#1C1B19` |
| `surface` | `#FFFFFF` | `#16181A` | `#FFFFFF` | `#24221F` |
| `border` | `#E6E6E3` | `#2A2D30` | `#000000` | `#3A3733` |
| `ink` | `#16161A` | `#F1F2F0` | `#000000` | `#EDE8E0` |
| `ink-soft` | `#55555E` | `#AFB3B0` | `#1A1A1A` | `#B8B2A8` |
| `ink-faint` | `#73737C` ★ | `#7E827F` ★ | `#333333` | `#8E897F` ★ |
| `accent` | `#0D8181` ★ | `#3BB6B6` | `#006A6A` | `#46B3A8` |
| `accent-soft` | `#E2F2F2` | `#16302F` | `#D5ECEC` | `#1E302E` |
| `positive` | `#1A8359` ★ | `#34C98A` | `#0B6B45` | `#42BE8C` |
| `warning` | `#946D22` ★ | `#D2A24A` | `#7A5710` | `#C99B57` |

★ adjusted from SPEC: Light `ink-faint` `#8A8A93`, `accent` `#0E8C8C`, `positive` `#1F9D6B`, `warning` `#B5852A`; Dark `ink-faint` `#7C807D`; Dim `ink-faint` `#857F75`.

**System-auto:** not a palette — with no explicit choice, CSS `prefers-color-scheme` selects **Light** or **Dark** (SPEC §4). High-contrast and Dim are deliberate, opt-in looks (`BRAND.md` §4b).

### 2.2 Typography & spacing tokens (approved §8 Q2 — shipped)
SPEC §6 says tokens are the source of color **/font/spacing**, but `BRAND.md`/SPEC give explicit values only for color. To honor "tokens are the only source," these restrained scales were added (approved) and encoded in `tokens.css`:

- **Font families:** `--wb-font-display: "Space Grotesk"`, `--wb-font-body: "Inter"`, `--wb-font-mono: <chosen mono>` — each with a sensible system fallback stack.
- **Weights / metrics (from `BRAND.md` §2, SPEC §2):** headings medium weight + tight letter-spacing; body regular weight + comfortable line-height (~1.6 for prose).
- **Type scale (proposed):** a modest modular scale, e.g. `xs .8125 · sm .875 · base 1 · lg 1.125 · xl 1.375 · 2xl 1.75 · 3xl 2.25rem` — calm, not shouty.
- **Spacing scale (proposed):** 4px base — `1=4 · 2=8 · 3=12 · 4=16 · 6=24 · 8=32 · 12=48 · 16=64`. Used for component padding/rhythm so spacing is also tokenized, not ad-hoc.
- **Radius / hairline (proposed):** small radius set + a 1px hairline using `border`. Quiet, precise.

### 2.3 Contrast: final measured values (AA verified, enforced by a gate)
> Measured on the FINAL shipped `tokens.css`. AA text floor = 4.5:1; status *dots* are non-text (3.0:1 UI bar) since they're always paired with a mono label. These are asserted on every test run by `tests/tokens-contrast.test.ts` and re-checked in a real browser by `e2e/modes.spec.ts`, so a regression below the floor fails the build.

| Pair | Light | Dark | High-contrast | Dim | Floor |
|---|---|---|---|---|---|
| `ink`/`bg` (body) | 17.43 | 17.09 | 21.00 | 14.11 | 4.5 |
| `ink-soft`/`bg` | 7.12 | 9.04 | 17.40 | 8.17 | 4.5 |
| `ink-faint`/`bg` | 4.53 | 4.92 | 12.63 | 4.95 | 4.5 |
| `ink-faint`/`surface` | 4.70 | 4.57 | 12.63 | 4.56 | 4.5 |
| `accent`/`bg` (links) | 4.53 | 7.81 | 6.42 | 6.78 | 4.5 |
| `accent`/`surface` | 4.69 | 7.25 | 6.42 | 6.25 | 4.5 |
| `positive` dot/`bg` | 4.57 | 9.02 | 6.56 | 7.36 | 3.0 |
| `warning` dot/`bg` | 4.54 | 8.23 | 6.57 | 6.81 | 3.0 |

**How AA was reached (decisions applied):**
1. **Light `accent` darkened** `#0E8C8C`→`#0D8181` so links clear 4.5 on both bg and surface — same teal hue, lower luminance only (allowed by `BRAND.md` §4b: modes change brightness/contrast, not identity).
2. **`ink-faint` darkened/lightened** to clear 4.5 on the harder of bg/surface in Light, Dark, and Dim (it's used for small label text like SectionLabel, so it must meet the text floor, not just the hint floor).
3. **Status color is never the label text** — `StatusTag`'s label uses `ink` (always AA); the status color appears only in the *dot* (non-text, 3.0 bar). This satisfies "never colour alone" and is why Light `positive`/`warning` only needed the 3.0 dot floor (they were nudged to ≥4.5 anyway for safe text reuse).
4. High-contrast keeps the SPEC values (primary ink ≥12.6 — well past AA, "aims higher"). Borders are decorative hairlines (exempt from the UI bar) but stay visible in every mode.

## 3. The pages / screens and their layout
> For each screen, a plain description of the layout.

**N/A — the package has no pages or screens** (WORKFLOW_DATAFLOW §2). The only visual surface is the **local-only `dev/` demo** used to verify the building blocks in each mode; it is a verification harness, not a designed product screen. The "layouts" that matter are the building blocks themselves (§4) and how they compose (e.g. `Nav` = wordmark left, links + ModeSwitcher right).

## 4. The components needed (the building blocks)
> Mark which come from weaverbit-core vs new here. **All of these ARE weaverbit-core** — this repo is their canonical home (SPEC §5).

| Component | Source | Notes (brand intent) |
|---|---|---|
| `Wordmark` | core (here) | the "weaverbit" mark, set in **mono** (the signature, `BRAND.md` §4). |
| `Nav` | core (here) | top bar: wordmark + links + `ModeSwitcher`. Calm, hairline-separated. |
| `Footer` | core (here) | minimal: copyright, product links, social/RSS. Quiet. |
| `ModeSwitcher` | core (here) | the control for the five modes; System-auto default; client-only; keyboard-operable. |
| `StatusTag` / `StatusDot` | core (here) | **dot + mono label, never color alone** (SPEC §5, `BRAND.md` §4b). `positive`=LIVE, `warning`=UPCOMING, etc. |
| `SectionLabel` | core (here) | the mono **UPPERCASE** small heading (e.g. `PORTFOLIO`), `ink-faint`/`ink-soft`. |
| `Prose` | core (here) | styled wrapper for long body text (blogs), tuned to tokens; comfortable line-height; mono for inline code. |

Each must work and meet the a11y floor in **all four looks** before it counts as done (SPEC §5–6; brief). Products pass content/props but must not restyle these away from the brand.

## 5. The one signature moment
> Per the brand idea of "one bold thing, everything else quiet."

**The monospace signature** (`BRAND.md` §4): across every product, the small technical things — section labels, web addresses, dates, status tags, the wordmark, code — always wear the mono face, and **only** those things do. It is the quiet detail that ties every page together and signals "an engineer made this." It costs nothing and never clutters. This package is what guarantees it everywhere (via `Wordmark`, `SectionLabel`, `StatusTag`, `Prose`'s inline-code, and the `--wb-font-mono` token). There is no louder "hero" moment — restraint *is* the signature (`BRAND.md` §1, §6).

## 6. Motion
> Any animation? Keep it minimal and respectful (must honor "reduce motion").

Minimal by default (calm > flashy). The only motion: a brief, soft **color transition when switching display modes** (so the change isn't jarring) and standard focus/hover state changes. All transitions are short and **wrapped in `@media (prefers-reduced-motion: reduce)`** to disable them for users who ask. No decorative or attention-grabbing animation (`BRAND.md` §1, §6).

## 7. Accessibility floor (confirm)
> Readable down to small screens; visible keyboard focus; good contrast in ALL modes; status never color alone; reduce-motion honored.

- **Contrast:** body text ≥ WCAG **AA (4.5:1)** in every mode; High-contrast aims higher (it already measures ≥ 6.4:1 on every pair). The Light-mode shortfalls in §2.3 are **fixed in the build**, and final values are reported in the PR. ☑
- **Keyboard:** every interactive element (ModeSwitcher, Nav links) is focusable with a **visible focus ring** using `accent`/`ink` (never `outline: none` without a replacement). ☑
- **Status never by color alone:** StatusTag is always **dot + mono label**; the label carries meaning if color is imperceptible. ☑ (`BRAND.md` §4b, SPEC §5)
- **Semantic HTML:** `nav`, `footer`, `button` for the switcher, real heading levels in `Prose`; ModeSwitcher exposes its options accessibly (labelled control / `aria-pressed` or a labelled menu). ☑
- **Responsive:** components reflow to small screens; nothing relies on hover-only. ☑
- **Reduce-motion honored** (§6). ☑
- **All four looks verified** per component before "done" (Playwright + the contrast gate). ☑

## 8. Open questions — resolved (approved 2026-06-22)
1. **Monospace face → JetBrains Mono** (approved). Variable, OFL, strong at small label sizes; fits "an engineer made this" (`BRAND.md` §4). Shipped self-hosted.
2. **Typography & spacing scales → approved** and encoded in `tokens.css` (§2.2).
3. **Light-mode accent darkening → approved and applied** (§2.3): `#0E8C8C`→`#0D8181`, hue kept, links now 4.53/4.69 vs bg/surface. Final values per mode in §2.3 and the PR body.
4. **BRAND.md fidelity:** no drift flagged; this doc mirrors `BRAND.md` and now records the as-shipped values.

---
*Approval gate: Aditya approves before code. (PROCESS.md §3)*
