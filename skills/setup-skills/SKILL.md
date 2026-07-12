---
name: setup-skills
description: Run superpowers-agent setup-skills to detect which AI harnesses (Claude Code, GitHub Copilot, OpenCode, Pi, Codex) are present in a project and wire up its skills infrastructure — .agents/skills/, per-harness symlinks, and each harness's instruction file. Use whenever starting a new project with AI agents, when skills symlinks are missing, when AGENTS.md or CLAUDE.md lacks skills configuration, when a user asks to "set up skills", "install skills", "bootstrap skills", or "initialize superpowers". Also use when skills aren't being discovered, or before creating project-specific skills if the infrastructure doesn't exist yet.
---

# Setup Skills

This skill does one thing: run `superpowers-agent setup-skills` and follow the output it gives you exactly.

## Run the Command

From the project root:

```bash
superpowers-agent setup-skills
```

## What the Command Does

- Creates `.agents/`, `.agents/skills/`, and `.agents/docs/SUPERPOWERS.md` (the reference doc every generated instruction file links to).
- Detects harnesses by dot-folder existence or CLI binary on PATH: Claude Code (`.claude`/`claude`), GitHub Copilot (`.github`/`copilot`), OpenCode (`.opencode`/`opencode`), Pi (`.pi`/`pi`), Codex (`.codex`/`codex`).
- Writes/updates `AGENTS.md` unconditionally (creating it if missing) with tool mappings for Copilot, OpenCode, Pi, and Codex.
- Updates `CLAUDE.md` in place only if one already exists at the project root or in `.agents/` — it never creates a fresh `CLAUDE.md`.
- Creates or updates `.github/copilot-instructions.md` only when GitHub Copilot is detected.
- Keeps exactly one backup per instruction file it touches (dedupes old `*.backup*` files).
- Symlinks each detected harness's skills dir back to `.agents/skills/`: `.claude/skills`, `.github/skills`, `.opencode/skill` (singular). Pi and Codex read `.agents/skills/` directly — no symlink.

## Follow the Output Exactly

The command output is authoritative. Read it, act on it, and do not skip any steps it prescribes. It adapts to the harnesses detected in your project and tells you precisely what was created, updated, or skipped.

If the command prints follow-up instructions, complete them before continuing with your task.

If it fails for any reason other than not-found (e.g. permission denied, partial failure), surface the exact error and stop — do not continue or leave the project half-configured.

## If superpowers-agent Is Not Found

Install it first, then rerun:

```bash
npm install -g @complexthings/superpowers-agent
superpowers-agent setup-skills
```

## After Setup

Project-specific skills belong in `.agents/skills/`. All AI agents working in the project discover them automatically via the symlinks the command created.

To verify, use your platform's native skill tool and confirm the project skills are available.

## Related Skills

- Use your platform's native skill tool to discover available skills after setup.
- Follow your platform's skill guidance for loading and applying them.
