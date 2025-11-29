import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { paths } from '../core/paths.js';

/**
 * Install OpenCode commands
 */
export const installOpencodeCommands = () => {
    const commandsSourceDir = join(paths.superpowersRepo, '.opencode', 'command');
    const commandsDestDir = join(paths.home, '.config', 'opencode', 'command');

    if (!existsSync(commandsSourceDir)) {
        console.log('⚠️  No opencode commands to install (source directory not found).');
        return;
    }

    // Create destination directory
    try {
        if (!existsSync(commandsDestDir)) {
            execSync(`mkdir -p "${commandsDestDir}"`, { stdio: 'pipe' });
        }
    } catch (error) {
        console.log(`Error creating opencode commands directory: ${error.message}`);
        return;
    }

    // Copy all .md files
    let commandFiles;
    try {
        commandFiles = readdirSync(commandsSourceDir)
            .filter(f => f.endsWith('.md'));
    } catch (error) {
        console.log(`Error reading opencode commands directory: ${error.message}`);
        return;
    }

    if (commandFiles.length === 0) {
        console.log('⚠️  No command files found to install.');
        return;
    }

    console.log('Installing opencode commands...');
    let installed = 0;
    for (const file of commandFiles) {
        try {
            const source = join(commandsSourceDir, file);
            const dest = join(commandsDestDir, file);
            execSync(`cp "${source}" "${dest}"`, { stdio: 'pipe' });
            console.log(`  ✓ Installed ${file}`);
            installed++;
        } catch (error) {
            console.log(`  ✗ Failed to install ${file}: ${error.message}`);
        }
    }

    if (installed > 0) {
        console.log(`\n✓ Installed ${installed} command(s) to ${commandsDestDir}\n  Use slash commands in opencode:\n    /brainstorm - Refine ideas into designs\n    /execute-plan - Execute plans in batches\n    /write-plan - Create implementation plans\n    /write-skill - Create new skills with TDD\n    /skills - Discover available skills\n    /use-skill - Load and apply a specific skill`);
    }
};
