import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { paths } from '../core/paths.js';

/**
 * Install OpenAI Codex prompts
 */
export const installCodexPrompts = () => {
    const promptsSourceDir = join(paths.superpowersRepo, '.codex', 'prompts');
    const promptsDestDir = join(paths.home, '.codex', 'prompts');

    if (!existsSync(promptsSourceDir)) {
        console.log('⚠️  No Codex prompts to install (source directory not found).');
        return;
    }

    // Create destination directory
    try {
        if (!existsSync(promptsDestDir)) {
            execSync(`mkdir -p "${promptsDestDir}"`, { stdio: 'pipe' });
        }
    } catch (error) {
        console.log(`Error creating Codex prompts directory: ${error.message}`);
        return;
    }

    // Copy all .md files
    let promptFiles;
    try {
        promptFiles = readdirSync(promptsSourceDir)
            .filter(f => f.endsWith('.md'));
    } catch (error) {
        console.log(`Error reading Codex prompts directory: ${error.message}`);
        return;
    }

    if (promptFiles.length === 0) {
        console.log('⚠️  No prompt files found to install.');
        return;
    }

    console.log('Installing OpenAI Codex prompts...');
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
        console.log(`\n✓ Installed ${installed} prompt(s) to ${promptsDestDir}\n  Use slash commands in OpenAI Codex:\n    /prompts:brainstorm - Refine ideas into designs\n    /prompts:write-skill - Create new skills with TDD\n    /prompts:skills - Discover available skills\n    /prompts:use-skill - Load and apply a specific skill\n  Note: Restart Codex or open a new session to reload prompts`);
    }
};
