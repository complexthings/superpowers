# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [9.2.1] - 2026-06-01

### Changed
- **GitHub agents are now also installed for the GitHub Copilot CLI** — `add` and `pull` symlink each GitHub agent (`.github/agents/<name>.agent.md`) into `~/.copilot/agents/` in addition to the VS Code `prompts/` directory, so the same agents are available to the Copilot CLI. Both destinations are tracked in `~/.agents/config.json` (new `destinations` array, with `destination` retained for backward compatibility) and both are removed by `rm`.

## [9.2.0] - 2026-05-31

### Changed
- **Version monitoring now uses the npm registry** — the `using-superpowers` skill and the `AGENTS.md` template now instruct agents to read the current version from `superpowers-agent` output, fetch the latest via `npm view @complexthings/superpowers-agent version`, and compare by **semver precedence** (not string comparison), prompting the user to update only when npm is newer. Replaces the old bundled-`^^SAV^^`-string comparison.
- **Skill-priority guidance reworked** — `using-superpowers` now directs agents to load **domain/context skills first**, then process/approach skills (brainstorming, planning, debugging, TDD), then implementation skills, so the domain skill can inform which process fits.
- **`leveraging-cli-tools` session nudge** now also triggers when a task involves using Bash (in addition to code search, JSON/YAML parsing, file finding, refactors, and verbose output).
- Refreshed the `AGENTS.md` and `SUPERPOWERS.md` templates/docs; `AGENTS.md` skill priority simplified to Project → Personal.

### Removed
- **`TOOLS.md.template` and the `{{TOOL_MAPPINGS}}` bootstrap templating** — `bootstrap` no longer reads `TOOLS.md.template` to inject a tool-mappings block; tool-equivalence guidance now lives inline in the templates.

## [9.1.0] - 2026-05-30

### Added
- **Claude Code SessionStart hook installed by `bootstrap`** — `bootstrap` now merges a `SessionStart` hook into `~/.claude/settings.json`, so the Superpowers context is injected at the start of every session. The merge is idempotent and preserves any other hooks and settings (backs up `settings.json` first).
- **GitHub Copilot CLI `sessionStart` hook** — `bootstrap` installs `~/.copilot/hooks/superpowers.json` (honoring `$COPILOT_HOME`), giving Copilot CLI the same session-start context injection via its `additionalContext` mechanism. Installed when the Copilot CLI is detected or `--force-copilot` is passed.
- **`leveraging-cli-tools` directive in the injected prompt** — the session-start context now includes an imperative pointer telling agents to use the `leveraging-cli-tools` skill for code search, parsing, file finding, refactors, and verbose output.
- **`superpowers-agent session-context [--format=claude|copilot|raw]`** — new command that prints the session-start context. It is the single source of truth for the injected prompt, shared by the Claude hook, the Copilot hook, and the OpenCode plugin so they never drift.

### Changed
- The OpenCode plugin now delegates to `session-context`, so every channel injects the same prompt (including the `leveraging-cli-tools` directive).

### Removed
- The Claude Code **plugin** hook (`hooks/hooks.json` and `hooks/session-start.sh`) — the `SessionStart` hook that `bootstrap` installs into `~/.claude/settings.json` replaces it. The `hooks/` directory and its `package.json` `files` entry were dropped.

## [9.0.0] - 2026-05-28

### Added
- Claude Code agent-persona platform — `.claude/agents/<name>.md` personas now install into `~/.claude/agents/` via `add`/`pull` (previously silently skipped)
- `bun test` harness with a smoke test and a `test` script in `.agents/package.json`; tests follow the `.agents/tests/<feature>.test.js` convention
- One-time `skill.json`-gated stale-symlink cleaner that runs during `bootstrap`, scrubbing deprecated per-platform skill symlinks (including legacy Cursor/Codex/Gemini directories) without touching agent personas

### Changed
- `superpowers-agent update` now self-runs `bootstrap` automatically
- Supported platforms are now GitHub Copilot, Claude Code, and OpenCode only

### Fixed
- `setup-skills` now correctly updates `.github/copilot-instructions.md` (restored the missing source template; creates the file when absent and updates it idempotently in place)

### Removed
- **BREAKING:** Removed Cursor, Codex, and Gemini support — deleted the integration modules and stripped their detection, paths, skill-symlink registries, skill discovery, the `install-cursor-hooks` command, and `GEMINI.md` generation
- **BREAKING:** Removed the `postinstall` script from the root `package.json` (supply-chain hardening); fresh installs now require a one-time manual `superpowers-agent bootstrap`
- **BREAKING:** Removed per-platform skill symlinking — skills now live only in `~/.agents/skills` and project `.agents/skills`

## [8.4.0] - 2026-04-06

### Added
- `superpowers-agent rm` command for removing installed skills/agents

### Fixed
- Fixed an issue with nested skill installs
- Resolved an issue with git URLs in `superpowers-agent add`
- Bug fixes for broken commands after migration

### Changed
- Updated GitHub Actions workflow

## [8.2.0] - 2026-03-16

### Changed
- **Update checking uses npm registry** — `checkForUpdates` and `getRemoteVersion` now query the npm registry instead of fetching from the Git repository. The `update` command tells users to run `npm install -g` rather than attempting `git pull`.
- **`getLocalVersion` reads from `.agents/package.json`** — Version resolution now reads the CLI tool's own `package.json` with a `0.0.0` fallback (previously hardcoded `5.4.0`).
- **Bootstrap update check simplified** — Bootstrap no longer attempts auto-update via git pull; it shows the npm install command when an update is available.

### Added
- **Husky pre-commit hook enforces version parity** — A pre-commit hook compares `version` in `./package.json` and `.agents/package.json`. On mismatch, it syncs both to the highest version, updates lockfiles, rebuilds the CLI, and stages all changes.

### Removed
- **Git-based update infrastructure** — `isRepoClean`, git fetch/pull logic, commit comparison, and `determineReinstalls`-driven integration reinstall removed from the update flow. `isOnMainBranch` retained as a deprecated no-op for backward compatibility.

## [8.0.0] - 2026-03-13

### Changed
- **Bootstrap no longer installs agent prompt/command files** — The six legacy install functions (`installCopilotPrompts`, `installCursorCommands`, `installCodexPrompts`, `installGeminiCommands`, `installClaudeCommands`, `installOpencodeCommands`) have been removed from the bootstrap flow. Skills are now delivered exclusively via symlinks.
- **Bootstrap cleans up legacy files** — A new `removeLegacyPrompts` step runs during bootstrap to delete any prompt/command files previously installed by older versions (across Copilot, Cursor, Codex, Gemini, Claude Code, and OpenCode directories). Safe to run repeatedly; missing files are silently skipped.
- **Removed `install-<agent>-prompts/commands` CLI commands** — The individual `install-copilot-prompts`, `install-cursor-commands`, `install-codex-prompts`, `install-gemini-commands`, `install-claude-commands`, and `install-opencode-commands` sub-commands have been removed. Only `install-cursor-hooks`, `install-aliases`, and `install-opencode-plugin` (internal) remain.
- **OpenCode plugin generates bootstrap content dynamically** — The `.opencode/plugins/superpowers-agent.js` plugin now generates the AGENTS.md bootstrap block at runtime instead of reading a static template file.
- **`setup-skills` is now a skill** — Project initialization is delivered as `skills/setup-skills/SKILL.md` instead of per-platform command files. The `superpowers-agent setup-skills` CLI command remains.
- **`update` command simplified** — Removed the `plans` directory update step from `runUpdate`; only skill/integration updates are performed.

### Added
- **`skills/setup-skills/` skill** — New `SKILL.md` for project initialization, replacing the deleted per-platform command files.

### Removed
- **All per-platform prompt/command file trees deleted** — `.codex/prompts/`, `.cursor/commands/`, `.gemini/commands/`, `.github/prompts/`, `.opencode/command/`, and `commands/` directories removed from the repository.
- **Cursor hooks removed** — `hooks/cursor/` (before-submit-prompt.sh, detect-new-conversation.sh, hooks.json, inject-bootstrap.sh) deleted; Cursor integration is now symlink-only.
- **`CLAUDE.md` and `GEMINI.md` root files deleted** — Agent-specific root instruction files removed in favour of the unified `AGENTS.md`.
- **`.github/copilot-instructions.md` template removed** — No longer needed now that bootstrap does not install Copilot instructions.
- **`skills/meta/writing-skills/`, `skills/meta/testing-skills-with-subagents/`, and `skills/meta/gardening-skills-wiki/` removed** — Entire skill directories deleted.
- **`skills/commands/` stub files removed** — brainstorm.md, execute-plan.md, write-plan.md deleted.
- **`.agents/superpowers-agent-backup.js` removed** — Legacy backup file deleted.
- **Plan documents removed** — Four design/plan documents under `.agents/superpowers/specs/` deleted.

## [7.1.2] - 2026-03-05

### Fixed
- **`--force-<agent>` creates missing agent directories (binary rebuild)** — v7.1.1 documented this fix but the binary was not rebuilt before release. This release ships the rebuilt binary. Running `bootstrap --force-copilot` (or any `--force-<agent>`) now correctly creates the agent's parent directory when it does not exist, instead of skipping with a warning.

## [7.1.1] - 2026-03-05

### Fixed
- **`--force-<agent>` creates missing agent directory** — Previously, if the agent's parent directory (e.g. `~/.copilot`) did not exist, `--force-copilot` would silently skip skill installation. The directory is now created automatically before installing skills.

## [7.1.0] - 2026-03-05

### Added
- **`--force-<agent>` flags for targeted re-installation** — `superpowers-agent bootstrap` now supports `--force-copilot`, `--force-cursor`, `--force-codex`, `--force-gemini`, `--force-claude`, and `--force-opencode` flags to re-run only specific agent integrations without repeating the full bootstrap. When force flags are used, only the targeted agent sections run; universal aliases installation and platform-specific `AGENTS.md` generation are skipped. Skill symlink sync always runs regardless of flags.

## [7.0.5] - 2026-02-09

### Added
- **Agent auto-installation via `agents.json`** — `superpowers-agent add` and `superpowers-agent pull` now automatically detect and install agents from repositories that contain an `agents.json` manifest file at the root. Supports GitHub Copilot agents (symlinked to VS Code `prompts/` directory) and OpenCode agents (symlinked to `~/.config/opencode/agents/`). Agent tracking is recorded in `~/.agents/config.json` under `installedAgents`. Repositories are stored persistently at `~/.agents/repos/` to keep symlinks valid after temp clones are cleaned up. Schema validation provides clear error messages for malformed manifests.

## [7.0.0] - 2026-02-07

### Changed
- **Build system migrated from Node.js/npm to Bun** — `build.js` refactored to use Bun's native bundler; `package-lock.json` replaced with `bun.lock`; `packageManager` field switched to `bun@1.3.8`; `.husky/pre-commit` hook added for automated `package-lock.json` regeneration.
- **Copilot instructions use smart template processing** — `installCopilotInstructions()` now injects the `using-superpowers` skill content into `~/.github/copilot-instructions.md` via a `${content}` placeholder, using `<!-- SUPERPOWERS_-_INSTRUCTIONS_START -->` / `<!-- SUPERPOWERS_-_INSTRUCTIONS_END -->` markers for idempotent in-place updates. Existing files are never overwritten; superpowers content is appended or updated between markers. Timestamped backups are created before any modification. Changes to `skills/meta/using-superpowers/` now trigger a `copilot-instructions` reinstall during `superpowers-agent update`.
- **Bumped 8 skills to migrate flowcharts from DOT to Mermaid** — `dispatching-parallel-agents` v1.2.0, `subagent-driven-development` v2.1.0, `root-cause-tracing` v1.2.0, `using-superpowers` v1.1.0, `writing-skills` v5.2.0, `when-stuck` v1.2.0, `condition-based-waiting` v1.2.0, and `test-driven-development` v3.2.0 updated for better rendering compatibility in GitHub, VS Code, and agent contexts.

## [6.5.0] - 2026-01-24

### Added
- **OpenCode Plugin** (`.opencode/plugins/superpowers-agent.js`) that uses `experimental.chat.system.transform` for session bootstrap injection and loads the `using-superpowers` skill at every session start.
- **`using-superpowers` skill** — behavioral enforcement skill with a Red Flags rationalization table (12 anti-patterns), DOT flowchart for skill invocation decisions, and agent-agnostic skill access guidance.
- **Two-stage code review process** in `subagent-driven-development` skill (bumped to v2.0.0): Stage 1 Spec Reviewer validates implementation against plan requirements; Stage 2 Code Quality Reviewer checks quality, patterns, and maintainability.
- Test infrastructure under `tests/`: `skill-triggering/` and `explicit-skill-requests/` suites with agent-agnostic test scripts.
- Helper script `find-polluter.sh` for bisection-based test pollution detection.
- Analysis scripts `render-graphs.js` (extracts DOT diagrams to SVG) and `analyze-token-usage.py` (analyzes token usage from conversation logs).

### Changed
- `writing-skills` skill updated with a warning about the Claude Skill Object description override trap, including correct vs. incorrect examples.

## [6.4.1] - 2026-01-24

### Changed
- `AGENTS.md.template` reduced by **76%** (168 → 40 lines) by moving detailed reference material to new `SUPERPOWERS.md.template` and generic tool guidance to `TOOLS.md.template`.
- `setup-skills` now creates `.agents/docs/SUPERPOWERS.md` from the template, providing detailed reference documentation without loading it into agent context every session.
- `bootstrap.js` updated `generateToolMappings()` and `runSetupSkills()` to reflect new template structure.
- Replaced 6 agent-specific `TOOLS-*.md.template` files (53–25 lines each) with a single shared `TOOLS.md.template` (21 lines), reducing per-agent tool mapping context by ~60%.

### Removed
- `TOOLS-GITHUB-COPILOT.md.template`, `TOOLS-CLAUDE-CODE.md.template`, `TOOLS-CURSOR.md.template`, `TOOLS-GEMINI.md.template`, `TOOLS-OPENCODE.md.template`, `TOOLS-CODEX.md.template` — replaced by unified `TOOLS.md.template`.

## [6.4.0] - 2026-01-23

### Added
- `setup-skills` command now automatically creates agent-specific symlinks from platform directories (`.claude/skills`, `.github/skills`, `.opencode/skill`, `.cursor/skills`, `.gemini/skills`, `.codex/skills`) pointing to `.agents/skills`, enabling native skill discovery for all major AI coding assistants at the project level.
- Symlink creation is idempotent; existing non-symlink directories are reported as errors rather than overwritten.
- Detection rules for each platform (e.g., requires `AGENTS.md` alongside agent directory for Copilot, OpenCode, Codex).

### Changed
- `symlinks.js` — added `PROJECT_SKILL_PLATFORMS` config and `syncProjectSkillSymlinks()` function.
- `bootstrap.js` — integrated project-level symlink sync into `runSetupSkills()`.

## [6.3.4] - 2026-01-17

### Changed
- Updated SKILLS.md files and agent instructions to align with agentskills.io specifications for improved cross-platform skill compatibility.

## [6.3.3] - 2026-01-14

### Added
- Full **Codex platform support**: Codex added to `SKILL_PLATFORMS` in `symlinks.js`; skills from `~/.agents/skills/` and `~/.agents/superpowers/skills/` now symlinked to `~/.codex/skills/`; added `projectCodexSkills` and `homeCodexSkills` path getters.
- `AGENTS.md.template` updated to include Codex in the Native Skill Tools table and Skill Locations section.

### Changed
- Rewrote all 6 `TOOLS-*.md.template` files with accurate, up-to-date tool information sourced from official platform documentation (Codex, Cursor, Gemini, OpenCode, Claude Code, GitHub Copilot).

## [6.3.2] - 2026-01-14

### Added
- New "NATIVE SKILL TOOLS" section in `AGENTS.md.template` instructing agents to attempt native skill tools first and fall back to `superpowers-agent execute`; documents native tool names per platform (GitHub Copilot, Claude Code, OpenCode, Cursor, Gemini).
- Extended symlink support to OpenCode (`~/.config/opencode/skill/`), Cursor (`~/.cursor/skills/`), and Gemini (`~/.gemini/skills/`) home-level directories.
- Full Cursor support: `cursor:` skill prefix, Cursor added to `skillTypes` in `parser.js` and path getters in `paths.js`.

### Fixed
- Corrected OpenCode skill paths to match OpenCode conventions: project-level `.opencode/skill/` (singular) and personal `~/.config/opencode/skill/` (under `.config`, singular).

## [6.3.1] - 2026-01-14

### Added
- `find-skills` and `execute` commands now discover skills from additional agent-specific directories at both project and home levels: `.copilot/skills/`, `.opencode/skills/`, `.gemini/skills/` (project); `~/.claude/skills/`, `~/.copilot/skills/`, `~/.opencode/skills/`, `~/.gemini/skills/` (personal).
- New skill prefixes: `copilot:skill-name`, `opencode:skill-name`, `gemini:skill-name`.
- Symlinks resolved to targets automatically; duplicates shown only once (highest-priority match wins).

### Changed
- Updated priority order documentation: Project tier → Personal tier → Superpowers tier; flat priority within tiers, first match wins.
- `paths.js` — added 7 new path getters; `parser.js` — added new prefixes and expanded `skillTypes`; `locator.js` — updated search order; `simple-commands.js` — updated discovery order; `finder.js` — added source labels; `AGENTS.md.template` — updated Skill Locations and Skill Naming sections.

## [6.3.0] - 2026-01-14

### Added
- Automatic symlink creation for **Claude Code** (`~/.claude/skills/superpowers`, individual personal skills) and **GitHub Copilot** (`~/.copilot/skills/superpowers`, individual personal skills), enabling native skill discovery in both tools.
- Symlinks auto-sync on `bootstrap`, `update`, `add`, and `pull` commands.
- Config tracking in `~/.agents/config.json` to manage created symlinks.
- `--force` flag on `bootstrap` to create parent directories if they don't exist.
- Cross-platform support: Unix/macOS and Windows (Developer Mode required for symlinks on Windows).
- Centralized symlink management module `src/utils/symlinks.js`.

## [6.2.0] - 2025-12-16

### Changed
- `generateToolMappings()` in `bootstrap.js` now reads actual content from `.agents/templates/TOOLS-*.md.template` files instead of generating stub headers, so each agent instruction file receives correct platform-specific tool mappings.
- `setup-skills` conditionally updates `.github/copilot-instructions.md` with GitHub Copilot tool mappings only when that file exists and `AGENTS.md` does not.

## [6.1.1] - 2024-12-09

### Fixed
- Critical bug where `installUnixAliases()` checked for executable existence but never created the required symlinks in `~/.local/bin/`, leaving `superpowers` and `superpowers-agent` commands unavailable globally after installation.
- `installUnixAliases()` now creates `~/.local/bin` if absent, writes symlinks for both commands, removes stale symlinks before recreating, and warns when `~/.local/bin` is not in `PATH`.
- Added `install-aliases` CLI command so users can manually recreate symlinks without re-running the full bootstrap.

## [6.1.0] - 2025-12-03

### Added
- New `superpowers pull` command to update or add skills from remote Git repositories (HTTPS, SSH, GitHub tree URLs) or local paths, with `@alias` syntax, `--global`/`--project` flags, and the same behavior as `add` but with update-oriented messaging.

## [6.0.2] - 2025-12-03

### Fixed
- `parseGitUrl()` only recognized HTTPS GitHub URLs; SSH-style URLs (e.g., `git@github.com:org/repo.git`) returned null and caused "Invalid URL or path not found" errors when using `superpowers add @alias` with SSH-configured repositories. Added SSH URL regex pattern to support both formats.

## [6.0.1] - 2025-12-02

### Fixed
- `superpowers add-repository` failed with `Error: Dynamic require of "os" is not supported` because `installer.js` used `require()` for Node built-ins, which esbuild (ESM mode) cannot handle. Converted all `require()` statements to static ES6 `import` declarations.

## [6.0.0] - 2025-11-29

### Added
- Complete modular architecture: 22 specialized ES-module source files organized into 6 layers (CLI, Commands, Core, Integrations, Skills, Utils), replacing the former monolithic executable.
- esbuild-based build system (`build.js`) producing a 324-line optimized bundle from 3,169 lines of source; supports minification, source maps, and `--watch` mode.
- New build scripts in `package.json`: `build`, `dev`, `watch`, `dev:link`, `production:link`.
- Development tooling: `scripts/extract-modules.py`, `scripts/finish-extraction.sh`, `scripts/link.cjs`.
- `AGENTS.md.template` updated with updates-monitoring section.
- Original monolithic file preserved as `superpowers-agent-backup.js` for rollback if needed.

### Changed
- All source converted from CommonJS to ES modules (`import`/`export`) with async/await for I/O throughout.
- Final executable reduced from 3,406 lines to a 324-line optimized bundle (~90% smaller disk footprint).
- `package.json` version bumped to 6.0.0; added proper metadata, build scripts, and esbuild as sole dev dependency targeting Node.js 18+.

## [5.4.0] - 2025-11-25

### Added
- Dynamic tool mapping template files for each platform (`TOOLS-GITHUB-COPILOT.md.template`, `TOOLS-CURSOR.md.template`, `TOOLS-CLAUDE-CODE.md.template`, `TOOLS-GEMINI.md.template`, `TOOLS-OPENCODE.md.template`, `TOOLS-CODEX.md.template`) in `.agents/templates/`.
- `detectPlatforms()` function to automatically detect installed AI coding assistants.
- `generateToolMappings(platforms)`, `updatePlatformFile()`, and `loadToolMappingTemplate(platform)` helper functions for automated file management.
- `superpowers-agent bootstrap` now generates platform-specific configuration files (`~/.agents/AGENTS.md`, `~/.github/copilot-instructions.md`, `~/.claude/CLAUDE.md`, `~/.gemini/GEMINI.md`, `~/.config/opencode/AGENTS.md`, `~/.codex/AGENTS.md`) with only the relevant tool mappings for each platform, automatic heading generation, and backup protection.
- `superpowers-agent setup-skills` detects project platforms and updates project `AGENTS.md` and platform-specific files with appropriate tool mappings.
- New Cursor `beforeSubmitPrompt` hook (`hooks/cursor/before-submit-prompt.sh`) that injects bootstrap context once per prompt before submission.
- `AGENTS.md.template` updated to use `{{TOOL_MAPPINGS}}` placeholder for dynamic injection.

### Changed
- Cursor hooks configuration updated to use `beforeSubmitPrompt` instead of `afterAgentResponse`/`stop`, reducing conversation overhead and improving response times.
- `superpowers-bootstrap.md` updated to reference platform-specific files instead of inline mappings.
- Tool mapping documentation expanded: GitHub Copilot (20+ tools), Cursor (15+ tools), Claude Code (20+ tools), Gemini, OpenCode, and Codex now have comprehensive platform-specific tool references.
- Marker-based content updates (`<!-- SUPERPOWERS_SKILLS_START -->` / `<!-- SUPERPOWERS_SKILLS_END -->`) introduced to allow safe, targeted updates to existing files.

## [5.3.0] - 2025-11-24

### Added
- `path` command: returns the filesystem path to a skill's `SKILL.md` file; supports aliases and smart matching (`superpowers-agent path <skill-name-or-alias>`).
- `execute` command as the new canonical name for loading and running skills (replaces `use-skill`).
- `create-skill-json` skill updated with strict 5-field enforcement, a comprehensive FORBIDDEN FIELDS section (40+ banned fields in 10 categories), a rationalization table, and a `test-scenarios.md` for subagent testing.
- Slash command files added/updated for `execute` across all platforms: OpenCode, Claude Code, GitHub Copilot, Cursor, Gemini, and Codex.

### Changed
- `use-skill` command renamed to `execute`; `use-skill` remains functional but is deprecated.
- README.md, INSTALL.md, `.github/copilot-instructions.md`, and all slash command files updated to reference `execute` instead of `use-skill`.
- `skill.json` schema clarified: exactly 5 allowed fields (`version`, `name`, `title`, `helpers`, `aliases`); all other fields explicitly forbidden.

## [5.2.3] - 2025-11-23

### Fixed
- `find-skills` and `execute` now correctly discover and load skills inside symlinked directories by checking `entry.isSymbolicLink()` and using `statSync()` to verify the symlink target is a directory. Broken symlinks are handled gracefully with try/catch.

## [5.2.2] - 2025-11-23

### Added
- `create-skill-json` skill (`meta/create-skill-json`): generates `skill.json` metadata files from `SKILL.md` frontmatter, extracts version/title/helpers automatically, generates standard aliases, and validates JSON syntax with `jq`.
- `verification-before-completion` skill (`testing/verification-before-completion`): ported from Jesse Vincent's original Superpowers repository; enforces evidence-based completion claims and prevents premature success declarations.
- Session-start hook (`hooks/session-start.sh`) and Cursor inject-bootstrap hook updated to use the `superpowers-agent` CLI with improved error handling and installation instructions when CLI is missing.

### Changed
- Hooks modernized to remove direct filesystem references in favor of CLI commands.

## [5.2.1] - 2025-11-23

### Added
- `skill.json` metadata files added for all 35 skills in the repository, with version tracking (v1.0.0–v5.1.0), helper file discovery, and alias support.
- Helper file detection for 9 skills with scripts, examples, templates, and resources cataloged.
- README updated to document complete `skill.json` coverage, version distribution, and `get-helpers`/alias usage examples.

## [5.2.0] - 2025-11-23

### Added
- `add` command: installs skills from Git repositories, local directories, or repository aliases into global (`~/.agents/skills/`) or project (`.agents/skills/`) locations, with automatic multi-skill detection from `skill.json`.
- `add-repository` command: creates named shortcuts for frequently used skill repositories, with automatic alias detection and custom `--as=@alias` flag support; aliases stored in `config.json`.
- Repository alias support in `config.json` under a `repositories` object; priority resolution favors project over global config.
- `get-helpers` command: finds helper files within a skill using substring matching against the `helpers` array in `skill.json`.
- `dir` command: returns the directory path of any skill by name, alias, or full path.
- `skill.json` fields `helpers`, `aliases`, `repository`, `skills` (multi-skill array), `name`, and `title` documented and supported.
- `installLocation` config option (`"global"` or `"project"`) to control default install destination; overridable with `--global`/`--project` flags.
- README expanded with comprehensive `skill.json` documentation and a full CLI commands reference section.

### Fixed
- Skill installation from local paths.
- Handling of tree URLs with branches during `add`.
- Directory creation for nested skill paths.
- Config file creation when parent directories do not exist.

## [5.1.1] - 2025-11-21

### Added
- `/meta-prompt` (or `/create-meta-prompt`) slash command added to all supported platforms (OpenCode, Claude Code, GitHub Copilot, Cursor, Gemini, Codex) for quick access to the `creating-prompts` skill.
- All platform command tables in README updated to include the new command.

## [5.1.0] - 2025-11-21

### Added
- `creating-prompts` skill: agent-agnostic prompt creation workflow for Do/Plan/Research/Refine patterns, with structured templates, dependency detection via file references, checklist-driven workflow, and a `SUMMARY.md` template. Adapted from TÂCHES.
- Configuration system: `.agents/config.json` for project and global settings; configurable keys include `prompts_dir`, `plans_dir`, `skills_dir`; priority resolution is project > global > defaults.
- `superpowers-agent get-config <key>` CLI command for reading config values.

### Changed
- `writing-plans` skill updated to use `.agents/plans/` as its output directory (configurable via `config.json`).
- README updated with `creating-prompts` entry in the Meta skills section and a new Configuration section.

## [5.0.0] - 2025-11-19

### Added
- Homebrew-style one-liner global installer: installs to `~/.agents/superpowers`, sets up universal CLI aliases (`superpowers` and `superpowers-agent`) for zsh, bash, and Windows PowerShell, and offers optional project file integration.
- Smart suffix-based skill matching: `brainstorming` and `collaboration/brainstorming` both resolve correctly; priority order is project skills → home skills → global superpowers skills; helpful error messages when multiple skills match.
- Comprehensive `INSTALL.md` with step-by-step instructions, troubleshooting, and platform-specific guidance.

### Changed
- **BREAKING:** Default installation location changed from project-specific `.agents/superpowers` to global `~/.agents/superpowers`. Existing installations continue to work; global installation is optional.
- `setup-skills` command improved: properly initializes `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` via template-based generation with fixed context detection and project root detection.
- README updated with a "What's New" section, updated Quick Start examples for smart skill matching, and documented skill resolution priority order.

### Fixed
- `setup-skills` incorrectly referencing skill usage in generated files.
- Context detection issues when adding skills to projects.
- `CLAUDE.md` and `GEMINI.md` update inconsistencies during setup.
- Template generation producing duplicate skill listings.

## [4.0.0] - 2025-11

### Added
- Multi-platform support: slash commands and prompts added for GitHub Copilot (`.github/prompts/`), Cursor (`.cursor/commands/`), Gemini (`.gemini/commands/`), Codex (`.codex/prompts/`), OpenCode (`.opencode/command/`), and Claude Code (`.claude/commands/`); all platforms share skill definitions via a unified `superpowers-agent` CLI with consistent command syntax (`/brainstorm`, `/write-plan`, `/execute-plan`, `/skills`, `/use-skill`, `/setup-skills`).
- `context-7` skill: library documentation search via Context-7 API; achieves ~98% context reduction compared to MCP integrations.
- `playwright-skill`: browser automation without MCP overhead; Node.js-based with in-environment filtering.
- `/setup-skills` command: initializes projects with `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` via template-based generation; available on all supported platforms.
- `leveraging-cli-tools` skill: teaches agents to use high-performance CLI tools (`rg`, `jq`, `fd`, `bat`, `ast-grep`) for 5–50x speedups over standard tools.
- `writing-prompts` skill: guides creation of custom slash commands for GitHub Copilot, Cursor, and Claude, with platform-specific syntax, file location guidance, and best practices.
- `testing-skills-with-subagents` skill: RED-GREEN-REFACTOR methodology for validating process documentation under pressure.
- Auto-update system: bootstrap checks for changes and only reinstalls integrations that have changed, respecting local modifications.
- Conditional platform detection during bootstrap: installs only relevant slash commands for detected tools.

### Changed
- Skills directory restructured into clearer categories: collaboration, testing, debugging, meta, mcp-replacement, problem-solving, research, architecture.
- **BREAKING:** Architecture moved from a Claude Code-specific plugin to a universal CLI tool (`superpowers-agent`); slash commands are now thin wrappers around the CLI. The original Claude Code plugin remains available at `github.com/obra/superpowers`.
- **BREAKING:** Skill priority resolution order established: project skills (`.agents/skills/`) → personal skills (`~/.agents/skills/`) → global superpowers skills; project-specific skills have highest priority.
- README overhauled with "What You Get" summary, updated multi-platform installation instructions, per-platform slash command reference, and skill library overview.
