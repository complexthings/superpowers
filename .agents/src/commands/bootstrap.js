/**
 * Bootstrap and setup commands for superpowers-agent
 */

import { existsSync, readFileSync, writeFileSync, rmSync, lstatSync } from 'fs';
import { join, dirname, parse } from 'path';
import { execSync } from 'child_process';
import { platform } from 'os';
import { paths } from '../core/paths.js';
import { readConfig } from '../core/config.js';
import { checkForUpdates, isOnMainBranch } from '../core/git.js';
import { printVersion, getLocalVersion } from '../utils/output.js';
import { toolDetection, detectPlatforms } from '../core/platform-detection.js';

// Import integration installers
import { installOpencodePluginSymlink } from '../integrations/opencode.js';
import { installClaudeSessionHook } from '../integrations/claude.js';
import { installCopilotSessionHook } from '../integrations/copilot.js';
import { detectTool } from '../utils/file-ops.js';

// Import update function
import { runUpdate } from './update.js';

// Import symlink utilities
import { syncRepoSkillSymlinks, SKILL_PLATFORMS } from '../utils/symlinks.js';
import { runStaleSkillSymlinkCleaner } from '../utils/stale-skill-symlink-cleaner.js';

/**
 * Update a platform-specific file with skills content
 */
const updatePlatformFile = (filePath, templateContent, platforms, createIfMissing = true) => {
    const fileExists = existsSync(filePath);
    
    // If file doesn't exist and we shouldn't create it, skip
    if (!fileExists && !createIfMissing) {
        return { updated: false, created: false, skipped: true };
    }
    
    // Replace placeholders in template
    let content = templateContent;
    const currentDate = new Date().toISOString().split('T')[0];
    content = content.replace(/\{\{DATE\}\}/g, currentDate);
    content = content.replace(/\{\{SUPERPOWERS_PATH\}\}/g, paths.superpowersRepo);
    
    // Wrap content in markers
    const wrappedContent = `<!-- SUPERPOWERS_SKILLS_START -->\n${content}\n<!-- SUPERPOWERS_SKILLS_END -->`;
    
    if (fileExists) {
        // Backup existing file
        const timestamp = new Date().toISOString().split('T')[0];
        const backupPath = `${filePath}.backup-${timestamp}`;
        try {
            execSync(`cp "${filePath}" "${backupPath}"`, { stdio: 'pipe' });
        } catch (error) {
            return { updated: false, error: true, message: `Failed to backup: ${error.message}` };
        }
        
        // Read existing file
        let existingContent;
        try {
            existingContent = readFileSync(filePath, 'utf8');
        } catch (error) {
            return { updated: false, error: true, message: `Failed to read: ${error.message}` };
        }
        
        // Check if file already has SUPERPOWERS markers
        const startMarker = '<!-- SUPERPOWERS_SKILLS_START -->';
        const endMarker = '<!-- SUPERPOWERS_SKILLS_END -->';
        
        let newContent;
        if (existingContent.includes(startMarker) && existingContent.includes(endMarker)) {
            // Replace existing superpowers section
            const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'g');
            newContent = existingContent.replace(regex, wrappedContent);
        } else {
            // Find opening header or prepend to top
            const headerMatch = existingContent.match(/^#\s+.+$/m);
            if (headerMatch) {
                // Insert after first header
                const headerEndPos = existingContent.indexOf('\n', headerMatch.index) + 1;
                newContent = existingContent.slice(0, headerEndPos) + '\n' + wrappedContent + '\n' + existingContent.slice(headerEndPos);
            } else {
                // No header, prepend to top
                newContent = wrappedContent + '\n\n' + existingContent;
            }
        }
        
        // Write updated content
        try {
            writeFileSync(filePath, newContent, 'utf8');
            return { updated: true, created: false, backup: backupPath };
        } catch (error) {
            return { updated: false, error: true, message: `Failed to write: ${error.message}` };
        }
    } else {
        // Create new file
        try {
            // Ensure directory exists
            const dir = dirname(filePath);
            if (!existsSync(dir)) {
                execSync(`mkdir -p "${dir}"`, { stdio: 'pipe' });
            }
            
            // Determine heading based on filename
            const fileName = parse(filePath).base.toUpperCase();
            const heading = `# ${fileName}\n\n`;
            
            // Write file with heading + content
            const finalContent = heading + wrappedContent;
            writeFileSync(filePath, finalContent, 'utf8');
            return { updated: false, created: true };
        } catch (error) {
            return { updated: false, created: false, error: true, message: `Failed to create: ${error.message}` };
        }
    }
};

/**
 * Install platform aliases (Unix/Linux/Mac)
 */
const installUnixAliases = () => {
    console.log('Installing Unix aliases...');
    const sourceAgentPath = join(paths.superpowersRepo, '.agents', 'superpowers-agent');
    const binDir = join(paths.home, '.local', 'bin');
    const agentLinkPath = join(binDir, 'superpowers-agent');
    const superpowersLinkPath = join(binDir, 'superpowers');
    
    // Check if source executable exists
    if (!existsSync(sourceAgentPath)) {
        console.log('⚠️  superpowers-agent executable not found');
        return;
    }
    
    // Create ~/.local/bin directory if it doesn't exist
    if (!existsSync(binDir)) {
        try {
            execSync(`mkdir -p "${binDir}"`, { stdio: 'pipe' });
            console.log(`✓ Created ${binDir}`);
        } catch (error) {
            console.log(`⚠️  Failed to create ${binDir}: ${error.message}`);
            return;
        }
    }
    
    // Create or update superpowers-agent symlink
    try {
        if (existsSync(agentLinkPath)) {
            // Remove existing symlink
            execSync(`rm "${agentLinkPath}"`, { stdio: 'pipe' });
        }
        execSync(`ln -s "${sourceAgentPath}" "${agentLinkPath}"`, { stdio: 'pipe' });
        console.log(`✓ Created symlink: superpowers-agent -> ${sourceAgentPath}`);
    } catch (error) {
        console.log(`⚠️  Failed to create superpowers-agent symlink: ${error.message}`);
    }
    
    // Create or update superpowers symlink
    try {
        if (existsSync(superpowersLinkPath)) {
            // Remove existing symlink
            execSync(`rm "${superpowersLinkPath}"`, { stdio: 'pipe' });
        }
        execSync(`ln -s "${sourceAgentPath}" "${superpowersLinkPath}"`, { stdio: 'pipe' });
        console.log(`✓ Created symlink: superpowers -> ${sourceAgentPath}`);
    } catch (error) {
        console.log(`⚠️  Failed to create superpowers symlink: ${error.message}`);
    }
    
    // Check if ~/.local/bin is in PATH
    const pathEnv = process.env.PATH || '';
    if (!pathEnv.includes(binDir)) {
        console.log(`\n⚠️  Warning: ${binDir} is not in your PATH`);
        console.log('   Add this to your shell profile (~/.bashrc, ~/.zshrc, etc.):');
        console.log(`   export PATH="$HOME/.local/bin:$PATH"\n`);
    }
};

/**
 * Install platform aliases (Windows)
 */
const installWindowsAliases = () => {
    console.log('Installing Windows aliases...');
    console.log('✓ Windows alias installation (implementation pending)');
};

/**
 * Install command aliases based on platform
 */
const installAliases = () => {
    const plat = platform();
    
    console.log('## Installing Universal Aliases\n');
    
    if (plat === 'win32') {
        return installWindowsAliases();
    } else {
        return installUnixAliases();
    }
};

/**
 * Update .github/copilot-instructions.md in a project with Superpowers content
 * 
 * Reads the template from .github/copilot-instructions.md in the superpowers repo
 * and installs it to the project's .github/copilot-instructions.md.
 * Uses marker-based update-in-place for idempotent updates.
 */
const updateCopilotInstructions = (projectRoot) => {
    const instructionsSource = join(paths.superpowersRepo, '.github', 'copilot-instructions.md');
    const instructionsDest = join(projectRoot, '.github', 'copilot-instructions.md');
    
    const START_MARKER = '<!-- SUPERPOWERS_-_INSTRUCTIONS_START -->';
    const END_MARKER = '<!-- SUPERPOWERS_-_INSTRUCTIONS_END -->';
    
    if (!existsSync(instructionsSource)) {
        return { error: true, message: 'Source template not found' };
    }
    
    let processedContent;
    try {
        processedContent = readFileSync(instructionsSource, 'utf8');
    } catch (error) {
        return { error: true, message: `Failed to read source template: ${error.message}` };
    }
    
    // Verify markers are present in the processed content
    if (!processedContent.includes(START_MARKER) || !processedContent.includes(END_MARKER)) {
        return { error: true, message: 'Template is missing required markers' };
    }
    
    // Create .github directory if needed
    const destDir = dirname(instructionsDest);
    try {
        if (!existsSync(destDir)) {
            execSync(`mkdir -p "${destDir}"`, { stdio: 'pipe' });
        }
    } catch (error) {
        return { error: true, message: `Failed to create .github directory: ${error.message}` };
    }
    
    // Check if destination file already exists
    if (existsSync(instructionsDest)) {
        let existingContent;
        try {
            existingContent = readFileSync(instructionsDest, 'utf8');
        } catch (error) {
            return { error: true, message: `Failed to read existing file: ${error.message}` };
        }
        
        // Backup the existing file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${instructionsDest}.backup-${timestamp}`;
        try {
            execSync(`cp "${instructionsDest}" "${backupPath}"`, { stdio: 'pipe' });
        } catch (error) {
            return { error: true, message: `Failed to backup: ${error.message}` };
        }
        
        // Check if file already has markers
        if (existingContent.includes(START_MARKER) && existingContent.includes(END_MARKER)) {
            // Replace content between markers (inclusive of markers)
            const regex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, 'g');
            const newContent = existingContent.replace(regex, processedContent.trim());
            try {
                writeFileSync(instructionsDest, newContent, 'utf8');
                return { updated: true, backup: backupPath };
            } catch (error) {
                return { error: true, message: `Failed to update: ${error.message}` };
            }
        } else {
            // No markers found - append the new content to end of file
            const newContent = existingContent.trimEnd() + '\n\n' + processedContent.trim() + '\n';
            try {
                writeFileSync(instructionsDest, newContent, 'utf8');
                return { updated: true, backup: backupPath };
            } catch (error) {
                return { error: true, message: `Failed to append: ${error.message}` };
            }
        }
    } else {
        // No existing file - write the processed content directly
        try {
            writeFileSync(instructionsDest, processedContent, 'utf8');
            return { created: true };
        } catch (error) {
            return { error: true, message: `Failed to create: ${error.message}` };
        }
    }
};

/**
 * Command: setup-skills
 * Initialize project with skills infrastructure
 */
const runSetupSkills = () => {
    printVersion();
    console.log('# Setting up Superpowers skills for this project\n');

    // ALWAYS use current directory as project root for setup-skills
    const projectRoot = process.cwd();
    const agentsDir = join(projectRoot, '.agents');
    const skillsDir = join(agentsDir, 'skills');
    const rootAgentsMdPath = join(projectRoot, 'AGENTS.md');
    const dotAgentsAgentsMdPath = join(agentsDir, 'AGENTS.md');
    const agentsMdPath = existsSync(rootAgentsMdPath) ? rootAgentsMdPath : dotAgentsAgentsMdPath;
    const templatePath = join(paths.superpowersRepo, '.agents', 'templates', 'AGENTS.md.template');

    // Check if template exists
    if (!existsSync(templatePath)) {
        console.log(`✗ Error: AGENTS.md template not found\n  Expected at: ${templatePath}\n  Please update your Superpowers installation`);
        return;
    }

    // Create .agents directory
    if (!existsSync(agentsDir)) {
        try {
            execSync(`mkdir -p "${agentsDir}"`, { stdio: 'pipe' });
            console.log('✓ Created .agents/ directory');
        } catch (error) {
            console.log(`✗ Failed to create .agents/ directory: ${error.message}`);
            return;
        }
    } else {
        console.log('✓ .agents/ directory exists');
    }

    // Create skills directory
    if (!existsSync(skillsDir)) {
        try {
            execSync(`mkdir -p "${skillsDir}"`, { stdio: 'pipe' });
            execSync(`touch "${join(skillsDir, '.gitkeep')}"`, { stdio: 'pipe' });
            console.log('✓ Created .agents/skills/ directory');
        } catch (error) {
            console.log(`✗ Failed to create skills directory: ${error.message}`);
            return;
        }
    } else {
        console.log('✓ .agents/skills/ directory exists');
    }

    // Create docs directory and copy SUPERPOWERS.md
    const docsDir = join(agentsDir, 'docs');
    const superpowersMdPath = join(docsDir, 'SUPERPOWERS.md');
    const superpowersTemplatePath = join(paths.superpowersRepo, '.agents', 'templates', 'SUPERPOWERS.md.template');

    if (!existsSync(docsDir)) {
        try {
            execSync(`mkdir -p "${docsDir}"`, { stdio: 'pipe' });
            console.log('✓ Created .agents/docs/ directory');
        } catch (error) {
            console.log(`⚠️  Failed to create docs directory: ${error.message}`);
        }
    } else {
        console.log('✓ .agents/docs/ directory exists');
    }

    // Handle existing AGENTS.md
    const agentsMdExists = existsSync(agentsMdPath);
    
    if (agentsMdExists) {
        const timestamp = new Date().toISOString().split('T')[0];
        const backupPath = `${agentsMdPath}.backup-${timestamp}`;
        try {
            execSync(`cp "${agentsMdPath}" "${backupPath}"`, { stdio: 'pipe' });
            console.log(`✓ Backed up existing AGENTS.md to ${parse(backupPath).base}`);
        } catch (error) {
            console.log(`✗ Failed to backup AGENTS.md: ${error.message}`);
            return;
        }
    }

    // Read template
    let template;
    try {
        template = readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.log(`✗ Failed to read template: ${error.message}`);
        return;
    }

    // Inject current version into template
    const currentVersion = getLocalVersion();
    template = template.replace(/\{\{VERSION\}\}/g, currentVersion);

    // Copy SUPERPOWERS.md with placeholder substitution
    if (existsSync(superpowersTemplatePath)) {
        try {
            let superpowersContent = readFileSync(superpowersTemplatePath, 'utf8');
            const currentDate = new Date().toISOString().split('T')[0];
            superpowersContent = superpowersContent.replace(/\{\{VERSION\}\}/g, currentVersion);
            superpowersContent = superpowersContent.replace(/\{\{DATE\}\}/g, currentDate);
            writeFileSync(superpowersMdPath, superpowersContent, 'utf8');
            console.log('✓ Created .agents/docs/SUPERPOWERS.md');
        } catch (error) {
            console.log(`⚠️  Failed to create SUPERPOWERS.md: ${error.message}`);
        }
    } else {
        console.log('⚠️  SUPERPOWERS.md.template not found');
    }

    // Detect platforms
    const projectPlatforms = [];

    const rootCopilotPath = join(projectRoot, '.github', 'copilot-instructions.md');
    const globalCopilotPath = join(paths.home, '.github', 'copilot-instructions.md');
    if (existsSync(rootCopilotPath) || existsSync(globalCopilotPath) || toolDetection.copilot.check()) {
        projectPlatforms.push('github-copilot');
    }

    const rootClaudeMdPath = join(projectRoot, 'CLAUDE.md');
    const dotAgentsClaudeMdPath = join(agentsDir, 'CLAUDE.md');
    if (existsSync(rootClaudeMdPath) || existsSync(dotAgentsClaudeMdPath) || toolDetection.claude.check()) {
        projectPlatforms.push('claude-code');
    }

    if (toolDetection.opencode.check()) projectPlatforms.push('opencode');

    console.log(`\nDetected platforms for project: ${projectPlatforms.join(', ') || 'none'}\n`);

    // Update AGENTS.md (targets GitHub Copilot and OpenCode only)
    const agentsPlatforms = projectPlatforms.filter(p => ['github-copilot', 'opencode'].includes(p));
    const agentsResult = updatePlatformFile(agentsMdPath, template, agentsPlatforms, !agentsMdExists);
    
    if (agentsResult.created) {
        const location = agentsMdPath === rootAgentsMdPath ? 'root' : '.agents/';
        console.log(`✓ Created AGENTS.md with platform tool mappings (${location})`);
    } else if (agentsResult.updated) {
        const location = agentsMdPath === rootAgentsMdPath ? 'root' : '.agents/';
        console.log(`✓ Updated AGENTS.md with platform tool mappings (${location})`);
    } else if (agentsResult.error) {
        console.log('⚠️  Failed to update AGENTS.md');
    }

    // Update CLAUDE.md if it exists (prefer root, then .agents/)
    const claudeMdPath = existsSync(rootClaudeMdPath) ? rootClaudeMdPath : dotAgentsClaudeMdPath;
    const claudeResult = updatePlatformFile(claudeMdPath, template, ['claude-code'], false);
    if (claudeResult.created) {
        const claudeMdLocation = claudeMdPath === rootClaudeMdPath ? 'root' : '.agents/';
        console.log(`✓ Created CLAUDE.md with Claude Code tool mappings (${claudeMdLocation})`);
    } else if (claudeResult.updated) {
        const claudeMdLocation = claudeMdPath === rootClaudeMdPath ? 'root' : '.agents/';
        console.log(`✓ Updated CLAUDE.md with Claude Code tool mappings (${claudeMdLocation})`);
        if (claudeResult.backup) {
            console.log(`  Backed up to ${parse(claudeResult.backup).base}`);
        }
    } else if (claudeResult.skipped) {
        console.log('ℹ️  Skipped CLAUDE.md (does not exist)');
    } else if (claudeResult.error) {
        console.log('⚠️  Failed to update CLAUDE.md');
    }

    // Update .github/copilot-instructions.md with Superpowers instructions when GitHub Copilot is detected
    const copilotInstructionsPath = join(projectRoot, '.github', 'copilot-instructions.md');
    let copilotResult = { skipped: true };

    if (projectPlatforms.includes('github-copilot')) {
        copilotResult = updateCopilotInstructions(projectRoot);
        if (copilotResult.created) {
            console.log('✓ Created .github/copilot-instructions.md with Superpowers instructions');
        } else if (copilotResult.updated) {
            console.log('✓ Updated .github/copilot-instructions.md with Superpowers instructions');
            if (copilotResult.backup) {
                console.log(`  Backed up to ${parse(copilotResult.backup).base}`);
            }
        } else if (copilotResult.error) {
            console.log(`⚠️  Failed to update .github/copilot-instructions.md: ${copilotResult.message || ''}`);
        }
    } else {
        console.log('ℹ️  Skipped .github/copilot-instructions.md (GitHub Copilot not detected)');
    }

    // Update .github/copilot-instructions.md with tool mappings if it exists AND AGENTS.md does NOT exist
    const agentsMdDoesNotExist = !existsSync(rootAgentsMdPath) && !existsSync(dotAgentsAgentsMdPath);
    
    if (existsSync(copilotInstructionsPath) && agentsMdDoesNotExist) {
        const copilotToolResult = updatePlatformFile(copilotInstructionsPath, template, ['github-copilot'], false);
        if (copilotToolResult.updated) {
            console.log('✓ Updated .github/copilot-instructions.md with GitHub Copilot tool mappings');
            if (copilotToolResult.backup) {
                console.log(`  Backed up to ${parse(copilotToolResult.backup).base}`);
            }
        } else if (copilotToolResult.error) {
            console.log('⚠️  Failed to update .github/copilot-instructions.md with tool mappings');
        }
    } else if (existsSync(copilotInstructionsPath) && !agentsMdDoesNotExist) {
        console.log('ℹ️  Skipped .github/copilot-instructions.md tool mappings (AGENTS.md exists, using that instead)');
    } else if (!existsSync(copilotInstructionsPath) && !projectPlatforms.includes('github-copilot')) {
        console.log('ℹ️  Skipped .github/copilot-instructions.md tool mappings (does not exist)');
    }

    // Build dynamic success message based on what was updated
    let setupMessage = `\n# Setup complete!\n\nYour project now has:
  - .agents/ directory structure`;

    if (agentsResult.updated || agentsResult.created) {
        setupMessage += '\n  - AGENTS.md with universal skills instructions';
    }
    if (claudeResult.updated || claudeResult.created) {
        setupMessage += '\n  - CLAUDE.md with Claude Code skills instructions';
    }
    if (copilotResult.updated || copilotResult.created) {
        setupMessage += '\n  - .github/copilot-instructions.md with Superpowers instructions';
    }
    setupMessage += '\n  - .agents/skills/ ready for project-specific skills';
    setupMessage += '\n  - .agents/docs/SUPERPOWERS.md for detailed reference\n';
    
    console.log(setupMessage);
};

/**
 * Remove legacy prompt/command files that were installed by previous bootstrap versions.
 * Silently skips files that no longer exist.
 */
const removeLegacyPrompts = () => {
    const legacyFiles = [
        // GitHub Copilot (.prompt.md)
        ...['brainstorming.prompt.md', 'execute-plan.prompt.md', 'write-plan.prompt.md',
            'setup-skills.prompt.md', 'create-meta-prompt.md', 'finding-skills.prompt.md',
            'skills.prompt.md', 'use-skill.prompt.md', 'using-a-skill.prompt.md']
            .map(f => join(paths.vscodeUserDir, 'prompts', f)),

        // Claude Code (.md)
        ...['brainstorm.md', 'create-meta-prompt.md', 'execute-plan.md', 'finding-skills.md',
            'skills.md', 'use-skill.md', 'using-a-skill.md', 'write-plan.md', 'setup-skills.md']
            .map(f => join(paths.home, '.claude', 'commands', f)),

        // OpenCode (.md)
        ...['brainstorm.md', 'create-meta-prompt.md', 'execute-plan.md', 'finding-skills.md',
            'skills.md', 'use-skill.md', 'using-a-skill.md', 'write-plan.md', 'setup-skills.md']
            .map(f => join(paths.home, '.config', 'opencode', 'command', f)),
    ];

    let removed = 0;
    for (const filePath of legacyFiles) {
        if (existsSync(filePath)) {
            try {
                rmSync(filePath);
                removed++;
            } catch (err) {
                // Non-fatal — log and continue
                console.log(`  ⚠️  Could not remove ${filePath}: ${err.message}`);
            }
        }
    }
    if (removed > 0) {
        console.log(`✓ Removed ${removed} legacy prompt/command file${removed !== 1 ? 's' : ''}`);
    } else {
        console.log('✓ No legacy prompt/command files found');
    }
};

/**
 * Remove the legacy `superpowers` directory-level symlink from each platform's
 * skills directory. This was created by the old syncSuperpowersForPlatform()
 * behavior and causes skill paths to nest as `superpowers/<skill>` instead of
 * appearing flat at the top level.
 */
const removeLegacySuperpowersDirSymlinks = () => {
    let removed = 0;
    for (const plat of SKILL_PLATFORMS) {
        const skillsDir = plat.skillsDir();
        const legacyLink = join(skillsDir, 'superpowers');
        try {
            const stat = lstatSync(legacyLink);
            if (stat.isSymbolicLink()) {
                rmSync(legacyLink);
                console.log(`✓ Removed legacy superpowers symlink from ${skillsDir.replace(paths.home, '~')}`);
                removed++;
            }
        } catch {
            // Path doesn't exist — nothing to do
        }
    }
    if (removed === 0) {
        console.log('✓ No legacy superpowers directory symlinks found');
    }
};

/**
 * Command: bootstrap [--no-update]
 * Run complete bootstrap process
 */
const runBootstrap = async () => {
    printVersion();
    console.log('# Superpowers Bootstrap for Agents\n# ==================================\n');

    // Check for --no-update flag
    const noUpdate = process.argv.includes('--no-update');

    // Parse --force-<agent> flags
    const KNOWN_AGENTS = ['copilot', 'claude', 'opencode'];
    const forceAgents = new Set(
        KNOWN_AGENTS.filter(a => process.argv.includes(`--force-${a}`))
    );
    const hasForcedAgents = forceAgents.size > 0;

    // Auto-update check
    if (!noUpdate) {
        const config = readConfig();
        const updateInfo = await checkForUpdates();
        
        if (updateInfo.error) {
            console.log('## Update Check\n\n⚠️  Could not check for updates (network issue)\n\n---\n');
        } else if (updateInfo.hasUpdates) {
            console.log('## Update Available\n');
            console.log(`⚠️  Update available: v${updateInfo.localVersion} → v${updateInfo.remoteVersion}\n    To update, run: \`npm install -g @complexthings/superpowers-agent\``);
            console.log('\n---\n');
        }
    }

    // Install universal aliases (skip when targeting specific agents)
    if (!hasForcedAgents) {
        installAliases();
        console.log('---\n');
    }

    // Remove legacy prompt/command files from previous bootstrap versions
    if (!hasForcedAgents) {
        console.log('## Cleaning Up Legacy Files\n');
        removeLegacyPrompts();
        console.log('\n---\n');
    }

    // Install GitHub Copilot integration
    if (!hasForcedAgents || forceAgents.has('copilot')) {
        console.log('## GitHub Copilot Integration\n');
        console.log('✓ Skill symlinks handled in sync step below');
        // Install the sessionStart hook when Copilot CLI is present (or already
        // configured), or when explicitly forced. Avoids creating ~/.copilot for
        // people who never use Copilot CLI.
        const copilotPresent = detectTool('copilot') || existsSync(join(paths.home, '.copilot'));
        if (copilotPresent || forceAgents.has('copilot')) {
            const hookResult = installCopilotSessionHook();
            if (hookResult.created) {
                console.log(`✓ Installed Copilot sessionStart hook -> ${hookResult.path.replace(paths.home, '~')}`);
            } else if (hookResult.updated) {
                console.log(`✓ Updated Copilot sessionStart hook -> ${hookResult.path.replace(paths.home, '~')}`);
            } else if (hookResult.existed) {
                console.log('✓ Copilot sessionStart hook already up to date');
            } else if (hookResult.error) {
                console.log(`⚠️  Failed to install Copilot sessionStart hook: ${hookResult.message}`);
            }
        } else {
            console.log('ℹ️  Skipped Copilot sessionStart hook (Copilot CLI not detected; run with --force-copilot to install anyway)');
        }
        console.log('\n---\n');
    }

    // Install Claude Code integration
    if (!hasForcedAgents || forceAgents.has('claude')) {
        console.log('## Claude Code Integration\n');
        const claudeDetected = toolDetection.claude.check();
        if (!claudeDetected && !forceAgents.has('claude')) {
            console.log(`⚠️  Skipped (${toolDetection.claude.name} CLI not detected)\n💡 To enable Claude Code integration:\n   1. Install Claude Code: ${toolDetection.claude.installUrl}\n   2. Run: superpowers-agent bootstrap --force-claude`);
        } else {
            console.log('✓ Skill symlinks handled in sync step below');
            // Install/refresh the SessionStart hook in ~/.claude/settings.json so the
            // CLI-tools nudge is injected every session, even when Superpowers is
            // installed via npm rather than as a Claude plugin.
            const hookResult = installClaudeSessionHook();
            if (hookResult.created) {
                console.log(`✓ Installed SessionStart hook -> ${paths.claudeSettings.replace(paths.home, '~')}`);
            } else if (hookResult.updated) {
                console.log(`✓ ${hookResult.existed ? 'Refreshed' : 'Added'} SessionStart hook in ${paths.claudeSettings.replace(paths.home, '~')}`);
                if (hookResult.backup) console.log(`  Backed up to ${parse(hookResult.backup).base}`);
            } else if (hookResult.error) {
                console.log(`⚠️  Failed to install SessionStart hook: ${hookResult.message}`);
            }
        }
        console.log('\n---\n');
    }

    // Install OpenCode integration
    if (!hasForcedAgents || forceAgents.has('opencode')) {
        console.log('## OpenCode Integration\n');
        const opencodeDetected = toolDetection.opencode.check();
        if (opencodeDetected) {
            installOpencodePluginSymlink();
        } else {
            console.log(`⚠️  Skipped (${toolDetection.opencode.name} CLI not detected)\n💡 To enable OpenCode integration:\n   1. Install OpenCode: ${toolDetection.opencode.installUrl}\n   2. Run: superpowers-agent ${toolDetection.opencode.bootstrapCommand}`);
        }
        console.log('\n---\n');
    }

    // Generate platform-specific files (skip when targeting specific agents)
    if (!hasForcedAgents) {
        console.log('## Generating Platform-Specific Files\n');
        
        const detectedPlatforms = detectPlatforms();
        console.log(`Detected platforms: ${detectedPlatforms.join(', ') || 'none'}\n`);
        
        const templatePath = join(paths.superpowersRepo, '.agents', 'templates', 'AGENTS.md.template');
        let baseTemplate = '';
        try {
            baseTemplate = readFileSync(templatePath, 'utf8');
        } catch (error) {
            console.log(`⚠️  Could not read AGENTS.md template: ${error.message}\n`);
        }
        
        if (baseTemplate) {
            // Inject current version into template
            const currentVersion = getLocalVersion();
            baseTemplate = baseTemplate.replace(/\{\{VERSION\}\}/g, currentVersion);
            
            // Update global AGENTS.md
            const globalAgentsPath = join(paths.home, '.agents', 'AGENTS.md');
            const globalResult = updatePlatformFile(globalAgentsPath, baseTemplate, detectedPlatforms, true);
            if (globalResult.created) {
                console.log(`✓ Created ${globalAgentsPath}`);
            } else if (globalResult.updated) {
                console.log(`✓ Updated ${globalAgentsPath}`);
            }
        }

        console.log('\n---\n');
    }

    // Remove legacy superpowers directory-level symlinks before syncing
    console.log('## Cleaning Up Legacy Superpowers Dir Symlinks\n');
    removeLegacySuperpowersDirSymlinks();
    console.log('\n---\n');

    // Sync repo skills into ~/.agents/skills/ FIRST
    console.log('## Syncing Repo Skills -> ~/.agents/skills/\n');
    const repoSkillResults = syncRepoSkillSymlinks();
    if (repoSkillResults.created > 0 || repoSkillResults.updated > 0) {
        console.log(`  ✓ ${repoSkillResults.created} created, ${repoSkillResults.updated} updated, ${repoSkillResults.existed} already current`);
    } else if (repoSkillResults.errors.length > 0) {
        for (const err of repoSkillResults.errors) console.log(`  ⚠️  ${err}`);
    } else {
        console.log(`  ✓ ${repoSkillResults.existed} skill symlinks already up to date`);
    }
    console.log('\n---\n');

    // Reconcile only retired links that prove package ownership from their raw target.
    console.log('## Reconciling Retired Repo-Managed Skill Symlinks\n');
    const cleanerResults = runStaleSkillSymlinkCleaner();
    if (cleanerResults.removed.length > 0) {
        console.log(`  ✓ Removed ${cleanerResults.removed.length} retired skill symlink(s):`);
        for (const p of cleanerResults.removed) {
            console.log(`    - ${p}`);
        }
    } else {
        console.log('  ✓ No retired repo-managed skill symlinks found');
    }
    console.log('\n---\n');

    console.log('# Bootstrap Complete!\n');
    console.log('✓ All integrations installed');
    console.log('✓ Skills system ready');
    console.log('✓ Skill symlinks synced\n');
    console.log('Next steps:');
    console.log('  - Use your platform\'s native skill tool to see available skills');
    console.log('  - Run `superpowers-agent setup-skills` in your project directory');
};

export {
    runBootstrap,
    runSetupSkills,
    installAliases,
    updatePlatformFile,
    updateCopilotInstructions
};
