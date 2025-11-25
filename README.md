# Superpowers

A comprehensive skills library of proven techniques, patterns, and workflows for AI coding assistants.

**This is a fork and extension of Jesse Vincent's incredible [Superpowers for Claude Code](https://github.com/obra/superpowers).** Jesse's groundbreaking work and [his amazing blog post](https://blog.fsck.com/2025/10/09/superpowers/) introduced the concept of systematic, reusable skills for AI agents. This fork extends that vision to support agent-agnostic workflows across GitHub Copilot, Cursor, Gemini, and other AI coding assistants.

## What's New

**v5.4.0 (November 25, 2025):**

- 🎯 **Dynamic Tool Mappings** - Platform-specific tool mapping templates automatically generate configuration files for detected AI coding assistants. Each platform gets its own template (GitHub Copilot, Cursor, Claude Code, Gemini, OpenCode, Codex) with comprehensive tool documentation.

- 📦 **Automated Platform Detection** - Bootstrap command now detects installed platforms and creates customized configuration files (`~/.github/copilot-instructions.md`, `~/.claude/CLAUDE.md`, `~/.gemini/GEMINI.md`, etc.) with only relevant tool mappings.

- 🔄 **Smart File Updates** - Marker-based content updates (`<!-- SUPERPOWERS_SKILLS_START/END -->`) preserve custom content while keeping tool mappings current. Automatic backups before updates.

- ⚡ **Cursor Hook Optimization** - New `beforeSubmitPrompt` hook injects skills context before prompt submission (replacing post-response hooks) for better performance and reduced overhead.

**Previous Updates:**

- 🎯 **Smart Skill Matching** - Just type `superpowers execute brainstorming` instead of the full `superpowers:collaboration/brainstorming` path. Suffix matching with priority resolution makes skill loading much more convenient.

- 🚀 **One-Line Installer** - Install globally with `curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash`. Sets up universal aliases, slash commands, and optional project integration automatically.

- 📦 **Skill Installation System** - New `add` and `add-repository` commands make it easy to install skills from Git repositories, local directories, or repository aliases. Create shortcuts with `superpowers-agent add-repository` and install skills with `superpowers-agent add @alias path/to/skill`.

- 🔍 **Helper File Discovery** - New `get-helpers` command finds helper scripts within skills using smart substring matching. Skills can define helper files in their `skill.json` for easy discovery.

- 📂 **Skill Directory Navigation** - New `dir` command returns the directory path of any skill, making it easy to access skill resources and helper scripts programmatically.

- 🔧 **MCP Replacement Skills** - New `context-7` and `playwright-skill` provide library documentation search and browser automation without MCP overhead (~98% context reduction).

- 📝 **Setup Skills Command** - New `/setup-skills` command initializes projects with AGENTS.md, CLAUDE.md, and GEMINI.md instruction files automatically.

- 🛠️ **Universal CLI Tools Skill** - `leveraging-cli-tools` skill teaches agents to use high-performance tools (rg, jq, fd, bat, ast-grep) for 5-50x speedups.

## What You Get

- **Testing Skills** - TDD, async testing, anti-patterns
- **Debugging Skills** - Systematic debugging, root cause tracing, verification
- **Collaboration Skills** - Brainstorming, planning, code review, parallel agents
- **Development Skills** - Git worktrees, finishing branches, subagent workflows
- **Meta Skills** - Creating, testing, and sharing skills
- **Utility Commands** - `/skills` to discover available skills, `/execute` to load them

Plus:
- **Universal Prompts** - Work across Claude, GitHub Copilot, Cursor, Gemini, and other AI assistants
- **Automatic Integration** - Skills activate automatically when relevant
- **Consistent Workflows** - Systematic approaches to common engineering tasks

# Installation

## Quick Install (Recommended)

Install Superpowers globally with one command:

```bash
curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash
```

**Security Note:** Always review scripts before running:
```bash
curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh -o install.sh
cat install.sh
bash install.sh
```

The installer will:
1. Install to `~/.agents/superpowers` (global, works everywhere)
2. Set up universal aliases: `superpowers` and `superpowers-agent`
3. Install slash commands for GitHub Copilot, Cursor, Windsurf
4. Optionally update project files (AGENTS.md, CLAUDE.md, GEMINI.md)

**After installation, you can use Superpowers from anywhere:**
```bash
superpowers --help
superpowers find-skills
superpowers execute systematic-debugging
```

**Installed slash commands:**
- `/brainstorm` (or `/brainstorm-with-superpowers`) - Interactive design refinement
- `/write-skill` (or `/write-a-skill`) - Create new skills with TDD
- `/skills` - Discover available skills
- `/execute` - Load and apply a specific skill
- `/write-plan` - Create implementation plans
- `/execute-plan` - Execute plans in batches

## Manual Installation

If you prefer manual installation or need project-specific setup, see [.agents/INSTALL.md](.agents/INSTALL.md).

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
superpowers find-skills
```

**Search for specific skills:**
```bash
superpowers find-skills | grep -i <topic>
```

### Using Skills

**Smart skill matching** - Just type the skill name or any suffix:
```bash
superpowers execute brainstorming              # Finds superpowers:collaboration/brainstorming
superpowers execute test-driven-development    # Finds superpowers:testing/test-driven-development
superpowers execute collaboration/brainstorming # More specific suffix also works
```

**Full paths still work:**
```bash
superpowers execute superpowers:collaboration/brainstorming
```

**Priority order:** Project skills → Home skills → Global Superpowers skills

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

## Configuration

Superpowers supports project-level and global configuration via `.agents/config.json`.

### Directory Configuration

**Default locations:**
- Prompts: `.agents/prompts/`
- Plans: `.agents/plans/`
- Skills: `.agents/skills/`

**Override globally:**
```json
// ~/.agents/config.json
{
  "prompts_dir": "custom/prompts",
  "plans_dir": "custom/plans",
  "installLocation": "global"
}
```

**Override per-project:**
```json
// .agents/config.json (in project root)
{
  "prompts_dir": ".my-prompts",
  "plans_dir": ".my-plans",
  "installLocation": "project"
}
```

**Priority:** Project config > Global config > Defaults

**Read config from CLI:**
```bash
superpowers-agent get-config prompts_dir
superpowers-agent get-config plans_dir
```

### Repository Aliases

Superpowers allows you to create shortcuts for frequently used skill repositories using repository aliases.

**Add a repository alias:**
```bash
# Automatic alias detection from skill.json
superpowers-agent add-repository https://github.com/example/skills.git

# Custom alias
superpowers-agent add-repository https://github.com/example/skills.git --as=@myskills

# Add to project config
superpowers-agent add-repository https://github.com/example/skills.git --project
```

**Use repository aliases to install skills:**
```bash
# Install all skills from repository
superpowers-agent add @myskills

# Install specific skill path
superpowers-agent add @myskills path/to/skill

# Install to project
superpowers-agent add @myskills path/to/skill --project
```

**Configuration format:**
```json
// ~/.agents/config.json or .agents/config.json
{
  "installLocation": "global",
  "repositories": {
    "@myskills": "https://github.com/example/skills.git",
    "@internal": "https://github.com/myorg/internal-skills.git"
  }
}
```

Repository aliases make it easy to:
- Install skills from multiple sources
- Share skill repositories across teams
- Quickly access frequently used skill collections
- Support both Git URLs and local paths

## Slash Commands & Skill Priority

Superpowers ships slash-command prompts for OpenCode, Claude Code, GitHub Copilot, Cursor, Gemini, and Codex so every agent can load the exact same skill definitions. Each command is a thin wrapper around `superpowers execute <name>`, so skill discovery always walks the same hierarchy before running anything. This section is the canonical reference for where those commands live in the repo and how the loader resolves conflicts.

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
| `/execute` | Load a specific skill by name | `.opencode/command/execute.md` |
| `/setup-skills` | Initialize project with skills documentation | `.opencode/command/setup-skills.md` |
| `/meta-prompt` | Create structured prompts for Do/Plan/Research/Refine workflows | `.opencode/command/meta-prompt.md` |

Docs: [OpenCode custom commands](https://opencode.ai/docs/commands/)

### Claude Code

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm` | Run the brainstorming skill for Socratic design sessions | `commands/brainstorm.md` |
| `/write-plan` | Create a detailed implementation plan via `writing-plans` | `commands/write-plan.md` |
| `/execute-plan` | Execute implementation plans in batches | `commands/execute-plan.md` |
| `/finding-skills` | List and search available skills | `commands/finding-skills.md` |
| `/using-a-skill` | Load a specific skill by name | `commands/using-a-skill.md` |
| `/setup-skills` | Initialize project with skills documentation | `commands/setup-skills.md` |
| `/create-meta-prompt` | Create structured prompts for Do/Plan/Research/Refine workflows | `commands/create-meta-prompt.md` |

Docs: [Claude Code custom slash commands](https://code.claude.com/docs/en/slash-commands#custom-slash-commands)

### GitHub Copilot

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm-with-superpowers` | Refine ideas into designs with the brainstorming skill | `.github/prompts/superpowers-brainstorming.prompt.md` |
| `/write-a-skill` | Follow the writing-skills workflow to create a new skill | `.github/prompts/superpowers-writing-skills.prompt.md` |
| `/skills` | Discover and search all skills | `.github/prompts/superpowers-skills.prompt.md` |
| `/execute` | Load a specific skill by name | `.github/prompts/superpowers-execute.prompt.md` |
| `/setup-skills` | Initialize project with skills documentation | `.github/prompts/superpowers-setup-skills.prompt.md` |
| `/create-meta-prompt` | Create structured prompts for Do/Plan/Research/Refine workflows | `.github/prompts/superpowers-create-meta-prompt.prompt.md` |

Docs: [VS Code Copilot prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files#_create-a-prompt-file)

### Cursor

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm-with-superpowers` | Guide brainstorming with collaborative questioning | `.cursor/commands/brainstorm-with-superpowers.md` |
| `/write-a-skill` | Apply the writing-skills TDD workflow | `.cursor/commands/write-a-skill.md` |
| `/skills` | Show all skills with search tips | `.cursor/commands/skills.md` |
| `/execute` | Load any skill via the CLI | `.cursor/commands/execute.md` |
| `/setup-skills` | Initialize project with skills documentation | `.cursor/commands/setup-skills.md` |
| `/create-meta-prompt` | Create structured prompts for Do/Plan/Research/Refine workflows | `.cursor/commands/create-meta-prompt.md` |

Docs: [Cursor custom commands](https://cursor.com/docs/agent/chat/commands#creating-commands)

### Gemini

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm-with-superpowers` | Refine ideas into designs with the brainstorming skill | `.gemini/commands/brainstorm-with-superpowers.toml` |
| `/write-a-skill` | Follow the writing-skills workflow to create a new skill | `.gemini/commands/write-a-skill.toml` |
| `/skills` | Discover and search all skills | `.gemini/commands/skills.toml` |
| `/execute` | Load a specific skill by name | `.gemini/commands/execute.toml` |
| `/setup-skills` | Initialize project with skills documentation | `.gemini/commands/setup-skills.toml` |
| `/create-meta-prompt` | Create structured prompts for Do/Plan/Research/Refine workflows | `.gemini/commands/create-meta-prompt.toml` |

Docs: [Gemini CLI custom slash commands](https://cloud.google.com/blog/topics/developers-practitioners/gemini-cli-custom-slash-commands)

### Codex

| Command | Description | Source file |
| --- | --- | --- |
| `/brainstorm-with-superpowers` | Run brainstorming with optional topic arguments | `.codex/prompts/brainstorm.md` |
| `/write-a-skill` | Create a new skill using writing-skills | `.codex/prompts/write-skill.md` |
| `/skills` | List and search available skills | `.codex/prompts/skills.md` |
| `/execute` | Load a specific skill by name | `.codex/prompts/execute.md` |
| `/setup-skills` | Initialize project with skills documentation | `.codex/prompts/setup-skills.md` |
| `/create-meta-prompt` | Create structured prompts for Do/Plan/Research/Refine workflows | `.codex/prompts/create-meta-prompt.md` |

Docs: [OpenAI Codex custom slash commands](https://developers.openai.com/codex/guides/slash-commands#create-your-own-slash-commands-with-custom-prompts)

Every table points to files that simply shell out to `superpowers-agent execute`, so the shared priority order above applies automatically across all integrations.

## What's Inside

### Skills Library

**Testing** (`skills/testing/`)
- **test-driven-development** - RED-GREEN-REFACTOR cycle
- **condition-based-waiting** - Async test patterns
- **testing-anti-patterns** - Common pitfalls to avoid
- **verification-before-completion** - Evidence-based completion claims (ported from obra/superpowers)

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
- **leveraging-cli-tools** - High-performance CLI tools (rg, jq, fd, bat, ast-grep)

**MCP Replacement** (`skills/mcp-replacement/`)
- **context-7** - Find library documentation and code examples (replaces MCP)
- **playwright-skill** - Browser automation and web scraping (replaces MCP)

**Meta** (`skills/meta/`)
- **writing-skills** - Create new skills following best practices
- **writing-prompts** - Create custom slash commands for GitHub Copilot, Cursor, or Claude
- **creating-prompts** - Create structured prompts for Do/Plan/Research/Refine workflows (adapted from TÂCHES)
- **create-skill-json** - Generate skill.json metadata files from SKILL.md and directory structure
- **sharing-skills** - Contribute skills back via branch and PR
- **testing-skills-with-subagents** - Verify skills work under pressure
- **using-superpowers** - Introduction to the skills system
- **finding-skills** - Discover and search available skills
- **using-a-skill** - Load and apply specific skills

**Problem-Solving** (`skills/problem-solving/`)
- **collision-zone-thinking** - Force unrelated concepts together for emergent insights
- **inversion-exercise** - Flip assumptions to reveal hidden constraints
- **meta-pattern-recognition** - Spot universal principles across domains
- **scale-game** - Test at extremes to expose fundamental truths
- **simplification-cascades** - Find insights that eliminate multiple components
- **when-stuck** - Dispatch to right problem-solving technique

**Research** (`skills/research/`)
- **tracing-knowledge-lineages** - Understand how ideas evolved over time

**Architecture** (`skills/architecture/`)
- **preserving-productive-tensions** - Keep multiple valid approaches instead of forcing premature resolution

### MCP Replacement Skills

**Context Efficiency** - These skills replace MCP integrations with local code execution, reducing context usage by ~98% per [Anthropic's code-execution-with-mcp guidance](https://www.anthropic.com/engineering/code-execution-with-mcp).

**Context-7** (`skills/context-7/`)
- **context-7** - Library documentation search via Context-7 API
  - Search for libraries and fetch documentation
  - Text-format responses for efficient parsing
  - Node.js scripts for cross-platform compatibility
  - Environment variable for API key management
  - **Setup**: `export CONTEXT7_API_KEY="your-key"` or create `.env` file
  - **Usage**: `node skills/context-7/scripts/search.js "query"`
  - **Docs**: `node skills/context-7/scripts/get-docs.js /library/path --topic=feature`

**Playwright** (`skills/playwright-skill/`)
- **playwright-skill** - Browser automation without MCP overhead
  - Write custom Playwright scripts for specific tasks
  - run.js executor handles module resolution
  - Progressive disclosure (full API reference loads on-demand)
  - Visible automation by default for debugging
  - **Setup**: `cd skills/playwright-skill/scripts && npm install && npx playwright install`
  - **Usage**: `node skills/playwright-skill/scripts/run.js ./your-script.js`
  - **Reference**: Load `references/API_REFERENCE.md` for advanced features

**Why Skills Instead of MCPs:**
- **Context reduction**: 150k tokens → 2k tokens (~98.7% savings)
- **Progressive disclosure**: Load tools on-demand vs upfront
- **In-environment filtering**: Process data before hitting model context
- **State persistence**: Reusable scripts, intermediate results
- **Cross-platform**: Node.js runs on Linux, Mac, Windows

**Dependencies:**
- Node.js 18+ (for native fetch support)
- Context-7: API key from https://context7.com
- Playwright: `npm install` in scripts/ directory

### Commands

Commands are thin wrappers that activate the corresponding skill:

- **brainstorm.md** - Activates the `brainstorming` skill
- **write-plan.md** - Activates the `writing-plans` skill
- **execute-plan.md** - Activates the `executing-plans` skill
- **finding-skills.md** - Activates the `finding-skills` utility
- **using-a-skill.md** - Activates the `using-a-skill` utility

### CLI Commands

The `superpowers-agent` CLI provides powerful commands for managing skills:

**Skill Discovery:**
```bash
superpowers-agent find-skills              # List all available skills
superpowers-agent execute <name>           # Load a specific skill
superpowers-agent path <skill-name>        # Get SKILL.md file path
superpowers-agent dir <skill-name>         # Get skill directory path
superpowers-agent get-helpers <skill> <term>  # Find helper files in skill
```

**Skill Installation:**
```bash
superpowers-agent add <url-or-path>        # Install skill(s) from Git or local
superpowers-agent add @alias path/to/skill # Install from repository alias
superpowers-agent add-repository <git-url> # Add repository alias
```

**Configuration:**
```bash
superpowers-agent config-get               # Show current configuration
superpowers-agent config-set <key> <value> # Update configuration
superpowers-agent get-config <key>         # Get specific config value
```

**Project Setup:**
```bash
superpowers-agent setup-skills             # Initialize project with skills docs
superpowers-agent bootstrap                # Run complete bootstrap
superpowers-agent update                   # Update to latest version
```

### Skill Metadata with skill.json

Skills can include a `skill.json` file to define metadata for the superpowers-agent CLI. This enables powerful features like repository aliases, helper file discovery, and multi-skill repositories.

**All skills in this repository include skill.json files** with version tracking, helper file listings, and aliases for convenient access.

#### Single Skill Configuration

For a single skill, `skill.json` defines the skill's identity and helpers:

```json
{
  "version": "1.0.0",
  "name": "aem/block-collection-and-party",
  "title": "AEM Block Collection and Party",
  "helpers": [
    "scripts/get-block-structure.js",
    "scripts/search-block-collection-github.js",
    "scripts/search-block-collection.js",
    "scripts/search-block-party.js"
  ],
  "aliases": [
    "block-party",
    "block-collection"
  ]
}
```

**Fields:**
- `name`: Canonical skill name (used for installation path)
- `title`: Human-readable display name
- `helpers`: Array of helper script paths relative to skill directory
- `aliases`: Short names that can be used with `execute` and `get-helpers`
- `version`: Skill version for tracking updates

**Usage with helpers:**
```bash
# Find helper files
superpowers-agent get-helpers block-collection search-block
# Returns: /path/to/skill/scripts/search-block-collection.js

# Use skill aliases
superpowers-agent execute block-party
# Loads: aem/block-collection-and-party
```

#### Multi-Skill Repository Configuration

For repositories containing multiple skills, the root `skill.json` lists all skills and defines a repository alias:

```json
{
  "version": "1.0.0",
  "repository": "@baici",
  "skills": [
    "aem/authoring-analysis",
    "aem/block-collection-and-party",
    "aem/block-inventory",
    "aem/building-blocks",
    "aem/content-driven-development"
  ]
}
```

**Fields:**
- `repository`: Default alias for this repository (used with `add-repository`)
- `skills`: Array of skill paths within the repository
- `version`: Repository version

**Each skill then has its own skill.json:**
```
repository/
├── skill.json           # Repository manifest
├── aem/
│   ├── authoring-analysis/
│   │   ├── SKILL.md
│   │   └── skill.json   # Individual skill metadata
│   └── block-inventory/
│       ├── SKILL.md
│       └── skill.json
```

**Usage with multi-skill repositories:**
```bash
# Add repository with automatic alias detection
superpowers-agent add-repository https://github.com/example/skills.git
# Detects @baici alias from skill.json

# Install specific skill from repository
superpowers-agent add @baici aem/building-blocks

# Install all skills from repository
superpowers-agent add @baici
```

#### Benefits of skill.json

1. **Helper Discovery**: Find and execute helper scripts easily
2. **Skill Aliases**: Use short, memorable names instead of full paths
3. **Repository Management**: Organize and share multi-skill collections
4. **Automatic Detection**: CLI reads metadata for smart defaults
5. **Installation Paths**: Control where skills install with `name` field
6. **Version Tracking**: Each skill tracks its version independently

#### This Repository's skill.json

This repository includes skill.json files for:
- **35 individual skills** with versions ranging from 1.0.0 to 5.1.0
- **Version tracking** synced with SKILL.md frontmatter
- **Helper file listings** for skills with scripts, templates, and resources
- **Skill aliases** for convenient loading (e.g., `brainstorming` or `collaboration/brainstorming`)

All skills are ready to use with commands like:
```bash
superpowers-agent get-helpers creating-prompts template
superpowers-agent execute brainstorming
superpowers-agent dir test-driven-development
```

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

### Automatic Updates (Default)

Superpowers automatically checks for and applies updates during bootstrap by default:

```bash
superpowers-agent bootstrap
```

**Auto-update behavior:**
- ✓ Fetches latest changes from GitHub main branch
- ✓ Only updates if repository is clean (no local modifications)
- ✓ Intelligently reinstalls only changed integrations (cursor, copilot, etc.)
- ✓ Skips update if not on main branch or network unavailable

**Skip auto-update for a single run:**
```bash
superpowers-agent bootstrap --no-update
```

### Manual Updates

Update anytime with the dedicated update command:

```bash
superpowers-agent update
```

This command:
- Pulls latest changes from GitHub
- Detects which integration files changed
- Reinstalls only affected integrations
- Shows summary of what was updated

**Update without reinstalling integrations:**
```bash
superpowers update --no-reinstall
```

### Configuration

**Disable auto-update permanently:**
```bash
superpowers-agent config-set auto_update false
```

When disabled, bootstrap will show an "Update Available" message instead of auto-updating.

**Re-enable auto-update:**
```bash
superpowers config-set auto_update true
```

**View current configuration:**
```bash
superpowers config-get
```

Configuration is stored in `~/.agents/superpowers/.config.json` and persists across updates.

### Claude Code Plugin

For Claude Code plugin users:
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
