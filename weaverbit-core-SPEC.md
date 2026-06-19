# weaverbit-core — Build Specification

> **What this is:** the spec for the shared brand package every Weaverbit product installs. This document is the *plan*; the working package is built in its own repo through the normal loop. It encodes `BRAND.md` into real, named values and shared building blocks.
>
> **Status:** spec ready to build. Color values below are a careful first pass — verify them in a browser in all modes during the build and adjust for real contrast.

---

## 1. What this package provides
1. **Design tokens** — every color, font, and spacing value as named variables, for all five display modes.
2. **Fonts** — Space Grotesk, Inter, and a monospace face, wired up and ready to use.
3. **Shared building blocks** — the handful of UI pieces every product reuses (see §5).
4. **The mode switcher** — the control + logic that lets a visitor change display mode, with System-auto as default.

Products install this from GitHub and get all of the above. They never redefine these things locally.

## 2. Fonts
- **Display / headings:** Space Grotesk.
- **Body:** Inter.
- **Mono / technical:** JetBrains Mono (or IBM Plex Mono) — used for labels, web addresses, dates, status tags, code.
- Load efficiently (self-host or a single optimized source). Headings medium weight, tight letter spacing; body regular weight, comfortable line height.

## 3. Color tokens — semantic names (not raw colors)
Components use **role names**, never raw hex. The same role name resolves to a different value in each mode. Roles:

- `bg` — page background
- `surface` — cards, raised panels
- `border` — hairline lines
- `ink` — primary text
- `ink-soft` — secondary text
- `ink-faint` — captions, labels, hints
- `accent` — the teal (links, focus, small highlights)
- `accent-soft` — a faint teal wash (hover/selection)
- `positive` / `warning` — status (live / upcoming), each paired with a non-color cue elsewhere

## 4. The five display modes — starting values
> First-pass values. **Verify contrast in-browser during the build** (body text must meet at least WCAG AA; High-contrast aims higher). Teal shifts slightly per mode so it stays readable.

### Light (the calm default)
- bg `#FBFBFA` · surface `#FFFFFF` · border `#E6E6E3`
- ink `#16161A` · ink-soft `#55555E` · ink-faint `#8A8A93`
- accent `#0E8C8C` · accent-soft `#E2F2F2`
- positive `#1F9D6B` · warning `#B5852A`

### Dark
- bg `#0E0F10` · surface `#16181A` · border `#2A2D30`
- ink `#F1F2F0` · ink-soft `#AFB3B0` · ink-faint `#7C807D`
- accent `#3BB6B6` · accent-soft `#16302F`
- positive `#34C98A` · warning `#D2A24A`

### High-contrast (accessibility)
- bg `#FFFFFF` · surface `#FFFFFF` · border `#000000`
- ink `#000000` · ink-soft `#1A1A1A` · ink-faint `#333333`
- accent `#006A6A` (darkened teal for max contrast) · accent-soft `#D5ECEC`
- positive `#0B6B45` · warning `#7A5710`
- text weights a step bolder; borders more solid. The point is maximum legibility, not calm.

### Dim / reading (warm, low-glare)
- bg `#1C1B19` (warm dark, not black) · surface `#24221F` · border `#3A3733`
- ink `#EDE8E0` · ink-soft `#B8B2A8` · ink-faint `#857F75`
- accent `#46B3A8` · accent-soft `#1E302E`
- positive `#42BE8C` · warning `#C99B57`
- warmer than Dark; designed for long reading (good for the blog).

### System-auto (default)
- Not its own palette. On first visit, follow the device preference → use **Light** or **Dark** accordingly. The visitor can then pick any mode explicitly; remember their choice for the session.

## 5. Shared building blocks (the pieces every product reuses)
Build these here so products don't rebuild them. Each must work in all four modes and meet the accessibility floor.

- **Wordmark** — the "weaverbit" mark (mono).
- **Nav** — top bar: wordmark + links + the mode switcher.
- **Footer** — minimal: copyright, product links, social/RSS.
- **ModeSwitcher** — the control to change display mode (the five modes, System-auto default).
- **StatusTag / StatusDot** — "LIVE" / "UPCOMING" etc.: a dot **plus** a mono label (never color alone).
- **SectionLabel** — the mono uppercase little heading (e.g. "PORTFOLIO").
- **Prose** — the styled wrapper for long body text (used by blogs), tuned to the tokens.

Products may pass in their own content/props but should not restyle these away from the brand.

## 6. Rules for the package
- Tokens are the only source of color/font/spacing. No raw hex in any product.
- Everything ships in all four modes; the build isn't done until each block is checked in each mode.
- Versioned by git tag; products install a specific version from GitHub and upgrade deliberately.
- Keep it lean — shared primitives only, no product-specific logic.

## 7. How it's built
Build in its own repo (`weaverbit-core`) through the normal loop: it's the first thing built, and weaverbit.com (the first product) installs it. Treat the color values above as the starting point; the build's job includes verifying real contrast in every mode and adjusting. Any change to the *decisions* (not just values) goes back to `BRAND.md` first.
