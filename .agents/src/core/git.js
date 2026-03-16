import { getLocalVersion, getRemoteVersion, isNewerVersion } from '../utils/output.js';

/**
 * @deprecated No longer relevant post-npm migration. Returns false.
 */
export const isOnMainBranch = () => false;

/**
 * Check for available updates from the npm registry
 */
export const checkForUpdates = async () => {
    try {
        const localVersion = getLocalVersion();
        const remoteVersion = await getRemoteVersion();
        const hasUpdates = isNewerVersion(remoteVersion, localVersion);

        return {
            hasUpdates,
            localVersion,
            remoteVersion
        };
    } catch {
        return {
            hasUpdates: false,
            localVersion: getLocalVersion(),
            remoteVersion: '',
            error: true
        };
    }
};

/**
 * Determine which integrations need reinstalling based on changed files
 */
export const determineReinstalls = (changedFiles) => {
    const integrationMap = {
        '.github/prompts/': 'copilot-prompts',
        '.cursor/commands/': 'cursor-commands',
        'hooks/cursor/': 'cursor-hooks',
        '.codex/prompts/': 'codex-prompts',
        '.gemini/commands/': 'gemini-commands',
        'commands/': 'claude-commands',
        '.opencode/command/': 'opencode-commands',
        '.opencode/plugins/': 'opencode-plugin'
    };
    
    const toReinstall = new Set();
    
    for (const file of changedFiles) {
        for (const [pathPrefix, integration] of Object.entries(integrationMap)) {
            if (file.startsWith(pathPrefix)) {
                toReinstall.add(integration);
            }
        }
    }
    
    return Array.from(toReinstall);
};
