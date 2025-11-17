# opencode Integration for Superpowers

This directory contains custom commands for [opencode](https://opencode.ai), enabling Superpowers skills to be used directly within the opencode CLI.

## Installation

The opencode commands are automatically installed when you run the bootstrap:

```bash
superpowers-agent bootstrap
```

Or install only the opencode commands:

```bash
superpowers-agent install-opencode-commands
```

Commands are installed to: `~/.config/opencode/command/`

## Available Commands

### `/brainstorm`
Refine ideas into designs through collaborative Socratic questioning. Uses the `superpowers:brainstorming` skill.

**Usage:**
```
/brainstorm
/brainstorm Build a user authentication system
```

### `/skills`
Discover and search all available skills across project, personal, and system locations.

**Usage:**
```
/skills
```

### `/use-skill`
Load and apply a specific skill by name.

**Usage:**
```
/use-skill superpowers:test-driven-development
/use-skill systematic-debugging
```

### `/write-skill`
Create new skills following TDD methodology with subagent testing. Uses the `superpowers:writing-skills` skill.

**Usage:**
```
/write-skill
/write-skill Create a performance optimization skill
```

### `/write-plan`
Create detailed implementation plans with bite-sized tasks. Uses the `superpowers:writing-plans` skill.

**Usage:**
```
/write-plan
/write-plan Implement user dashboard feature
```

### `/execute-plan`
Execute plans in batches with review checkpoints. Uses the `superpowers:executing-plans` skill.

**Usage:**
```
/execute-plan
```

## Command Structure

All commands follow the opencode markdown format:

```markdown
---
description: Brief description shown in command list
---

# Command Name

Command content with instructions and skill loading.

$ARGUMENTS
```

- **Frontmatter**: Contains command metadata (description, agent, model, etc.)
- **Content**: Instructions for the AI agent, including skill loading commands
- **$ARGUMENTS**: Placeholder for user-provided arguments

## Skill Integration

These commands integrate seamlessly with the Superpowers skills system by:

1. Loading the appropriate skill using `superpowers-agent use-skill`
2. Following skill-specific workflows and methodologies
3. Maintaining consistency with other AI environments (Cursor, GitHub Copilot, Claude Code, etc.)

## Priority Resolution

Skills are resolved with the following priority:
1. Project skills (`.agents/skills/`) - highest priority
2. Claude skills (`.claude/skills/`)
3. Personal skills (`~/.agents/skills/`)
4. System skills (`~/.agents/superpowers/skills/`) - installed by default

## Customization

To add custom commands:

1. Create a new `.md` file in `.opencode/command/`
2. Add frontmatter with command metadata
3. Write command content with skill integration
4. Commands are auto-discovered by opencode

Example:

```markdown
---
description: My custom command
---

# Custom Command

```bash
superpowers-agent use-skill my-skill
```

$ARGUMENTS
```

## Documentation

- opencode commands: https://opencode.ai/docs/commands/
- Superpowers skills: See `skills/` directory
- Bootstrap agent: `.agents/superpowers-agent`

## Support

For issues or questions:
- Superpowers: https://github.com/gregorybleiker/superpowers
- opencode: https://github.com/sst/opencode
