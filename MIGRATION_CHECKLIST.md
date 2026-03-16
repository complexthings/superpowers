# Migration Checklist: install.sh → npm Package

Every discrete behavior in `install.sh` that the npm package must replicate.

## Dependency Checks
- [ ] Check `git` is installed
- [ ] Check `node` is installed
- [ ] Check `npm` is installed
- [ ] Print install instructions per platform if missing

## Platform Detection
- [ ] Detect macOS / Linux / Windows via `uname -s`
- [ ] Map to `macos`, `linux`, `windows`, `unknown`

## Installation (Fresh)
- [ ] Create `~/.agents/` parent directory
- [ ] `git clone` repo to `~/.agents/superpowers`

## Installation (Update)
- [ ] Detect existing install via `.git` directory
- [ ] Stash local changes before pull
- [ ] `git pull origin main`

## Bootstrap
- [ ] Run `~/.agents/superpowers/.agents/superpowers-agent bootstrap`
- [ ] Mark success with `.install_success` sentinel file

## PATH Setup
- [ ] Detect user's shell (zsh/bash/fish/other)
- [ ] Detect shell profile file (~/.zshrc, ~/.bash_profile, ~/.bashrc, ~/.config/fish/config.fish, ~/.profile)
- [ ] Check if `~/.local/bin` already in profile
- [ ] Append PATH export if missing (fish syntax variant)
- [ ] Create profile file if it doesn't exist

## Project File Updates (Optional, Interactive)
- [ ] Detect AGENTS.md, CLAUDE.md, GEMINI.md in CWD
- [ ] Prompt user (y/N) to update
- [ ] Backup each file with timestamp suffix
- [ ] Copy files from global install to CWD
- [ ] Restore backup on copy failure

## Error Handling
- [ ] `set -euo pipefail` equivalent (fail-fast)
- [ ] Trap EXIT for cleanup
- [ ] Remove incomplete `$INSTALL_DIR` on failure (if no `.install_success`)

## UX
- [ ] Colored output (RED/GREEN/YELLOW/BLUE)
- [ ] Structured log helpers (info/success/warning/error with icons)
- [ ] ASCII banner header
- [ ] Final success message with next-steps

## npm Package Mapping

| Shell Behavior | npm Equivalent |
|---|---|
| `git clone` to `~/.agents/superpowers` | `npm install -g` (npm handles distribution) |
| `git pull` for updates | `npm update -g` |
| `superpowers-agent bootstrap` | `postinstall` lifecycle script |
| Symlinks in `~/.local/bin` | `bin` field in package.json (npm creates shims) |
| `uname` platform detection | Already handled by CLI via `process.platform` |
| Dependency checks (git/node/npm) | node/npm guaranteed; git checked at runtime |
| Interactive project file updates | Remains via `superpowers-agent setup-skills` |
| Shell profile PATH modification | No longer needed (npm global bin is already in PATH) |
