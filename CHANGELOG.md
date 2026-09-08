# Changelog

All notable changes to `weaverbit-core` are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Because
every Weaverbit product installs this package, a breaking change here breaks all of
them — the public API surface (`exports` in `package.json`) is the contract.

## [Unreleased]

Harness fix carried over from `weaverbit-template` (PR #2). **No API change** — nothing
under `dist/` is touched, so consumers are unaffected; this only changes how the build
harness gates a session.

### Fixed

- **The Stop gate deadlocked when `node` was the missing dependency.** 0.1.1 made the hooks
  fail closed, but `stop-gate.sh` still needed `node` to parse `stop_hook_active` off stdin.
  With `node` absent the guard could never fire, so the new fail-closed branch below it
  exited 2 on *every* stop — and a Stop hook that exits 2 re-triggers itself, so the agent
  could never finish. The guard is now two-tier: `node` parses the JSON when it is
  available, and a whitespace-stripped string match covers the one case where it is not.
  A continuation exits 0 with no `node`; a genuine stop still exits 2, because the gates
  genuinely cannot run.
- **A node warning on stderr could un-find a gate.** Both hooks captured the manifest read
  with `2>&1`. Command substitution strips trailing newlines, so a node warning would glue
  itself onto a script name — an at-exit one onto the last, the far commoner startup
  `ExperimentalWarning` onto the first — and that gate would stop matching, the exact
  silent skip the fail-closed work existed to remove. stderr now flows to the hook's own
  stderr, which is what reaches Claude anyway.
- **An unresolvable project root gated the wrong directory.** Both hooks now reject an empty
  root with exit 2 instead of running `cd ""`, which succeeds and stays put — the gates would
  have run against whatever the cwd happened to be. This is a narrow hardening, not a live
  bug: `${CLAUDE_PROJECT_DIR:-…}` already substituted on empty as well as unset, so the only
  way to reach it is the `BASH_SOURCE` fallback failing to resolve its own location.

### Changed

- `tests/harness.test.ts` spawns the hooks instead of grepping their source. The old
  fail-closed specs asserted source text, and a string search cannot see an exit code:
  reintroducing the bug behind `npm pkg get … || true` left them green. The specs now drive
  each hook in a throwaway project root and assert the status Claude Code actually reads:
  that a red gate blocks with exit 2, that both hooks observably run the gates they own
  (all five for the Stop gate, typecheck and lint only for the fast one), and that a
  continuation is let through on both tiers of the guard. Each spec was verified to turn red
  against the mutation it exists to catch.

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
  `lib/analytics.ts` — none of which exist in a brand package with no server. Every document
  it now names is present in the repo.
- `CLAUDE.md` §1 describes this package instead of weaverbit.com: no server, no database, no
  analytics, no PII, no deploy target — consumed by products from a GitHub tag. §2's `build`
  line said `next build`; it is `tsc` plus an asset copy.
- `STRUCTURE.md` §2 matches the template: planning docs live in `docs/`.

### Added

- `CODE_STANDARDS.md` at the root, copied unchanged from `weaverbit-template`. This repo
  follows it like any product, and it completes the spine `STRUCTURE.md` §2 describes.
- `tests/gates.test.ts` (backported from the template) and `tests/harness.test.ts` guard the
  invariants above: the five gate scripts exist and are not placeholders, the hooks are
  committed `100755`, `settings.json` points at scripts that exist, and the hooks only ever
  block with exit 2. Every defect fixed here failed *non-blocking*, so nothing but a test
  can tell "enforced" from "silently absent".
- `dev/index.html` ships an inline SVG favicon, so the local demo no longer inherits
  whatever icon the browser cached for `localhost:5173` from another app.
- `coverage/` and `package-lock.json` added to `.prettierignore`.

### Removed

- `.github/workflows/README.md`. It documented a Vercel/Railway deploy that this package
  does not have, and a single-workflow folder does not clear the bar in `CLAUDE.md` §11 —
  the reasoning that earns its keep now lives in comments inside `ci.yml` itself.
- The four `.claude/**/README.md` files, for the same reason: §11 excludes the control-layer
  folders, whose files are named for what they do. The one thing they documented that the
  filenames do not — the exit-code contract, and why the scripts fail closed — moved into
  the header of each hook script, next to the code it governs.

## [0.1.0] — 2026-09-07

Initial package: design tokens, self-hosted fonts, the five display modes, and the shared
UI building blocks.

[unreleased]: https://github.com/adityapathak9893/weaverbit-core/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/adityapathak9893/weaverbit-core/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/adityapathak9893/weaverbit-core/releases/tag/v0.1.0
