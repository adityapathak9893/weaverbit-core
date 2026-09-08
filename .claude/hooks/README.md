# `.claude/hooks/` — automated quality gates

Shell scripts that Claude Code runs **automatically** at lifecycle events (configured in `../settings.json`). They are the enforcement muscle of the build loop — they run whether or not the agent "remembers" to check its work.

## The scripts

### `post-edit-verify.sh` — fires after every file edit
Event: `PostToolUse` (matcher `Edit|Write|MultiEdit`).
Runs the **fast** gates only: `typecheck` + `lint`. If either fails, the error is fed straight back to Claude so it fixes the problem immediately instead of letting errors pile up.
Deliberately cheap — it runs on every single edit, so it must be fast. The heavy suite runs at the Stop gate, not here.

### `stop-gate.sh` — fires when Claude tries to finish
Event: `Stop`.
Runs the **full** Definition of Done: `typecheck`, `lint`, `test`, `e2e`, `build`. If any fails, it forces Claude to keep working (exit code 2) instead of ending with broken code.
Includes a `stop_hook_active` guard that prevents an infinite loop (a Stop hook that always blocks would trap the agent forever). The guard parses the event JSON on stdin with `node`; an unparseable payload fails *closed* (gates still run) rather than skipping the gate.

## Fail closed, always
Both scripts read the gate list out of `package.json` with `node`. If `node` is missing or
`package.json` will not parse, they **exit 2** rather than treating it as "no gates defined".
The earlier version suppressed both errors and skipped every gate while exiting 0 — the same
invisible no-op the `jq` path was fixed to remove, wearing a different missing dependency.
`tests/harness.test.ts` asserts the guard is present and that these scripts only ever block
with exit 2.

## Exit-code contract (how hooks talk to Claude Code)
- **exit 0** → success, the agent proceeds.
- **exit 2** → blocking failure; `stderr` text is fed back to Claude. On `PostToolUse` it flags the problem; on `Stop` it forces the agent to continue working.
- other non-zero → non-blocking warning; execution continues.

## Design choice you should know
Gates are **split across two hooks on purpose**: fast feedback (typecheck+lint) on every edit, full enforcement (the whole suite) only before stopping. Running the full suite on every keystroke would make the loop crawl and waste tokens. If you ever want the heavy suite to run more aggressively, move those gates into `post-edit-verify.sh`.

## Both scripts fail safe
If `package.json` or a given npm script doesn't exist yet (e.g. during first scaffolding), the scripts **skip gracefully** rather than block the agent. The gates "switch on" automatically as the project gains its `typecheck`/`lint`/`test`/`e2e`/`build` scripts — so make sure those scripts actually get defined, or the gates stay dormant.

## Requirements
- **Node** — both scripts read `package.json` and the Stop event JSON with `node`. Nothing
  else is needed: `jq` was deliberately dropped because it is not guaranteed to be
  installed, and the old code exited 0 when it was missing, which Stop reads as "all gates
  green" — the entire Definition-of-Done gate disappeared with only a stderr line nobody
  reads. `node` is guaranteed here, since npm runs the gates.
- **The scripts must stay executable.** The exec bit has to be in git, not just on disk:
  `git update-index --chmod=+x .claude/hooks/*.sh`. Committed `100644`, the hook is invoked
  and dies with exit 126 — non-blocking, so the failure never reaches the agent and the gate
  is silently absent. `settings.json` also invokes them as `bash "…/script.sh"`, which ignores the
  exec bit outright — that is the belt to this braces, not a graceful degradation.
- **Neither script *requires* `$CLAUDE_PROJECT_DIR`.** It is preferred when set, but under
  `set -u` a bare expansion of an unset variable aborts the script with exit 1 — non-blocking
  and silent again — so the project root falls back to a `BASH_SOURCE`-derived path.
