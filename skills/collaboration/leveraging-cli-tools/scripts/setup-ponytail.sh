#!/usr/bin/env bash
# setup-ponytail.sh — verify (and optionally install) the ponytail plugin for
# whichever agent harness is currently running this script.
#
# Contract (same as setup-rtk.sh):
#   - Default (no flags): CHECK + REPORT ONLY. Detects the current harness,
#     prints what's installed/missing and the exact command(s) that WOULD
#     run. Changes nothing on disk or in any plugin registry.
#   - `--apply`: actually runs the planned install commands / writes the
#     planned files.
#   - Idempotent, create-if-absent only. Never overwrites an existing file
#     (in particular ~/.config/ponytail/config.json is left untouched once
#     it exists).
#
# Usage:
#   scripts/setup-ponytail.sh            # check only, changes nothing
#   scripts/setup-ponytail.sh --apply    # apply the plan reported above

set -euo pipefail

APPLY=0
[[ "${1:-}" == "--apply" ]] && APPLY=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COPILOT_ASSET="$SCRIPT_DIR/../references/copilot-instructions.md"
GAPS=0

ok()   { printf '  [ok] %s\n' "$*"; }
gap()  { printf '  [MISSING] %s\n' "$*"; GAPS=$((GAPS + 1)); }
plan() { printf '  would run: %s\n' "$*"; }

# --- detect harness ---------------------------------------------------------
# Lazy heuristic: env vars first (cheapest, most specific), config dir
# presence as fallback. Claude Code is checked first since it sets an
# unambiguous env var even when other harnesses' dirs also exist.
harness=""
if [[ -n "${CLAUDECODE:-}" || -n "${CLAUDE_CODE_ENTRYPOINT:-}" ]]; then
  harness="claude"
elif [[ -n "${CODEX_HOME:-}" || -d "$HOME/.codex" ]]; then
  harness="codex"
elif [[ -n "${GITHUB_COPILOT_CLI:-}" || -d "$HOME/.copilot" ]]; then
  harness="copilot"
elif [[ -n "${OPENCODE_MODEL:-}" || -d "$HOME/.config/opencode" ]]; then
  harness="opencode"
elif [[ -d "$HOME/.pi" ]]; then
  harness="pi"
fi

if [[ -z "$harness" ]]; then
  echo "Could not detect a known agent harness (Claude Code, OpenCode, pi, codex, Copilot). Nothing to check."
  exit 0
fi

echo "Detected harness: $harness"
echo

case "$harness" in
  claude)
    dir="$HOME/.claude/plugins/marketplaces/ponytail"
    if [[ -d "$dir" ]]; then
      ok "ponytail marketplace present ($dir)"
    else
      gap "ponytail marketplace not found ($dir)"
      plan "claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail"
      if [[ $APPLY -eq 1 ]]; then
        claude plugin marketplace add DietrichGebert/ponytail
        claude plugin install ponytail@ponytail
        echo "  -> installed. Run /reload-plugins in Claude Code to pick it up."
      fi
    fi
    ;;

  opencode)
    cfg="$HOME/.config/opencode/opencode.json"
    if [[ -f "$cfg" ]] && grep -q '@dietrichgebert/ponytail' "$cfg"; then
      ok "ponytail listed in $cfg"
    else
      gap "ponytail not listed in $cfg"
      plan "add \"@dietrichgebert/ponytail\" to the \"plugins\" array in $cfg"
      if [[ $APPLY -eq 1 ]]; then
        if command -v jq >/dev/null 2>&1 && [[ -f "$cfg" ]]; then
          tmp="$(mktemp)"
          jq '.plugins = ((.plugins // []) + ["@dietrichgebert/ponytail"] | unique)' "$cfg" > "$tmp" && mv "$tmp" "$cfg"
        elif command -v jq >/dev/null 2>&1; then
          mkdir -p "$(dirname "$cfg")"
          printf '{"plugins":["@dietrichgebert/ponytail"]}\n' > "$cfg"
        else
          echo "  -> jq not found; edit $cfg manually and add \"@dietrichgebert/ponytail\" to \"plugins\"." >&2
        fi
        echo "  -> restart opencode."
      fi
    fi
    ;;

  pi)
    cfg="$HOME/.pi/agent/settings.json"
    if [[ -f "$cfg" ]] && grep -q 'git:github.com/DietrichGebert/ponytail' "$cfg"; then
      ok "ponytail listed in $cfg"
    else
      gap "ponytail not listed in $cfg"
      plan "pi install git:github.com/DietrichGebert/ponytail"
      if [[ $APPLY -eq 1 ]]; then
        pi install git:github.com/DietrichGebert/ponytail
        echo "  -> restart pi."
      fi
    fi
    ;;

  codex)
    dir="$HOME/.codex/plugins/cache/ponytail"
    if [[ -d "$dir" ]]; then
      ok "ponytail plugin cache present ($dir)"
    else
      gap "ponytail plugin cache not found ($dir)"
      plan "codex plugin marketplace add DietrichGebert/ponytail && codex plugin add ponytail@ponytail"
      if [[ $APPLY -eq 1 ]]; then
        codex plugin marketplace add DietrichGebert/ponytail
        codex plugin add ponytail@ponytail
        echo "  -> restart codex."
      fi
    fi
    ;;

  copilot)
    dir="$HOME/.copilot/installed-plugins/ponytail"
    if [[ -d "$dir" ]]; then
      ok "ponytail plugin present ($dir)"
    else
      gap "ponytail plugin not found ($dir)"
      plan "copilot plugin marketplace add DietrichGebert/ponytail && copilot plugin install ponytail@ponytail"
      if [[ $APPLY -eq 1 ]]; then
        copilot plugin marketplace add DietrichGebert/ponytail
        copilot plugin install ponytail@ponytail
        echo "  -> restart copilot."
      fi
    fi

    repo_asset="./.github/copilot-instructions.md"
    if [[ -f "$repo_asset" ]] && grep -q 'Ponytail, lazy senior dev mode' "$repo_asset"; then
      ok "$repo_asset already has ponytail instructions"
    elif [[ -f "$repo_asset" ]]; then
      gap "$repo_asset exists but lacks ponytail instructions"
      plan "append $COPILOT_ASSET to $repo_asset"
      if [[ $APPLY -eq 1 ]]; then
        { echo; cat "$COPILOT_ASSET"; } >> "$repo_asset"
      fi
    else
      gap "$repo_asset not found"
      plan "create $repo_asset from $COPILOT_ASSET"
      if [[ $APPLY -eq 1 ]]; then
        mkdir -p "$(dirname "$repo_asset")"
        cp "$COPILOT_ASSET" "$repo_asset"
      fi
    fi
    ;;
esac

# --- all harnesses: global ponytail config, create-if-absent only ----------
if [[ -n "${APPDATA:-}" ]]; then
  ponytail_cfg="$APPDATA/ponytail/config.json"
else
  ponytail_cfg="$HOME/.config/ponytail/config.json"
fi

echo
if [[ -f "$ponytail_cfg" ]]; then
  ok "$ponytail_cfg already exists (left untouched)"
else
  gap "$ponytail_cfg not found"
  plan "create $ponytail_cfg with {\"defaultMode\":\"full\"}"
  if [[ $APPLY -eq 1 ]]; then
    mkdir -p "$(dirname "$ponytail_cfg")"
    printf '{"defaultMode":"full"}\n' > "$ponytail_cfg"
    echo "  -> created $ponytail_cfg"
  fi
fi

echo
if [[ $GAPS -eq 0 ]]; then
  echo "All ponytail checks passed for harness: $harness."
elif [[ $APPLY -eq 1 ]]; then
  echo "Applied plan for $GAPS gap(s)."
else
  echo "$GAPS gap(s) found. Re-run with --apply to fix."
fi
