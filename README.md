# Superpowers

A comprehensive skills library of proven techniques, patterns, and workflows for AI coding assistants.

**This is a fork and extension of Jesse Vincent's incredible [Superpowers for Claude Code](https://github.com/obra/superpowers).** Jesse's groundbreaking work and [his amazing blog post](https://blog.fsck.com/2025/10/09/superpowers/) introduced the concept of systematic, reusable skills for AI agents. This fork extends that vision to support agent-agnostic workflows across GitHub Copilot, Cursor, Gemini, and other AI coding assistants.

## What's New

**v8.0.0 (March 13, 2026):**

- **Skills-only delivery** — All per-platform prompt/command files (`.opencode/command/`, `.cursor/commands/`, `.gemini/commands/`, `.github/prompts/`, `.codex/prompts/`, `commands/`) have been removed. 
- **Bootstrap cleanup** — Bootstrap now runs a `removeLegacyPrompts` step that deletes any prompt/command files previously installed by older versions.
- **`setup-skills` is now a skill** — Project initialization is delivered as `skills/setup-skills/SKILL.md`. The `superpowers-agent setup-skills` CLI command remains.
- **Cursor integration is symlink-only** — Cursor hooks (`hooks/cursor/`) have been removed. Cursor now discovers skills through its native skill tool via symlinks.
- **Removed skills**: `writing-skills`, `testing-skills-with-subagents`, `gardening-skills-wiki` deleted from `skills/meta/` mostly in favor of Claude's Skills 2.0 `skill-creator` skill.
- **Removed CLI commands**: `install-copilot-prompts`, `install-cursor-commands`, `install-codex-prompts`, `install-gemini-commands`, `install-claude-commands`, `install-opencode-commands`.

**v7.0.5 (February 9, 2026):**

- **Agent Auto-Installation** - `add` and `pull` commands now automatically detect and install agents from repositories with an `agents.json` manifest, supporting GitHub Copilot and OpenCode platforms with extensible platform support
- **Agent Tracking** - Installed agents are tracked in `~/.agents/config.json` with source repository, version, and install timestamps
- **Persistent Repo Storage** - Git-sourced agent repositories are persisted at `~/.agents/repos/` to maintain valid symlinks

**v7.0.0 (February 7, 2026):**

- 🔧 **Bun Build System** - Migrated CLI build toolchain from Node.js/npm to Bun for faster builds and simpler dependency management
- 📋 **Smart Copilot Instructions** - `bootstrap` and `update` now process `~/.github/copilot-instructions.md` as a template, injecting the `using-superpowers` skill content and supporting marker-based idempotent updates with automatic backups
- 📊 **Mermaid Flowcharts** - Replaced DOT-format flowcharts with Mermaid syntax across 8 skills for better rendering in GitHub, VS Code, and agent contexts

**v6.5.0 (January 24, 2026):**

- 🔄 **Upstream Sync** - Ported advanced features from Jesse Vincent's [obra/superpowers](https://github.com/obra/superpowers) v4.1.1:
  - **OpenCode Plugin** (`.opencode/plugins/superpowers-agent.js`) - Session bootstrap injection via system prompt transform
  - **using-superpowers Skill** - Behavioral enforcement with Red Flags rationalization table (12 anti-patterns)
  - **Two-Stage Code Review** - Spec compliance review + code quality review workflow
  - **Test Infrastructure** (`tests/`) - Agent-agnostic test scripts for skill triggering

- 🔌 **OpenCode Plugin** - Native plugin for OpenCode that injects superpowers context at every session start using `experimental.chat.system.transform` hook

- 📋 **Two-Stage Review Process** - Updated `subagent-driven-development` skill with spec reviewer and code quality reviewer prompts for comprehensive code review

**v6.4.x (January 23-24, 2026):**

- 📐 **Context Optimization** - Reduced AGENTS.md context size by ~60-70% with separate SUPERPOWERS.md reference file
- 🔗 **Project-Level Symlinks** - `setup-skills` now creates symlinks from agent directories to `.agents/skills`

**Previous Releases:**

- **v6.3.x** - Codex platform support, native skill tools, extended symlinks for OpenCode/Cursor/Gemini
- **v6.0.0** - Complete codebase modernization with 90% bundle reduction
- **v5.4.0** - Dynamic tool mappings, automated platform detection

**Key Features:**

- 🎯 **Smart Skill Matching** - Just type `superpowers execute brainstorming` instead of full paths
- 🚀 **One-Line Installer** - `npm install -g @complexthings/superpowers-agent`
- 📦 **Skill Installation** - `add` and `add-repository` commands for Git/local skill installation
- 🔍 **Helper Discovery** - `get-helpers` finds scripts within skills using substring matching
- 📝 **Setup Skills** - `setup-skills` skill initializes projects with agent instruction files and skill symlinks

## What You Get

- **Testing Skills** - TDD, async testing, anti-patterns
- **Debugging Skills** - Systematic debugging, root cause tracing, verification
- **Collaboration Skills** - Brainstorming, planning, code review, parallel agents
- **Development Skills** - Git worktrees, finishing branches, subagent workflows
- **Meta Skills** - Creating, testing, and sharing skills
- **Utility Commands** - `find-skills` to discover available skills, `execute` to load them

Plus:
- **Universal Prompts** - Work across Claude, GitHub Copilot, Cursor, Gemini, and other AI assistants
- **Automatic Integration** - Skills activate automatically when relevant
- **Consistent Workflows** - Systematic approaches to common engineering tasks

# Installation

## Quick Install (Recommended)

Install Superpowers globally with one command:

```bash
npm install -g @complexthings/superpowers-agent
```

The installer will:
1. Install to `~/.agents/superpowers` (global, works everywhere)
2. Set up universal aliases: `superpowers` and `superpowers-agent`
3. Sync skill symlinks for all detected agents
4. Optionally update project files (AGENTS.md)

**After installation, you can use Superpowers from anywhere:**
```bash
superpowers --help
superpowers find-skills
superpowers execute systematic-debugging
```

## Manual Installation

If you prefer manual installation or need project-specific setup, see [.agents/INSTALL.md](.agents/INSTALL.md).

**Learn more:** [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/) by Jesse Vincent

## Quick Start

### Discovering Skills

**List all available skills:**
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

### Agent Auto-Installation

Repositories can include an `agents.json` manifest to automatically install AI agents alongside skills. When you run `superpowers-agent add` or `superpowers-agent pull` on a repository containing `agents.json`, agents are automatically symlinked to the appropriate platform directories.

**`agents.json` format:**
```json
{
    "version": "1.0.0",
    "repository": "@my-agents",
    "agents": {
        "github": ["agent-name-1", "agent-name-2"],
        "opencode": ["agent-name-1", "agent-name-2"]
    }
}
```

**Supported platforms and paths:**

| Platform | Source Directory | Destination |
|----------|----------------|-------------|
| `github` | `.github/agents/<name>.agent.md` | VS Code `prompts/` directory |
| `opencode` | `.opencode/agents/<name>.md` | `~/.config/opencode/agents/` |

**How it works:**
1. After skills are installed, the system checks for `agents.json` at the repository root
2. For each platform listed, agents are symlinked from the repository to the platform destination
3. For git-sourced repositories, a persistent copy is stored at `~/.agents/repos/` so symlinks remain valid
4. Installed agents are tracked in `~/.agents/config.json` under `installedAgents`

**Examples:**
```bash
# Install skills and agents from a repository
superpowers-agent add https://github.com/example/agents-repo.git

# Update agents from a repository alias
superpowers-agent pull @my-agents
```

### Skill Symlinks for IDE Integration

Superpowers automatically creates symlinks to make skills available to all major AI coding assistants in their native skill directories.

**How it works:**

When you run `superpowers-agent bootstrap` or `superpowers-agent setup-skills`:

1. **Global symlinks** (via `bootstrap`) sync skills to user-level directories:
   - `~/.claude/skills/superpowers` -> `~/.agents/superpowers/skills/`
   - `~/.copilot/skills/superpowers` -> `~/.agents/superpowers/skills/`
   - `~/.config/opencode/skill/superpowers` -> `~/.agents/superpowers/skills/`
   - `~/.cursor/skills/superpowers` -> `~/.agents/superpowers/skills/`
   - `~/.gemini/skills/superpowers` -> `~/.agents/superpowers/skills/`
   - `~/.codex/skills/superpowers` -> `~/.agents/superpowers/skills/`

2. **Project symlinks** (via `setup-skills`) sync project skills to agent directories:
   - `.claude/skills` -> `.agents/skills`
   - `.github/skills` -> `.agents/skills`
   - `.opencode/skill` -> `.agents/skills`
   - `.cursor/skills` -> `.agents/skills`
   - `.gemini/skills` -> `.agents/skills`
   - `.codex/skills` -> `.agents/skills`

3. **Personal skills** (installed via `superpowers-agent add`) are symlinked individually to all platforms.

**Behavior:**
- Symlinks are only created if the parent directory exists
- Use `--force` flag to create parent directories: `superpowers-agent bootstrap --force`
- Use `--force-<agent>` flags to re-install only specific agent integrations (e.g. `--force-copilot`, `--force-cursor`, `--force-claude`)
- Symlinks are tracked in `~/.agents/config.json` for management

**Windows Notes:**

On Windows, symlinks require either:
- Developer Mode enabled (Settings > Update & Security > For developers)
- Running as administrator

If symlink creation fails on Windows, you'll see a warning with instructions.

**Configuration:**
```json
// ~/.agents/config.json
{
  "symlinks": {
    "claude": {
      "superpowers": "~/.claude/skills/superpowers",
      "skills": ["~/.claude/skills/my-skill"]
    },
    "copilot": {
      "superpowers": "~/.copilot/skills/superpowers",
      "skills": []
    },
    "opencode": {
      "superpowers": "~/.config/opencode/skill/superpowers",
      "skills": []
    },
    "cursor": {
      "superpowers": "~/.cursor/skills/superpowers",
      "skills": []
    },
    "gemini": {
      "superpowers": "~/.gemini/skills/superpowers",
      "skills": []
    },
    "codex": {
      "superpowers": "~/.codex/skills/superpowers",
      "skills": []
    }
  }
}
```

## Slash Commands & Skill Priority

Superpowers delivers skills as symlinks into each agent's native skill directory. Each agent discovers and loads skills using its native skill tool — no separate prompt/command files are installed.

**Skill priority pipeline (first match wins):**
1. `./skills/` or `.agents/skills/` inside the workspace (project-specific overrides)
2. `.claude/skills/` inside the repo if present (repo-wide Claude overrides)
3. Personal skills in `~/.agents/skills/` (user-level customizations)
4. Bundled Superpowers skills in `~/.agents/superpowers/skills/` (system defaults)

When any agent invokes a skill — no matter which tool it originates from — the CLI enforces the ordering above. Add a `brainstorming` skill under `./skills/` and every tool immediately picks it up without modifying any prompt files.

### OpenCode

Skills are available via OpenCode's native `skill` tool. The `.opencode/plugins/superpowers-agent.js` plugin injects bootstrap context at session start. Docs: [OpenCode Plugins](https://opencode.ai/docs/plugins/)

### GitHub Copilot

Skills are available via the native skill tool. 

### Cursor

Skills are available via the native skill tool. 
### Gemini

Skills are available via the native skill tool. 

### Claude Code

Skills are available via the native skill tool. 

### Codex

Skills are available via the native skill tool. 

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
- **subagent-driven-development** - Fast iteration with two-stage code review (spec + quality)
- **leveraging-cli-tools** - High-performance CLI tools (rg, jq, fd, bat, ast-grep)

**Meta** (`skills/meta/`)
- **using-superpowers** - Behavioral enforcement skill loaded at session start (ported from obra/superpowers)
- **writing-prompts** - Create custom slash commands for GitHub Copilot, Cursor, or Claude
- **creating-prompts** - Create structured prompts for Do/Plan/Research/Refine workflows (adapted from TÂCHES)
- **create-skill-json** - Generate skill.json metadata files from SKILL.md and directory structure

**Utilities** (`skills/finding-skills/`, `skills/using-a-skill/`, `skills/setup-skills/`)
- **finding-skills** - Discover and search available skills
- **using-a-skill** - Load and apply specific skills
- **setup-skills** - Initialize project with agent instruction files and skill symlinks

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

### Test Infrastructure

The `tests/` directory contains agent-agnostic test scripts for validating skill behavior:

**Test Categories:**
- `tests/skill-triggering/` - Tests for implicit skill activation scenarios
- `tests/explicit-skill-requests/` - Tests for explicit skill loading requests

**Running Tests:**
```bash
# Run a single test
./tests/skill-triggering/run-test.sh prompts/test-name.txt

# Run all tests in a category
./tests/skill-triggering/run-all.sh

# Configure for your agent
export AGENT_CLI="opencode"  # or "claude", "cursor", etc.
./tests/skill-triggering/run-test.sh prompts/test-name.txt
```

**Creating New Tests:**
1. Add prompt files to `prompts/` subdirectory
2. Each test is a `.txt` file with the prompt to send
3. Scripts output agent responses for manual verification

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
```

**Repository Management:**
```bash
superpowers-agent list-repositories        # List all configured repository aliases
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

## How It Works

**For Agent-Agnostic Installation:**
1. **Bootstrap Process** - Installs agent integrations and syncs skill symlinks globally
2. **Skill Discovery** - Finds skills across system, personal, and project locations
3. **Priority Resolution** - Project skills override personal skills override system skills
4. **Universal Integration** - Works with OpenCode, GitHub Copilot, Cursor, Gemini, and other AI assistants

**For OpenCode:**
1. **Plugin System** - The `.opencode/plugins/superpowers-agent.js` plugin injects bootstrap context dynamically at session start
2. **System Transform Hook** - Uses `experimental.chat.system.transform` for reliable session injection
3. **Native Skills** - Skills are accessible via OpenCode's native `skill` tool through symlinks

**For Claude Code:**
1. **Skills System** - Uses Claude Code's first-party skills system
2. **Automatic Discovery** - Claude finds and uses relevant skills for your task
3. **Mandatory Workflows** - When a skill exists for your task, using it becomes required

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
3. Follow the skill-creator skill for creating new skills
4. Submit a PR

## Updating

### Automatic Updates (Default)

Superpowers automatically checks for and applies updates during bootstrap by default:

```bash
superpowers-agent bootstrap
```

**Auto-update behavior:**
- ✓ Fetches latest changes from GitHub main branch
- ✓ Only updates if repository is clean (no local modifications)
- ✓ Intelligently reinstalls only changed integrations (opencode plugin, etc.)
- ✓ Skips update if not on main branch or network unavailable

**Skip auto-update for a single run:**
```bash
superpowers-agent bootstrap --no-update
```

**Re-install only specific agent integrations:**

Use `--force-<agent>` flags to target individual agents without running the full bootstrap. Useful when you've updated a single agent's tools or want to repair a specific integration.

```bash
# Re-install only GitHub Copilot integration
superpowers-agent bootstrap --force-copilot

# Re-install Copilot and Gemini together
superpowers-agent bootstrap --force-copilot --force-gemini
```

Supported flags: `--force-copilot`, `--force-cursor`, `--force-codex`, `--force-gemini`, `--force-claude`, `--force-opencode`

> When `--force-<agent>` flags are used, universal alias installation and `AGENTS.md` platform generation are skipped. Skill symlink sync still runs. If the agent's directory does not exist (e.g. `~/.copilot`), it will be created automatically.

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

## Credits

This project builds on [Jesse Vincent's Superpowers for Claude Code](https://github.com/obra/superpowers). Jesse's pioneering work introduced the concept of systematic, reusable skills for AI agents. Read his excellent blog post: [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/)

**Ported from obra/superpowers (v7.0.0):**
- `using-superpowers` behavioral enforcement skill
- Two-stage code review process (spec + quality reviewers)
- OpenCode plugin architecture pattern
- Test infrastructure for skill validation

This fork extends that vision to support agent-agnostic workflows across multiple AI coding assistants including GitHub Copilot, Cursor, Gemini, OpenCode, and Codex.

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: https://github.com/complexthings/superpowers/issues
- **Original Project**: https://github.com/obra/superpowers
