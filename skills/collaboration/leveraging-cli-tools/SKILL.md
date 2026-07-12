---
name: leveraging-cli-tools
description: Use when performing code searches, JSON/YAML parsing, file finding, structural refactors, or data wrangling, or when a command could flood context with verbose output like logs, CI runs, test output, or git/docker status dumps. Routes agents to `rtk` (Rust Token Killer), a token-optimized CLI proxy that wraps ripgrep, jq, git, gh, test runners, and more, and to `ponytail` for lazy-solution discipline — instead of reaching for raw grep/find/sed/awk or a per-tool checklist. Also sets up rtk and ponytail for the current harness if either isn't configured yet.
---

# Leveraging CLI Tools

The leverage is filtering and transforming with the right tool **before reading**, so tokens and time go to the answer, not the search. `rtk` is the single entry point for that: it wraps the high-performance CLI tools (ripgrep, jq, git, gh, test runners, and more) and returns token-optimized output automatically, and `rtk proxy` reaches anything it doesn't wrap. `ponytail` supplies the "laziest solution that works" discipline alongside it.

**This supersedes the old approach of memorizing a table of ~16 individual tools (`rg`, `jq`, `fd`, `yq`, `ast-grep`, `sd`, …) and reaching for each one raw.** If you find yourself reconstructing that table from memory, stop — reach for `rtk <tool>` instead, and `rtk proxy <tool>` for anything `rtk` doesn't wrap directly.

## Setup rtk

Before relying on `rtk`, verify it's configured for the current harness:

```bash
bash scripts/setup-rtk.sh
```

(relative to this skill directory — use the absolute path if you're working elsewhere). This script only **checks and reports**; it never changes anything by itself. It:

1. Detects the current harness (Claude Code, OpenCode, pi, codex, GitHub Copilot).
2. Checks whether `rtk` is installed and wired into that harness's config (e.g. `rtk init --show` for Claude Code; the harness-specific config file for others).
3. If everything is already `[ok]`, does nothing further — you're set, move on.
4. If something's missing, prints the exact command(s) it would run to fix it (e.g. `rtk init --auto-patch`, `rtk init -g --auto-patch`, `rtk init -g --opencode`, `rtk init --codex`).

Anything the script reports missing is a **global or repo-config change** — never run the fix command on your own initiative. Surface the report and the exact command(s) to the user and get their confirmation first (see "Ask before you act" below). If the fix touches Claude Code's own config, tell the user to restart Claude Code afterward so the new config is picked up.

## Setup ponytail

Same check → report → confirm pattern, for the `ponytail` discipline skill:

```bash
bash scripts/setup-ponytail.sh
```

It checks that `ponytail` is installed for the current harness (marketplace/plugin/package presence) and that `~/.config/ponytail/config.json` exists. If the config is missing, it offers to create it with `defaultMode: full` — it only ever creates an absent file, it never edits or overwrites one that already exists. Confirm the offered command with the user, same as rtk setup, before it runs.

On GitHub Copilot, also check whether this repo's `.github/copilot-instructions.md` already carries the rtk + ponytail instructions. If not, `references/copilot-instructions.md` (bundled with this skill) is the source of truth to append — offer that too, and confirm before writing.

### Ask before you act

Any setup step that touches global or machine state — installing a package, writing outside this task's working files, editing a config in `$HOME` — gets surfaced and confirmed, never run silently. Ask with whichever question tool your harness exposes: `askUserQuestion`, `ask_user_question`, `askQuestions`, or `question`. Same rule elsewhere in this skill: when you're unsure whether a change is welcome, ask instead of guessing.

## Use rtk with discipline

Picking `rtk` is only half of it. The other half is using it with discipline — the same habits that used to be spread across a dozen raw tools, now aimed at `rtk`'s subcommands.

**1 — Reach for `rtk <tool>` for the data's shape, not a raw tool from muscle memory.** Code/text search → `rtk rg`, JSON → `rtk jq`, git/gh → `rtk git` / `rtk gh`, verbose command output (tests, CI, builds) → the matching `rtk` wrapper (`rtk cargo test`, `rtk playwright test`, `rtk jest`, …). The reflex to resist is reaching for `grep`/`sed`/`awk` on structured data, or a raw tool `rtk` already wraps — both throw away the reduction `rtk` gives you for free.

**Prefer `rtk rg` over `rtk grep`.** They cover the same ground, but `rtk rg` runs ripgrep underneath and is faster and more efficient — use it as the default for code/text search.

**2 — Ask for less: use the flag or selector that returns the answer's _shape_.** The biggest single win is never pulling raw output into context. Match the request to the question:

| Question | Command | Returns |
|----------|---------|---------|
| Which files match? | `rtk rg -l` | paths only, no lines |
| How many files? | `rtk rg -l \| wc -l` | a file count, not a line count |
| How many hits? | `rtk rg -c` (lines/file) / `rtk rg --count-matches` (matches/file) | counts only |
| Just the matched bit? | `rtk rg -o` | the substring, not the whole line |
| Enough to judge a hit? | `rtk rg -A/-B/-C N`, `rtk rg -m N` (cap per file) | bounded context |
| Only certain fields? | `rtk jq -r '.a, .b'` | projected values, not the whole doc |
| Which files, by dir? | `rtk find <pattern>` | paths grouped by directory |
| Only the errors? | `rtk err <cmd>` | filtered stderr/error lines |

Shape output at the selector; never pull the whole thing into context and filter it by eye.

**3 — Compose so only the answer comes back.** Do the counting, dedup, and projection *in the pipeline*, not by reading raw output and reasoning over it. One pass keeps every intermediate result out of context:
```bash
rtk rg -l '"error"' logs/ --type json | xargs rtk jq -r 'select(.level=="error") | .code' | sort -u
```
When a task needs several tool calls plus processing, write **one** pipeline that does it all and returns only the result — the intermediate data never touches your context.

**4 — When `rtk` has no wrapper for a tool, use `rtk proxy <cmd>` instead of the raw command.** `rtk proxy` runs anything raw while keeping it inside the same invocation pattern — e.g. `rtk proxy ast-grep --pattern '...' --lang ts`, `rtk proxy yq '.services' docker-compose.yml`, `rtk proxy sd 'old' 'new' file.ts`. Reach for `rtk <tool>` first; fall back to `rtk proxy <tool>` only when `rtk` doesn't wrap it.

**5 — Read the output critically — it's a claim, not a fact.** A zero or suspiciously low result is the one to distrust: `rtk rg` respects `.gitignore`/`.ignore` by default, so a real match in `node_modules/`, `dist/`, or a dotfile is silently absent. Before concluding "no matches," re-run with `--no-ignore` (or `-u`/`-uu`/`--hidden`) — then decide whether those ignored hits (vendored deps, build output, generated mirrors) actually belong in the answer; surfacing them is the check, keeping them is a judgment call. Mind case (`-i`) and word boundaries (`-w`) so you neither miss a hit nor over-match a common word.

In Claude Code the `Grep` and `Glob` tools are themselves built on ripgrep — prefer them for in-context searches, and reach for `rtk` on the command line when you need piping, transforms, rewrites, or output reduction.

## Red flags

- Parsing JSON/YAML with `awk`/`sed`/`grep` instead of `rtk jq` / `rtk proxy yq`.
- Reading files before filtering them with `rtk rg`.
- Reaching for `rtk grep` by habit when `rtk rg` covers the same ground faster.
- Running a tool raw (`ast-grep`, `yq`, `sd`, …) when `rtk proxy <tool>` would give the same result inside the standard invocation pattern.
- Piping a command's full output into context to eyeball it, when `-l`/`-c`/`-o` or a `rtk jq` projection would return just the answer.
- Concluding "no matches" from a default `rtk rg` run without re-checking `--no-ignore`/`--hidden` — the hit may be sitting in an ignored directory.
- Hand-rolling `curl` against the GitHub API instead of `rtk gh`.
- Reconstructing the old 16-tool table from memory instead of reaching for `rtk`.
- Running a setup fix (`rtk init --auto-patch`, creating `~/.config/ponytail/config.json`, etc.) without confirming with the user first.

## Common rationalizations

| Excuse | Reality |
|--------|---------|
| "grep works fine" | On a big tree it's 10-50x slower and floods context with noise `rtk rg` would have filtered out. |
| "I don't know if rtk is set up" | `bash scripts/setup-rtk.sh` answers it in one check; fixing it pays back across the whole session. |
| "Not worth the setup" | One confirmed fix = a speedup on every future task, not just this one. |
| "The test/CI output is just long, I'll scroll it" | `rtk`'s wrappers (`rtk cargo test`, `rtk playwright test`, …) cut that noise automatically — scrolling raw output throws that away. |
| "This tool isn't in rtk's table, I'll just run it raw" | `rtk proxy <tool>` runs it inside the same pattern — no need to drop back to the bare command. |
| "User didn't ask for optimization" | Faster, lower-noise completion *is* better completion. |

## When NOT to use

- The user declined an rtk/ponytail setup fix — note it once, then fall back to the raw tool and move on.
- A teaching context where the standard tool is the point.
- Output you already shaped with a selector — don't add another reduction pass for its own sake.
