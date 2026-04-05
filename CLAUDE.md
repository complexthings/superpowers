# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Superpowers Agent** is a CLI tool (`superpowers-agent`) that manages reusable markdown-based "skills" for AI coding assistants. It provides a multi-platform skill delivery system for Claude, GitHub Copilot, Cursor, Gemini, OpenCode, and Codex. Skills are stored in `.agents/skills/` directories and symlinked into each assistant's config directory.

## Build & Development

The CLI lives in `.agents/` and is built with **Bun**:

```bash
cd .agents
npm run build       # Compile to .agents/superpowers-agent (minified bundle)
npm run watch       # Watch mode
npm run dev         # Run CLI from source
npm run dev:link    # Create dev symlinks (superpowers-agent → dev build)
```

The compiled output is `.agents/superpowers-agent` — a polyglot shebang script that runs under bun or node as fallback.

**No external npm dependencies** — pure Node.js built-ins only.

## Testing

No automated test runner. Tests are prompt files + manual verification:

```bash
export AGENT_CLI="claude"   # or opencode, copilot, cursor, etc.
./tests/skill-triggering/run-test.sh tests/prompts/<test-name>.txt
./tests/skill-triggering/run-all.sh
```

## Architecture

### Source (`./agents/src/`)

| Layer | Files | Responsibility |
|-------|-------|---------------|
| CLI Entry | `cli.js` | Command routing |
| Commands | `commands/bootstrap.js`, `update.js`, `simple-commands.js` | Command implementations |
| Core | `core/config.js`, `paths.js`, `platform-detection.js`, `git.js` | Config, path resolution, AI platform detection |
| Skills | `skills/finder.js`, `locator.js`, `installer.js`, `executor.js`, `parser.js` | Discovery, install, execution pipeline |
| Integrations | `integrations/claude.js`, `copilot.js`, `cursor.js`, `gemini.js`, `opencode.js`, `codex.js` | Per-platform symlink/config setup |
| Utils | `utils/symlinks.js`, `frontmatter.js`, `output.js`, `file-ops.js` | Shared helpers |

### Skill Discovery Priority (highest → lowest)

1. `.agents/skills/` — project-level
2. `~/.agents/skills/` — personal cross-project
3. `~/.agents/superpowers/skills/` — bundled community skills

### Key Flows

- **`bootstrap`** → detects installed AI platforms → creates symlinks to each platform's skill directory → writes platform config files
- **`find-skills [pattern]`** → searches all three skill tiers → returns name/path/description
- **`execute <skill-name>`** → locates skill → outputs SKILL.md content for the agent to follow
- **`add <url-or-path>`** → clones git repo or copies local path → installs skills into `~/.agents/superpowers/skills/`
- **`update`** → checks npm registry for new version → reports if update available

### Skill Structure

Each skill is a directory with a `SKILL.md` file:

```
skills/
└── <category>/
    └── <skill-name>/
        ├── SKILL.md         # Frontmatter (name, description, triggers) + instructions
        ├── scripts/         # Optional support scripts
        └── resources/       # Optional templates/data
```

`SKILL.md` frontmatter fields: `name`, `description`, `triggers` (array of natural language patterns).

### Symlink Destinations

Bootstrap creates symlinks from skills dirs to:
- `~/.claude/skills/` (Claude Code)
- `~/.config/opencode/skill/` (OpenCode plugin format)
- `~/.cursor/skills/` (Cursor)
- `~/.copilot/skills/` (GitHub Copilot)
- `~/.gemini/skills/` (Gemini)
- `~/.codex/skills/` (Codex)

## Publishing

CI publishes to npm (`@complexthings/superpowers-agent`) via `.github/workflows/main.yaml` on manual trigger, tested against Node v24.

Current version: **8.2.2**
