---
name: finishing-a-development-branch
description: Use when implementation is complete and you need to decide how to integrate the work — guides completion of development work by running pre-merge checks, presenting structured options for merge, PR, or cleanup, and handling the chosen workflow including branch and worktree cleanup. Invoke this skill whenever a user says "I'm done", "implementation complete", "wrap up", "finish this branch", "create a PR", "merge to main", or "what do I do now that I'm done coding".
---

# Finishing a Development Branch

## Overview

Guide completion of development work by running pre-merge checks, presenting clear options, and handling the chosen workflow.

**Core principle:** Verify → Present options → Execute choice → Clean up.

**Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

## The Process

### Step 1: Pre-Flight Checks

Before presenting options, run these checks in order. Stop and report on any failure.

#### 1a. Clean working tree

```bash
git status --short
```

If there are uncommitted changes, ask: "There are uncommitted changes. Should I commit them, stash them, or discard them before proceeding?"

Wait for answer before continuing.

#### 1b. Run tests

Discover the test command by checking `package.json`, `Makefile`, `pyproject.toml`, `.github/workflows/`, or the project's README. Common commands:

```bash
npm test          # Node.js
cargo test        # Rust
pytest            # Python
go test ./...     # Go
./gradlew test    # Gradle
bundle exec rspec # Ruby
```

**If tests fail:**
```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge/PR until tests pass.
```

Stop. Don't proceed to Step 2.

**If tests pass:** Continue to Step 2.

#### 1c. Check if branch is up-to-date

```bash
git fetch origin
git rev-list --count HEAD..origin/<base-branch> 2>/dev/null
```

If the count is greater than 0, inform the user:
```
The base branch has <N> new commit(s) that aren't in this branch.
Rebasing before merging will avoid hidden conflicts and keep history clean.
```

This is advisory, not blocking — proceed to Step 2 regardless.

### Step 2: Determine Base Branch

```bash
# Check what branch this was created from
git log --oneline HEAD ^main ^master 2>/dev/null | tail -1
# Or check the most recent common ancestor
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

If ambiguous, ask: "What branch should I merge/PR into? (main, master, develop, etc.)"

### Step 3: Present Options

Present exactly these 4 options:

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

Keep options concise — don't add explanation unless asked.

### Step 4: Execute Choice

#### Option 1: Merge Locally

```bash
# Switch to base branch and update
git switch <base-branch>
git pull --ff-only

# Merge feature branch (use --no-ff to preserve branch history, or --squash for clean log)
git merge <feature-branch>

# Verify tests still pass on merged result
<test command>

# If tests pass: delete feature branch and prune stale refs
git branch -d <feature-branch>
git fetch --prune
```

Then: Cleanup worktree (Step 5)

#### Option 2: Push and Create PR

```bash
# Push branch to remote
git push -u origin <feature-branch>
```

Create PR with a meaningful description — fill in every section based on what was actually implemented:

```bash
gh pr create --title "<concise title describing the change>" --body "$(cat <<'EOF'
## Summary
- <what changed, bullet 1>
- <why it exists, bullet 2>

## Motivation
<Why does this exist? Link related issues if applicable.>
Closes #NNN

## Testing
<How was this verified? What edge cases were exercised?>

## Reviewer Notes
<What feedback do you want? Any design decisions to discuss?>
EOF
)"
```

Good PR titles are imperative and specific: `"Add retry logic to payment processor"` not `"fix stuff"`.
After creating the PR, share the URL with the user.

Then: Cleanup worktree (Step 5)

#### Option 3: Keep As-Is

Report: "Keeping branch `<name>`. Worktree preserved at `<path>`."

**Don't cleanup worktree.**

#### Option 4: Discard

**Confirm first:**
```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path> (if applicable)

Type 'discard' to confirm.
```

Wait for exact typed confirmation.

If confirmed:

```bash
git switch <base-branch>
git branch -D <feature-branch>
```

Then: Cleanup worktree (Step 5)

### Step 5: Cleanup Worktree

First check whether this work is in a worktree or the main working directory:

```bash
git worktree list | grep "$(git branch --show-current)"
```

**If in a worktree (Options 1, 2, 4):**

```bash
git worktree remove <worktree-path>
```

**If not in a worktree:** No worktree cleanup needed — the work is in the main repo directory.

**For Option 3:** Keep worktree regardless.

## Quick Reference

| Option | Merge | Push | Keep Worktree | Cleanup Branch |
|--------|-------|------|---------------|----------------|
| 1. Merge locally | ✓ | - | - | ✓ (+ prune) |
| 2. Create PR | - | ✓ | - | - |
| 3. Keep as-is | - | - | ✓ | - |
| 4. Discard | - | - | - | ✓ (force) |

## Common Mistakes

**Skipping test verification**
- Problem: Merge broken code, create a failing PR
- Fix: Always verify tests before offering options

**Skipping the clean working tree check**
- Problem: Uncommitted work gets lost or included unexpectedly
- Fix: `git status --short` first; resolve before proceeding

**Not updating before merge**
- Problem: Stale conflicts hide bugs introduced at merge time
- Fix: Advisory check in Step 1c; encourage rebasing when base has moved

**Open-ended questions**
- Problem: "What should I do next?" leads to ambiguous answers
- Fix: Present exactly 4 structured options

**Not pruning remote-tracking refs**
- Problem: Stale refs in `git branch -r` cause confusion about what exists
- Fix: `git fetch --prune` after Option 1 merge

**No confirmation for discard**
- Problem: Accidentally deletes work
- Fix: Require typed "discard" confirmation

## Red Flags

**Never:**
- Proceed with uncommitted changes without user direction
- Proceed with failing tests
- Merge without verifying tests on the merged result
- Delete work without confirmation
- Force-push without explicit user request

**Always:**
- Check for uncommitted changes before anything else
- Verify tests before offering options
- Present exactly 4 options
- Get typed confirmation for Option 4
- Check for worktree vs. main working directory before cleanup

## Integration

**Called by:**
- **subagent-driven-development** (Step 7) — After all tasks complete
- **executing-plans** (Step 5) — After all batches complete

**Pairs with:**
- **using-git-worktrees** — Cleans up worktrees created by that skill
