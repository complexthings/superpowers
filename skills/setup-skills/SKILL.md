---
name: setup-skills
description: Run superpowers-agent setup-skills to initialize the skills infrastructure for a project. Use whenever starting a new project with AI agents, when skills symlinks are missing, when AGENTS.md lacks skills configuration, when a user asks to "set up skills", "install skills", "bootstrap skills", or "initialize superpowers". Also use when skills aren't being discovered or when you're about to create project-specific skills and the infrastructure doesn't exist yet. If there's any chance the project hasn't been set up for skills yet, run this skill.
---

# Setup Skills

This skill does one thing: run `superpowers-agent setup-skills` and follow the output it gives you exactly.

The command sets up the full skills infrastructure for a project — creating `.agents/`, symlinks for each AI platform, and updating `AGENTS.md` — and its output tells you everything that happened and what to do next.

## Run the Command

From the project root:

```bash
superpowers-agent setup-skills
```

## Follow the Output Exactly

The command output is authoritative. Read it, act on it, and do not skip any steps it prescribes. It adapts to the platforms detected in your project and tells you precisely what was created, updated, or skipped.

If the command prints follow-up instructions, complete them before continuing with your task.

## If superpowers-agent Is Not Found

Install it first, then rerun:

```bash
@npm install -g @complexthings/superpowers-agent
superpowers-agent setup-skills
```

## After Setup

Project-specific skills belong in `.agents/skills/`. All AI agents working in the project discover them automatically via the symlinks the command created.

To verify:
```bash
superpowers-agent find-skills
```

## Related Skills

- **finding-skills** — Discover available skills after setup
- **using-superpowers** — How the full skills system works
