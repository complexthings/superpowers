import { execSync } from 'child_process';
import { paths } from './paths.js';

/**
 * Check if repository is clean (no uncommitted changes)
 */
export const isRepoClean = () => {
    try {
        const output = execSync('git status --porcelain --untracked-files=no', {
            cwd: paths.superpowersRepo,
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 3000
        });
        return output.trim().length === 0;
    } catch {
        return false;
    }
};

/**
 * Check if currently on main branch
 */
export const isOnMainBranch = () => {
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', {
            cwd: paths.superpowersRepo,
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 3000
        });
        return branch.trim() === 'main';
    } catch {
        return false;
    }
};

/**
 * Check for available updates from origin/main
 */
export const checkForUpdates = () => {
    try {
        // Fetch latest from origin
        execSync('git fetch origin', {
            cwd: paths.superpowersRepo,
            timeout: 5000,
            stdio: 'pipe'
        });

        // Check if repo is clean
        const hasLocalChanges = !isRepoClean();

        // Get current and latest commits
        const currentCommit = execSync('git rev-parse HEAD', {
            cwd: paths.superpowersRepo,
            encoding: 'utf8',
            stdio: 'pipe'
        }).trim();

        const latestCommit = execSync('git rev-parse origin/main', {
            cwd: paths.superpowersRepo,
            encoding: 'utf8',
            stdio: 'pipe'
        }).trim();

        const hasUpdates = currentCommit !== latestCommit;

        if (!hasUpdates) {
            return {
                hasUpdates: false,
                hasLocalChanges,
                currentCommit,
                latestCommit,
                commitsBehind: 0,
                changedFiles: []
            };
        }

        // Count commits behind
        const commitsBehind = parseInt(execSync('git rev-list --count HEAD..origin/main', {
            cwd: paths.superpowersRepo,
            encoding: 'utf8',
            stdio: 'pipe'
        }).trim(), 10);

        // Get changed files
        const changedFilesOutput = execSync('git diff --name-only HEAD origin/main', {
            cwd: paths.superpowersRepo,
            encoding: 'utf8',
            stdio: 'pipe'
        });

        const changedFiles = changedFilesOutput.trim().split('\n').filter(f => f.length > 0);

        return {
            hasUpdates: true,
            hasLocalChanges,
            currentCommit,
            latestCommit,
            commitsBehind,
            changedFiles
        };
    } catch {
        return {
            hasUpdates: false,
            hasLocalChanges: false,
            currentCommit: '',
            latestCommit: '',
            commitsBehind: 0,
            changedFiles: [],
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
