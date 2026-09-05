# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Run from `.agents/`:

```bash
bun test                              # all tests
bun test tests/smoke.test.js          # one file
bun test -t "retired CLI commands"     # one test by name
bun run dev -- version                # run the CLI from source
bun run build                         # bundle to .agents/superpowers-agent
```

## Architecture

`src/cli.js` is a flat command-name → handler map. Superpowers is retired, so the surface is only
`bootstrap`, `update`, `check-updates`, `version` and the default help. `bootstrap` and `update` both
run `src/commands/retirement-cleanup.js`, which removes every artifact the package ever installed and
backs real files up under `~/.agents/retirement-backup-<date>/`. Every invocation prints a one-line
retirement banner on stderr, so stdout stays a clean contract.

`build.js` bundles `src/cli.js` with Bun into the single committed file `.agents/superpowers-agent`, prefixed with a sh/bun/node polyglot shebang. That artifact is committed and shipped via npm `files`, so a source change is not live until it is rebuilt; the pre-commit hook rebuilds it.

Bundled skills were once installed as symlinks under `~/.agents/skills`; the CLI no longer
installs them, it only removes them — `tests/stale-skill-symlink-cleaner.test.js` covers that path.
