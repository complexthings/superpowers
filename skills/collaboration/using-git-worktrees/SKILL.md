---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification
metadata:
  when_to_use: when starting feature work that needs isolation from current workspace, before executing implementation plans
  version: 1.2.0
---

# Using Git Worktrees

## Overview

Git worktrees create isolated workspaces sharing the same repository, allowing work on multiple branches simultaneously without switching.

**Core principle:** Systematic directory selection + safety verification = reliable isolation.

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

## Pre-Flight Check

### Detect Current Context

Before creating a worktree, confirm you're in a git repo and know where you are:

```bash
# Verify git repo
git rev-parse --show-toplevel 2>/dev/null || { echo "Not a git repo"; exit 1; }

# Check if already inside a linked worktree (vs main worktree)
git_dir=$(git rev-parse --absolute-git-dir 2>/dev/null)
# In a linked worktree, $git_dir points to .git/worktrees/<name>/, not .git/
# This is informational — git worktree add works from either location
```

### Check for Submodules

```bash
[ -f .gitmodules ] && echo "WARNING: This repo has submodules — git worktree support is incomplete. Multiple checkouts of a superproject are not recommended."
```

## Directory Selection Process

Follow this priority order:

### 1. Check Existing Directories

```bash
# Use POSIX test, not ls -d (more reliable)
[ -d .worktrees ] && echo "found: .worktrees"
[ -d worktrees ]  && echo "found: worktrees"
```

**If found:** Use that directory. If both exist, `.worktrees` wins.

### 2. Check AGENTS.md / CLAUDE.md

```bash
grep -i "worktree.*director" AGENTS.md 2>/dev/null
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```

**If preference specified:** Use it without asking.

### 3. Ask User

If no directory exists and no config preference:

```
No worktree directory found. Where should I create worktrees?

1. .worktrees/ (project-local, hidden)
2. ~/.config/superpowers/worktrees/<project-name>/ (global location)

Which would you prefer?
```

## Safety Verification

### For Project-Local Directories (.worktrees or worktrees)

**MUST verify directory is ignored before creating worktree.** Note the trailing slash — required for `git check-ignore` to recognize directory patterns:

```bash
# Note: trailing slash required for directory pattern matching
git check-ignore -q .worktrees/ 2>/dev/null && echo "ignored" || echo "NOT ignored"
git check-ignore -q worktrees/  2>/dev/null && echo "ignored" || echo "NOT ignored"
```

**If NOT ignored:**

1. Add appropriate line to `.gitignore` (e.g., `.worktrees/` or `worktrees/`)
2. Commit the change
3. Proceed with worktree creation

**Why critical:** Prevents accidentally committing worktree contents to repository.

### For Global Directory (~/.config/superpowers/worktrees)

No `.gitignore` verification needed — outside project entirely.

## Branch Name Handling

Branch names with `/` (e.g., `feature/add-auth`) create nested subdirectories inside the worktree location. This works but produces `feature/add-auth` → `.worktrees/feature/add-auth/`. If you want a flat layout, sanitize slashes:

```bash
# Sanitize slashes to dashes for flat directory names
safe_name=$(echo "$BRANCH_NAME" | tr '/' '-')
# Use $safe_name for the path, $BRANCH_NAME for the git branch
```

## Creation Steps

### 1. Detect Project Name

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
```

### 2. Determine Full Path

```bash
case $LOCATION in
  .worktrees|worktrees)
    path="$LOCATION/$safe_name"
    ;;
  ~/.config/superpowers/worktrees/*)
    path="$HOME/.config/superpowers/worktrees/$project/$safe_name"
    ;;
esac
```

### 3. Check for Existing Worktree or Path Conflicts

```bash
# Check if target path is already a registered worktree
if git worktree list --porcelain | awk '/^worktree /{print $2}' | grep -qx "$path"; then
  echo "Worktree already exists at $path — switching to it instead"
  # Just cd to it
fi

# Check if path exists as a regular directory (failed previous run)
if [ -d "$path" ]; then
  echo "Directory $path already exists but is not a registered worktree — choose a different name or remove it"
fi
```

### 4. Handle Branch Existence

The correct command depends on whether the branch already exists:

```bash
# Check if branch exists
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  # Branch exists — check if it's already checked out somewhere
  if git worktree list --porcelain | grep -q "^branch refs/heads/${BRANCH_NAME}$"; then
    echo "Branch '$BRANCH_NAME' is already checked out in another worktree — cannot create duplicate"
    echo "Use --force only if you know what you're doing (rare edge case)"
  else
    # Branch exists, not checked out — use it as-is (no -b flag)
    git worktree add "$path" "$BRANCH_NAME"
  fi
else
  # Branch doesn't exist — create it
  git worktree add "$path" -b "$BRANCH_NAME"
fi
```

**Note:** Avoid `-B` (capital B) — it silently resets an existing branch to HEAD, destroying unpushed commits.

### 5. Run Project Setup

Auto-detect and run appropriate setup. Prefer lockfile-respecting commands to avoid modifying lockfiles and creating dirty state:

```bash
# Node.js — prefer npm ci (deterministic) over npm install (may modify lockfile)
if [ -f package-lock.json ]; then
  npm ci
elif [ -f yarn.lock ]; then
  yarn install --frozen-lockfile
elif [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile
elif [ -f bun.lockb ]; then
  bun install
elif [ -f package.json ]; then
  npm install   # no lockfile — fallback only
fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f pyproject.toml ]; then
  poetry install
elif [ -f requirements.txt ]; then
  pip install -r requirements.txt
fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### 6. Verify Clean Baseline

Run tests to ensure worktree starts clean:

```bash
# Use project-appropriate command
npm test
cargo test
pytest
go test ./...
```

**If tests fail:** Report failures, ask whether to proceed or investigate.

**If tests pass:** Report ready.

### 7. Report Location

```
Worktree ready at <full-path>
Branch: <branch-name>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Listing & Managing Worktrees

Always use `--porcelain` for scripting — the human-readable output format is not stable:

```bash
# List all worktrees (machine-readable)
git worktree list --porcelain

# List all worktrees (human-readable overview)
git worktree list
```

## Cleanup & Removal

When work is complete (typically called by the `finishing-a-development-branch` skill):

```bash
# Remove a clean worktree
git worktree remove .worktrees/my-feature

# Remove even if uncommitted changes exist
git worktree remove --force .worktrees/my-feature

# Prune stale admin files after manual directory deletion
git worktree prune

# Dry-run to see what would be pruned
git worktree prune -n -v
```

**Note:** `git gc` auto-prunes stale worktree admin files after 3 months (`gc.worktreePruneExpire`). For short-lived agent tasks, call `git worktree prune` explicitly rather than waiting.

## Repairing Worktrees

If the repo or worktree directory moves (Docker, CI, symlink changes), repair the links:

```bash
# Run from main worktree after a linked worktree was moved
git worktree repair

# Specify new path if auto-detection fails
git worktree repair /new/path/to/worktree
```

## Locking (Long-Running Tasks)

Lock a worktree to prevent `git gc` from pruning it during long agent tasks:

```bash
# Atomically create and lock (prevents gc from cleaning up)
git worktree add --lock --reason "agent task in progress" "$path" -b "$BRANCH_NAME"

# Unlock when done
git worktree unlock "$path"
git worktree remove "$path"
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| `.worktrees/` exists | Use it (verify ignored) |
| `worktrees/` exists | Use it (verify ignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check AGENTS.md/CLAUDE.md → Ask user |
| Directory not ignored | Add to `.gitignore` + commit |
| Branch doesn't exist | `git worktree add "$path" -b "$branch"` |
| Branch exists, not checked out | `git worktree add "$path" "$branch"` (no `-b`) |
| Branch checked out elsewhere | Error — ask user before using `--force` |
| Worktree already at path | Switch to it instead of re-creating |
| Tests fail during baseline | Report failures + ask |
| No package.json/Cargo.toml | Skip dependency install |
| Submodules present | Warn — limited worktree support |
| Long-running task | Use `--lock` when creating |

## Common Mistakes

### Trailing slash missing in git check-ignore

- **Problem:** `git check-ignore -q .worktrees` always exits 1 (not ignored), even when the directory IS ignored
- **Fix:** Always use `git check-ignore -q .worktrees/` — trailing slash required for directory matching

### Using `npm install` instead of `npm ci`

- **Problem:** `npm install` may modify `package-lock.json`, creating a dirty worktree from the start
- **Fix:** Use `npm ci` when a lockfile exists — it's deterministic and won't modify the lockfile

### Using `-b` when branch already exists

- **Problem:** `git worktree add "$path" -b "$branch"` fails if `$branch` already exists
- **Fix:** Check with `git show-ref --verify --quiet "refs/heads/$branch"` first; omit `-b` for existing branches

### Using `-B` (capital B)

- **Problem:** Silently resets an existing branch to HEAD, destroying unpushed commits
- **Fix:** Never use `-B` unless explicitly requested by the user

### Skipping ignore verification

- **Problem:** Worktree contents get tracked, pollute git status
- **Fix:** Always use `git check-ignore` (with trailing slash) before creating project-local worktrees

### Assuming directory location

- **Problem:** Creates inconsistency, violates project conventions
- **Fix:** Follow priority: existing > AGENTS.md/CLAUDE.md > ask

### Proceeding with failing tests

- **Problem:** Can't distinguish new bugs from pre-existing issues
- **Fix:** Report failures, get explicit permission to proceed

## Example Workflow

```
You: I'm using the using-git-worktrees skill to set up an isolated workspace.

[Check .worktrees/ — exists, verify with git check-ignore -q .worktrees/ → ignored]
[Check branch: git show-ref --verify --quiet refs/heads/feature/auth → not found]
[Sanitize path: feature/auth → feature-auth]
[Create: git worktree add .worktrees/feature-auth -b feature/auth]
[Run: npm ci (package-lock.json found)]
[Run: npm test — 47 passing]

Worktree ready at /Users/jesse/myproject/.worktrees/feature-auth
Branch: feature/auth
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

## Integration

**Called by:**
- **brainstorming** (Phase 4) — REQUIRED when design is approved and implementation follows
- **subagent-driven-development** — REQUIRED before executing any tasks
- **executing-plans** — REQUIRED before executing any tasks
- Any skill needing isolated workspace

**Pairs with:**
- **finishing-a-development-branch** — REQUIRED for cleanup after work complete
