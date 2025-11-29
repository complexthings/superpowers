import { existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { paths } from '../core/paths.js';

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

/**
 * Install GitHub Copilot universal instructions
 */
export const installCopilotInstructions = () => {
    const instructionsSource = join(paths.superpowersRepo, '.github', 'copilot-instructions.md');
    const instructionsDest = join(paths.home, '.github', 'copilot-instructions.md');
    
    if (!existsSync(instructionsSource)) {
        console.log('⚠️  No Copilot instructions to install (source file not found).');
        return;
    }
    
    // Create destination directory
    const destDir = dirname(instructionsDest);
    try {
        if (!existsSync(destDir)) {
            execSync(`mkdir -p "${destDir}"`, { stdio: 'pipe' });
        }
    } catch (error) {
        console.log(`Error creating .github directory: ${error.message}`);
        return;
    }
    
    // Copy instructions
    try {
        execSync(`cp "${instructionsSource}" "${instructionsDest}"`, { stdio: 'pipe' });
        console.log(`✓ Installed GitHub Copilot universal instructions\n  Location: ${instructionsDest}\n  GitHub Copilot will now use Superpowers skills universally in all workspaces`);
    } catch (error) {
        console.log(`✗ Failed to install instructions: ${error.message}`);
    }
};
