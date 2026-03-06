# `--force-<agent>` Create Missing Directory Implementation Plan

> **For AGENTS:** REQUIRED SUB-SKILL: Use executing-plans skill to implement this plan task-by-task.

**Goal:** When `--force-<agent>` is used and the agent's parent directory does not exist, create it automatically before installing skills.

**Architecture:** Pass the `forceAgents` Set from `bootstrap.js` into `syncAllSkillSymlinks` in `symlinks.js`. In the per-platform loop, compute a per-platform force flag: `const platformForce = force || forceAgents.has(platform.name)`. This ensures only the explicitly targeted agent's directory is created—no side effects on other platforms.

**Tech Stack:** Bun, ES modules, Node `fs` (existsSync, mkdirSync)

---

### Task 1: Update `syncAllSkillSymlinks` in `symlinks.js`

**Files:**
- Modify: `.agents/src/utils/symlinks.js` (function `syncAllSkillSymlinks`, ~line 374)

**Step 1: Open the file and locate `syncAllSkillSymlinks`**

The function signature is currently:
```js
export const syncAllSkillSymlinks = (options = {}) => {
    const { force = false } = options;
```

**Step 2: Update the destructure to accept `forceAgents`**

Replace:
```js
export const syncAllSkillSymlinks = (options = {}) => {
    const { force = false } = options;
```
With:
```js
export const syncAllSkillSymlinks = (options = {}) => {
    const { force = false, forceAgents = new Set() } = options;
```

**Step 3: Add per-platform force resolution at the top of the loop body**

Find the `for (const platform of SKILL_PLATFORMS)` loop. After the opening brace of the loop, directly before `const parentDir = platform.parentDir();`, add:

```js
        const platformForce = force || forceAgents.has(platform.name);
```

**Step 4: Replace all uses of `force` inside the loop with `platformForce`**

There is one `if (force)` inside the loop (in the `!existsSync(parentDir)` branch). Replace:
```js
            if (force) {
```
With:
```js
            if (platformForce) {
```

Also update the `else` branch skip message from:
```
   Use --force to create directory
```
To:
```
   Use --force or --force-<agent> to create directory
```

**Step 5: Verify no other `force` references remain inside the loop body**

The `force` variable is also passed to `syncSuperpowersForPlatform` and `syncPersonalSkillsForPlatform` as part of `options` — leave those as-is (they receive the full `options` object, not the computed `platformForce`). Only the `if (force)` dir-creation guard needs changing.

**Step 6: Build to verify no syntax errors**

```bash
cd .agents && bun build.js
```
Expected: build completes with no errors.

**Step 7: Commit**

```bash
git add .agents/src/utils/symlinks.js
git commit -m "fix: accept forceAgents set in syncAllSkillSymlinks for per-platform force"
```

---

### Task 2: Update call site in `bootstrap.js`

**Files:**
- Modify: `.agents/src/commands/bootstrap.js` (~line 745)

**Step 1: Locate the call site**

Find this block (around line 744-746):
```js
    const forceCreate = process.argv.includes('--force');
    syncAllSkillSymlinks({ force: forceCreate });
```

**Step 2: Pass `forceAgents` to the call**

Replace:
```js
    const forceCreate = process.argv.includes('--force');
    syncAllSkillSymlinks({ force: forceCreate });
```
With:
```js
    const forceCreate = process.argv.includes('--force');
    syncAllSkillSymlinks({ force: forceCreate, forceAgents });
```

(`forceAgents` is already in scope — it was built earlier in `runBootstrap` from the `--force-<agent>` argv parsing.)

**Step 3: Build to verify no syntax errors**

```bash
cd .agents && bun build.js
```
Expected: build completes with no errors.

**Step 4: Smoke test — non-existent directory scenario**

```bash
# Only run if you have a safe throwaway dir name (never use a real ~/.copilot)
# Confirm the flag path reaches syncAllSkillSymlinks with forceAgents containing 'copilot'
# Manual inspection: add a console.log temporarily if needed to verify the Set is passed through
```

**Step 5: Commit**

```bash
git add .agents/src/commands/bootstrap.js
git commit -m "fix: pass forceAgents to syncAllSkillSymlinks so --force-<agent> creates missing dirs"
```

---

### Task 3: Bump version in `package.json`

**Files:**
- Modify: `.agents/package.json`

**Step 1: Update version**

Change:
```json
"version": "7.1.0",
```
To:
```json
"version": "7.1.1",
```

**Step 2: Build**

```bash
cd .agents && bun build.js
```
Expected: build succeeds.

**Step 3: Commit**

```bash
git add .agents/package.json
git commit -m "chore: bump version to 7.1.1"
```

---

### Task 4: Update `RELEASE-NOTES.md`

**Files:**
- Modify: `RELEASE-NOTES.md`

**Step 1: Prepend new version entry**

Insert the following block immediately after the `---` separator that follows the intro paragraph (before `## v7.1.0`):

```markdown
## v7.1.1 (March 5, 2026)

### Fixed

- **`--force-<agent>` creates missing agent directory** — Previously, if the agent's parent directory (e.g. `~/.copilot`) did not exist, `--force-copilot` would silently skip skill installation. Now the directory is created automatically before installing skills.

---

```

**Step 2: Commit**

```bash
git add RELEASE-NOTES.md
git commit -m "docs: add v7.1.1 release notes for --force-<agent> directory creation fix"
```

---

### Task 5: Update `README.md`

**Files:**
- Modify: `README.md` (~line 832)

**Step 1: Locate the `--force-<agent>` note**

Find this line (around line 832):
```
> When `--force-<agent>` flags are used, universal alias installation and `AGENTS.md` platform generation are skipped. Skill symlink sync still runs.
```

**Step 2: Expand the note to mention directory creation**

Replace:
```
> When `--force-<agent>` flags are used, universal alias installation and `AGENTS.md` platform generation are skipped. Skill symlink sync still runs.
```
With:
```
> When `--force-<agent>` flags are used, universal alias installation and `AGENTS.md` platform generation are skipped. Skill symlink sync still runs. If the agent's directory does not exist (e.g. `~/.copilot`), it will be created automatically.
```

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: note that --force-<agent> creates the agent directory if it doesn't exist"
```

---

### Task 6: Tag and push `7.1.1`

**Step 1: Verify all commits are in place**

```bash
git log --oneline -8
```
Expected: see commits for symlinks fix, bootstrap fix, version bump, release notes, README.

**Step 2: Create and push git tag**

```bash
git tag 7.1.1
git push origin HEAD
git push origin 7.1.1
```

Expected: tag appears on remote.
