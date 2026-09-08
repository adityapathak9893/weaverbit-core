# Changelog

All notable changes to `weaverbit-core` are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Because
every Weaverbit product installs this package, a breaking change here breaks all of
them — the public API surface (`exports` in `package.json`) is the contract.

## [0.1.1] — 2026-09-09

Harness and CI fixes backported from `weaverbit-template` (PR #1). **No API change** —
no token, component, type, or export was touched, so consumers need no migration.

### Fixed

- **Hooks never ran.** `.claude/hooks/*.sh` were committed non-executable and invoked
  directly, so every `PostToolUse` died with exit 126 — a non-blocking code, meaning the
  failure was invisible and the gate silently absent. Scripts are now committed `100755`
  and invoked via `bash "${CLAUDE_PROJECT_DIR:-.}/…"`.
- **Stop gate vanished without `jq`.** `stop-gate.sh` exited 0 when `jq` was missing, and
  Stop reads exit 0 as "all gates green". The event JSON is now parsed with `node`, which
  is guaranteed present in a Node repo.
- **Unset `CLAUDE_PROJECT_DIR` killed both hooks.** Under `set -u` the unbound variable
  aborted the script with exit 1 — again non-blocking and silent. The project root is now
  resolved from `BASH_SOURCE` when the variable is absent.
- **CI uploaded nothing on failure.** The `upload-artifact` step pointed at
  `playwright-report/`, which the `github` reporter never writes. Playwright now emits the
  `html` report and screenshots on failure, so a red run is diagnosable from the artifact.

### Changed

- `npm run lint` now also runs `prettier --check .`, so formatting is enforced by the same
  gate the hooks and CI already run instead of relying on a separate script nobody invokes.
- CI installs only Chromium (both Playwright projects are Chromium) and declares an
  explicit `permissions: contents: read` scope.
- `.claude/agents/code-reviewer.md` no longer cites documents and paths that do not exist
  in this repo (`UI.md`, `/api/feedback`, `lib/analytics.ts`).
- `STRUCTURE.md` §2 matches the template: planning docs live in `docs/`.

### Added

- `dev/index.html` ships an inline SVG favicon, so the local demo no longer inherits
  whatever icon the browser cached for `localhost:5173` from another app.
- `coverage/` and `package-lock.json` added to `.prettierignore`.

## [0.1.0] — 2026-09-08

Initial package: design tokens, self-hosted fonts, the five display modes, and the shared
UI building blocks.
