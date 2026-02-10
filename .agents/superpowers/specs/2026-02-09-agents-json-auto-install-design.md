# Design Spec: agents.json Auto-Install Feature

**Date:** 2026-02-09
**Status:** Approved (with revisions applied)
**Version Target:** 7.0.5
**Review Date:** 2026-02-09

## Summary

Add automatic agent installation support to `superpowers-agent add` and `superpowers-agent pull` commands. When a repository contains an `agents.json` manifest at its root, the system reads it and symlinks listed agents to the appropriate platform-specific directories on the user's system.

## Problem

Currently, `superpowers-agent` handles skill installation but has no mechanism for installing AI agent prompt files. Users must manually discover and copy agent files from repositories to the correct platform-specific locations. This is error-prone, platform-dependent, and doesn't scale.

## Solution

### agents.json Manifest Format

```json
{
    "version": "1.0.0",
    "repository": "@alias",
    "agents": {
        "github": [
            "agent-name-1",
            "agent-name-2"
        ],
        "opencode": [
            "agent-name-1",
            "agent-name-2"
        ]
    }
}
```

**Fields:**
- `version` (string, required): Manifest version, stored for reference
- `repository` (string, required): Repository alias, used for tracking installed agents by source
- `agents` (object, required): Platform-keyed object where values are arrays of agent names

### Source Path Conventions

Agent files in the repository follow dot-prefix directory conventions:

| Platform   | Source Path                                        | File Extension   |
|------------|----------------------------------------------------|------------------|
| `github`   | `.github/agents/<agent-name>.agent.md`             | `.agent.md`      |
| `opencode` | `.opencode/agents/<agent-name>.md`                 | `.md`            |

### Destination Paths (Symlink Targets)

| Platform   | macOS                                                              | Linux                                          | Windows                                          |
|------------|--------------------------------------------------------------------|-------------------------------------------------|---------------------------------------------------|
| `github`   | `~/Library/Application Support/Code/User/prompts/<name>.agent.md`  | `~/.config/Code/User/prompts/<name>.agent.md`   | `%APPDATA%\Code\User\prompts\<name>.agent.md`     |
| `opencode` | `~/.config/opencode/agents/<name>.md`                              | `~/.config/opencode/agents/<name>.md`            | `~/.config/opencode/agents/<name>.md`              |

### Persistent Repository Storage

When `add`/`pull` processes a git-sourced repository containing `agents.json`, the repository is cloned/persisted to `~/.agents/repos/<alias>/` (where `<alias>` is the repository alias from `agents.json`, e.g., `@baici` → `~/.agents/repos/baici/`). This persistent location serves as the symlink source, solving the temp-clone lifecycle issue where symlinks to deleted temp dirs would become dangling.

For **local path** sources, symlinks point directly to the local path (no copy needed).

On `pull`, the persistent repo is updated (re-cloned or refreshed) before re-symlinking.

### Behavior

1. **Trigger:** After skill installation completes in `runAdd()` or `runPull()`
2. **Detection:** Check for `agents.json` at the root of the cloned/source repository
3. **Processing:** Parse the file, validate schema (version, repository, agents fields required; agents values must be arrays of strings)
4. **Persistence:** For git sources, copy/persist the agent directories (`.github/agents/`, `.opencode/agents/`) to `~/.agents/repos/<alias>/`
5. **Installation:** For each agent in each platform, create a symlink from the persistent source to the platform destination directory
6. **Conflict handling:** If a symlink or file already exists at the destination, remove it before creating the new symlink (handles both symlink and regular file overwrites, addressing `createSymlink()` limitation with non-symlink files)
7. **Tracking:** Record installed agents in `~/.agents/config.json` under `installedAgents`
8. **All platforms installed:** Do not filter by detected platform — install for all platforms listed in the manifest
9. **Graceful handling:** If an agent source file doesn't exist in the repo, warn and skip (don't fail the entire operation)
10. **Directory creation:** Create destination directories if they don't exist

### Config Tracking Format

Installed agents are tracked in `~/.agents/config.json`:

```json
{
  "installedAgents": {
    "@baici": {
      "version": "1.0.0",
      "agents": {
        "github": {
          "requirements-business-agent": {
            "source": "/absolute/path/to/.github/agents/requirements-business-agent.agent.md",
            "destination": "/Users/user/Library/Application Support/Code/User/prompts/requirements-business-agent.agent.md",
            "installedAt": "2026-02-09T00:00:00.000Z"
          }
        },
        "opencode": {
          "requirements-business-agent": {
            "source": "/absolute/path/to/.opencode/agents/requirements-business-agent.md",
            "destination": "/Users/user/.config/opencode/agents/requirements-business-agent.md",
            "installedAt": "2026-02-09T00:00:00.000Z"
          }
        }
      }
    }
  }
}
```

## Architecture

### New Files

1. **`.agents/src/agents/installer.js`** — Core agent installation logic
   - `installAgents(repoPath, flags)` — Main entry point, reads agents.json, validates schema, dispatches per-platform
   - `installAgentForPlatform(platform, agentName, sourcePath)` — Removes existing file/symlink at destination, creates new symlink
   - `persistAgentRepo(repoPath, alias)` — Copies agent dirs to `~/.agents/repos/<alias>/` for git sources
   - `trackInstalledAgent(repository, version, platform, agentName, source, destination)` — Updates config

2. **`.agents/src/agents/platforms.js`** — Platform path resolution
   - `getAgentSourcePath(repoPath, platform, agentName)` — Returns source file path
   - `getAgentDestPath(platform, agentName)` — Returns destination symlink path based on OS (reuses `getVSCodeUserDir()` from `paths.js` for github platform)
   - `PLATFORM_CONFIG` — Map of platform configs (source dir, extension, destination resolver)

### Modified Files

1. **`.agents/src/skills/installer.js`** — Add call to `installAgents()` in both `runAdd()` and `runPull()` after skill installation completes
2. **`.agents/src/core/config.js`** — Add `getInstalledAgents()`, `saveInstalledAgents()` functions
3. **`.agents/package.json`** — Bump version from `7.0.4` to `7.0.5`
4. **`RELEASE-NOTES.md`** — Add v7.0.5 entry
5. **`README.md`** — Add agents.json documentation section

### Integration Points

The agent installer hooks into the existing `add`/`pull` flow:

```
runAdd()/runPull()
  ├── [existing] Parse args, resolve source
  ├── [existing] Clone repo / resolve local path
  ├── [existing] Install skills from skill.json
  ├── [existing] Sync symlinks
  └── [NEW] Check for agents.json → installAgents()
        ├── Parse agents.json
        ├── For each platform:
        │   ├── For each agent:
        │   │   ├── Resolve source path
        │   │   ├── Resolve destination path
        │   │   ├── Create destination directory
        │   │   ├── Remove existing symlink/file
        │   │   └── Create symlink
        │   └── Track in config
        └── Report results
```

### Console Output Style

Following existing patterns (emoji prefix, color via ANSI):

```
📋 Found agents.json — installing agents...
  → github: requirements-business-agent ✓
  → github: requirements-technical-agent ✓
  → opencode: requirements-business-agent ✓
  → opencode: requirements-technical-agent ✓
  ⚠️ opencode: missing-agent — source file not found, skipping
✅ Installed 4 agents from @baici (v1.0.0)
```

## Future Extensibility

The `PLATFORM_CONFIG` map in `platforms.js` is designed to be extended. Adding a new platform requires only adding an entry with:
- `sourceDir`: Directory name in repo (e.g., `.cursor`)
- `sourceSubDir`: Subdirectory for agents (e.g., `agents`)
- `extension`: File extension (e.g., `.md`)
- `getDestPath(agentName)`: Function returning the OS-appropriate destination path

Future platforms (Claude, Cursor, Gemini, Codex) can be added with minimal code.

## Edge Cases

1. **No agents.json in repo** — Silently skip, no warning (most repos won't have one)
2. **Empty agents object** — Skip with no output
3. **Unknown platform key** — Warn and skip: `⚠️ Unknown agent platform: "cursor" — skipping`
4. **Missing source file** — Warn and skip that specific agent, continue with others
5. **Destination directory doesn't exist** — Create it recursively
6. **Permission errors** — Catch and report, continue with remaining agents
7. **Local path (non-git) add** — Works the same, agents.json checked at local root; symlinks point directly to local path
8. **Windows symlink permissions** — Use junction type (matches existing symlink utils pattern)

## Reviewer Findings Addressed

| Finding | Resolution |
|---------|-----------|
| C1: Temp clone lifecycle (symlinks break when temp dir deleted) | Persistent repo storage at `~/.agents/repos/<alias>/` for git sources |
| C2: `createSymlink()` refuses to overwrite non-symlink files | Pre-remove existing file/symlink before calling `createSymlink()` |
| M1: Windows path uses `%APPDATA%` vs Node.js `homedir()` | Reuse `getVSCodeUserDir()` from `paths.js` which handles this correctly |
| M2: Duplicate VS Code path resolution | Reuse existing `getVSCodeUserDir()` helper from `paths.js` |
| M3: `github` platform is VS Code-specific | Clarified: `github` means "GitHub Copilot in VS Code" |
| M5: No uninstall command | Known limitation, tracked for future work |
| S1: Reuse `createSymlink()` from `symlinks.js` | Yes, with pre-remove step to handle non-symlink overwrites |
| S5: Validate `agents.json` schema | Added schema validation to processing step |

## Decisions Made (Brainstorming Session)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| agents.json location | Repository root | Consistent with skill.json placement |
| Install behavior | Automatic, no prompts | Matches skill installation behavior |
| Platform filtering | Install all listed | User may use multiple editors |
| Conflict handling | Overwrite existing | Matches skill overwrite behavior |
| Tracking | config.json with repository grouping | Enables future list/remove commands |
| Repository field | Used for tracking/attribution | Groups agents by source |
| Version field | Stored for reference | Future version comparison possible |
| Source directory | Dot-prefix (`.github/`, `.opencode/`) | Matches conventional hidden config dirs |
| VS Code variants | Standard VS Code only | Keep scope manageable |
| Linux VS Code path | `~/.config/Code/User/prompts/` | Standard VS Code on Linux |
