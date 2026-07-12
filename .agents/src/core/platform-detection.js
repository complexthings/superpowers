import { existsSync } from 'fs';
import { join } from 'path';
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
        check: () => detectTool('copilot'),
        cli: true,
        name: 'GitHub Copilot',
        bootstrapCommand: 'install-copilot-prompts'
    },
    pi: {
        check: () => detectTool('pi'),
        cli: true,
        name: 'Pi Coding Agent'
    },
    codex: {
        check: () => detectTool('codex'),
        cli: true,
        name: 'OpenAI Codex'
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

/**
 * Dot-folder that signals a harness is set up in a given project, keyed by
 * the platform id used throughout this module (and by runSetupSkills()).
 */
const PROJECT_PLATFORM_FOLDERS = {
    'claude-code': '.claude',
    'github-copilot': '.github',
    opencode: '.opencode',
    pi: '.pi',
    codex: '.codex'
};

/** toolDetection key for each project platform id above. */
const PROJECT_PLATFORM_TOOL_KEY = {
    'claude-code': 'claude',
    'github-copilot': 'copilot',
    opencode: 'opencode',
    pi: 'pi',
    codex: 'codex'
};

/**
 * True when the harness's dot-folder exists directly under projectRoot.
 * Pure/deterministic — no CLI lookups — so it's the seam tests target for
 * the "not detected" case.
 */
export const hasPlatformFolder = (projectRoot, platformId) => {
    const folder = PROJECT_PLATFORM_FOLDERS[platformId];
    return folder ? existsSync(join(projectRoot, folder)) : false;
};

/**
 * Detect which agent harnesses are set up for a project: dot-folder
 * existence in projectRoot OR the harness's CLI binary on PATH.
 */
export const detectProjectPlatforms = (projectRoot) => {
    return Object.keys(PROJECT_PLATFORM_FOLDERS).filter((platformId) => {
        const toolKey = PROJECT_PLATFORM_TOOL_KEY[platformId];
        return hasPlatformFolder(projectRoot, platformId) || toolDetection[toolKey].check();
    });
};

/** Project platforms whose instructions are routed to AGENTS.md. */
export const AGENTS_MD_TARGET_PLATFORMS = ['github-copilot', 'opencode', 'pi', 'codex'];
