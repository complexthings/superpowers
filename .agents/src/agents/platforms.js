import { join } from 'path';
import { homedir } from 'os';
import { paths } from '../core/paths.js';

const AGENT_PLATFORMS = {
    github: {
        name: 'github',
        sourceDir: '.github/agents',
        sourceExt: '.agent.md',
        getDestDir: () => join(paths.vscodeUserDir, 'prompts'),
        // GitHub agents (.agent.md) are consumed both by VS Code (prompts dir)
        // and the GitHub Copilot CLI, which reads personal agents from
        // ~/.copilot/agents. Symlink into both so a single install covers both.
        getExtraDestDirs: () => [join(homedir(), '.copilot', 'agents')],
        destExt: '.agent.md'
    },
    opencode: {
        name: 'opencode',
        sourceDir: '.opencode/agents',
        sourceExt: '.md',
        getDestDir: () => join(homedir(), '.config', 'opencode', 'agents'),
        destExt: '.md'
    },
    claude: {
        name: 'claude',
        sourceDir: '.claude/agents',
        sourceExt: '.md',
        getDestDir: () => join(homedir(), '.claude', 'agents'),
        destExt: '.md'
    }
};

export function getAgentPlatform(platformKey) {
    return AGENT_PLATFORMS[platformKey] || null;
}

export function getAgentSourcePath(repoRoot, platformKey, agentName) {
    const plat = AGENT_PLATFORMS[platformKey];
    if (!plat) return null;
    return join(repoRoot, plat.sourceDir, `${agentName}${plat.sourceExt}`);
}

export function getAgentDestPath(platformKey, agentName) {
    const plat = AGENT_PLATFORMS[platformKey];
    if (!plat) return null;
    return join(plat.getDestDir(), `${agentName}${plat.destExt}`);
}

/**
 * All destination paths a single agent should be symlinked to.
 * Returns the primary destination first, followed by any extra destinations
 * (e.g. github agents also land in ~/.copilot/agents for the Copilot CLI).
 * Returns [] for an unknown platform key.
 */
export function getAgentDestPaths(platformKey, agentName) {
    const plat = AGENT_PLATFORMS[platformKey];
    if (!plat) return [];
    const dirs = [plat.getDestDir(), ...(plat.getExtraDestDirs ? plat.getExtraDestDirs() : [])];
    return dirs.map((dir) => join(dir, `${agentName}${plat.destExt}`));
}

export function getSupportedPlatforms() {
    return Object.keys(AGENT_PLATFORMS);
}
