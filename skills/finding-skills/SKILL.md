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

### Native Skill Tool

Most AI coding assistants expose a native skill mechanism. Use it first:

- If your platform has a native skill tool, use it to list or load skills by name.
- If skills appear in your system context (for example, an `<available_skills>` block), scan that list before starting.
- If your platform supports skill mentions or tool invocations, use those to activate a skill directly.

If no native list is available, inspect the project's `.agents/skills/` directory or the skill paths provided by your platform. Open the relevant `SKILL.md` with your file-read tool.

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

1. Load it with your platform's native skill tool, or open its `SKILL.md` with your file-read tool.
2. Announce: "Using Skill: [name] to [purpose]"
3. Follow the skill's instructions exactly

If a skill exists for your task, using it is not optional — skills encode solutions to known problems.

## Common Mistakes

**Don't:**
- Skip checking for skills because "this is simple"
- Assume you remember what skills are available
- Search only by exact name

**Do:**
- Check at the start of every task, before writing code or asking clarifying questions
- Search broadly for related descriptions
- If in doubt whether a skill applies, load it and check

## Related Skills

- **using-a-skill** - How to load and apply a skill once found
- **using-superpowers** - Introduction to the full skills system
- **writing-skills** - Create new skills using TDD
