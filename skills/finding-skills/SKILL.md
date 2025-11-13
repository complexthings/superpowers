---
name: finding-skills
description: Use when you need to discover available skills across system, personal, and project locations - lists all skills with filtering and search capability
---

# Finding Skills

## Overview

Discover and search for available skills across all locations: system skills, personal skills, and project-specific skills.

## When to Use

Use this skill when you need to:
- See what skills are available
- Find a skill for a specific task
- Search for skills by keyword or topic
- Understand the skill hierarchy and priority

## How to Use

**List all skills:**
```bash
~/.agents/superpowers/.agents/superpowers-agent find-skills
```

**Search/filter skills:**
The CLI command supports filtering by providing search terms that match against:
- Skill names
- Skill descriptions
- Directory paths

Example searches:
```bash
# Find testing-related skills
~/.agents/superpowers/.agents/superpowers-agent find-skills | grep -i test

# Find debugging skills
~/.agents/superpowers/.agents/superpowers-agent find-skills | grep -i debug
```

## Skill Locations and Priority

Skills are discovered from multiple locations in priority order:

1. **Project skills** (highest priority)
   - `.agents/skills/` - Project-specific skills
   - `.claude/skills/` - Claude-specific project skills

2. **Personal skills**
   - `~/.agents/skills/` - Your personal cross-project skills

3. **System skills** (lowest priority)
   - `~/.agents/superpowers/skills/` - Superpowers community skills

When skills have the same name, project skills override personal skills, which override system skills.

## Output Format

The command shows:
- Skill name with appropriate prefix (`superpowers:`, `claude:`, or none)
- Description (what the skill does and when to use it)
- "When to use" guidance if available

## Quick Reference

| Command | Purpose |
|---------|---------|
| `find-skills` | List all available skills |
| `find-skills \| grep <term>` | Search for specific skills |
| `use-skill <name>` | Load and use a specific skill |

## Related Skills

- **using-a-skill** - Load and apply a specific skill
- **using-superpowers** - Introduction to the skills system
- **writing-skills** - Create new skills
