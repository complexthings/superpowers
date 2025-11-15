# Superpowers

A comprehensive skills library of proven techniques, patterns, and workflows for AI coding assistants.

**This is a fork and extension of Jesse Vincent's incredible [Superpowers for Claude Code](https://github.com/obra/superpowers).** Jesse's groundbreaking work and [his amazing blog post](https://blog.fsck.com/2025/10/09/superpowers/) introduced the concept of systematic, reusable skills for AI agents. This fork extends that vision to support agent-agnostic workflows across GitHub Copilot, Cursor, Gemini, and other AI coding assistants.

## What You Get

- **Testing Skills** - TDD, async testing, anti-patterns
- **Debugging Skills** - Systematic debugging, root cause tracing, verification
- **Collaboration Skills** - Brainstorming, planning, code review, parallel agents
- **Development Skills** - Git worktrees, finishing branches, subagent workflows
- **Meta Skills** - Creating, testing, and sharing skills
- **Utility Commands** - `/skills` to discover available skills, `/use-skill` to load them

Plus:
- **Universal Prompts** - Work across Claude, GitHub Copilot, Cursor, Gemini, and other AI assistants
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

This installation method works with **OpenCode, GitHub Copilot, Cursor, Windsurf, Gemini, and other AI coding assistants** that support the Model Context Protocol or custom prompts.

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

**Installed slash commands**:
- `/brainstorm` (or `/brainstorm-with-superpowers`) - Interactive design refinement
- `/write-skill` (or `/write-a-skill`) - Create new skills with TDD
- `/skills` - Discover available skills
- `/use-skill` - Load and apply a specific skill
- `/write-plan` - Create implementation plans
- `/execute-plan` - Execute plans in batches

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

## Slash Commands & Skill Priority

Superpowers ships slash-command prompts for OpenCode, Claude Code, GitHub Copilot, Cursor, Gemini, and Codex so every agent can load the exact same skill definitions. Each command is a thin wrapper around `~/.agents/superpowers/.agents/superpowers-agent use-skill <name>`, so skill discovery always walks the same hierarchy before running anything. This section is the canonical reference for where those commands live in the repo and how the loader resolves conflicts.

**Skill priority pipeline (first match wins):**
1. `./skills/` or `.agents/skills/` inside the workspace (project-specific overrides)
2. `.claude/skills/` inside the repo if present (repo-wide Claude overrides)
3. Personal skills in `~/.agents/skills/` (user-level customizations)
4. Bundled Superpowers skills in `~/.agents/superpowers/skills/` (system defaults)

When any slash command runs—no matter which agent it originates from—it invokes the CLI, which enforces the ordering above. Add a `brainstorming` skill under `./skills/` and every tool immediately picks it up without modifying prompt files. The tables below list the commands per agent, their descriptions, and the source file in this repo, along with links to each host tool’s documentation for creating custom slash commands.

### OpenCode

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm` | Refine ideas into designs through Socratic questioning | `.opencode/command/brainstorm.md` |
| `/write-plan` | Create detailed implementation plans | `.opencode/command/write-plan.md` |
| `/execute-plan` | Execute plans in batches with review checkpoints | `.opencode/command/execute-plan.md` |
| `/write-skill` | Create new skills following TDD methodology | `.opencode/command/write-skill.md` |
| `/skills` | Discover and search available skills | `.opencode/command/skills.md` |
| `/use-skill` | Load a specific skill by name | `.opencode/command/use-skill.md` |

Docs: [OpenCode custom commands](https://opencode.ai/docs/commands/)

### Claude Code

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm` | Run the brainstorming skill for Socratic design sessions | `commands/brainstorm.md` |
| `/write-plan` | Create a detailed implementation plan via `writing-plans` | `commands/write-plan.md` |
| `/execute-plan` | Execute implementation plans in batches | `commands/execute-plan.md` |
| `/finding-skills` | List and search available skills | `commands/finding-skills.md` |
| `/using-a-skill` | Load a specific skill by name | `commands/using-a-skill.md` |

Docs: [Claude Code custom slash commands](https://code.claude.com/docs/en/slash-commands#custom-slash-commands)

### GitHub Copilot

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm-with-superpowers` | Refine ideas into designs with the brainstorming skill | `.github/prompts/superpowers-brainstorming.prompt.md` |
| `/write-a-skill` | Follow the writing-skills workflow to create a new skill | `.github/prompts/superpowers-writing-skills.prompt.md` |
| `/skills` | Discover and search all skills | `.github/prompts/superpowers-skills.prompt.md` |
| `/use-skill` | Load a specific skill by name | `.github/prompts/superpowers-use-skill.prompt.md` |

Docs: [VS Code Copilot prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files#_create-a-prompt-file)

### Cursor

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm-with-superpowers` | Guide brainstorming with collaborative questioning | `.cursor/commands/brainstorm-with-superpowers.md` |
| `/write-a-skill` | Apply the writing-skills TDD workflow | `.cursor/commands/write-a-skill.md` |
| `/skills` | Show all skills with search tips | `.cursor/commands/skills.md` |
| `/use-skill` | Load any skill via the CLI | `.cursor/commands/use-skill.md` |

Docs: [Cursor custom commands](https://cursor.com/docs/agent/chat/commands#creating-commands)

### Gemini

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm-with-superpowers` | Refine ideas into designs with the brainstorming skill | `.gemini/prompts/brainstorm-with-superpowers.toml` |
| `/write-a-skill` | Follow the writing-skills workflow to create a new skill | `.gemini/prompts/write-a-skill.toml` |
| `/skills` | Discover and search all skills | `.gemini/prompts/skills.toml` |
| `/use-skill` | Load a specific skill by name | `.gemini/prompts/use-skill.toml` |

Docs: [Gemini CLI custom slash commands](https://cloud.google.com/blog/topics/developers-practitioners/gemini-cli-custom-slash-commands)

### Codex

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm-with-superpowers` | Run brainstorming with optional topic arguments | `.codex/prompts/brainstorm.md` |
| `/write-a-skill` | Create a new skill using writing-skills | `.codex/prompts/write-skill.md` |
| `/skills` | List and search available skills | `.codex/prompts/skills.md` |
| `/use-skill` | Load a specific skill by name | `.codex/prompts/use-skill.md` |

Docs: [OpenAI Codex custom slash commands](https://developers.openai.com/codex/guides/slash-commands#create-your-own-slash-commands-with-custom-prompts)

Every table points to files that simply shell out to `superpowers-agent use-skill`, so the shared priority order above applies automatically across all integrations.

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
4. **Universal Integration** - Works with OpenCode, GitHub Copilot, Cursor, Gemini, and other AI assistants

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
