import { detectTool } from '../utils/file-ops.js';

/**
 * Tool detection configuration for different platforms
 */
export const toolDetection = {
    opencode: {
        check: () => detectTool('opencode'),
        cli: true,
        name: 'OpenCode',
        installUrl: 'https://opencode.ai/docs/installation',
        bootstrapCommand: 'install-opencode-commands'
    },
    claude: {
        check: () => detectTool('claude'),
        cli: true,
        name: 'Claude Code',
        installUrl: 'https://code.claude.com/docs/en/installation',
        bootstrapCommand: 'install-claude-commands'
    },
    copilot: {
        check: () => true,
        cli: false,
        name: 'GitHub Copilot',
        bootstrapCommand: 'install-copilot-prompts'
    }
};

/**
 * Detect available platforms in the current environment
 */
export const detectPlatforms = () => {
    const detected = [];
    
    if (toolDetection.copilot.check()) detected.push('github-copilot');
    if (toolDetection.claude.check()) detected.push('claude-code');
    if (toolDetection.opencode.check()) detected.push('opencode');
    
    return detected;
};
