import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { paths } from '../core/paths.js';

/**
 * Install Gemini commands
 */
export const installGeminiCommands = () => {
    const commandsSourceDir = join(paths.superpowersRepo, '.gemini', 'commands');
    const commandsDestDir = join(paths.home, '.gemini', 'commands');

    if (!existsSync(commandsSourceDir)) {
        console.log('⚠️  No Gemini commands to install (source directory not found).');
        return;
    }

    // Create destination directory
    try {
        if (!existsSync(commandsDestDir)) {
            execSync(`mkdir -p "${commandsDestDir}"`, { stdio: 'pipe' });
        }
    } catch (error) {
        console.log(`Error creating Gemini commands directory: ${error.message}`);
        return;
    }

    // Copy all .toml files
    let commandFiles;
    try {
        commandFiles = readdirSync(commandsSourceDir)
            .filter(f => f.endsWith('.toml'));
    } catch (error) {
        console.log(`Error reading Gemini commands directory: ${error.message}`);
        return;
    }

    if (commandFiles.length === 0) {
        console.log('⚠️  No command files found to install.');
        return;
    }

    console.log('Installing Gemini commands...');
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
        console.log(`\n✓ Installed ${installed} command(s) to ${commandsDestDir}\n  Use slash commands in Gemini:\n    /brainstorm-with-superpowers - Refine ideas into designs\n    /write-a-skill - Create new skills with TDD\n    /skills - Discover available skills\n    /use-skill - Load and apply a specific skill`);
    }
};
