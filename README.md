# Superpowers

A comprehensive skills library of proven techniques, patterns, and workflows for AI coding assistants.

**This is a fork and extension of Jesse Vincent's incredible [Superpowers for Claude Code](https://github.com/obra/superpowers).** Jesse's groundbreaking work and [his amazing blog post](https://blog.fsck.com/2025/10/09/superpowers/) introduced the concept of systematic, reusable skills for AI agents. This fork extends that vision to support agent-agnostic workflows across GitHub Copilot, Claude Code, OpenCode, Pi, and OpenAI Codex.

## What's New

**v10.0.0 (July 12, 2026):**

- ⚠️ **Leaner bundled surface** — most bundled skills were retired. The package now ships only four: `brainstorming`, `leveraging-cli-tools`, `create-skill-json`, and `setup-skills`. Install anything else with `superpowers-agent add`.
- ⚠️ **Retired CLI commands removed** — the skill discovery/execution commands `dir`, `execute`, `find-skills`, `get-helpers`, `path`, and `use-skill` are gone. Skills are discovered and loaded through each harness's native skill tool, not the CLI.
- ⚠️ **`brainstorming` deprecated** — it now announces its deprecation and redirects to the `grilling` skill, handing over the same context.
- **Pi & OpenAI Codex supported** — `superpowers-agent` now detects and targets **Pi** (`.pi`) and **OpenAI Codex** (`.codex`) alongside GitHub Copilot, Claude Code, and OpenCode — five supported harnesses. Detection works whether a harness is installed as a binary or a project folder.
- **RTK + ponytail integration** — `setup-rtk.sh` (harness-aware RTK config) and `setup-ponytail.sh` wire token-optimized CLI output and minimal-solution guidance into each harness. `leveraging-cli-tools` was rewritten around `rtk` and `ponytail`, with RTK Python guidance.
- **`SUPERPOWERS.md` linked** from generated `AGENTS.md`, `CLAUDE.md`, and `copilot-instructions.md`; `setup-skills` dedupes the backups it creates and replaces the `copilot-instructions.md` marker idempotently.

**v9.2.1 (June 1, 2026):**

- **GitHub agents now reach the Copilot CLI** — `add` and `pull` now also symlink GitHub agents (`.github/agents/<name>.agent.md`) into `~/.copilot/agents/`, alongside the existing VS Code `prompts/` install, so the same agents are usable by the GitHub Copilot CLI. `rm` cleans up both locations.
- **npm-based version monitoring** — the `using-superpowers` skill and `AGENTS.md` template now check for updates by querying the npm registry (`npm view @complexthings/superpowers-agent version`) and comparing by semver precedence, prompting you to update only when npm is actually newer (replaces the old bundled-version-string comparison).
- **Smarter skill-priority guidance** — `using-superpowers` now tells agents to load domain/context skills first, then process skills (brainstorming, planning, debugging, TDD), then implementation skills, so the domain skill can shape which process fits.
- **`leveraging-cli-tools` nudge broadened** — the session-start context now also points agents at the skill whenever a task involves using Bash.
- **Template cleanup** — removed `TOOLS.md.template` and the `{{TOOL_MAPPINGS}}` bootstrap placeholder; tool-equivalence guidance now lives inline in the refreshed `AGENTS.md`/`SUPERPOWERS.md` templates. `AGENTS.md` skill priority simplified to Project → Personal.

**v9.1.0 (May 30, 2026):**

- **Session-start hooks installed by `bootstrap`** — `bootstrap` now installs a Claude Code `SessionStart` hook into `~/.claude/settings.json` and a GitHub Copilot CLI `sessionStart` hook at `~/.copilot/hooks/superpowers.json`, so the Superpowers context is injected at the start of every session. The Claude merge is idempotent and preserves your other hooks/settings. (This replaces the old Claude Code plugin hook, which has been removed.)
- **`leveraging-cli-tools` in the injected prompt** — the session-start context now also tells agents to use the `leveraging-cli-tools` skill for code search, parsing, file finding, refactors, and verbose output to cut token cost and latency.
- **New `session-context` command** — `superpowers-agent session-context [--format=claude|copilot|raw]` is the single source of truth for the injected prompt, shared by the Claude hook, the Copilot hook, and the OpenCode plugin so they never drift.

**v9.0.0 (May 28, 2026):**

- **Claude persona installation** — `.claude/agents/<name>.md` personas now install into `~/.claude/agents/` via `add`/`pull` (previously silently skipped)
- ⚠️ **No more `postinstall`** — the npm `postinstall` script was removed for supply-chain hardening. Fresh installs now require a **one-time manual** `superpowers-agent bootstrap`; `superpowers-agent update` self-runs bootstrap thereafter
- ⚠️ **Removed Cursor, Codex & Gemini support** — supported platforms are now **GitHub Copilot, Claude Code, and OpenCode** only. Integration modules, detection, the `install-cursor-hooks` command, and `GEMINI.md` generation were removed
- ⚠️ **Skills live only in `~/.agents/skills`** — per-platform skill symlinking has been removed. A one-time `skill.json`-gated cleaner runs during `bootstrap` to scrub deprecated symlink directories (including legacy Cursor/Codex/Gemini) without touching agent personas
- **Fixed `copilot-instructions.md`** — `setup-skills` now correctly creates and idempotently updates `.github/copilot-instructions.md`
- **`bun test` harness** — added a Bun test runner, smoke test, and `test` script following the `.agents/tests/<feature>.test.js` convention

**v8.4.0 (April 6, 2026):**

- **`superpowers-agent rm` command** — new CLI command for removing installed skills and agents from your system

**v8.2.0 (March 16, 2026):**

- **npm registry update checking** — `update` and `check-updates` now query the npm registry instead of the Git repo. Run `npm install -g @complexthings/superpowers-agent` to update.
- **Version parity hook** — A Husky pre-commit hook ensures `./package.json` and `.agents/package.json` stay in sync, auto-syncing to the highest version and rebuilding the CLI on mismatch.

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

**Key Features:**

- 🎯 **Native Skill Discovery** - Your AI platform discovers and loads skills directly
- 🚀 **One-Line Installer** - `npm install -g @complexthings/superpowers-agent`
- 📦 **Skill Installation** - `add` and `add-repository` commands for Git/local skill installation
- 📝 **Setup Skills** - `setup-skills` initializes projects with agent instruction files and skill symlinks

## What You Get

- **Requirement Grilling** - Interrogate a plan into a clear, reviewed design (the `grilling` skill; `brainstorming` now redirects here)
- **Efficient CLI Workflows** - Search, inspect, and shape command output with less noise
- **Skill Metadata** - Generate consistent `skill.json` files from existing skills
- **Skill Setup** - Initialize project skill infrastructure
- **Native Skill Tools** - Skills are discovered and loaded by your AI platform

Plus:
- **Universal Skills** - Work across GitHub Copilot, Claude Code, OpenCode, Pi, and OpenAI Codex
- **Automatic Integration** - Skills activate automatically when relevant
- **Consistent Workflows** - Systematic approaches to common engineering tasks

# Installation

## Quick Install (Recommended)

Install Superpowers globally and run the required one-time bootstrap step:

```bash
npm install -g @complexthings/superpowers-agent
superpowers-agent bootstrap
```

> **Note:** `superpowers-agent bootstrap` is a **required** one-time step after every fresh install. It is no longer run automatically by npm's `postinstall` hook — you must run it manually. Subsequent `superpowers-agent update` calls will run bootstrap for you automatically.

## Migration to Superpower Agent `^10.0.0`

```bash
rm -rf ~/.local/bin/superpowers-agent ~/.local/bin/superpowers ~/.agents/superpowers
npm install -g @complexthings/superpowers-agent
superpowers-agent bootstrap
```

**After installation, your AI platform can discover Superpowers skills automatically.**

If your platform has no native skill tool, open the relevant `SKILL.md` from its configured skill directories with your file-read tool.

## Manual Installation

If you prefer manual installation or need project-specific setup, see [.agents/INSTALL.md](.agents/INSTALL.md).

**Learn more:** [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/) by Jesse Vincent

## Quick Start

### Discovering and Using Skills

Use your AI platform's native skill tool to view available skills and load the one relevant to your task. If no native skill tool is available, inspect the configured project or personal skill directories and open the relevant `SKILL.md` with your file-read tool.

**Priority order:** Project skills → Home skills → Global Superpowers skills

### Bundled Skills

This release bundles four skills:
- `brainstorming` — **deprecated**; redirects to the `grilling` skill
- `leveraging-cli-tools`
- `create-skill-json`
- `setup-skills`

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
superpowers-agent config-get   # prints the resolved configuration, including prompts_dir and plans_dir
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
| `github` | `.github/agents/<name>.agent.md` | VS Code `prompts/` directory **and** `~/.copilot/agents/` (GitHub Copilot CLI) |
| `opencode` | `.opencode/agents/<name>.md` | `~/.config/opencode/agents/` |
| `claude` | `.claude/agents/<name>.md` | `~/.claude/agents/` |

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

### Skill Storage

As of v9.0.0, Superpowers no longer creates per-platform skill symlinks. Skills live in just two canonical locations and the supported agents discover them there directly:

- **Global skills** — bundled Superpowers skills in `~/.agents/superpowers/skills/` and personal skills in `~/.agents/skills/`
- **Project skills** — `.agents/skills/` inside a project (created/managed by `setup-skills`)

**Stale symlink cleanup:**

A one-time, `skill.json`-gated cleaner runs during `superpowers-agent bootstrap`. It scrubs deprecated per-platform skill symlink directories left behind by older versions — including legacy Cursor, Codex, and Gemini directories — without touching agent personas in `~/.claude/agents/` or the supported platforms.

## Skill Priority

Each supported agent discovers and loads skills using its native skill tool. No separate prompt/command files are installed.

**Skill priority pipeline (first match wins):**
1. `.agents/skills/` inside the workspace (project-specific overrides)
2. `.claude/skills/` inside the repo if present (repo-wide Claude overrides)
3. Personal skills in `~/.agents/skills/` (user-level customizations)
4. Bundled Superpowers skills in `~/.agents/superpowers/skills/` (system defaults)

When any agent invokes a skill — no matter which supported tool it originates from — the CLI enforces the ordering above. Add a `brainstorming` skill under `.agents/skills/` and every supported tool immediately picks it up.

### OpenCode

Skills are available via OpenCode's native `skill` tool. The `.opencode/plugins/superpowers-agent.js` plugin injects bootstrap context at session start. Docs: [OpenCode Plugins](https://opencode.ai/docs/plugins/)

### GitHub Copilot

Skills are available via the native skill tool. `bootstrap` installs a `sessionStart` hook at `~/.copilot/hooks/superpowers.json` (honoring `$COPILOT_HOME`) that injects the Superpowers context — including the `leveraging-cli-tools` directive — at the start of every Copilot CLI session via the hook's `additionalContext` output.

### Claude Code

Skills are available via the native skill tool. Claude agent personas defined in `.claude/agents/<name>.md` are installed into `~/.claude/agents/` via `add`/`pull`. `bootstrap` also installs a `SessionStart` hook into `~/.claude/settings.json` that injects the Superpowers context every session (idempotent; preserves your other hooks and settings).

## Bundled Skills

The package contains only the four skills listed in [Quick Start](#quick-start). Install additional skills with `superpowers-agent add`.

### Running Tests

Run the automated suite from `.agents`:

```bash
cd .agents
bun test
```

### CLI Commands

The `superpowers-agent` CLI provides commands for managing installed skills. Skill discovery and loading use your AI platform's native skill tool.

**Skill Installation:**
```bash
superpowers-agent add <url-or-path>        # Install skill(s) from Git or local
superpowers-agent add @alias path/to/skill # Install from repository alias
superpowers-agent rm <skill-name>          # Remove an installed skill or agent
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
```

**Project Setup:**
```bash
superpowers-agent setup-skills             # Initialize project with skills docs
superpowers-agent bootstrap                # Run complete bootstrap (installs Claude + Copilot session hooks)
superpowers-agent update                   # Update to latest version
```

**Session Hooks:**
```bash
superpowers-agent session-context                    # Print session-start context (raw)
superpowers-agent session-context --format=claude    # Emit Claude Code SessionStart hook JSON
superpowers-agent session-context --format=copilot   # Emit GitHub Copilot sessionStart hook JSON
```
The platform hooks installed by `bootstrap` call this command; it is the single source of truth for the injected CLI-tool nudge.

### Skill Metadata with skill.json

Skills can include a `skill.json` file to define installation metadata for the superpowers-agent CLI and multi-skill repositories.

#### Single Skill Configuration

For a single skill, `skill.json` defines its identity:

```json
{
  "version": "1.0.0",
  "name": "aem/block-collection-and-party",
  "title": "AEM Block Collection and Party"
}
```

**Fields:**
- `name`: Canonical skill name (used for installation path)
- `title`: Human-readable display name
- `version`: Skill version for tracking updates

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

1. **Repository Management**: Organize and share multi-skill collections
2. **Automatic Detection**: CLI reads metadata for installation defaults
3. **Installation Paths**: Control where skills install with `name` field
4. **Version Tracking**: Each skill tracks its version independently

## How It Works

**For Agent-Agnostic Installation:**
1. **Bootstrap Process** - Installs agent integrations and syncs skill symlinks globally
2. **Skill Discovery** - Finds skills across system, personal, and project locations
3. **Priority Resolution** - Project skills override personal skills override system skills
4. **Universal Integration** - Works with GitHub Copilot, Claude Code, OpenCode, Pi, and OpenAI Codex

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

# Re-install Copilot and Claude together
superpowers-agent bootstrap --force-copilot --force-claude
```

Supported flags: `--force-copilot`, `--force-claude`, `--force-opencode`

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

**Inspired by obra/superpowers (v7.0.0):**
- Reusable skill workflows
- OpenCode plugin architecture pattern
- Test infrastructure for skill validation

This fork extends that vision to support agent-agnostic workflows across GitHub Copilot, Claude Code, OpenCode, Pi, and OpenAI Codex.

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: https://github.com/complexthings/superpowers/issues
- **Original Project**: https://github.com/obra/superpowers
