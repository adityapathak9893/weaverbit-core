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
- **A broken toolchain skipped every gate.** `has_script` suppressed the errors from
  reading `package.json`, so a missing `node` or an unparseable manifest was read as "no
  such script" and all five gates were skipped with exit 0. Both hooks now exit 2 instead.
- **Unset `CLAUDE_PROJECT_DIR` killed both hooks.** Under `set -u` the unbound variable
  aborted the script with exit 1 — again non-blocking and silent. The project root is now
  resolved from `BASH_SOURCE` when the variable is absent.
- **CI's failure artifact had no readable report.** The `upload-artifact` step already
  collected `test-results/` (raw traces, written on the CI retry), but also pointed at
  `playwright-report/`, which the `github` reporter never writes — so the half a human
  actually reads was always missing. Playwright now emits the `html` report and a
  screenshot on first failure, so a red run is diagnosable without reproducing it.

### Changed

- `npm run lint` now also runs `prettier --check .`, so formatting is enforced by the same
  gate the hooks and CI already run instead of relying on a separate script nobody invokes.
- CI installs only Chromium (both Playwright projects are Chromium) and declares an
  explicit `permissions: contents: read` scope.
- `.claude/agents/code-reviewer.md` no longer cites `UI.md`, `/api/feedback`, or
  `lib/analytics.ts` — none of which exist in a brand package with no server. It does still
  reference `CODE_STANDARDS.md`, which this repo has yet to adopt; see the PR's follow-ups.
- `STRUCTURE.md` §2 matches the template: planning docs live in `docs/`.

### Added

- `tests/gates.test.ts` (backported from the template) and `tests/harness.test.ts` guard the
  invariants above: the five gate scripts exist and are not placeholders, the hooks are
  committed `100755`, `settings.json` points at scripts that exist, and the hooks only ever
  block with exit 2. Every defect fixed here failed *non-blocking*, so nothing but a test
  can tell "enforced" from "silently absent".
- `dev/index.html` ships an inline SVG favicon, so the local demo no longer inherits
  whatever icon the browser cached for `localhost:5173` from another app.
- `coverage/` and `package-lock.json` added to `.prettierignore`.

## [0.1.0] — 2026-09-07

Initial package: design tokens, self-hosted fonts, the five display modes, and the shared
UI building blocks.

[0.1.1]: https://github.com/adityapathak9893/weaverbit-core/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/adityapathak9893/weaverbit-core/releases/tag/v0.1.0
