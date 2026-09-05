# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Run from `.agents/`:

```bash
bun test                              # all tests
bun test tests/smoke.test.js          # one file
bun test -t "session context"         # one test by name
bun run dev -- session-context        # run the CLI from source
bun run build                         # bundle to .agents/superpowers-agent
```

## Architecture

`src/cli.js` is a flat command-name → handler map; adding a command means adding an entry there plus its handler and a help line. Handlers live in `src/commands/` (`bootstrap.js`, `update.js`, `simple-commands.js` — the last holds config get/set and repo listing), `src/skills/installer.js` (add/pull/rm), and `src/integrations/`.

`src/integrations/` holds one module per supported agent platform (claude, copilot, opencode) plus `session-context.js`. `session-context` is invoked by each platform's session-start hook with a `--format` flag, so its output is a public contract — changing it changes what every agent session sees.

`build.js` bundles `src/cli.js` with Bun into the single committed file `.agents/superpowers-agent`, prefixed with a sh/bun/node polyglot shebang. That artifact is committed and shipped via npm `files`, so a source change is not live until it is rebuilt; the pre-commit hook rebuilds it.

Bundled skills in `skills/` are installed as symlinks under `~/.agents/skills` and become stale when a skill is removed — `tests/stale-skill-symlink-cleaner.test.js` and `tests/repo-skill-symlinks-target.test.js` cover that path.
