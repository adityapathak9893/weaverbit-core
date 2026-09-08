#!/usr/bin/env bash
# stop-gate.sh
# Fires when Claude is about to finish responding (Stop event).
# Enforces the Definition of Done (CLAUDE.md §3): the session may not end
# until typecheck, lint, test, e2e, and build all pass.
#
# CRITICAL: Stop hooks fire on EVERY stop. Returning exit 2 forces Claude to
# keep working — without the stop_hook_active guard this creates an infinite
# loop. We read stdin JSON and bail to exit 0 if we're already inside a
# hook-triggered continuation.

set -uo pipefail

INPUT=$(cat)

# Prevent infinite loop: if this stop was itself triggered by a prior block, allow it.
#
# Why not jq: it is not guaranteed to be installed, and the old code exited 0 when it
# was missing — Stop treats exit 0 as "all good", so the whole Definition-of-Done gate
# vanished with only a stderr line nobody reads. node is guaranteed here (this is a
# Node repo, and npm runs the gates), so the parse can never be the reason we skip.
ACTIVE=$(printf '%s' "$INPUT" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{let v=false;try{v=JSON.parse(s).stop_hook_active===true}catch{}process.stdout.write(String(v))})" 2>/dev/null)
if [ "$ACTIVE" = "true" ]; then
  exit 0
fi

# Prefer CLAUDE_PROJECT_DIR; fall back to a path derived from this script's own location
# when it is unset or empty. Why the fallback: under `set -u` a bare $CLAUDE_PROJECT_DIR
# aborts the script with "unbound variable" and exit 1 — a NON-blocking code, so the gate
# would disappear silently and the agent would never be told. A hook that quietly does
# nothing is worse than no hook. BASH_SOURCE also covers the git-bash-on-Windows case
# where the env var was the thing that went missing.
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

cd "$PROJECT_DIR" || {
  echo "stop-gate: cannot cd to project root ($PROJECT_DIR); gates NOT run." >&2
  exit 2
}

# Nothing to gate before the project exists.
if [ ! -f package.json ]; then
  exit 0
fi

# The gate list is read from package.json with node, so both must work. Fail CLOSED:
# if node is missing or package.json is unparseable, exit 2 rather than skipping. Why this
# matters: the previous `has_script` swallowed both errors with 2>/dev/null and returned
# "script not defined", so a broken package.json silently skipped every gate and reported
# success — the same invisible no-op that the jq path was fixed to remove, just with a
# different missing dependency.
if ! command -v node >/dev/null 2>&1; then
  echo "stop-gate: node not found — gates could NOT run." >&2
  exit 2
fi

if ! SCRIPTS=$(node -e 'const s = require(process.cwd() + "/package.json").scripts || {}; process.stdout.write(Object.keys(s).join("\n"))' 2>&1); then
  echo "stop-gate: cannot read package.json scripts — gates NOT run:" >&2
  echo "$SCRIPTS" >&2
  exit 2
fi

# Exact line match against the captured list, using only builtins: no pipe (a `grep -q`
# would close the pipe early and trip pipefail) and no extra node process per gate.
has_script () {
  case $'\n'"$SCRIPTS"$'\n' in
    *$'\n'"$1"$'\n'*) return 0 ;;
    *) return 1 ;;
  esac
}

run_gate () {
  local script="$1"
  local OUT
  # Skip gracefully if the script isn't defined yet.
  if ! has_script "$script"; then
    return 0
  fi
  if ! OUT=$(npm run "$script" 2>&1); then
    echo "--- ${script} failed ---" >&2
    echo "$OUT" >&2
    return 1
  fi
  return 0
}

FAIL=0
for g in typecheck lint test e2e build; do
  if ! run_gate "$g"; then
    FAIL=1
  fi
done

if [ "$FAIL" -ne 0 ]; then
  echo "Definition of Done not met — gates above are red. Keep working; do not stop until all pass." >&2
  exit 2
fi

exit 0
