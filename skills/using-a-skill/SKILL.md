---
name: using-a-skill
description: Use when you need to load and apply a specific skill from system, personal, or project locations - automatically handles priority resolution
---

# Using a Skill

## Overview

Load and apply a specific skill by name. Your platform's native skill tool resolves the highest-priority version across configured locations.

## When to Use

Use this skill when you:
- Need to apply a specific skill to your current task
- Want to reference a skill's detailed guidance
- Need to load supporting files or examples from a skill
- Are following another skill that references a sub-skill

## How to Use

1. Load the skill with your platform's native skill tool.
2. If no native tool is available, open the skill's `SKILL.md` directly with your file-read tool.
3. Read any supporting files the skill references before acting.

## Skill Priority

When no explicit source is selected, priority is:

1. Project skills (`.agents/skills/`)
2. Platform project skills (for example, `.claude/skills/`)
3. Personal skills (`~/.agents/skills/`)
4. System skills (`~/.agents/superpowers/skills/`)

## What You Get

When you load a skill, you receive:
- Its main `SKILL.md` content
- References to supporting files
- Frontmatter metadata such as its description and when to use it

## Skill References

Skills may name required sub-skills or background skills. Load those before proceeding.

## Supporting Files

Skills may include supporting files in their directory:
- Example code (`.ts`, `.js`, `.py`, etc.)
- Reference documentation (`.md` files)
- Reusable tools (scripts, templates)

## Common Mistakes

**Don't:**
- Skip loading referenced skills
- Assume you remember skill content

**Do:**
- Load skills on-demand when needed
- Follow cross-references to sub-skills
- Check your platform's available-skills list when you cannot find a skill

## Related Skills

- **finding-skills** - Discover available skills
- **using-superpowers** - Introduction to the skills system
- **writing-skills** - Create new skills
