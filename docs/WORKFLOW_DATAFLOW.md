# WORKFLOW_DATAFLOW.md — weaverbit-core

> **What this is:** the second planning document. It describes *how the product behaves* — the steps a user takes, and how information moves through the system. Filled from the brief + PRODUCT_SPEC, approved by Aditya before code. (See `PROCESS.md` §3.)
>
> Replace every `[ ... ]`. Keep it plain; diagrams in words are fine.
>
> **Status:** ☑ Draft  ☑ Approved by Aditya on 2026-06-22

---

> **Up front — most of this form is N/A, and honestly so.** weaverbit-core is a **package, not an app**. It has **no end users, no pages, no user journeys, and no runtime data** (nothing is fetched, submitted, or stored). Inventing user flows here would be dishonest. So §1–§4 below are reframed around the only two "behaviours" this package actually has:
> - **(a) how a product installs and consumes it** (the developer/agent workflow), and
> - **(b) how mode switching works** at runtime *inside a consuming product* (the one piece of genuine runtime behaviour the package ships).
>
> The remaining sections (data, backend, external services, privacy) are answered plainly, and most are "none — and here's why."

---

## 1. The main user journeys
> Walk through what a person actually does, step by step, for each important path. One short list per journey.

There are **no end-user journeys** (no app, no visitors). The real workflows are the *consumption* workflows below.

### Journey A: A product installs weaverbit-core (one-time, per product)
1. A new product repo is started from `weaverbit-template` (`PROCESS.md` §7).
2. The engineer/agent adds weaverbit-core as a dependency **from GitHub at a pinned tag** (e.g. `npm i github:<owner>/weaverbit-core#v0.1.0`).
3. On install, the package's `prepare` step builds its distributable output (see `SYSTEM_DESIGN.md` §3) so the consumer gets ready-to-import ESM + types. *(Pending confirmation of the build-on-install approach — `SYSTEM_DESIGN.md` §11 Q4.)*
4. The product imports, **once at its root**: the tokens stylesheet, the fonts stylesheet, and the no-flash mode script. From then on it uses only semantic tokens and core components.
5. The product upgrades deliberately later by bumping the pinned tag — never silently (SPEC §6).

### Journey B: A product uses a token or a building block (every day, while building)
1. The engineer/agent needs a color/font/spacing value or a shared UI piece.
2. They reference a **semantic token** (e.g. `var(--wb-ink)` / the Tailwind alias `text-ink`) or import a core component (e.g. `<Nav>`, `<StatusTag>`). They never write a raw hex value or re-pick a font (SPEC §6; `STRUCTURE.md` §2 "Brand always comes from weaverbit-core").
3. The value/component automatically resolves to whatever the active display mode dictates — no per-mode code in the product.

### Journey C: The brand evolves (occasional, owner-driven)
1. Aditya changes a brand *decision* → updates `BRAND.md` first (SPEC §7).
2. The change is encoded here in weaverbit-core (token value, font, or component), verified in all four modes, PR'd, reviewed, merged, and tagged a new version.
3. Each product opts in by bumping its pinned tag when ready.

*(Unhappy paths: a consuming product references a token name that doesn't exist → it falls back to the CSS variable's default/`unset` and the mismatch is caught in that product's own review, not here. A product on an old tag simply keeps the old brand until it upgrades — that is intentional, not a failure.)*

## 2. The screens / pages involved
> List the screens or pages these journeys pass through, and one line on what each is for.

**N/A — the package ships no screens or pages.** The one browser surface that exists is a **local-only demo/preview** used purely to verify the building blocks in all four modes during the build (`SYSTEM_DESIGN.md` §3, §10). It is a development/verification harness, **not shipped** in the installable package and never deployed.

- (dev only) `demo` preview — renders every building block in a chosen mode so we (and Playwright) can verify look + contrast in Light / Dark / High-contrast / Dim.

## 3. How data moves
> For each piece of information the product handles: where does it come from, where does it go, where is it stored (if at all)? Plain words.

The package handles **no application data** — nothing is fetched, submitted, or persisted to any server or database. The *only* piece of state that exists at runtime, inside a consuming product, is the **visitor's chosen display mode**:

| Information | Comes from | Goes to / stored where | Notes |
|---|---|---|---|
| Chosen display mode | The visitor clicking the ModeSwitcher (or, on first visit, their device's `prefers-color-scheme`) | Applied as a `data-mode` attribute on the document root; remembered in the browser's **`sessionStorage`** (per the SPEC's "remember their choice for the session") | Client-side only. Never sent anywhere, never a cookie, no server, no PII. See §7. |
| Token values, fonts | Shipped inside the package (static CSS + font files) | Loaded by the consuming product at its root | Static assets; not "data" in the user sense. |

## 4. States and transitions
> If something has states (e.g. a product is "live" or "upcoming"; a submission is "new" then "read"), list them and what moves between them.

**The display mode is the only stateful thing.** States and transitions:

- **States:** `system-auto` (default — no explicit choice yet), `light`, `dark`, `high-contrast`, `dim`.
- **Initial state:** `system-auto`. With no stored choice, the page follows the device's `prefers-color-scheme` (→ Light or Dark) via CSS, with no JS required for the baseline.
- **Transition:** visitor picks a mode in the ModeSwitcher → that mode is written to the document root (`data-mode`) and saved to `sessionStorage` → all tokens re-resolve instantly. Picking "System" clears the explicit choice and returns to `system-auto`.
- **Re-entry within the session:** the saved choice is read by a small inline script *before first paint* (no flash of the wrong theme), so the visitor sees their chosen mode immediately.
- **New session:** `sessionStorage` is empty again → back to `system-auto`. (Deliberate: the SPEC scopes memory to the session, not forever.)

Separately, the **StatusTag/StatusDot** building block represents a *content* status (e.g. `LIVE` / `UPCOMING`) supplied by the consuming product as a prop. The package does not own or transition that state — it only renders it (always as **dot + mono label**, never color alone; SPEC §5, `BRAND.md`).

## 5. What needs a backend vs. what doesn't
> Be explicit: which parts are just static pages, and which parts genuinely need a server / database / external service? (Keeps us from building backend we don't need.)

- **Static (no server):** **everything.** Tokens are static CSS, fonts are static files, components are client-side React, mode state is client-side `sessionStorage`. The package has no server-side anything.
- **Needs a server/db/service:** **nothing.** weaverbit-core requires no backend, database, or external service of its own — by design.

## 6. External services this depends on
> Anything outside our own code: a database, an email service, an AI API, analytics, etc. Note which are Aditya's to set up.

- **None at runtime.** No database, email, AI API, or analytics. Fonts are **self-hosted inside the package** (no Google Fonts / third-party CDN) — see `SYSTEM_DESIGN.md` §11 Q6 and the GDPR rationale in §7 below.
- **Build/distribution only:** GitHub (hosts the repo that products install from) and the npm toolchain on the consumer's machine (runs the build on install). Aditya owns the GitHub repo + tags; no other accounts needed (no npm registry — `PROCESS.md` §2).

## 7. Privacy / data note
> Does any of this handle personal information? If so, what's the minimal amount we can collect, and how do we stay respectful (and compliant)? (See the product's SYSTEM_DESIGN for the full posture.)

**No personal information is handled at all.** The only stored value is the chosen display mode, kept in `sessionStorage` on the visitor's own device — not a cookie, never transmitted, cleared when the session ends. There is no tracking, no fingerprinting, no analytics in this package. Fonts are self-hosted so a consuming product makes **no third-party font requests** (a quiet but real GDPR win, consistent with the cookieless posture in `CLAUDE.md` / `PROCESS.md` §5). Any product-level analytics or data capture is the *product's* concern, governed by that product's `SYSTEM_DESIGN.md` — never this package.

## 8. Open questions for Aditya
- See consolidated list in `SYSTEM_DESIGN.md` §11. The dataflow-specific one: **confirm `sessionStorage` (per-session memory)** is what you want for the mode choice, matching SPEC §4 "remember their choice for the session" — not `localStorage` (which would persist the choice across sessions/forever). I have planned `sessionStorage` per the SPEC's wording.

---
*Approval gate: Aditya approves before code. (PROCESS.md §3)*
