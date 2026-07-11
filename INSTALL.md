# Installing Superpowers (Agent Guide)

Instructions for an AI coding agent (Claude, Gemini, Codex, GitHub Copilot, OpenCode, or any other) to install the `superpowers-agent` CLI and its skills system on the user's machine. Run the commands with your shell/Bash tool, in order.

## Prerequisites

- **Node.js** `^20 || ^22 || ^24` and **npm** — required to install and run the CLI.
- **git** — only needed if you later install third-party skills/agents from git repos (`add`/`pull`).

Check first:

```bash
node --version && npm --version
```

## 1. Install the CLI

```bash
npm install -g @complexthings/superpowers-agent
```

This package has **no `postinstall` script** — installing it does **not** configure anything by itself. You **must** run bootstrap next.

## 2. Bootstrap (required, once per machine)

```bash
superpowers-agent bootstrap
```

Bootstrap is idempotent (safe to re-run). It:

- Installs the `superpowers` and `superpowers-agent` aliases into `~/.local/bin` (Unix).
- Checks npm for a newer version and tells you if one exists.
- Syncs the skills into `~/.agents/skills/` and creates/updates the global `~/.agents/AGENTS.md`.
- Installs a **session-start hook** for each AI assistant it detects, so the skills context is injected at the start of every session:
  - **GitHub Copilot CLI** → `~/.copilot/hooks/superpowers.json` (when the Copilot CLI is detected or `~/.copilot` exists).
  - **Claude Code** → a `SessionStart` hook merged into `~/.claude/settings.json` (backed up first).
  - **OpenCode** → a plugin symlink (when the OpenCode CLI is detected).
- Removes legacy/stale files from older versions.

Undetected assistants are skipped. To install an integration anyway, force it:

```bash
superpowers-agent bootstrap --force-copilot   # also: --force-claude, --force-opencode
superpowers-agent bootstrap --no-update        # skip the update check
```

If bootstrap warns that `~/.local/bin` is not on `PATH`, add it to the user's shell profile (`~/.zshrc`, `~/.bashrc`, etc.) and reload:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

## 3. Verify

```bash
superpowers-agent version       # prints the installed version, e.g. 9.2.1
```

That succeeding means the install is complete.

## 4. Set up a project (run inside each project directory)

```bash
cd /path/to/project
superpowers-agent setup-skills
```

This initializes the project for skills: creates `.agents/`, `.agents/skills/`, and `.agents/docs/`, and creates or idempotently updates instruction files — `AGENTS.md` (always), `CLAUDE.md` (only if it already exists), and `.github/copilot-instructions.md` (when GitHub Copilot is detected). Existing files are backed up before changes.

## Using skills (any agent)

The skills system is **agent-agnostic**. Use your assistant's native skill tool to discover and load skills. If your assistant has no native skill tool, inspect the configured skill directories and open the relevant `SKILL.md` with your file-read tool. When a skill names a tool you don't have (e.g. a specific todo, subagent, or edit tool), substitute your environment's closest equivalent.

## Updating

One command re-installs the latest CLI and re-runs bootstrap:

```bash
superpowers-agent update
```

(Equivalent to `npm install -g @complexthings/superpowers-agent` followed by `superpowers-agent bootstrap`.) After updating, re-run `superpowers-agent setup-skills` in any project you want refreshed.

## Uninstalling

```bash
npm uninstall -g @complexthings/superpowers-agent
rm -f ~/.local/bin/superpowers ~/.local/bin/superpowers-agent   # aliases
rm -f ~/.copilot/hooks/superpowers.json                          # Copilot CLI hook
# Remove the Superpowers SessionStart hook block from ~/.claude/settings.json (if present)
```

## Help

- Documentation & source: https://github.com/complexthings/superpowers
- Issues: https://github.com/complexthings/superpowers/issues
- Original project: [Superpowers for Claude Code](https://github.com/obra/superpowers) by Jesse Vincent
