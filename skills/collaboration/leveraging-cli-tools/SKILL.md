---
name: leveraging-cli-tools
description: Use when performing code searches, JSON/YAML parsing, file finding, structural refactors, or data wrangling, or when a command floods context with verbose output like logs, CI, or test runs - ensures agents reach for high-performance CLI tools (rg, jq, fd, yq, ast-grep, gh, sd) over slower standard tools like grep/find/sed and use them with discipline, choosing the right output-reducing flags, composing pipelines so raw output never enters context, and using a bundled reducer for output that flags cannot shape, cutting token cost and latency 5-50x. Check availability and offer to install a tool when a relevant task arises.
compatibility: The bundled scripts/slim.py needs python3 (standard on macOS/Linux). The CLI tools install via the system package manager.
---

# Leveraging CLI Tools

## Purpose

Reach for high-performance CLI tools over slower standard tools. The leverage is filtering and transforming with the right tool **before reading**, so tokens and time go to the answer, not the search. On a large tree `rg` is 10-50x faster than `grep` and returns far less noise; across a session that compounds into hours and tens of thousands of tokens saved.

Picking the faster tool is only half of it. The other half is using it with discipline — two levers that keep raw output out of your context: **ask for less** (the right flags and selectors), and **shrink what you can't shape** (a reducer for inherently verbose output). A fast tool fed a lazy command still floods your context.

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

## Use them with discipline

Five habits separate a fast, low-noise result from a slow, context-flooding one. The token savings below are measured, not hypothetical.

**1 — Pick the tool that fits the data, not the one in muscle memory.** JSON → `jq`, YAML/TOML → `yq`, structural refactor → `ast-grep`, GitHub → `gh`. The reflex to resist is `grep`/`sed`/`awk` on structured data — they treat structure as flat text, so you pay in escaping bugs and noise the format-aware tool never produces.

**2 — Ask for less: use the flag or selector that returns the answer's _shape_.** The biggest single win is never pulling raw output into context. Match the request to the question:

| Question | Flag / selector | Returns |
|----------|-----------------|---------|
| Which files match? | `rg -l` | paths only, no lines |
| How many files? | `rg -l \| wc -l` | a file count, not a line count |
| How many hits? | `rg -c` (lines/file) / `rg --count-matches` (matches/file) | counts only |
| Just the matched bit? | `rg -o` | the substring, not the whole line |
| Enough to judge a hit? | `rg -A/-B/-C N`, `rg -m N` (cap per file) | bounded context |
| Only certain fields? | `jq -r '.a, .b'`, `yq`, `mlr --opprint cut -f` | projected values, not the whole doc |
| First N of a list? | pipe to `head`, or `fd --max-results N` | the slice you need |

For the **projection tools** (`jq`, `yq`, `dasel`, `miller`, `htmlq`) the selector *is* the filter — `jq` turning a 2,000-record array into one summed number is a ~100% reduction on its own. Shape their output at the selector; never post-filter it (that's what habit 4 is *not* for).

**3 — Compose so only the answer comes back.** Do the counting, dedup, and projection *in the pipeline*, not by reading raw output and reasoning over it. One pass keeps every intermediate result out of context:
```bash
rg -l '"error"' logs/ --type json | xargs jq -r 'select(.level=="error") | .code' | sort -u
```
This is the lesson of programmatic tool calling (Amazon's PTC benchmarks: ~87-92% fewer tokens): when a task needs several tool calls plus processing, write **one** pipeline or script that does it all and returns only the result — the intermediate data never touches your context. So: filter before reading, and refactor by AST, not regex:
```bash
rg -l "password.*hash" src/auth/ --type ts | xargs rg "TODO"
sg --pattern 'console.log($$$A)' --rewrite 'logger.debug($$$A)' --lang ts
```

**4 — Shrink what you can't shape: the bundled reducer for verbose emitters.** Some output has no projection flag — logs, CI output (`gh run view --log`), test runs, stack traces, status dumps. Flags get you part way, but the residual stays repetitive, wide, and noisy. Pipe it through `scripts/slim.py` (relative to this skill; use its absolute path if you're working elsewhere) and ask only for the cuts the task needs:
```bash
gh run view --log | python3 scripts/slim.py --errors --uniq --max-line 200
cargo test 2>&1   | python3 scripts/slim.py --errors --dedup
rg -n TODO --no-ignore | python3 scripts/slim.py --group-dir
```
It does dedup (`--dedup`/`--uniq`, repeats collapse to `(xN)`), grouping (`--group-dir` → per-directory counts), truncation (`--head/--tail/--middle/--max-line`), and noise-stripping (`--comments/--errors/--grep`). On a real 1,236-line CI log, `rg` error-filtering alone cut 91% but left ~6,700 tokens; adding `slim` reached 97% — a third the residual. Run `python3 scripts/slim.py -h` for all modes. The cuts are **lossy and opt-in**: ask for what you need, know what you're discarding, and don't reach for it when a projection tool's own selector would do the job.

**5 — Read the output critically — it's a claim, not a fact.** A zero or suspiciously low result is the one to distrust: `rg` skips `.gitignore`d and hidden files by default, so a real match in `node_modules/`, `dist/`, or a dotfile is silently absent. Before concluding "none," re-run with `--no-ignore`, `-uu`, or `--hidden` — then decide whether those ignored hits (vendored deps, build output, generated mirrors) actually belong in the answer; surfacing them is the check, keeping them is a judgment call. Mind case (`-i`) and word boundaries (`-w`) so you neither miss `Subagent` nor over-match `tasks` — and when an identifier doubles as a common word (a `Task` tool vs. the word "task"), even `-w` isn't enough: glance at the context to confirm the hit is the symbol, not prose. When a count or list drives a decision, confirm a match means what you think before acting on it.

In Claude Code the `Grep` and `Glob` tools are themselves built on ripgrep — prefer them for in-context searches, and reach for the CLI tools when you need piping, transforms, rewrites, or output reduction.

## Red flags

- Parsing JSON/YAML with `awk`/`sed`/`grep` instead of `jq`/`yq`.
- Reading files before filtering them with `rg`.
- Piping a tool's full output into context to eyeball it, when `-l`/`-c`/`-o` or a `jq` projection would return just the answer.
- Letting a verbose command (test run, CI log, `git`/`docker` status dump) land raw in context when `slim` would cut it 90%+.
- Reaching for `slim` on a projection tool's output — shape it at the `jq`/`yq`/`mlr` selector instead.
- Concluding "no matches" from a default `rg` run without re-checking `--no-ignore`/`--hidden` — the hit may be sitting in an ignored directory.
- Hand-rolling `curl` against the GitHub API instead of `gh`.
- Regex codemods with `sed` where `ast-grep` is structurally safe.

## Common rationalizations

| Excuse | Reality |
|--------|---------|
| "grep works fine" | On a big tree it's 10-50x slower and floods context with noise `rg` would have filtered out. |
| "I don't know if they have jq" | One `command -v jq` answers it; install is seconds and pays back across the whole session. |
| "Not worth the setup" | One install = a speedup on every future task, not just this one. |
| "The test/CI output is just long, I'll scroll it" | A 1,200-line log is ~75k tokens of mostly noise; `slim --errors --uniq` makes it ~2k without losing the failures. |
| "User didn't ask for optimization" | Faster, lower-noise completion *is* better completion. |

## When NOT to use

- The user declined the install — note the cost once, then use the fallback.
- A teaching context where the standard tool is the point.
- Output you already shaped with a selector — don't add a `slim` pass for its own sake.
