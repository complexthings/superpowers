---
name: finding-skills
description: Use when you need to discover what skills are available before starting any task, find a skill for a specific problem, search by keyword or topic, or understand which skill to use. Always check for skills at the start of any conversation or before beginning a task — if a skill exists for what you're doing, you must use it.
---

# Finding Skills

## Overview

Before starting any task, discover what skills are available so you don't reinvent solved problems. Skills encode proven workflows — using them prevents known mistakes and saves time.

## When to Use

- Starting a new task or conversation (always check first)
- Looking for guidance on a specific problem (debugging, testing, planning, etc.)
- Unsure whether a skill exists for something you're about to do
- Asked "is there a skill for X?" or "what skills are available?"

## How to Find Skills

### Native Skill Tool (Primary Method — All Platforms)

Most AI coding assistants expose a native skill or tool mechanism. Use it first:

- **If your platform has a native `skill` tool**: use it to list or load skills by name — this is the fastest path
- **If skills appear in your system context** (e.g., an `<available_skills>` block or similar): scan that list before starting any task
- **If your platform supports `@skill` mentions or tool invocations**: use those to activate a skill directly

When in doubt, check whatever mechanism your platform provides to discover available skills before doing anything else.

### CLI: superpowers-agent find-skills

```bash
superpowers-agent find-skills
```

This shows all skills from superpowers-managed locations with their names and descriptions.

**Filter by piping to grep:**
```bash
# Find testing-related skills
superpowers-agent find-skills | grep -i test

# Find debugging skills
superpowers-agent find-skills | grep -i debug

# Find skills about a topic
superpowers-agent find-skills | grep -i brainstorm
```

**Get the path to a specific skill:**
```bash
superpowers-agent path <skill-name>
```

**Load and execute a skill directly:**
```bash
superpowers-agent execute <skill-name>
```

## Skill Locations and Priority

Skills are discovered from multiple locations. Higher priority overrides lower when names conflict:

| Priority | Location | Scope |
|----------|----------|-------|
| 1 (highest) | `.agents/skills/` in project | Project-specific |
| 1 (highest) | Platform project skill dir (e.g. `.claude/skills/`) | Project-specific |
| 2 | `~/.agents/skills/` | Personal, cross-project |
| 3 | Platform system skill directory | Platform system skills |
| 4 (lowest) | `~/.agents/superpowers/skills/` | Superpowers community skills |

Project skills always win. When a project skill and a system skill share the same name, the project version is used.

## After Finding a Skill

Once you identify a relevant skill:

1. Load it using your platform's native skill tool, or via `superpowers-agent execute <name>`
2. Announce: "Using Skill: [name] to [purpose]"
3. Follow the skill's instructions exactly

If a skill exists for your task, using it is not optional — skills encode solutions to known problems.

## Common Mistakes

**Don't:**
- Skip checking for skills because "this is simple" — simple tasks are exactly when you're most likely to miss that a skill exists
- Assume you remember what skills are available — the list changes, check fresh each time
- Search only by exact name — grep descriptions too, skills may use different terminology

**Do:**
- Check at the start of every task, before writing code or asking clarifying questions
- Search broadly (e.g., `grep -i plan` finds `writing-plans`, `executing-plans`, etc.)
- If in doubt whether a skill applies, load it and check — it costs little to verify

## Related Skills

- **using-a-skill** - How to load and apply a skill once found
- **using-superpowers** - Introduction to the full skills system
- **writing-skills** - Create new skills using TDD
