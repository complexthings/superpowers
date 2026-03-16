# Migration Plan: install.sh → npm Package

## Overview

The existing `.agents/superpowers-agent` bundled CLI already implements all runtime logic (bootstrap, symlinks, platform detection, skill sync). This migration is purely a **packaging exercise** — wrapping the existing CLI in a proper npm package.

## Architecture

```
Before (shell script):
  curl install.sh | bash → git clone → bootstrap → symlink ~/.local/bin

After (npm package):
  npm install -g @complexthings/superpowers-agent
    → npm extracts package to global node_modules
    → npm creates bin shims (superpowers-agent, superpowers)
    → postinstall runs bootstrap --no-update
```

## What Changes

### Root `package.json` (NEW)
- `name`: `@complexthings/superpowers-agent`
- `version`: synced with `.agents/package.json` (8.0.1)
- `bin`: maps `superpowers-agent` and `superpowers` → `.agents/superpowers-agent`
- `files`: includes all runtime assets (templates, skills, prompts, docs)
- `engines`: `node >= 18`
- `postinstall`: runs `node .agents/superpowers-agent bootstrap --no-update`

### Shell Behaviors → npm Equivalents

| install.sh Behavior | npm Package Equivalent | Notes |
|---|---|---|
| Platform detection (`uname`) | `process.platform` in CLI | Already implemented |
| Dependency check (git/node/npm) | node/npm guaranteed by npm | git checked at runtime by CLI |
| `git clone` to `~/.agents/superpowers` | `npm install -g` | npm handles distribution |
| `git pull` (update) | `npm update -g` | npm handles updates |
| Run `bootstrap` | `postinstall` script | Automatic on install |
| Create `~/.local/bin` symlinks | `bin` field in package.json | npm creates shims automatically |
| Add `~/.local/bin` to PATH | Not needed | npm global bin already in PATH |
| Interactive project file updates | `superpowers-agent setup-skills` | Unchanged, run manually |
| Error cleanup (trap/sentinel) | npm handles failed installs | Rollback is automatic |
| Colored output/banner | CLI already has this | No change needed |

### What's Eliminated
- `install.sh` no longer primary install method (kept in repo for reference)
- No shell profile modification needed
- No git clone/pull for installation
- No `~/.local/bin` symlink management for install
- No `.install_success` sentinel file

### `files` Array — What Gets Packaged

```
.agents/superpowers-agent        # The bundled CLI binary
.agents/templates/               # AGENTS.md.template, TOOLS.md.template, etc.
.agents/docs/                    # Documentation
.agents/skills/                  # Bundled skills
.agents/prompts/                 # Platform prompts
.agents/plans/                   # Plans
.agents/superpowers-bootstrap.md # Bootstrap instructions
skills/                          # Main skills directory
hooks/                           # Hook configs
.github/                         # GitHub files (copilot-instructions.md template)
AGENTS.md                        # Root instruction file
README.md
LICENSE
```

### Cross-Platform Support
- **Mac/Linux**: npm creates symlinks in its global bin directory
- **Windows**: npm creates `.cmd` shims in its global bin directory
- The CLI's polyglot shebang (`#!/bin/sh` + node/bun exec) works on Unix; npm's shims handle Windows

## No Code Changes Required
The existing `.agents/src/` code and `.agents/superpowers-agent` bundle need zero modifications. The `bootstrap` command already handles all post-install setup (alias creation, skill syncing, platform file generation, integration installs).
