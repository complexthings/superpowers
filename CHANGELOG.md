# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
