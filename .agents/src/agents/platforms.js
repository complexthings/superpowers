import { join } from 'path';
import { homedir } from 'os';
import { paths } from '../core/paths.js';

const AGENT_PLATFORMS = {
    github: {
        name: 'github',
        sourceDir: '.github/agents',
        sourceExt: '.agent.md',
        getDestDir: () => join(paths.vscodeUserDir, 'prompts'),
        destExt: '.agent.md'
    },
    opencode: {
        name: 'opencode',
        sourceDir: '.opencode/agents',
        sourceExt: '.md',
        getDestDir: () => join(homedir(), '.config', 'opencode', 'agents'),
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

export function getSupportedPlatforms() {
    return Object.keys(AGENT_PLATFORMS);
}
