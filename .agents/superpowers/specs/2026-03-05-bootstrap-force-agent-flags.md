# Bootstrap `--force-<agent>` Flags Implementation Plan

> **For AGENTS:** REQUIRED SUB-SKILL: Use executing-plans skill to implement this plan task-by-task.

**Goal:** Add `--force-<agent_name>` flags to `superpowers-agent bootstrap` so users can re-run the bootstrap process for specific agents only (e.g. `--force-copilot`, `--force-gemini`), while the rest of bootstrap is skipped.

**Architecture:** Add flag-parsing logic at the top of `runBootstrap()` to detect any `--force-<agent>` flags. When present, wrap each per-agent installer block in a conditional so only targeted agents execute. The auto-update check and skill symlinks step always run regardless.

**Tech Stack:** JavaScript (ESM), Bun runtime, `process.argv` flag parsing (no external deps needed)

---

## Confirmed Behavior

| Step | Normal bootstrap | With `--force-<agent>` |
|---|---|---|
| Auto-update check | Runs | Runs (unchanged) |
| `installAliases()` | Runs | **Skipped** |
| Per-agent installers | All run (or tool-detected) | Only targeted agent(s) |
| AGENTS.md platform update | Runs | **Skipped** |
| `syncAllSkillSymlinks()` | Runs | Runs (unchanged) |

## Agent → Installer Mapping

| Flag | Installer call(s) |
|---|---|
| `--force-copilot` | `installCopilotPrompts()` |
| `--force-cursor` | `installCursorCommands()` + `installCursorHooks()` |
| `--force-codex` | `installCodexPrompts()` |
| `--force-gemini` | `installGeminiCommands()` |
| `--force-claude` | `installClaudeCommands()` |
| `--force-opencode` | `installOpencodeCommands()` + `installOpencodePluginSymlink()` |

---

## Task 1: Add flag parsing to `runBootstrap()`

**Files:**
- Modify: `.agents/src/commands/bootstrap.js:598-733`

**Step 1: Add `KNOWN_AGENTS` constant and `forceAgents` Set after line 603 (the `noUpdate` check)**

Insert immediately after line 603 (`const noUpdate = process.argv.includes('--no-update');`):

```js
// Parse --force-<agent> flags
const KNOWN_AGENTS = ['copilot', 'cursor', 'codex', 'gemini', 'claude', 'opencode'];
const forceAgents = new Set(
    KNOWN_AGENTS.filter(a => process.argv.includes(`--force-${a}`))
);
const hasForcedAgents = forceAgents.size > 0;
```

**Step 2: Make `installAliases()` conditional**

Replace lines 631-633:
```js
// Install universal aliases
installAliases();
console.log('---\n');
```

With:
```js
// Install universal aliases (skip when targeting specific agents)
if (!hasForcedAgents) {
    installAliases();
    console.log('---\n');
}
```

**Step 3: Wrap each agent block with a conditional**

For **copilot** block (lines 635-638), wrap:
```js
// Install GitHub Copilot integration
if (!hasForcedAgents || forceAgents.has('copilot')) {
    console.log('## GitHub Copilot Integration\n');
    installCopilotPrompts();
    console.log('\n---\n');
}
```

For **cursor** block (lines 640-645), wrap:
```js
// Install Cursor integration
if (!hasForcedAgents || forceAgents.has('cursor')) {
    console.log('## Cursor Integration\n');
    installCursorCommands();
    console.log('');
    installCursorHooks();
    console.log('\n---\n');
}
```

For **codex** block (lines 647-655), wrap:
```js
// Install Codex integration
if (!hasForcedAgents || forceAgents.has('codex')) {
    console.log('## OpenAI Codex Integration\n');
    const codexDetected = toolDetection.codex.check();
    if (codexDetected) {
        installCodexPrompts();
    } else {
        console.log(`⚠️  Skipped (${toolDetection.codex.name} CLI not detected)\n💡 To enable Codex integration:\n   1. Install Codex: ${toolDetection.codex.installUrl}\n   2. Run: superpowers-agent ${toolDetection.codex.bootstrapCommand}`);
    }
    console.log('\n---\n');
}
```

For **gemini** block (lines 657-665), wrap:
```js
// Install Gemini integration
if (!hasForcedAgents || forceAgents.has('gemini')) {
    console.log('## Gemini Integration\n');
    const geminiDetected = toolDetection.gemini.check();
    if (geminiDetected) {
        installGeminiCommands();
    } else {
        console.log(`⚠️  Skipped (${toolDetection.gemini.name} CLI not detected)\n💡 To enable Gemini integration:\n   1. Install Gemini: ${toolDetection.gemini.installUrl}\n   2. Run: superpowers-agent ${toolDetection.gemini.bootstrapCommand}`);
    }
    console.log('\n---\n');
}
```

For **claude** block (lines 667-675), wrap:
```js
// Install Claude Code integration
if (!hasForcedAgents || forceAgents.has('claude')) {
    console.log('## Claude Code Integration\n');
    const claudeDetected = toolDetection.claude.check();
    if (claudeDetected) {
        installClaudeCommands();
    } else {
        console.log(`⚠️  Skipped (${toolDetection.claude.name} CLI not detected)\n💡 To enable Claude Code integration:\n   1. Install Claude Code: ${toolDetection.claude.installUrl}\n   2. Run: superpowers-agent ${toolDetection.claude.bootstrapCommand}`);
    }
    console.log('\n---\n');
}
```

For **opencode** block (lines 677-687), wrap:
```js
// Install OpenCode integration
if (!hasForcedAgents || forceAgents.has('opencode')) {
    console.log('## OpenCode Integration\n');
    const opencodeDetected = toolDetection.opencode.check();
    if (opencodeDetected) {
        installOpencodeCommands();
        console.log('');
        installOpencodePluginSymlink();
    } else {
        console.log(`⚠️  Skipped (${toolDetection.opencode.name} CLI not detected)\n💡 To enable OpenCode integration:\n   1. Install OpenCode: ${toolDetection.opencode.installUrl}\n   2. Run: superpowers-agent ${toolDetection.opencode.bootstrapCommand}`);
    }
    console.log('\n---\n');
}
```

**Step 4: Make the AGENTS.md platform file update conditional**

Wrap lines 689-718 (the `## Generating Platform-Specific Files` block) with:
```js
// Generate platform-specific files (skip when targeting specific agents)
if (!hasForcedAgents) {
    // ... existing block ...
}
```

**Step 5: Build to verify syntax is valid**

```bash
cd .agents && bun build.js
```
Expected: Build succeeds with no errors.

**Step 6: Smoke-test with `--force-copilot`**

```bash
bun src/cli.js bootstrap --no-update --force-copilot
```
Expected output:
- Does NOT print `## Installing Universal Aliases`
- DOES print `## GitHub Copilot Integration`
- Does NOT print `## Cursor Integration`, `## Gemini Integration`, etc.
- DOES print `## Syncing Skill Symlinks`

**Step 7: Smoke-test with no force flags (regression check)**

```bash
bun src/cli.js bootstrap --no-update
```
Expected: Same output as before this change (all sections present).

**Step 8: Smoke-test combining two flags**

```bash
bun src/cli.js bootstrap --no-update --force-copilot --force-gemini
```
Expected: Only copilot and gemini sections appear. Everything else skipped (except symlinks).

**Step 9: Commit**

```bash
git add .agents/src/commands/bootstrap.js
git commit -m "feat: add --force-<agent> flags to bootstrap for targeted re-installation"
```

---

## Task 2: Bump version and update RELEASE-NOTES.md

**Files:**
- Modify: `.agents/package.json`
- Modify: `RELEASE-NOTES.md`

**Step 1: Bump version in `.agents/package.json`**

Change `"version": "7.0.6"` to `"version": "7.1.0"`.

**Step 2: Add release notes entry**

Add the following block at the top of `RELEASE-NOTES.md`, after the intro paragraph and before `## v7.0.5`:

```markdown
## v7.1.0 (March 5, 2026)

### Targeted Agent Bootstrap with `--force-<agent>` Flags

The `bootstrap` command now supports re-running the installation process for **specific agents only**, without re-running the full bootstrap.

**Usage:**
```sh
# Re-run only the Copilot integration
superpowers-agent bootstrap --force-copilot

# Re-run Copilot and Gemini integrations
superpowers-agent bootstrap --force-copilot --force-gemini
```

**Supported flags:**
- `--force-copilot` — GitHub Copilot
- `--force-cursor` — Cursor
- `--force-codex` — OpenAI Codex
- `--force-gemini` — Gemini
- `--force-claude` — Claude Code
- `--force-opencode` — OpenCode

**When one or more `--force-<agent>` flags are used:**
- The auto-update check still runs
- Skill symlinks still sync at the end
- Only the targeted agent installer(s) execute
- Universal aliases and platform file generation are skipped

These flags can be combined with `--no-update` to skip the update check as well.

---
```

**Step 3: Commit**

```bash
git add .agents/package.json RELEASE-NOTES.md
git commit -m "chore: bump version to 7.1.0"
```

---

## Task 3: Update README.md

**Files:**
- Modify: `README.md`

**Step 1: Find the bootstrap flags section**

The section is around line 814 where `--no-update` is documented. Add `--force-<agent>` flags documentation immediately after the `--no-update` block.

After the `--no-update` code block and its description, add:

```markdown
**Re-run bootstrap for specific agents only:**
```bash
superpowers-agent bootstrap --force-copilot
superpowers-agent bootstrap --force-copilot --force-gemini
```

Supported agent flags: `--force-copilot`, `--force-cursor`, `--force-codex`, `--force-gemini`, `--force-claude`, `--force-opencode`

When `--force-<agent>` flags are used, only the targeted agent installer(s) run. Universal aliases and platform file generation are skipped. The auto-update check and skill symlinks sync still run.

Can be combined with `--no-update`:
```bash
superpowers-agent bootstrap --no-update --force-claude
```
```

Also find the reference table/list around line 331 where `--force` is documented:

```
- Use `--force` flag to create parent directories: `superpowers-agent bootstrap --force`
```

Add after it:
```markdown
- Use `--force-<agent>` to re-run only a specific agent: `superpowers-agent bootstrap --force-copilot`
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document --force-<agent> bootstrap flags in README"
```

---

## Task 4: Build final artifact

**Step 1: Run build**

```bash
cd .agents && bun build.js
```
Expected: Build succeeds.

**Step 2: Verify built artifact references the new version**

```bash
grep '"version"' .agents/package.json
```
Expected: `"version": "7.1.0"`

**Step 3: Final smoke test of built CLI**

```bash
bun src/cli.js bootstrap --no-update --force-copilot
```
Expected: Only copilot section runs, symlinks sync, no aliases or platform file generation.

**Step 4: Commit if anything was missed**

```bash
git status
```
If clean: done. If not: stage and commit remaining files.
