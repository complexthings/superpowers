---
name: create-agents-md
description: Analyzes a codebase and creates or improves an AGENTS.md file at the repo root — the open-standard instruction file that AI coding agents (Claude Code, Codex, Cursor, Copilot, Gemini CLI, Aider, and others) read for build/test commands, code style, and conventions. Use whenever the user asks to create, generate, write, update, or improve an AGENTS.md, onboard agents to a repo, document build/test/lint commands for AI tools, or consolidate scattered agent instruction files (CLAUDE.md, .cursorrules, .cursor/rules, .github/copilot-instructions.md) into one. Use even if the user only says "make an agents file" or "document this repo for AI agents".
metadata:
  version: 1.0.0
---

# Create AGENTS.md

## Overview

`AGENTS.md` is an open, cross-tool standard (https://agents.md/): a "README for agents" placed at the repo root that gives AI coding agents the build steps, test commands, and conventions they need to work in a repository. 20+ tools read it, including Claude Code, OpenAI Codex, Cursor, GitHub Copilot, Gemini CLI, Aider, Jules, and Zed.

This skill produces that file by **reading the actual repository** and writing down what is true of it — never boilerplate, never invented conventions.

**Core principle: facts only.** Every command, style rule, and convention in the output must come from a file you actually read. If you can't verify it, don't write it. A short AGENTS.md that is 100% accurate beats a long one padded with plausible guesses — agents will run the commands you list, and a wrong command wastes their time.

## When NOT to use this skill

- The user wants a human-facing project README → that's `README.md`, not AGENTS.md.
- The user wants to set up the superpowers skills system → use `setup-skills`.
- The user wants to audit/improve a subagent prompt file → use `enhance-agent-prompts`.

## Workflow

Copy this checklist and track progress as you go:

```
AGENTS.md Progress:
- [ ] Step 1: Detect ecosystem and locate inputs
- [ ] Step 2: Read existing instruction files (don't replace blindly)
- [ ] Step 3: Extract verifiable commands (build, lint, test, single test)
- [ ] Step 4: Infer code style and conventions from real source
- [ ] Step 5: Decide scope — single file vs. nested (monorepo)
- [ ] Step 6: Write or improve AGENTS.md
- [ ] Step 7: Self-review against the accuracy checklist
```

Use `leveraging-cli-tools` throughout — prefer `rg`, `fd`, `bat`, `jq`, and `ast-grep` over slower alternatives. The detection commands below assume them.

### Step 1: Detect ecosystem and locate inputs

Identify the stack before reading anything in depth. This tells you which config files matter.

```bash
# Manifests and lockfiles reveal the package manager and language
fd -H -d 2 '^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|bun\.lockb|Cargo\.toml|go\.mod|pyproject\.toml|requirements\.txt|Gemfile|composer\.json|pom\.xml|build\.gradle)$'
```

The lockfile is the source of truth for the package manager: `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb` → bun, otherwise `package-lock.json` → npm. Use the right one in every command you document — telling an agent to run `npm test` in a pnpm repo is a factual error.

### Step 2: Read existing instruction files

Read each of these if present. The goal is to **improve, not overwrite** — preserve still-accurate content and fold in scattered rules.

```bash
fd -H -d 3 '^(AGENTS\.md|CLAUDE\.md|GEMINI\.md|\.cursorrules|copilot-instructions\.md)$'
fd -H -t f . .cursor/rules 2>/dev/null   # Cursor rules live here as .mdc files
```

- **Existing `AGENTS.md`** — treat as the base. Keep what's correct, fix what's stale, fill gaps.
- **`.cursor/rules/*.mdc`, `.cursorrules`, `.github/copilot-instructions.md`, `CLAUDE.md`, `GEMINI.md`** — extract real rules (style, conventions, do/don'ts) and incorporate them verbatim or tightly summarized. Note their source so the user can later consolidate (see [Consolidating instruction files](#consolidating-instruction-files)).

### Step 3: Extract verifiable commands

These are the highest-value content — agents run them directly. Pull them from config, don't guess.

```bash
# Node: the scripts block IS the command list
jq '.scripts' package.json 2>/dev/null

# Other ecosystems: read the real task definitions
bat Makefile justfile Taskfile.yml 2>/dev/null
rg -n '\[tool\.(poetry|hatch|pdm)\.|^\[project\.scripts\]' pyproject.toml 2>/dev/null
```

Capture: **build**, **lint**, **lint:fix/format**, **typecheck**, **test**, and crucially **how to run a single test in isolation** (e.g. `vitest run path/to/file.test.ts -t "name"`, `pytest path::test_name`, `go test ./pkg -run TestName`). Single-test invocation is the one agents most often get wrong, so derive it from the actual test runner rather than assuming.

If a command isn't defined anywhere, say how the tool is normally invoked for that runner — but only if the runner is actually present in the manifest.

### Step 4: Infer code style and conventions

Read formatter/linter config first (these are authoritative), then confirm against a representative sample of real source files.

```bash
fd -H -d 2 '^(\.eslintrc.*|eslint\.config\.*|\.prettierrc.*|prettier\.config\.*|biome\.json|\.editorconfig|ruff\.toml|\.rubocop\.yml|rustfmt\.toml|tsconfig\.json)$'
```

Confirm by reading several source files in the primary language — don't document a rule the config implies but the code contradicts. Cover what an agent needs to match the house style:

- **Imports** — ordering, named vs. default, file extensions, path aliases.
- **Formatting** — quotes, semicolons, indentation, line length (usually settled by the formatter config — cite it).
- **Types** — strictness, annotation expectations, `any` policy.
- **Naming** — files, functions, variables, constants, components, CSS classes.
- **Error handling** — the pattern actually used (Result types, exceptions, error-wrapping helpers) and anything the codebase clearly avoids.

For naming/error patterns, prefer `ast-grep` or `rg` over eyeballing one file, so the convention you state reflects the codebase, not a single example.

### Step 5: Decide scope — single file vs. nested

AGENTS.md supports **nested files**: an agent reads the nearest one in the directory tree, so the closest file wins. For a monorepo, a per-package AGENTS.md often beats one bloated root file.

- **Single package** → one root `AGENTS.md`.
- **Monorepo** (workspaces in `package.json`, `pnpm-workspace.yaml`, Nx/Turbo/Lerna, multiple manifests) → write a root file with shared/global instructions, and offer to add per-package files where commands or conventions genuinely differ. Don't duplicate identical content into every package.

### Step 6: Write or improve AGENTS.md

Write to `AGENTS.md` at the repo root (or the relevant package root for nested files). It's plain Markdown with no required schema — use clear headings. Default to the structure below, dropping any section you have no real content for.

Keep it precise and scannable, written for an agent audience, with no prose padding. **~150 lines is a ceiling, not a goal** — let the real content set the length. A small library might warrant only 30–40 lines; a large monorepo more. If you find yourself adding material to fill space, stop: a short, fully accurate file is the win, and padding directly violates the facts-only principle.

```markdown
# AGENTS.md

Short orienting line: what this project is and the primary language/framework.

## Setup
- Install: `<exact command for this repo's package manager>`
- Env/prereqs: `<only if real — node version from .nvmrc/engines, services, etc.>`

## Commands
- Build: `<cmd>`
- Dev: `<cmd>`
- Lint: `<cmd>`  |  Fix: `<cmd>`  |  Typecheck: `<cmd>`
- Test (all): `<cmd>`
- Test (single): `<exact single-test invocation>`

## Code style
- Imports: `<order, named/default, extensions, aliases>`
- Formatting: `<quotes, semicolons, indent, width — cite the formatter>`
- Types: `<strictness, annotation rules, any policy>`

## Naming conventions
- Files / functions / variables / constants / components / CSS — only the rules that hold

## Error handling
- The pattern this codebase uses; what to avoid

## <Project-specific rules pulled from Cursor/Copilot/CLAUDE files>
- Folded-in rules, kept verbatim or tightly summarized

## PR / commit guidelines
- Only if the repo evidences a convention (commitlint, CONTRIBUTING.md, PR template, git log pattern)
```

Adapt headings to the project. Sourced rules from `.cursor/rules`, Copilot, etc. should be merged into the relevant section above rather than ghettoized — but keep a short note of provenance if it helps the user consolidate later.

### Step 7: Self-review against the accuracy checklist

Before declaring done, re-read the file and verify every line:

```
- [ ] Every command was copied from a real script/task/config — not assumed
- [ ] The package manager matches the lockfile in every command
- [ ] A single-test invocation is present and correct for the actual runner
- [ ] Every style/naming/error rule traces to config or observed source
- [ ] Rules from Cursor/Copilot/CLAUDE files are incorporated, not lost
- [ ] No invented conventions, no aspirational rules, no generic filler
- [ ] An existing AGENTS.md was improved, not blindly replaced
- [ ] Length is set by real content, not a quota (≤ ~150 lines); agent-audience tone; scannable
```

If anything fails, fix it before finishing.

## Consolidating instruction files

A common (community, not part of the official spec) convention is to make AGENTS.md the single source of truth and symlink tool-specific files to it, so every tool reads the same content:

```bash
ln -sf AGENTS.md CLAUDE.md
ln -sf AGENTS.md GEMINI.md
ln -sf AGENTS.md .github/copilot-instructions.md
```

Only do this if the user asks. Flag it as optional and confirm first — it's a destructive change to existing files, and some teams deliberately keep tool-specific instructions separate.

## Edge cases

- **Empty or near-empty repo** — document only the scaffolding that exists (e.g. the manifest and its scripts). Don't pad.
- **Polyglot repo** — lead with the primary language; give each significant language its own command block.
- **Conflicting rules across instruction files** — prefer what the code and config actually do; note the conflict for the user rather than silently picking one.
- **No build/test tooling at all** — keep the file minimal and say so plainly, rather than inventing commands.
