#!/usr/bin/env bash
# setup-rtk.sh — verify rtk is configured for the current agentic harness.
#
# Contract:
#   - Default (no args): CHECK + REPORT only. Detects the harness, prints
#     config status per-check ([ok]/[missing]), and prints the EXACT rtk
#     commands that would fix any gap. Changes NOTHING.
#   - `--apply`: runs the planned fix commands for the DETECTED harness only.
#     Every fix is a call to `rtk init ...`, which is itself create-if-absent
#     and never overwrites existing config, so re-running is always safe.
#   - If the harness can't be determined, every harness is checked read-only
#     and nothing is ever applied (there's no single harness to act on).
#
# Usage:
#   scripts/setup-rtk.sh            # check + report (safe, default)
#   scripts/setup-rtk.sh --apply    # run the planned fix commands

set -euo pipefail

APPLY=false
if [ "${1:-}" = "--apply" ]; then
  APPLY=true
fi

if ! command -v rtk >/dev/null 2>&1; then
  echo "[--] rtk is not installed or not on PATH — nothing to check."
  echo "     Install rtk first, then re-run this script."
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
PLANNED=()

plan() {
  PLANNED+=("$1")
  echo "  planned: $1"
}

run_planned() {
  for cmd in "${PLANNED[@]}"; do
    echo "  running: $cmd"
    eval "$cmd"
  done
}

# --- Harness detection -------------------------------------------------
# Sensible, lazy heuristic: harness-specific env vars first, then config
# dirs. Order matters — check the most specific/reliable signal first.
detect_harness() {
  if [ -n "${CLAUDECODE:-}" ] || [ -n "${CLAUDE_CODE_ENTRYPOINT:-}" ]; then
    echo claude; return
  fi
  if [ -n "${CODEX_SANDBOX:-}" ] || [ -n "${CODEX_HOME:-}" ]; then
    echo codex; return
  fi
  if [ -n "${OPENCODE_MODEL:-}" ] || [ -d "$HOME/.config/opencode" ] && [ -n "${OPENCODE_EXPERIMENTAL_MARKDOWN:-}${OPENCODE_BIN_PATH:-}" ]; then
    echo opencode; return
  fi
  if [ -n "${PI_AGENT:-}" ] || [ -n "${PI_HOME:-}" ]; then
    echo pi; return
  fi
  if [ -n "${GITHUB_COPILOT_CLI:-}" ] || [ -n "${COPILOT_AGENT:-}" ]; then
    echo copilot; return
  fi
  echo unknown
}

# --- Per-harness checks -------------------------------------------------
# Each check prints [ok]/[missing] status lines and calls `plan` for any
# gap. None of these mutate anything by themselves.

check_claude() {
  echo "Claude Code:"
  local show
  show="$(rtk init --show 2>&1)"
  local core global_bad local_bad
  core="$(printf '%s\n' "$show" | grep -E '(Hook:|RTK\.md:|Global \(|Local \(|settings\.json:)' || true)"
  global_bad="$(printf '%s\n' "$core" | grep -v 'Local (' | grep -v '^\[ok\]' || true)"
  local_bad="$(printf '%s\n' "$core" | grep 'Local (' | grep -v '^\[ok\]' || true)"

  if [ -z "$global_bad" ] && [ -z "$local_bad" ]; then
    echo "$core" | sed 's/^/  /'
    echo "  [ok] rtk fully configured for Claude Code"
    return
  fi

  echo "$core" | sed 's/^/  /'
  if [ -n "$global_bad" ]; then
    plan "rtk init -g --auto-patch"
  fi
  if [ -n "$local_bad" ]; then
    plan "rtk init --auto-patch"
  fi
  CLAUDE_NEEDS_RESTART=true
}

check_opencode() {
  echo "OpenCode:"
  local plugin="$HOME/.config/opencode/plugins/rtk.ts"
  if [ -f "$plugin" ]; then
    echo "  [ok] plugin installed ($plugin)"
  else
    echo "  [missing] plugin not found ($plugin)"
    plan "rtk init -g --opencode"
  fi
}

check_pi() {
  echo "pi:"
  local ext="$HOME/.pi/agent/extensions/rtk.ts"
  local repo_rtk="$REPO_ROOT/RTK.md"
  if [ -f "$ext" ]; then
    echo "  [ok] extension installed ($ext)"
  else
    echo "  [missing] extension not found ($ext)"
    plan "rtk init -g --agent pi"
  fi
  if [ -f "$repo_rtk" ]; then
    echo "  [ok] repo RTK.md present ($repo_rtk)"
  else
    echo "  [missing] repo RTK.md not found ($repo_rtk)"
    plan "rtk init --codex"
  fi
}

check_codex() {
  echo "codex:"
  local codex_home="${CODEX_HOME:-$HOME/.codex}"
  local global_rtk="$codex_home/RTK.md"
  local repo_rtk="$REPO_ROOT/RTK.md"
  if [ -f "$global_rtk" ]; then
    echo "  [ok] global RTK.md present ($global_rtk)"
  else
    echo "  [missing] global RTK.md not found ($global_rtk)"
    plan "rtk init -g --codex"
  fi
  if [ -f "$repo_rtk" ]; then
    echo "  [ok] repo RTK.md present ($repo_rtk)"
  else
    echo "  [missing] repo RTK.md not found ($repo_rtk)"
    plan "rtk init --codex"
  fi
}

check_copilot() {
  echo "GitHub Copilot:"
  local global_hook="$HOME/.copilot/hooks/rtk-rewrite.json"
  local repo_hook="$REPO_ROOT/.github/hooks/rtk-rewrite.json"
  if [ -f "$global_hook" ]; then
    echo "  [ok] global hook present ($global_hook)"
  else
    echo "  [missing] global hook not found ($global_hook)"
    plan "rtk init -g --copilot"
  fi
  if [ -f "$repo_hook" ]; then
    echo "  [ok] repo hook present ($repo_hook)"
  else
    echo "  [missing] repo hook not found ($repo_hook)"
    plan "rtk init --copilot"
  fi
}

# --- Main ----------------------------------------------------------------
CLAUDE_NEEDS_RESTART=false
HARNESS="$(detect_harness)"

case "$HARNESS" in
  claude)
    echo "Detected harness: Claude Code"
    check_claude
    ;;
  opencode)
    echo "Detected harness: OpenCode"
    check_opencode
    ;;
  pi)
    echo "Detected harness: pi"
    check_pi
    ;;
  codex)
    echo "Detected harness: codex"
    check_codex
    ;;
  copilot)
    echo "Detected harness: GitHub Copilot"
    check_copilot
    ;;
  unknown)
    echo "Harness could not be determined — checking all harnesses read-only."
    check_claude
    check_opencode
    check_pi
    check_codex
    check_copilot
    echo
    echo "No single harness detected, so nothing can be applied automatically."
    echo "Re-run on the target machine/agent, or configure manually with the commands above."
    exit 0
    ;;
esac

echo
if [ "${#PLANNED[@]}" -eq 0 ]; then
  echo "rtk is already configured for $HARNESS. Nothing to do."
  exit 0
fi

if [ "$APPLY" = true ]; then
  echo "Applying fixes for $HARNESS..."
  run_planned
  if [ "$HARNESS" = "claude" ] && [ "$CLAUDE_NEEDS_RESTART" = true ]; then
    echo
    echo "rtk config changed for Claude Code — please restart Claude Code to pick it up."
  fi
else
  echo "Run again with --apply to execute the planned command(s) above."
fi
