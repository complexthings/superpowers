---
name: using-a-skill
description: Use when you need to load and apply a specific skill from system, personal, or project locations - automatically handles priority resolution
---

# Using a Skill

## Overview

Load and apply a specific skill by name. The system automatically finds the skill across all locations and applies the highest-priority version.

## When to Use

Use this skill when you:
- Need to apply a specific skill to your current task
- Want to reference a skill's detailed guidance
- Need to load supporting files or examples from a skill
- Are following another skill that references a sub-skill

## How to Use

**Basic usage:**
```bash
superpowers-agent use-skill <skill-name>
```

**Examples:**
```bash
# Load a system skill
superpowers-agent use-skill superpowers:brainstorming

# Load a Claude skill
superpowers-agent use-skill claude:persistent-planning

# Load a project or personal skill (no prefix)
superpowers-agent use-skill my-custom-skill
```

## Skill Naming and Prefixes

**Prefixes indicate source:**
- `superpowers:skill-name` - System skill from `~/.agents/superpowers/skills/`
- `claude:skill-name` - Claude skill from `.claude/skills/`
- `skill-name` (no prefix) - Project or personal skill

**Priority resolution (when no prefix specified):**
1. Project skills (`.agents/skills/`) - highest priority
2. Claude skills (`.claude/skills/`)
3. Personal skills (`~/.agents/skills/`)
4. System skills (`~/.agents/superpowers/skills/`) - lowest priority

## What You Get

When you load a skill, you receive:
- The skill's main content (SKILL.md)
- Reference to supporting files directory
- Frontmatter metadata (name, description, when to use)

## Skill References

Skills often reference other skills using patterns like:
- `**REQUIRED SUB-SKILL:** Use superpowers:skill-name`
- `**REQUIRED BACKGROUND:** You MUST understand superpowers:skill-name`

When you see these, load the referenced skill before proceeding.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `use-skill superpowers:<name>` | Load system skill |
| `use-skill claude:<name>` | Load Claude skill |
| `use-skill <name>` | Load with auto-priority |
| `find-skills` | See all available skills |

## Supporting Files

Skills may include supporting files in their directory:
- Example code (`.ts`, `.js`, `.py`, etc.)
- Reference documentation (`.md` files)
- Reusable tools (scripts, templates)

The skill header shows the directory path where these files are located.

## Common Mistakes

**Don't:**
- Force-load skills with `@` syntax (wastes context)
- Skip loading referenced skills (breaks workflows)
- Assume you remember skill content (skills evolve, reload them)

**Do:**
- Load skills on-demand when needed
- Follow cross-references to sub-skills
- Check `find-skills` if you can't find a skill

## Related Skills

- **finding-skills** - Discover available skills
- **using-superpowers** - Introduction to the skills system
- **writing-skills** - Create new skills
