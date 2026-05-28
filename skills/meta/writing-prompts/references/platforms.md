# Platform formats

Exact locations, file formats, frontmatter, and argument syntax for reusable commands on each platform. Read the section for your target platform when saving the file.

## Contents
- The convergence on SKILL.md
- Claude Code (skills + legacy commands)
- GitHub Copilot (prompt files + custom instructions)
- Cursor (commands + rules + skills)
- Quick pick

## The convergence on SKILL.md

All three platforms are moving the same direction: a reusable command is becoming a skill — a directory containing a `SKILL.md` file with YAML frontmatter. Claude Code states custom commands "have been merged into skills"; Cursor 2.4 promotes Skills as the successor to commands and ships a `/migrate-to-skills` flow; GitHub Copilot reads `AGENTS.md` and a skills-style layout. Legacy formats still work everywhere, but prefer skills for new work where the platform supports them.

A minimal skill, identical in shape across platforms:

```
my-command/
└── SKILL.md
```

```markdown
---
name: my-command
description: What it does and when to use it.
---

# My Command

<the prompt body>
```

## Claude Code

**Skills (recommended).**
- Project: `.claude/skills/<name>/SKILL.md` (commit to git to share)
- Personal: `~/.claude/skills/<name>/SKILL.md` (all your projects)
- The command name comes from the **directory name** → `/my-command`. Frontmatter `name` only sets the display label.
- Precedence: enterprise > personal > project. If a skill and a legacy command share a name, the skill wins.

**Legacy commands (still supported).**
- `.claude/commands/<name>.md` or `~/.claude/commands/<name>.md` → `/name` (from the file name).
- Support the same frontmatter as skills.

**Frontmatter (all optional; `description` is the one that matters for triggering):**
`name`, `description`, `when_to_use`, `argument-hint` (e.g. `[issue-number]`), `arguments` (named positional args), `disable-model-invocation` (default `false` — set `true` to make it manual-only, i.e. a pure slash command the model won't auto-run), `user-invocable` (default `true`), `allowed-tools` / `disallowed-tools`, `model` (or `inherit`), `effort` (`low`/`medium`/`high`/`xhigh`/`max`), `context` (`fork`), `agent`, `hooks`, `paths` (glob auto-activation), `shell` (`bash`/`powershell`).

**Arguments (0-based — note this differs from the old `$1`-is-first convention):**
- `$ARGUMENTS` — all arguments as one string. If the file contains none, the args are appended as `ARGUMENTS: <value>`.
- `$ARGUMENTS[0]` — first argument; `$ARGUMENTS[1]` second, etc.
- `$0`, `$1` — shorthand; **`$0` is the first argument.**
- `$name` — a named argument declared in `arguments:` frontmatter, bound by position.
- Also available: `${CLAUDE_SESSION_ID}`, `${CLAUDE_EFFORT}`, `${CLAUDE_SKILL_DIR}`.

**Bash injection in the body:**
- Inline: `` !`<command>` `` (only at line start or after whitespace).
- Block: a fenced ` ```! ` code block.
- Runs as preprocessing before the model sees the body; requires a matching `allowed-tools` grant such as `Bash(gh *)`.

**Skill vs command vs subagent:**
- Reference-style content (knowledge the model pulls in when relevant) → a normal skill.
- Action you invoke explicitly → a skill with `disable-model-invocation: true`, or a legacy command.
- Delegated, isolated-context work → a subagent in `.claude/agents/<name>.md` (frontmatter `name`, `description`, `tools`, `model`), or a skill run with `context: fork` + `agent:`.

## GitHub Copilot

**Prompt files** (VS Code, Visual Studio, JetBrains):
- Location: `.github/prompts/`
- Naming: `<name>.prompt.md` (e.g. `explain-code.prompt.md`)
- Frontmatter documented by GitHub: `agent:` (value `'agent'`) and `description:`. (`model` and `tools` exist in VS Code's own prompt-file format but are **not** part of GitHub's documented spec — don't rely on them for portability.)
- Invoke: type `/<name>` (no extension) in Copilot Chat → `/explain-code`.

```markdown
---
agent: 'agent'
description: 'Generate a clear code explanation with examples'
---

Explain the selected code. Cover what it does, the non-obvious parts, and one example call.
```

**Repository custom instructions** (always-on context, not invoked):
- Repo-wide: `.github/copilot-instructions.md` — plain Markdown, no frontmatter.
- Path-specific: `.github/instructions/<name>.instructions.md` — frontmatter `applyTo:` (glob, e.g. `applyTo: "app/models/**/*.rb"` or `applyTo: "**"`) and optional `excludeAgent:` (`"code-review"` / `"cloud-agent"`).
- Copilot code review reads only the first 4,000 characters of an instruction file (other features are unaffected). Keep them tight.
- `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` are also recognized.

**Variables documented by GitHub:** input variables only — `${input:name}` and `${input:name:placeholder}` (e.g. `${input:code:Paste your code here}`). The `${selection}`, `${file}`, and `${workspaceFolder}` tokens come from VS Code's editor, not GitHub's spec — fine in VS Code, not portable.

## Cursor

**Commands** (lightly documented; Cursor now steers users toward Skills):
- Location: `.cursor/commands/<name>.md` (project). A user-level form exists but Cursor doesn't publish the exact global path — don't quote one.
- No documented frontmatter; commands are described simply as reusable prompts.
- No documented argument/parameter passing.
- Invoke: type `/` in the Agent input and pick the command.

**Skills (preferred going forward):** `SKILL.md`-based, same shape as the convergence example above. Cursor ships `/migrate-to-skills` to convert commands.

**Rules** (passive context, auto-injected — not invoked like commands):
- Location: `.cursor/rules/` as `.md` or `.mdc`. Use `.mdc` for frontmatter.
- Frontmatter: `description` (string), `globs` (file pattern), `alwaysApply` (boolean).
- Types: **Always** (`alwaysApply: true`), **Agent Requested** (description, no globs — pulled in when relevant), **Auto Attached** (matches `globs`), **Manual** (only via `@`-mention).

## Quick pick

| You want… | Claude Code | GitHub Copilot | Cursor |
|---|---|---|---|
| Invoke a saved prompt by name | `.claude/skills/<name>/SKILL.md` → `/name` | `.github/prompts/<name>.prompt.md` → `/name` | `.cursor/commands/<name>.md` → `/name` |
| Always-on project context | `.claude/skills/` (auto-invoked) or `CLAUDE.md` | `.github/copilot-instructions.md` | `.cursor/rules/*.mdc` |
| Path-scoped context | `paths:` frontmatter | `.github/instructions/*.instructions.md` (`applyTo`) | `.cursor/rules/*.mdc` (`globs`) |

When in doubt, write a `SKILL.md` — it's the format all three are converging on.
