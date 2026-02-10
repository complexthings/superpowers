# Implementation Plan: agents.json Auto-Install Feature

> FOR AGENTS
> Goal: Add automatic agent installation to superpowers-agent add/pull commands when a repository contains an agents.json manifest
> Architecture: ES module CLI tool, zero runtime dependencies, Bun build system, manual argv parsing, flat command dispatch
> Tech Stack: Node.js built-ins (fs, path, child_process, os), Bun bundler, ESM

## File Structure Map

```
.agents/src/
├── agents/                     # NEW directory
│   ├── installer.js            # NEW - Core agent install/track logic
│   └── platforms.js            # NEW - Platform path resolution
├── core/
│   ├── config.js               # MODIFY - Add installedAgents tracking
│   └── paths.js                # MODIFY - Add agents-related paths
├── skills/
│   └── installer.js            # MODIFY - Hook agents install into add/pull
├── utils/
│   └── symlinks.js             # READ-ONLY - Reuse createSymlink, removeSymlink
└── cli.js                      # READ-ONLY - No changes needed
```

```
.agents/
├── package.json                # MODIFY - Version bump 7.0.4 → 7.0.5
├── RELEASE-NOTES.md            # MODIFY - Add v7.0.5 entry
└── README.md                   # MODIFY - Add agents.json documentation
```

---

## Chunk 1: Core Agent Platform Resolution

**Goal:** Create the platform configuration module that maps platform keys from agents.json to source/destination paths.

### Files
- `CREATE .agents/src/agents/platforms.js`

### Steps

1. Create `.agents/src/agents/` directory
2. Create `platforms.js` with the following exports:

```js
// .agents/src/agents/platforms.js
import { join } from 'path';
import { homedir, platform } from 'os';
import { paths } from '../core/paths.js';

/**
 * Platform configuration for agent installation.
 * Maps agents.json platform keys to source directory patterns and
 * destination directory resolvers.
 */
const AGENT_PLATFORMS = {
    github: {
        name: 'GitHub Copilot',
        // Source path within the repository
        sourceDir: (repoRoot) => join(repoRoot, '.github', 'agents'),
        // File extension for agent files
        fileExtension: '.agent.md',
        // Destination directory on the user's system
        destDir: () => join(paths.vscodeUserDir, 'prompts'),
    },
    opencode: {
        name: 'OpenCode',
        sourceDir: (repoRoot) => join(repoRoot, '.opencode', 'agents'),
        fileExtension: '.md',
        destDir: () => join(homedir(), '.config', 'opencode', 'agents'),
    },
};

/**
 * Get the platform configuration for a given platform key.
 * @param {string} platformKey - Key from agents.json (e.g., 'github', 'opencode')
 * @returns {object|null} Platform config or null if unsupported
 */
export const getAgentPlatform = (platformKey) => {
    return AGENT_PLATFORMS[platformKey] || null;
};

/**
 * Get the source file path for an agent within a repository.
 * @param {string} repoRoot - Root directory of the repository
 * @param {string} platformKey - Platform key from agents.json
 * @param {string} agentName - Agent name from agents.json array
 * @returns {string} Full path to the agent source file
 */
export const getAgentSourcePath = (repoRoot, platformKey, agentName) => {
    const platform = AGENT_PLATFORMS[platformKey];
    if (!platform) return null;
    return join(platform.sourceDir(repoRoot), `${agentName}${platform.fileExtension}`);
};

/**
 * Get the destination file path for an agent on the user's system.
 * @param {string} platformKey - Platform key from agents.json
 * @param {string} agentName - Agent name from agents.json array
 * @returns {string} Full path to the agent destination file
 */
export const getAgentDestPath = (platformKey, agentName) => {
    const platform = AGENT_PLATFORMS[platformKey];
    if (!platform) return null;
    return join(platform.destDir(), `${agentName}${platform.fileExtension}`);
};

/**
 * Get all supported platform keys.
 * @returns {string[]} Array of supported platform keys
 */
export const getSupportedPlatforms = () => Object.keys(AGENT_PLATFORMS);

export { AGENT_PLATFORMS };
```

### Verify
- File exists and exports are importable: `bun -e "import { AGENT_PLATFORMS } from './.agents/src/agents/platforms.js'; console.log(Object.keys(AGENT_PLATFORMS));"`

---

## Chunk 2: Config Extension for Agent Tracking

**Goal:** Add functions to core/config.js for reading and writing installed agent tracking data.

### Files
- `MODIFY .agents/src/core/config.js`

### Steps

1. Add two new exported functions after the existing `addRepositoryToConfig`:

```js
/**
 * Get installed agents from global config.
 * @returns {object} installedAgents object keyed by repository alias
 */
export const getInstalledAgents = () => {
    const config = readConfigFile(true);
    return config.installedAgents || {};
};

/**
 * Track an installed agent in global config.
 * @param {string} repoAlias - Repository alias (e.g., '@baici')
 * @param {string} repoVersion - Version from agents.json
 * @param {string} platformKey - Platform key (e.g., 'github', 'opencode')
 * @param {string} agentName - Agent name
 * @param {string} source - Absolute source path
 * @param {string} destination - Absolute destination path
 */
export const trackInstalledAgent = (repoAlias, repoVersion, platformKey, agentName, source, destination) => {
    const config = readConfigFile(true);
    if (!config.installedAgents) config.installedAgents = {};
    if (!config.installedAgents[repoAlias]) {
        config.installedAgents[repoAlias] = { version: repoVersion, agents: {} };
    }
    if (!config.installedAgents[repoAlias].agents[platformKey]) {
        config.installedAgents[repoAlias].agents[platformKey] = {};
    }
    config.installedAgents[repoAlias].agents[platformKey][agentName] = {
        source,
        destination,
        installedAt: new Date().toISOString(),
    };
    config.installedAgents[repoAlias].version = repoVersion;
    writeConfigFile(config, true);
};
```

### Verify
- Import and call: `bun -e "import { getInstalledAgents } from './.agents/src/core/config.js'; console.log(getInstalledAgents());"`

---

## Chunk 3: Core Agent Installer

**Goal:** Create the main agent installation logic that reads agents.json, validates it, installs agents per platform, and tracks them.

### Files
- `CREATE .agents/src/agents/installer.js`

### Steps

1. Create `installer.js` with the following:

```js
// .agents/src/agents/installer.js
import { existsSync, readFileSync, mkdirSync, unlinkSync, lstatSync } from 'fs';
import { join, dirname } from 'path';
import { getAgentPlatform, getAgentSourcePath, getAgentDestPath, getSupportedPlatforms } from './platforms.js';
import { createSymlink } from '../utils/symlinks.js';
import { trackInstalledAgent } from '../core/config.js';

/**
 * Validate agents.json schema.
 * @param {object} manifest - Parsed agents.json content
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateAgentsManifest = (manifest) => {
    const errors = [];
    if (!manifest || typeof manifest !== 'object') {
        errors.push('agents.json must be a JSON object');
        return { valid: false, errors };
    }
    if (!manifest.version || typeof manifest.version !== 'string') {
        errors.push('Missing or invalid "version" field (must be a string)');
    }
    if (!manifest.agents || typeof manifest.agents !== 'object') {
        errors.push('Missing or invalid "agents" field (must be an object)');
        return { valid: false, errors };
    }
    for (const [platformKey, agentList] of Object.entries(manifest.agents)) {
        if (!Array.isArray(agentList)) {
            errors.push(`agents.${platformKey} must be an array, got ${typeof agentList}`);
            continue;
        }
        for (const agent of agentList) {
            if (typeof agent !== 'string') {
                errors.push(`agents.${platformKey} contains non-string value: ${JSON.stringify(agent)}`);
            }
        }
    }
    return { valid: errors.length === 0, errors };
};

/**
 * Install a single agent file by creating a symlink.
 * Pre-removes existing files (symlink or regular) at destination.
 * @param {string} source - Absolute path to agent source file
 * @param {string} destination - Absolute path to symlink destination
 * @returns {{ success: boolean, error?: string }}
 */
const installAgentFile = (source, destination) => {
    if (!existsSync(source)) {
        return { success: false, error: `Source file not found: ${source}` };
    }

    // Create parent directory if needed
    const destDir = dirname(destination);
    if (!existsSync(destDir)) {
        try {
            mkdirSync(destDir, { recursive: true });
        } catch (err) {
            return { success: false, error: `Failed to create directory ${destDir}: ${err.message}` };
        }
    }

    // Pre-remove existing file (handles both symlinks and regular files)
    if (existsSync(destination) || isSymlinkBroken(destination)) {
        try {
            unlinkSync(destination);
        } catch (err) {
            return { success: false, error: `Failed to remove existing file at ${destination}: ${err.message}` };
        }
    }

    // Create the symlink using existing utility
    const result = createSymlink(source, destination);
    if (result.error) {
        return { success: false, error: result.error };
    }
    return { success: true };
};

/**
 * Check if a path is a broken symlink.
 */
const isSymlinkBroken = (path) => {
    try {
        const stats = lstatSync(path);
        if (stats.isSymbolicLink()) {
            return !existsSync(path); // exists follows symlinks, returns false for broken
        }
        return false;
    } catch {
        return false;
    }
};

/**
 * Install agents from an agents.json manifest.
 * Called from skills/installer.js after skill installation.
 *
 * @param {string} repoRoot - Root directory of the cloned/local repository
 * @param {string} repoAlias - Repository alias for tracking (e.g., '@baici'), or URL if no alias
 * @param {string} action - 'add' or 'pull' for messaging
 * @returns {{ installed: number, failed: number, skipped: number }}
 */
export const installAgents = (repoRoot, repoAlias, action = 'add') => {
    const agentsJsonPath = join(repoRoot, 'agents.json');
    const results = { installed: 0, failed: 0, skipped: 0 };

    // Check if agents.json exists
    if (!existsSync(agentsJsonPath)) {
        return results; // Silent — not all repos have agents
    }

    // Parse agents.json
    let manifest;
    try {
        const raw = readFileSync(agentsJsonPath, 'utf-8');
        manifest = JSON.parse(raw);
    } catch (err) {
        console.log(`⚠️  Failed to parse agents.json: ${err.message}`);
        return results;
    }

    // Validate schema
    const validation = validateAgentsManifest(manifest);
    if (!validation.valid) {
        console.log(`⚠️  Invalid agents.json:`);
        for (const error of validation.errors) {
            console.log(`   - ${error}`);
        }
        return results;
    }

    const verb = action === 'pull' ? 'Updating' : 'Installing';
    const pastVerb = action === 'pull' ? 'Updated' : 'Installed';
    const repoVersion = manifest.version || 'unknown';
    const repoName = manifest.repository || repoAlias;

    console.log(`\n${verb} agents from ${repoName}...`);

    // Process each platform
    for (const [platformKey, agentNames] of Object.entries(manifest.agents)) {
        const platform = getAgentPlatform(platformKey);
        if (!platform) {
            console.log(`  ⚠️  Unsupported platform: ${platformKey} (skipping)`);
            results.skipped += agentNames.length;
            continue;
        }

        console.log(`  ${platform.name}:`);

        for (const agentName of agentNames) {
            const source = getAgentSourcePath(repoRoot, platformKey, agentName);
            const destination = getAgentDestPath(platformKey, agentName);

            if (!source || !destination) {
                console.log(`    ✗ ${agentName}: Failed to resolve paths`);
                results.failed++;
                continue;
            }

            const installResult = installAgentFile(source, destination);
            if (installResult.success) {
                console.log(`    ✓ ${agentName}`);
                results.installed++;
                trackInstalledAgent(repoAlias, repoVersion, platformKey, agentName, source, destination);
            } else {
                console.log(`    ✗ ${agentName}: ${installResult.error}`);
                results.failed++;
            }
        }
    }

    // Summary
    if (results.installed > 0) {
        console.log(`\n✓ ${pastVerb} ${results.installed} agent(s) from ${repoName}`);
    }
    if (results.failed > 0) {
        console.log(`⚠️  ${results.failed} agent(s) failed to install`);
    }

    return results;
};
```

### Verify
- File exists and exports are importable: `bun -e "import { installAgents } from './.agents/src/agents/installer.js'; console.log('OK');"`

---

## Chunk 4: Hook into add/pull Commands

**Goal:** Modify skills/installer.js to call installAgents() during add and pull operations. Handle persistent repo storage for git sources.

### Files
- `MODIFY .agents/src/skills/installer.js`

### Steps

1. Add import at top of file (after existing imports):
```js
import { installAgents } from '../agents/installer.js';
```

2. Add helper function for persisting repo for agent symlinks:
```js
import { existsSync as fsExists, mkdirSync, cpSync, rmSync } from 'fs';
import { join as pathJoin } from 'path';
import { homedir } from 'os';

/**
 * Persist a cloned repo to ~/.agents/repos/<alias>/ for agent symlinks.
 * Returns the persistent repo path.
 */
const persistRepoForAgents = (tmpDir, alias) => {
    const reposDir = pathJoin(homedir(), '.agents', 'repos');
    // Sanitize alias for directory name (remove @ prefix, replace special chars)
    const safeName = alias.replace(/^@/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const persistDir = pathJoin(reposDir, safeName);

    try {
        if (fsExists(persistDir)) {
            rmSync(persistDir, { recursive: true, force: true });
        }
        mkdirSync(reposDir, { recursive: true });
        cpSync(tmpDir, persistDir, { recursive: true });
        return persistDir;
    } catch (err) {
        console.log(`⚠️  Failed to persist repo for agents: ${err.message}`);
        return tmpDir; // Fallback to tmpDir (symlinks may break on cleanup)
    }
};
```

3. In `runAdd()` function — after skill installation completes and BEFORE tmp cleanup:

Find the section after skills are installed (around line ~350-370 area in the current code, where `console.log` reports installation results and before the tmp dir is cleaned up). Add:

```js
// --- Agent installation ---
// Determine repo root (may differ from sourcePath for tree URLs)
const agentRepoRoot = parsed.type === 'git-tree' ? tmpDir : sourcePath;
// Check for agents.json
const agentsJsonExists = existsSync(join(agentRepoRoot, 'agents.json'));
let persistedRepoRoot = agentRepoRoot;
if (agentsJsonExists && tmpDir) {
    // Persist the repo so agent symlinks survive tmp cleanup
    const alias = firstArg.startsWith('@') ? firstArg : (manifest?.repository || firstArg);
    persistedRepoRoot = persistRepoForAgents(agentRepoRoot, alias);
}
if (agentsJsonExists) {
    const alias = firstArg.startsWith('@') ? firstArg : (manifest?.repository || firstArg);
    installAgents(persistedRepoRoot, alias, 'add');
}
```

4. In `runPull()` function — same pattern, after skill installation and before tmp cleanup:

```js
// --- Agent installation ---
const agentRepoRoot = parsed.type === 'git-tree' ? tmpDir : sourcePath;
const agentsJsonExists = existsSync(join(agentRepoRoot, 'agents.json'));
let persistedRepoRoot = agentRepoRoot;
if (agentsJsonExists && tmpDir) {
    const alias = firstArg.startsWith('@') ? firstArg : (manifest?.repository || firstArg);
    persistedRepoRoot = persistRepoForAgents(agentRepoRoot, alias);
}
if (agentsJsonExists) {
    const alias = firstArg.startsWith('@') ? firstArg : (manifest?.repository || firstArg);
    installAgents(persistedRepoRoot, alias, 'pull');
}
```

### Notes
- `tmpDir` is only set for git sources (clone operations), not for local paths
- For local paths, `sourcePath` IS the repo root and symlinks point there directly (no persistence needed)
- The `manifest` variable referenced here is the agents.json manifest, NOT the skill.json — need to use a different variable name to avoid conflict with existing `skillJson` variable. The actual agents.json manifest is read inside `installAgents()`, so we only need existence check here.
- `parsed.type` tells us: 'git-tree', 'git-repo', or 'local'

### Verify
- Run `bun run dev -- add --help` to ensure no import errors
- Run `bun run build` to ensure the build succeeds

---

## Chunk 5: Version Bump, Release Notes, README

**Goal:** Update package.json version, add release notes entry, and update README with agents.json documentation.

### Files
- `MODIFY .agents/package.json` — Change `"version": "7.0.4"` → `"version": "7.0.5"`
- `MODIFY RELEASE-NOTES.md` — Add v7.0.5 entry at top (after title/attribution)
- `MODIFY README.md` — Add agents.json section

### Steps

1. Version bump in package.json: Change version field from `7.0.4` to `7.0.5`

2. Add RELEASE-NOTES.md entry (insert after the title/attribution block, before v7.0.0):

```markdown
## v7.0.5 — 2026-02-09

### Agent Auto-Installation from Repository Manifests

Superpowers Agent now supports automatic agent installation when repositories contain an `agents.json` manifest file. When you run `superpowers-agent add` or `superpowers-agent pull` on a repository that includes this manifest, agents are automatically symlinked to the appropriate platform-specific directories on your system.

#### What's New

- **`agents.json` manifest support**: Repositories can now declare agents for multiple platforms (GitHub Copilot, OpenCode) in a single `agents.json` file at the repository root
- **Automatic platform-specific installation**: Agents are symlinked to the correct location for each platform:
  - **GitHub Copilot**: `~/Library/Application Support/Code/User/prompts/` (Mac), `~/.config/Code/User/prompts/` (Linux), `%APPDATA%\Code\User\prompts\` (Windows)
  - **OpenCode**: `~/.config/opencode/agents/`
- **Persistent repository storage**: Git-sourced repositories are persisted to `~/.agents/repos/<alias>/` so agent symlinks remain valid
- **Config tracking**: Installed agents are tracked in `~/.agents/config.json` under `installedAgents`, grouped by source repository
- **Schema validation**: `agents.json` files are validated before processing with clear error messages

#### agents.json Format

```json
{
    "version": "1.0.0",
    "repository": "@alias",
    "agents": {
        "github": ["agent-name-1", "agent-name-2"],
        "opencode": ["agent-name-1", "agent-name-2"]
    }
}
```

Agent source files should be located at:
- GitHub: `.github/agents/<agent-name>.agent.md`
- OpenCode: `.opencode/agents/<agent-name>.md`

### Files Created
```
.agents/src/agents/installer.js
.agents/src/agents/platforms.js
```

### Files Modified
```
.agents/src/skills/installer.js
.agents/src/core/config.js
.agents/package.json
RELEASE-NOTES.md
README.md
```
```

3. Add README section — insert before or after the "Repository Aliases" section (wherever makes most logical sense in the document flow), a new section:

```markdown
## Agent Installation

Repositories can include an `agents.json` manifest file to declare agents that should be installed for various AI coding platforms. When you run `superpowers-agent add` or `superpowers-agent pull` on such a repository, agents are automatically installed to the correct platform-specific directories on your system.

### agents.json Format

Place an `agents.json` file at the root of your repository:

```json
{
    "version": "1.0.0",
    "repository": "@your-alias",
    "agents": {
        "github": ["my-agent-1", "my-agent-2"],
        "opencode": ["my-agent-1", "my-agent-2"]
    }
}
```

### Supported Platforms

| Platform | Source Path | Install Location (Mac) |
|----------|-----------|----------------------|
| `github` | `.github/agents/<name>.agent.md` | `~/Library/Application Support/Code/User/prompts/` |
| `opencode` | `.opencode/agents/<name>.md` | `~/.config/opencode/agents/` |

Linux and Windows paths are resolved automatically.

### Agent Directory Structure

Your repository should contain agent files in platform-specific directories:

```
your-repo/
├── agents.json
├── .github/
│   └── agents/
│       ├── my-agent-1.agent.md
│       └── my-agent-2.agent.md
└── .opencode/
    └── agents/
        ├── my-agent-1.md
        └── my-agent-2.md
```

Agents are symlinked (not copied), so updates via `superpowers-agent pull` keep everything in sync. For git-sourced repositories, the repository is persisted to `~/.agents/repos/` to ensure symlinks remain valid.
```

### Verify
- `bun -e "import pkg from './.agents/package.json'; console.log(pkg.version);"` should show `7.0.5`
- Visually verify RELEASE-NOTES.md entry formatting
- Visually verify README.md section formatting

---

## Chunk 6: Build and Integration Testing

**Goal:** Build the project and verify everything works end-to-end.

### Files
- None modified — verification only

### Steps

1. Run `bun run build` from `.agents/` directory — must succeed with no errors
2. Test that the built executable runs: `.agents/superpowers-agent version`
3. Create a test agents.json and verify the installer logic works:
   - Create a temp directory with a mock agents.json
   - Create mock agent files in the expected structure
   - Run the agent installer function directly via bun eval
4. Verify config tracking: check that `~/.agents/config.json` includes `installedAgents` after a test run

### Verify Commands
```bash
# Build
cd .agents && bun run build

# Version check
.agents/superpowers-agent version

# Functional test (quick inline test)
bun -e "
import { installAgents } from './.agents/src/agents/installer.js';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const testDir = join(tmpdir(), 'test-agents-' + Date.now());
mkdirSync(join(testDir, '.github', 'agents'), { recursive: true });
mkdirSync(join(testDir, '.opencode', 'agents'), { recursive: true });

writeFileSync(join(testDir, 'agents.json'), JSON.stringify({
    version: '1.0.0',
    repository: '@test',
    agents: {
        github: ['test-agent'],
        opencode: ['test-agent']
    }
}));

writeFileSync(join(testDir, '.github', 'agents', 'test-agent.agent.md'), '# Test Agent');
writeFileSync(join(testDir, '.opencode', 'agents', 'test-agent.md'), '# Test Agent');

const result = installAgents(testDir, '@test', 'add');
console.log('Result:', result);
"
```

---

## Execution Order

1. Chunk 1 (platforms.js) — no dependencies
2. Chunk 2 (config.js) — no dependencies
3. Chunk 3 (installer.js) — depends on Chunk 1 + 2
4. Chunk 4 (hook into add/pull) — depends on Chunk 3
5. Chunk 5 (version/docs) — independent, can run parallel with 4
6. Chunk 6 (build/test) — depends on all above

Chunks 1 and 2 can be executed in parallel.
Chunks 4 and 5 can be executed in parallel (after 3 completes).
