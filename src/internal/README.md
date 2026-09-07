# `src/internal/` — private shared helpers

Tiny utilities shared across the building blocks that are **deliberately not part of the
public API** — they are never re-exported from `src/index.ts`, and products must not import
them.

| File | Role |
|---|---|
| `cx.ts` | Joins class names, dropping falsy values (so an optional `className` passes straight through). |

Why this isn't `lib/` or a graduated module: per `STRUCTURE.md` §1.1, `lib/`/`components/ui` are
for code with *multiple feature consumers in a product*. This is internal package plumbing with
no product-facing surface, so it stays private here rather than implying a public contract.
