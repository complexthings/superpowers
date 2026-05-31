import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { paths } from '../core/paths.js';

// Our dedicated personal-hooks file. A standalone file (not merged into the
// user's other hook files) so it's unambiguously ours and safe to overwrite.
const COPILOT_HOOK_FILENAME = 'superpowers.json';

const buildCopilotHook = () => ({
    version: 1,
    hooks: {
        sessionStart: [
            {
                type: 'command',
                bash: 'superpowers-agent session-context --format=copilot 2>/dev/null || true',
                powershell: 'superpowers-agent session-context --format=copilot 2>$null; exit 0',
                timeoutSec: 15,
            },
        ],
    },
});

/**
 * Install (or refresh) the Superpowers sessionStart hook for GitHub Copilot CLI.
 * Writes a dedicated personal-hooks file at <hooksDir>/superpowers.json. Idempotent:
 * re-running writes identical content (no-op if already current).
 *
 * @param {string} hooksDir - hooks directory (defaults to ~/.copilot/hooks or
 *   $COPILOT_HOME/hooks). Overridable for tests.
 * @returns {{created?:boolean, updated?:boolean, existed?:boolean, error?:boolean, message?:string, path?:string}}
 */
export const installCopilotSessionHook = (hooksDir = paths.copilotHooksDir) => {
    const hookPath = join(hooksDir, COPILOT_HOOK_FILENAME);
    const desired = JSON.stringify(buildCopilotHook(), null, 2) + '\n';

    if (existsSync(hookPath)) {
        let current;
        try {
            current = readFileSync(hookPath, 'utf8');
        } catch (error) {
            return { error: true, message: `Failed to read ${hookPath}: ${error.message}` };
        }
        if (current === desired) {
            return { existed: true, path: hookPath };
        }
    }

    if (!existsSync(hooksDir)) {
        try {
            mkdirSync(hooksDir, { recursive: true });
        } catch (error) {
            return { error: true, message: `Failed to create ${hooksDir}: ${error.message}` };
        }
    }

    const wasPresent = existsSync(hookPath);
    try {
        writeFileSync(hookPath, desired, 'utf8');
    } catch (error) {
        return { error: true, message: `Failed to write ${hookPath}: ${error.message}` };
    }

    return wasPresent ? { updated: true, path: hookPath } : { created: true, path: hookPath };
};

/**
 * Install GitHub Copilot prompts to VS Code User directory
 */
export const installCopilotPrompts = () => {
    const promptsSourceDir = join(paths.superpowersRepo, '.github', 'prompts');
    const promptsDestDir = join(paths.vscodeUserDir, 'prompts');
    
    if (!existsSync(promptsSourceDir)) {
        console.log('⚠️  No Copilot prompts to install (source directory not found).');
        return;
    }
    
    // Create destination directory
    try {
        if (!existsSync(promptsDestDir)) {
            execSync(`mkdir -p "${promptsDestDir}"`, { stdio: 'pipe' });
        }
    } catch (error) {
        console.log(`Error creating prompts directory: ${error.message}`);
        return;
    }
    
    // Copy all .prompt.md files
    let promptFiles;
    try {
        promptFiles = readdirSync(promptsSourceDir)
            .filter(f => f.endsWith('.prompt.md'));
    } catch (error) {
        console.log(`Error reading prompts directory: ${error.message}`);
        return;
    }
    
    if (promptFiles.length === 0) {
        console.log('⚠️  No prompt files found to install.');
        return;
    }
    
    console.log('Installing GitHub Copilot prompts...');
    let installed = 0;
    for (const file of promptFiles) {
        try {
            const source = join(promptsSourceDir, file);
            const dest = join(promptsDestDir, file);
            execSync(`cp "${source}" "${dest}"`, { stdio: 'pipe' });
            console.log(`  ✓ Installed ${file}`);
            installed++;
        } catch (error) {
            console.log(`  ✗ Failed to install ${file}: ${error.message}`);
        }
    }
    
    if (installed > 0) {
        console.log(`\n✓ Installed ${installed} prompt(s) to ${promptsDestDir}\n  Use slash commands in GitHub Copilot:\n    /brainstorm-with-superpowers - Refine ideas into designs\n    /write-a-skill - Create new skills with TDD\n    /skills - Discover available skills\n    /use-skill - Load and apply a specific skill`);
    }
};

