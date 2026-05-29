---
name: leveraging-cli-tools
description: Use when performing code searches, JSON/YAML parsing, file finding, structural refactors, or data wrangling - ensures agents reach for high-performance CLI tools (rg, jq, fd, yq, ast-grep, gh, sd) over slower standard tools like grep/find/sed, cutting token cost and latency 5-50x. Check availability and offer to install a tool when a relevant task arises.
---

# Leveraging CLI Tools

## Purpose

Reach for high-performance CLI tools over slower standard tools. The leverage is filtering and transforming with the right tool **before reading**, so tokens and time go to the answer, not the search. On a large tree `rg` is 10-50x faster than `grep` and returns far less noise; across a session that compounds into hours and tens of thousands of tokens saved.

## When a relevant task arises

1. Pick the right tool from the table below.
2. Confirm it's installed before relying on it — e.g. `command -v rg`.
3. If it's missing, name the tool and its payoff and **offer** to install it — don't install silently. Adapt the command to the user's package manager/OS (the table shows `brew`; substitute `apt install`, `dnf install`, `pacman -S`, `cargo install`, etc.). If they decline, fall back to the standard tool and move on.

Check only the tools the current task needs — no upfront session-wide scan.

## Tools

| Rating | Tool | Replaces | Why | Install |
|:------:|------|----------|-----|---------|
| 10 | `rg` (ripgrep) | `grep`, `grep -r`, `ack` | Code/text search. Respects `.gitignore`, 10-50x faster than `grep` — the highest-leverage tool; filter before reading. | `brew install ripgrep` |
| 10 | `jq` | `grep`/`sed`/`awk` on JSON | JSON query/transform. Turns API responses and config into exactly the fields you need; the pipe target for JSON. | `brew install jq` |
| 9 | `fd` | `find` | File finding. Faster, saner syntax, parallel traversal, `.gitignore`-aware. | `brew install fd` |
| 8 | `yq` | `grep`/`sed`/`awk` on YAML | `jq` for YAML/TOML/XML. Reads CI files, `docker-compose`, k8s manifests, frontmatter. | `brew install yq` |
| 8 | `ast-grep` (`sg`) | `sed`/`grep` for refactors | Structural search/rewrite by AST, not regex. Safe codebase-wide refactors that `sed` would mangle. | `brew install ast-grep` |
| 8 | `gh` | `curl` + GitHub API + tokens | GitHub from the shell — PRs, issues, CI, API. No hand-rolled `curl` + token juggling. | `brew install gh` |
| 7 | `sd` | `sed -i`, `perl -pe` | Find/replace. Literal-string-safe, no regex-escaping footguns. | `brew install sd` |
| 6 | `dasel` | `jq`+`yq`+`xq` (mixed formats) | Query *and modify* JSON/YAML/TOML/XML/CSV through one selector. Use when format is mixed or unknown. | `brew install dasel` |
| 6 | `htmlq` | `grep`/`sed` on HTML | `jq` for HTML — CSS-selector extraction from fetched pages. | `brew install htmlq` |
| 6 | `miller` (`mlr`) | `awk`/`cut`/`join`/`sort` on CSV/TSV | `awk`/`cut`/`join`/`sort` for CSV/TSV/JSON with *named* fields — no brittle column counting. | `brew install miller` |
| 5 | `qsv` | `awk`/`cut`/`sort -u` on CSV, `csvkit` | High-perf CSV toolkit (maintained `xsv` successor). Stats, slice, join, dedup on big CSVs. | `brew install qsv` |
| 5 | `hyperfine` | `time`, `for`-loop timing | Statistical benchmarking with warmups. Real before/after numbers, not `time` guesses. | `brew install hyperfine` |
| 5 | `tokei` | `wc -l`, `find … \| wc`, `cloc` | Instant LOC/language breakdown. Orient in an unfamiliar repo before exploring. | `brew install tokei` |
| 5 | `fzf` (`-f`) | manual fuzzy filtering | Non-interactive `-f`/`--filter` mode: fuzzy-rank a candidate list piped from `fd`/`rg`. | `brew install fzf` |
| 4 | `watchexec` | `while`+`sleep`, `entr` | Run a command on file change. Useful in build/test loops; non-interactive unlike most watchers. | `brew install watchexec` |

## Core workflows

**Filter before reading** — find the matches, then read only those.
```bash
rg -l "password.*hash" src/auth/ --type ts | xargs rg "TODO"
```

**Compose tools** — search, parse, dedup in one pass.
```bash
rg -l '"error"' logs/ --type json | xargs jq -r 'select(.level=="error") | .code' | sort -u
```

**Structural rewrite, not regex** — refactor by AST so syntax can't trip you.
```bash
sg --pattern 'console.log($$$A)' --rewrite 'logger.debug($$$A)' --lang ts
```

In Claude Code the `Grep` and `Glob` tools are themselves built on ripgrep — prefer them for in-context searches, and reach for the CLI tools when you need piping, transforms, or rewrites.

## Red flags

- Parsing JSON/YAML with `awk`/`sed`/`grep` instead of `jq`/`yq`.
- Reading files before filtering them with `rg`.
- Hand-rolling `curl` against the GitHub API instead of `gh`.
- Regex codemods with `sed` where `ast-grep` is structurally safe.

## Common rationalizations

| Excuse | Reality |
|--------|---------|
| "grep works fine" | On a big tree it's 10-50x slower and floods context with noise `rg` would have filtered out. |
| "I don't know if they have jq" | One `command -v jq` answers it; install is seconds and pays back across the whole session. |
| "Not worth the setup" | One install = a speedup on every future task, not just this one. |
| "User didn't ask for optimization" | Faster, lower-noise completion *is* better completion. |

## When NOT to use

- A tiny one-off (a handful of files, well under a megabyte) where the standard tool is already at hand.
- The user declined the install — note the cost once, then use the fallback.
- A teaching context where the standard tool is the point.
