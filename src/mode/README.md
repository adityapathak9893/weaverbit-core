# `src/mode/` — the display-mode system

The runtime behind the five modes (BRAND.md §4b, SPEC §4). Everything else in the package is
static; this is the only stateful piece.

| File | Role |
|---|---|
| `types.ts` | `Mode` union, `MODES`, the `wb-mode` storage key, `isMode` guard. No React — safe anywhere. |
| `no-flash-script.ts` | `noFlashScript`: an inline `<head>` string that applies the stored mode **before first paint** (no FOUC). Only ever writes the `data-mode` attribute. |
| `ModeProvider.tsx` | React context: applies `[data-mode]` and persists the choice. `"use client"`. |
| `useMode.ts` | Hook to read/set the mode. `"use client"`; throws if used outside a provider. |

## Conventions / gotchas
- **System-auto = the absence of `[data-mode]`** on `<html>`, so CSS `prefers-color-scheme`
  governs with zero JS. Choosing "System" *removes* the attribute; choosing any other mode sets it.
- **Per-session memory:** the choice is stored in `sessionStorage` (not `localStorage`) — the
  SPEC scopes it to the session, so a new session returns to System-auto.
- **SSR-safe:** `ModeProvider` renders `defaultMode` first, then reconciles from storage on mount,
  so server and first client render match. Pair it with `noFlashScript` so the correct theme is
  painted before hydration.
- **Tamper-safe:** stored values are validated against the known modes before being applied.
