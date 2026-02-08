import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
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
 * 
 * Reads the template from .github/copilot-instructions.md, replaces ${content}
 * with the using-superpowers SKILL.md content, and installs to ~/.github/copilot-instructions.md.
 * Uses marker-based update-in-place for idempotent updates.
 */
export const installCopilotInstructions = () => {
    const instructionsSource = join(paths.superpowersRepo, '.github', 'copilot-instructions.md');
    const skillSource = join(paths.superpowersRepo, 'skills', 'meta', 'using-superpowers', 'SKILL.md');
    const instructionsDest = join(paths.home, '.github', 'copilot-instructions.md');
    
    const START_MARKER = '<!-- SUPERPOWERS_-_INSTRUCTIONS_START -->';
    const END_MARKER = '<!-- SUPERPOWERS_-_INSTRUCTIONS_END -->';
    
    if (!existsSync(instructionsSource)) {
        console.log('⚠️  No Copilot instructions to install (source template not found).');
        return;
    }
    
    if (!existsSync(skillSource)) {
        console.log('⚠️  No Copilot instructions to install (using-superpowers SKILL.md not found).');
        return;
    }
    
    // Read the template and skill content
    let templateContent;
    let skillContent;
    try {
        templateContent = readFileSync(instructionsSource, 'utf8');
        skillContent = readFileSync(skillSource, 'utf8');
    } catch (error) {
        console.log(`✗ Failed to read source files: ${error.message}`);
        return;
    }
    
    // Replace ${content} placeholder with actual skill content
    const processedContent = templateContent.replace('${content}', skillContent);
    
    // Ensure the processed content has the markers (the template already includes them)
    // Verify markers are present in the processed content
    if (!processedContent.includes(START_MARKER) || !processedContent.includes(END_MARKER)) {
        console.log('⚠️  Template is missing required markers, cannot install.');
        return;
    }
    
    // Create destination directory if needed
    const destDir = dirname(instructionsDest);
    try {
        if (!existsSync(destDir)) {
            execSync(`mkdir -p "${destDir}"`, { stdio: 'pipe' });
        }
    } catch (error) {
        console.log(`✗ Error creating .github directory: ${error.message}`);
        return;
    }
    
    // Check if destination file already exists
    if (existsSync(instructionsDest)) {
        let existingContent;
        try {
            existingContent = readFileSync(instructionsDest, 'utf8');
        } catch (error) {
            console.log(`✗ Failed to read existing instructions: ${error.message}`);
            return;
        }
        
        // Backup the existing file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${instructionsDest}.backup-${timestamp}`;
        try {
            execSync(`cp "${instructionsDest}" "${backupPath}"`, { stdio: 'pipe' });
            console.log(`✓ Backed up existing instructions to ${backupPath}`);
        } catch (error) {
            console.log(`✗ Failed to backup existing instructions: ${error.message}`);
            return;
        }
        
        // Check if file already has markers
        if (existingContent.includes(START_MARKER) && existingContent.includes(END_MARKER)) {
            // Update content between markers in place
            const regex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, 'g');
            const newContent = existingContent.replace(regex, processedContent.trim());
            try {
                writeFileSync(instructionsDest, newContent, 'utf8');
                console.log(`✓ Updated GitHub Copilot universal instructions (in-place)\n  Location: ${instructionsDest}`);
            } catch (error) {
                console.log(`✗ Failed to update instructions: ${error.message}`);
            }
        } else {
            // No markers found - append the new content to end of file
            const newContent = existingContent.trimEnd() + '\n\n' + processedContent.trim() + '\n';
            try {
                writeFileSync(instructionsDest, newContent, 'utf8');
                console.log(`✓ Appended GitHub Copilot universal instructions to existing file\n  Location: ${instructionsDest}`);
            } catch (error) {
                console.log(`✗ Failed to append instructions: ${error.message}`);
            }
        }
    } else {
        // No existing file - write the processed content directly
        try {
            writeFileSync(instructionsDest, processedContent, 'utf8');
            console.log(`✓ Installed GitHub Copilot universal instructions\n  Location: ${instructionsDest}\n  GitHub Copilot will now use Superpowers skills universally in all workspaces`);
        } catch (error) {
            console.log(`✗ Failed to install instructions: ${error.message}`);
        }
    }
};
