# PRODUCT_SPEC.md — weaverbit-core

> **What this is:** the first planning document for any Weaverbit product. It answers *what* we are building and *why*, before any code. Filled in from Aditya's brief, then reviewed and approved by Aditya. No code begins until this is approved. (See `PROCESS.md` §3.)
>
> Fill every section. If a section genuinely does not apply, write "N/A — because…" rather than deleting it. Replace every `[ ... ]`.
>
> **Status:** ☑ Draft  ☑ Approved by Aditya on 2026-06-22
>
> **Note on archetype:** `weaverbit-core` is **not a product/app** — it is the shared **brand package** every Weaverbit product installs (`PROCESS.md` §2). This form was written for products with users and journeys; it is filled here adapted honestly for a library. Where a section assumes an end-user app, it is answered from the package's real point of view (its "users" are *other Weaverbit products* and the engineer building them), not invented to fit.

---

## 1. One sentence
> What is this product, in a single plain sentence a stranger would understand?

weaverbit-core is the shared brand package — design tokens, fonts, five display modes, and a small set of UI building blocks — that every Weaverbit product installs so they all look like one family with **zero local restyling**.

## 2. Who is it for
> Who are the people who will use this? Be specific — not "everyone." If there are two audiences (e.g. users and a hiring manager), name both.

This package has **no end users** — nobody visits it; it is a dependency, not a site. Its "users" are the things and people that *consume* it:

- **Primary — every Weaverbit product (and the engineer/agent building it).** Today: weaverbit.com (the first product to install it). Tomorrow: Cite and every future `*.weaverbit.com` product. The concrete consumer is the build agent (and Aditya) wiring a new product: they install the package and expect the entire brand to "just work."
- **Secondary — Aditya as brand owner.** This package is where `BRAND.md`'s decisions become real values. When the brand evolves, it changes here once and every product upgrades deliberately by git tag.
- **Indirect — the eventual visitors of those products.** They never touch this package, but they experience its output (the fonts, the teal, the five modes). Their accessibility floor (WCAG AA per mode) is a first-class requirement *because* of them, even though they are not "users" of the package.

## 3. Why it exists / the problem
> What problem does it solve, or what need does it meet? Why would someone bother using it?

Without it, every Weaverbit product would re-pick fonts, re-enter hex values, and re-build a mode switcher — guaranteeing drift: products that *almost* match, an accessibility floor implemented inconsistently, and brand decisions scattered across repos with no single source of truth. That contradicts the whole Weaverbit thesis (`PROCESS.md` §0): a portfolio that "reads as handcrafted by one builder."

weaverbit-core solves this by encoding `BRAND.md` **once** as real, named, tested values and shared primitives. Products install it and inherit the identity for free. Brand changes happen in one place. The "family resemblance" (`BRAND.md` §5) becomes a guarantee, not an aspiration. It is deliberately the **first thing built** in the system because every product depends on it.

## 4. What success looks like
> Concrete, checkable signs that this product is doing its job. Avoid vague goals like "make it good." Prefer things you could actually point at.

- A product can install this package **from GitHub at a pinned tag** and get the full brand — tokens, fonts, all five modes, all building blocks — working, with **zero local color/font/spacing declarations** and zero restyling of the shared components.
- weaverbit.com (the first product) consumes it as living proof: its pages reference only semantic tokens and core components; grepping its source finds **no raw hex** and no re-declared font stacks.
- Every building block (§5 of the SPEC) is verified rendering correctly in **all four looks** (Light, Dark, High-contrast, Dim) and meets the accessibility floor — body text ≥ WCAG AA in every mode, High-contrast higher.
- Tokens are demonstrably the **single source** of color/font/spacing: changing a token value changes every consuming product's appearance with no other edits.
- The package is **lean** — shared primitives only, no product-specific logic leaked in (`PROCESS.md` §5 "minimum code", noting shared infrastructure is the legitimate exception).

## 5. What it does — the main things (top level only)
> The handful of core capabilities. Not a feature list — the big rocks. Details go in WORKFLOW_DATAFLOW.md.

- **Design tokens** — every color, plus typography and spacing scales, as named *semantic* variables (`bg`, `surface`, `border`, `ink`, `ink-soft`, `ink-faint`, `accent`, `accent-soft`, `positive`, `warning`), each resolving per mode.
- **Fonts** — Space Grotesk (headings), Inter (body), and one monospace face (technical bits), wired up and loaded efficiently.
- **Five display modes + the switcher** — Light, Dark, High-contrast, Dim/reading, and System-auto (the default), with a small control to change between them and logic to apply and remember the choice.
- **Shared building blocks** — Wordmark, Nav, Footer, ModeSwitcher, StatusTag/StatusDot, SectionLabel, Prose (SPEC §5).
- **Packaging for consumption** — distributed so a Next.js or Vite product installs it from GitHub and consumes tokens + components with no local restyling; versioned by git tag.

## 6. Explicitly NOT in scope
> Just as important as what it does. What are we deliberately NOT building (now)? This is the fence that stops the work sprawling.

- **Not a website.** No pages, routes, content, SEO, navigation destinations, or deployable app. Nobody visits weaverbit-core.
- **No product logic** — no analytics, database, feedback endpoint, blog/MDX, auth, or any single-product feature. (Those live in the products. The harness's `new-post` command and the `feedback`/analytics language in `CLAUDE.md` are SITE concerns and do **not** apply here.)
- **No npm publish.** Installed directly from GitHub by tag (`PROCESS.md` §2). No registry account, no publishing pipeline.
- **No per-product theming UI / no extra brand colors** — products *extend* the brand in their own `DESIGN_GUIDE.md`; this package ships only the shared core.
- **No deployment / infra.** Job ends at an opened PR (`CLAUDE.md` §1, §8).
- **Not redefining the brand decisions** — those live in `BRAND.md`; this package *encodes* them. A change to a *decision* goes back to `BRAND.md` first (SPEC §7).

## 7. Which goal does this serve
> Per the Weaverbit mission: (A) the job/portfolio artifact, (B) product revenue, or both? Be honest — it changes what "good" means.

**Foundational infrastructure that serves both, directly neither.** It earns no revenue and has no portfolio "wow" page on its own. Its value is leverage: it makes (A) the portfolio read as one handcrafted system, and accelerates (B) every revenue product by removing per-product brand work. As a hiring artifact specifically, a well-architected shared design-system package (tokens, theming, a11y, framework-agnostic distribution) is itself strong evidence of staff-level engineering — so "good" here means *exemplary architecture and rigor*, not features.

## 8. The metric that matters
> If this serves revenue: what's the one number that tells us it's working (e.g. weekly active users)? If it serves the portfolio: what does it need to demonstrate?

Portfolio/infrastructure metric: **a product installs the package and needs zero local brand code.** Concretely — when weaverbit.com is built on top of this, the number of locally-declared colors/fonts/mode logic it requires is **0**, and the number of building blocks it has to rebuild is **0**. Secondary signal: number of products sharing one brand from one source (target: every product, starting at 1).

## 9. Open questions for Aditya
> Anything the brief didn't settle. The agent lists these instead of guessing. Aditya answers before approval.

These are carried in full (with my recommendations) in `SYSTEM_DESIGN.md` §11 and `DESIGN_GUIDE.md` §8, since they are mostly technical/visual. The product-level ones:

1. **Audience / framework (resolved).** The building blocks ship as **React components** (weaverbit.com and Cite are React, and React is the cleanest fit). Crucially, this is **not hard-locked** to "every product must be React": the **token + font layer is framework-agnostic plain CSS**, so a future non-React product can still consume the full visual brand (tokens, fonts, modes) and would only forgo the React component wrappers. See `SYSTEM_DESIGN.md` §11 Q3.
2. **The monospace face** — SPEC §2 leaves it as "JetBrains Mono *or* IBM Plex Mono." This is a brand decision. My recommendation: **JetBrains Mono**. See `DESIGN_GUIDE.md` §8 Q1.
3. Confirm there is genuinely **no consumer outside the Weaverbit portfolio** (i.e. we never need a public/registry-published, externally-documented package). I have assumed no — GitHub-only, internal.

---
*Approval gate: Aditya must check "Approved" above before any code in this repo. (PROCESS.md §3)*
