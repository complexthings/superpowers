# Superpowers Release Notes

Release history for the agent-agnostic fork of Superpowers.

**About This Fork:** This project extends [Jesse Vincent's Superpowers for Claude Code](https://github.com/obra/superpowers) to support universal AI coding assistants including GitHub Copilot, Cursor, Gemini, Codex, OpenCode, and Windsurf. Jesse's [groundbreaking work](https://blog.fsck.com/2025/10/09/superpowers/) introduced systematic, reusable skills for AI agents—this fork makes those workflows accessible across all major AI development tools.

---

## v5.0.0 (November 19, 2025)

### New Features

**One-Liner Global Installer**
- Homebrew-style installation script for quick setup
- Install globally with: `curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash`
- Automatically installs to `~/.agents/superpowers` (works from anywhere)
- Sets up universal CLI aliases during installation
- Optional project file integration with interactive prompts
- Cross-platform support (macOS, Linux, Windows via Git Bash)

**Universal CLI Aliases**
- `superpowers` and `superpowers-agent` commands available globally after installation
- No need to type full paths or remember installation location
- Shell integration for zsh, bash, and Windows PowerShell
- Aliases persist across terminal sessions

**Smart Skill Matching**
- Suffix-based skill lookup for easier access
- Type `superpowers use-skill brainstorming` instead of full path `superpowers:collaboration/brainstorming`
- Multi-level suffix matching: both `brainstorming` and `collaboration/brainstorming` work
- Priority resolution: project skills → home skills → global superpowers skills
- Helpful error messages with descriptions when multiple skills match at same priority level
- Full paths still supported for explicit selection

### Improvements

**Enhanced Setup Skills Command**
- `/setup-skills` now properly initializes AGENTS.md, CLAUDE.md, and GEMINI.md in projects
- Template-based generation ensures consistent instruction files
- Fixed context detection when adding skills to existing projects
- Improved project root detection for accurate file placement

**Installation Documentation**
- New comprehensive INSTALL.md with step-by-step instructions
- Troubleshooting section for common issues
- Manual installation options for users preferring project-specific setup
- Platform-specific guidance for macOS, Linux, and Windows

**README Updates**
- Added "What's New" section highlighting November 2025 improvements
- Updated Quick Start section with smart skill matching examples
- Documented priority order for skill resolution
- Enhanced installation instructions with security notes

### Breaking Changes

**Global Installation Model**
- Default installation location changed from project-specific `.agents/superpowers` to global `~/.agents/superpowers`
- Enables "install once, use everywhere" workflow
- Manual installations can still use project-specific locations if preferred
- Existing installations continue to work; global installation is optional

### Bug Fixes

- Fixed setup-skills command incorrectly referencing skill usage in generated files
- Resolved context detection issues when adding skills to projects
- Fixed CLAUDE.md and GEMINI.md update inconsistencies during setup
- Corrected template generation to avoid duplicate skill listings

---

## v4.0.0 (October-November 2025)

This release marks the fork of Jesse Vincent's Superpowers for Claude Code, extending it to support agent-agnostic workflows across GitHub Copilot, Cursor, Gemini, Codex, OpenCode, and other AI coding assistants.

### New Features

**Multi-Platform Support**
- Added slash commands and prompts for GitHub Copilot (.github/prompts/)
- Added slash commands for Cursor (.cursor/commands/)
- Added slash commands for Gemini (.gemini/commands/)
- Added prompts for Codex (.codex/prompts/)
- Added commands for OpenCode (.opencode/command/)
- Added commands for Claude Code (.claude/commands/)
- All platforms use same skill definitions via unified `superpowers-agent` CLI
- Consistent command syntax across all tools: `/brainstorm`, `/write-plan`, `/execute-plan`, `/skills`, `/use-skill`, `/setup-skills`

**MCP Replacement Skills**
- Added `context-7` skill for library documentation search via Context-7 API
- Added `playwright-skill` for browser automation without MCP overhead
- Achieves ~98% context reduction compared to MCP integrations
- Progressive disclosure: load full API references only when needed
- Node.js-based scripts for cross-platform compatibility
- In-environment filtering processes data before hitting model context

**Setup Skills Command**
- New `/setup-skills` command initializes projects with instruction files
- Automatically creates AGENTS.md, CLAUDE.md, and GEMINI.md
- Template-based generation ensures consistency
- Available across all supported platforms

**Leveraging CLI Tools Skill**
- New skill teaching agents to use high-performance CLI tools
- Covers rg (ripgrep), jq, fd, bat, ast-grep
- Provides 5-50x speedups over standard tools
- Includes verification patterns and fallback strategies

**Writing Prompts Skill**
- Guides creation of custom slash commands for GitHub Copilot, Cursor, and Claude
- Platform-specific syntax and file location guidance
- Best practices for effective prompt engineering
- Covers when to create commands vs when to use existing skills

**Testing Skills with Subagents**
- RED-GREEN-REFACTOR methodology for testing process documentation
- Baseline testing without skill, then iterate to close loopholes
- Verify skills work under pressure and resist rationalization
- Systematic validation before deployment

### Improvements

**Skill Reorganization**
- Restructured skills directory with clearer categories
- Categories: collaboration, testing, debugging, meta, mcp-replacement, problem-solving, research, architecture
- Improved discoverability with consistent naming conventions
- Better separation of concerns between skill types

**Auto-Update System**
- Bootstrap process checks for updates intelligently
- Only reinstalls integrations that have changed
- Respects local modifications and branch state
- Clear status messages about update success or pending changes

**Conditional Tool Detection**
- Bootstrap detects available platforms automatically
- Installs only relevant slash commands for detected tools
- Reduces clutter and setup time
- Smart detection for VS Code, Cursor, Gemini CLI, etc.

### Breaking Changes

**Agent-Agnostic Architecture**
- Moved from Claude Code-specific plugin to universal CLI tool
- obra's original Claude Code plugin still available separately at github.com/obra/superpowers
- New architecture supports any AI assistant that can run shell commands
- Slash commands now thin wrappers around `superpowers-agent` CLI

**Skill Priority System**
- New resolution order: project skills → home skills → global superpowers skills
- Project-specific skills (.agents/skills/) have highest priority
- Personal skills (~/.agents/skills/) override global superpowers skills
- Enables local customization without modifying core installation

### Documentation

**Installation Guides**
- Created platform-specific installation documentation
- Added troubleshooting sections for common issues
- Documented manual installation options
- Clear explanations of global vs project-specific installation

**README Overhaul**
- Added "What You Get" section summarizing features
- Updated installation instructions for multi-platform support
- Documented slash commands for each platform
- Added skill library overview with categories

---

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/complexthings/superpowers/issues).

Want to contribute? See our skills in `skills/` and follow the patterns in `skills/meta/writing-skills/`.

## Original Project

This is a fork of [obra/superpowers](https://github.com/obra/superpowers). For Claude Code-specific features, see Jesse Vincent's original implementation and [blog post](https://blog.fsck.com/2025/10/09/superpowers/).
