import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { paths } from '../core/paths.js';

/**
 * Install Cursor commands
 */
export const installCursorCommands = () => {
    const commandsSourceDir = join(paths.superpowersRepo, '.cursor', 'commands');
    const commandsDestDir = join(paths.home, '.cursor', 'commands');
    
    if (!existsSync(commandsSourceDir)) {
        console.log('⚠️  No Cursor commands to install (source directory not found).');
        return;
    }
    
    // Create destination directory
    try {
        if (!existsSync(commandsDestDir)) {
            execSync(`mkdir -p "${commandsDestDir}"`, { stdio: 'pipe' });
        }
    } catch (error) {
        console.log(`Error creating Cursor commands directory: ${error.message}`);
        return;
    }
    
    // Copy all .md files
    let commandFiles;
    try {
        commandFiles = readdirSync(commandsSourceDir)
            .filter(f => f.endsWith('.md'));
    } catch (error) {
        console.log(`Error reading Cursor commands directory: ${error.message}`);
        return;
    }
    
    if (commandFiles.length === 0) {
        console.log('⚠️  No command files found to install.');
        return;
    }
    
    console.log('Installing Cursor commands...');
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
        console.log(`\n✓ Installed ${installed} command(s) to ${commandsDestDir}\n  Use slash commands in Cursor:\n    /brainstorm-with-superpowers - Refine ideas into designs\n    /write-a-skill - Create new skills with TDD\n    /skills - Discover available skills\n    /use-skill - Load and apply a specific skill`);
    }
};

/**
 * Install Cursor hooks
 */
export const installCursorHooks = () => {
    const hooksSourceDir = join(paths.superpowersRepo, 'hooks', 'cursor');
    const hooksDestDir = join(paths.home, '.cursor', 'hooks');
    const hooksJsonSource = join(hooksSourceDir, 'hooks.json');
    const hooksJsonDest = join(paths.home, '.cursor', 'hooks.json');

    if (!existsSync(hooksSourceDir)) {
        console.log('⚠️  No Cursor hooks to install (source directory not found).');
        return;
    }

    // Create destination directory
    try {
        if (!existsSync(hooksDestDir)) {
            execSync(`mkdir -p "${hooksDestDir}"`, { stdio: 'pipe' });
        }
    } catch (error) {
        console.log(`Error creating Cursor hooks directory: ${error.message}`);
        return;
    }

    // Copy hooks.json
    try {
        execSync(`cp "${hooksJsonSource}" "${hooksJsonDest}"`, { stdio: 'pipe' });
        console.log('  ✓ Installed hooks.json');
    } catch (error) {
        console.log(`  ✗ Failed to install hooks.json: ${error.message}`);
        return;
    }

    // Copy hook scripts
    let hookFiles;
    try {
        hookFiles = readdirSync(hooksSourceDir)
            .filter(f => f.endsWith('.sh'));
    } catch (error) {
        console.log(`Error reading hooks directory: ${error.message}`);
        return;
    }

    if (hookFiles.length === 0) {
        console.log('⚠️  No hook scripts found to install.');
        return;
    }

    console.log('Installing Cursor hooks...');
    let installed = 0;
    for (const file of hookFiles) {
        try {
            const source = join(hooksSourceDir, file);
            const dest = join(hooksDestDir, file);
            execSync(`cp "${source}" "${dest}"`, { stdio: 'pipe' });
            execSync(`chmod +x "${dest}"`, { stdio: 'pipe' });
            console.log(`  ✓ Installed ${file}`);
            installed++;
        } catch (error) {
            console.log(`  ✗ Failed to install ${file}: ${error.message}`);
        }
    }

    if (installed > 0) {
        console.log(`\n✓ Installed ${installed} hook(s) to ${hooksDestDir}\n  Cursor will now check for skills before each prompt submission\n  Restart Cursor for hooks to take effect`);
    }
};
