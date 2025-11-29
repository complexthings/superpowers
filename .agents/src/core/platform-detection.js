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
    gemini: { 
        check: () => detectTool('gemini'), 
        cli: true,
        name: 'Gemini',
        installUrl: 'https://cloud.google.com/gemini/docs/cli/install',
        bootstrapCommand: 'install-gemini-commands'
    },
    codex: { 
        check: () => detectTool('codex'), 
        cli: true,
        name: 'Codex',
        installUrl: 'https://developers.openai.com/codex/docs/installation',
        bootstrapCommand: 'install-codex-prompts'
    },
    cursor: { 
        check: () => true, 
        cli: false,
        name: 'Cursor',
        bootstrapCommand: 'install-cursor-commands'
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
    if (toolDetection.cursor.check()) detected.push('cursor');
    if (toolDetection.claude.check()) detected.push('claude-code');
    if (toolDetection.opencode.check()) detected.push('opencode');
    if (toolDetection.gemini.check()) detected.push('gemini');
    if (toolDetection.codex.check()) detected.push('codex');
    
    return detected;
};
