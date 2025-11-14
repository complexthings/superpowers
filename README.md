# Superpowers

A comprehensive skills library of proven techniques, patterns, and workflows for AI coding assistants.

**This is a fork and extension of Jesse Vincent's incredible [Superpowers for Claude Code](https://github.com/obra/superpowers).** Jesse's groundbreaking work and [his amazing blog post](https://blog.fsck.com/2025/10/09/superpowers/) introduced the concept of systematic, reusable skills for AI agents. This fork extends that vision to support agent-agnostic workflows across GitHub Copilot, Cursor, and other AI coding assistants.

## What You Get

- **Testing Skills** - TDD, async testing, anti-patterns
- **Debugging Skills** - Systematic debugging, root cause tracing, verification
- **Collaboration Skills** - Brainstorming, planning, code review, parallel agents
- **Development Skills** - Git worktrees, finishing branches, subagent workflows
- **Meta Skills** - Creating, testing, and sharing skills
- **Utility Commands** - `/skills` to discover available skills, `/use-skill` to load them

Plus:
- **Universal Prompts** - Work across GitHub Copilot, Cursor, and other AI assistants
- **Automatic Integration** - Skills activate automatically when relevant
- **Consistent Workflows** - Systematic approaches to common engineering tasks

# Installation

## Easy Mode

As your Agent to run the following

```bash
Run following https://raw.githubusercontent.com/complexthings/superpowers/refs/heads/main/.agents/INSTALL.md and follow all instructions.
```

## Step by Step

### Agent-Agnostic Workflow Support (Recommended)

This installation method works with **GitHub Copilot, Cursor, Windsurf, and other AI coding assistants** that support the Model Context Protocol or custom prompts.

**Quick Install:**
```bash
mkdir -p ~/.agents/superpowers
cd ~/.agents/superpowers
git clone https://github.com/complexthings/superpowers.git .
~/.agents/superpowers/.agents/superpowers-agent bootstrap
```

The bootstrap process will:
1. Install GitHub Copilot slash commands to your VS Code User profile
2. Install universal instructions for all workspaces
3. List all available skills
4. Auto-load the `using-superpowers` skill

**Installed slash commands** (GitHub Copilot):
- `/brainstorm-with-superpowers` - Interactive design refinement
- `/write-a-skill` - Create new skills with TDD
- `/skills` - Discover available skills
- `/use-skill` - Load and apply a specific skill

See [.agents/INSTALL.md](.agents/INSTALL.md) for detailed installation instructions.

### Alternative: Claude Code Plugin

For Claude Code users, Jesse Vincent's original implementation is available via plugin:

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Claude Code commands:
- `/superpowers:brainstorm` - Interactive design refinement
- `/superpowers:write-plan` - Create implementation plan
- `/superpowers:execute-plan` - Execute plan in batches

**Learn more:** [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/) by Jesse Vincent

## Quick Start

### Discovering Skills

**List all available skills:**
```
/skills
```

Or run directly:
```bash
~/.agents/superpowers/.agents/superpowers-agent find-skills
```

**Search for specific skills:**
```bash
~/.agents/superpowers/.agents/superpowers-agent find-skills | grep -i <topic>
```

### Using Skills

**Load a specific skill:**
```
/use-skill superpowers:brainstorming
```

Or run directly:
```bash
~/.agents/superpowers/.agents/superpowers-agent use-skill superpowers:brainstorming
```

### Common Workflows

**Brainstorm a design:**
```
/brainstorm-with-superpowers
```

**Create a new skill:**
```
/write-a-skill
```

### Automatic Skill Activation

Skills activate automatically when relevant. For example:
- `test-driven-development` activates when implementing features
- `systematic-debugging` activates when debugging issues
- `verification-before-completion` activates before claiming work is done

## What's Inside

### Skills Library

**Testing** (`skills/testing/`)
- **test-driven-development** - RED-GREEN-REFACTOR cycle
- **condition-based-waiting** - Async test patterns
- **testing-anti-patterns** - Common pitfalls to avoid

**Debugging** (`skills/debugging/`)
- **systematic-debugging** - 4-phase root cause process
- **root-cause-tracing** - Find the real problem
- **verification-before-completion** - Ensure it's actually fixed
- **defense-in-depth** - Multiple validation layers

**Collaboration** (`skills/collaboration/`)
- **brainstorming** - Socratic design refinement
- **writing-plans** - Detailed implementation plans
- **executing-plans** - Batch execution with checkpoints
- **dispatching-parallel-agents** - Concurrent subagent workflows
- **requesting-code-review** - Pre-review checklist
- **receiving-code-review** - Responding to feedback
- **using-git-worktrees** - Parallel development branches
- **finishing-a-development-branch** - Merge/PR decision workflow
- **subagent-driven-development** - Fast iteration with quality gates

**Meta** (`skills/meta/`)
- **writing-skills** - Create new skills following best practices
- **sharing-skills** - Contribute skills back via branch and PR
- **testing-skills-with-subagents** - Validate skill quality
- **using-superpowers** - Introduction to the skills system
- **finding-skills** - Discover and search available skills
- **using-a-skill** - Load and apply specific skills

### Commands

Commands are thin wrappers that activate the corresponding skill:

- **brainstorm.md** - Activates the `brainstorming` skill
- **write-plan.md** - Activates the `writing-plans` skill
- **execute-plan.md** - Activates the `executing-plans` skill
- **finding-skills.md** - Activates the `finding-skills` utility
- **using-a-skill.md** - Activates the `using-a-skill` utility

## How It Works

**For Agent-Agnostic Installation:**
1. **Bootstrap Process** - Installs prompts and instructions globally
2. **Skill Discovery** - Finds skills across system, personal, and project locations
3. **Priority Resolution** - Project skills override personal skills override system skills
4. **Universal Integration** - Works with GitHub Copilot, Cursor, and other AI assistants

**For Claude Code Plugin:**
1. **SessionStart Hook** - Loads the `using-superpowers` skill at session start
2. **Skills System** - Uses Claude Code's first-party skills system
3. **Automatic Discovery** - Claude finds and uses relevant skills for your task
4. **Mandatory Workflows** - When a skill exists for your task, using it becomes required

## Philosophy

- **Test-Driven Development** - Write tests first, always
- **Systematic over ad-hoc** - Process over guessing
- **Complexity reduction** - Simplicity as primary goal
- **Evidence over claims** - Verify before declaring success
- **Domain over implementation** - Work at problem level, not solution level

## Contributing

Skills live directly in this repository. To contribute:

1. Fork the repository
2. Create a branch for your skill
3. Follow the `writing-skills` skill for creating new skills
4. Use the `testing-skills-with-subagents` skill to validate quality
5. Submit a PR

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

**Agent-Agnostic Installation:**
```bash
cd ~/.agents/superpowers
git pull
~/.agents/superpowers/.agents/superpowers-agent bootstrap
```

**Claude Code Plugin:**
```bash
/plugin update superpowers
```

## Credits

This project builds on [Jesse Vincent's Superpowers for Claude Code](https://github.com/obra/superpowers). Jesse's pioneering work introduced the concept of systematic, reusable skills for AI agents. Read his excellent blog post: [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/)

This fork extends that vision to support agent-agnostic workflows across multiple AI coding assistants.

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: https://github.com/complexthings/superpowers/issues
- **Original Project**: https://github.com/obra/superpowers
- **Marketplace** (Claude Code): https://github.com/obra/superpowers-marketplace
