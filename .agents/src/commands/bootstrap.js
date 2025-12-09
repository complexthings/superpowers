/**
 * Bootstrap and setup commands for superpowers-agent
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, parse } from 'path';
import { execSync } from 'child_process';
import { platform } from 'os';
import { paths } from '../core/paths.js';
import { readConfig } from '../core/config.js';
import { checkForUpdates, isOnMainBranch } from '../core/git.js';
import { printVersion, getLocalVersion } from '../utils/output.js';
import { toolDetection, detectPlatforms } from '../core/platform-detection.js';

// Import all integration installers
import { 
    installCopilotPrompts, 
    installCopilotInstructions 
} from '../integrations/copilot.js';
import { 
    installCursorCommands, 
    installCursorHooks 
} from '../integrations/cursor.js';
import { installCodexPrompts } from '../integrations/codex.js';
import { installGeminiCommands } from '../integrations/gemini.js';
import { installClaudeCommands } from '../integrations/claude.js';
import { installOpencodeCommands } from '../integrations/opencode.js';

// Import update function
import { runUpdate } from './update.js';

/**
 * Generate tool mappings for specified platforms
 */
const generateToolMappings = (platforms) => {
    // This is a simplified version - full implementation would read from templates
    const mappings = {
        'github-copilot': 'GitHub Copilot',
        'cursor': 'Cursor',
        'claude-code': 'Claude Code',
        'opencode': 'OpenCode',
        'gemini': 'Gemini',
        'codex': 'Codex'
    };
    
    const lines = platforms.map(p => `**Tool Mapping for ${mappings[p]}:**`);
    return lines.join('\n');
};

/**
 * Update a platform-specific file with skills content
 */
const updatePlatformFile = (filePath, templateContent, platforms, createIfMissing = true) => {
    const fileExists = existsSync(filePath);
    
    // If file doesn't exist and we shouldn't create it, skip
    if (!fileExists && !createIfMissing) {
        return { updated: false, created: false, skipped: true };
    }
    
    // Generate tool mappings for the specified platforms
    const toolMappings = generateToolMappings(platforms);
    
    // Replace placeholder in template
    let content = templateContent.replace(/\{\{TOOL_MAPPINGS\}\}/g, toolMappings);
    
    // Replace other placeholders
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
    
    const rootGeminiMdPath = join(projectRoot, 'GEMINI.md');
    const dotAgentsGeminiMdPath = join(agentsDir, 'GEMINI.md');
    if (existsSync(rootGeminiMdPath) || existsSync(dotAgentsGeminiMdPath) || toolDetection.gemini.check()) {
        projectPlatforms.push('gemini');
    }
    
    if (toolDetection.cursor.check()) projectPlatforms.push('cursor');
    if (toolDetection.opencode.check()) projectPlatforms.push('opencode');
    if (toolDetection.codex.check()) projectPlatforms.push('codex');
    
    console.log(`\nDetected platforms for project: ${projectPlatforms.join(', ') || 'none'}\n`);
    
    // Update AGENTS.md
    const agentsPlatforms = projectPlatforms.filter(p => ['github-copilot', 'cursor', 'opencode', 'codex'].includes(p));
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

    console.log(`\n# Setup complete!\n\nYour project now has:
  - .agents/ directory structure
  - AGENTS.md with universal skills instructions
  - .agents/skills/ ready for project-specific skills\n`);
};

/**
 * Command: bootstrap [--no-update]
 * Run complete bootstrap process
 */
const runBootstrap = () => {
    printVersion();
    console.log('# Superpowers Bootstrap for Agents\n# ==================================\n');

    // Check for --no-update flag
    const noUpdate = process.argv.includes('--no-update');

    // Auto-update check
    if (!noUpdate) {
        const config = readConfig();
        const updateInfo = checkForUpdates();
        
        if (updateInfo.error) {
            console.log('## Update Check\n\n⚠️  Could not check for updates (network issue)\n\n---\n');
        } else if (updateInfo.hasUpdates) {
            if (config.auto_update && !updateInfo.hasLocalChanges && isOnMainBranch()) {
                console.log('## Auto-Update\n');
                runUpdate();
                console.log('\n---\n');
            } else {
                console.log('## Update Available\n');
                if (updateInfo.hasLocalChanges) {
                    console.log('⚠️  Your superpowers installation is behind the latest version.\n    Cannot auto-update: local changes detected\n    To update, commit/stash changes then run: `superpowers-agent update`');
                } else if (!isOnMainBranch()) {
                    console.log('⚠️  Your superpowers installation is behind the latest version.\n    Cannot auto-update: not on main branch\n    To update, switch to main then run: `superpowers-agent update`');
                } else {
                    console.log(`⚠️  Your superpowers installation is behind the latest version.\n    To update, run: \`superpowers-agent update\`\n    Or enable auto-update: \`superpowers-agent config-set auto_update true\``);
                }
                console.log('\n---\n');
            }
        }
    }

    // Install universal aliases
    installAliases();
    console.log('---\n');

    // Install GitHub Copilot integration
    console.log('## GitHub Copilot Integration\n');
    installCopilotPrompts();
    console.log('');
    installCopilotInstructions();
    console.log('\n---\n');

    // Install Cursor integration
    console.log('## Cursor Integration\n');
    installCursorCommands();
    console.log('');
    installCursorHooks();
    console.log('\n---\n');

    // Install Codex integration
    console.log('## OpenAI Codex Integration\n');
    const codexDetected = toolDetection.codex.check();
    if (codexDetected) {
        installCodexPrompts();
    } else {
        console.log(`⚠️  Skipped (${toolDetection.codex.name} CLI not detected)\n💡 To enable Codex integration:\n   1. Install Codex: ${toolDetection.codex.installUrl}\n   2. Run: superpowers-agent ${toolDetection.codex.bootstrapCommand}`);
    }
    console.log('\n---\n');

    // Install Gemini integration
    console.log('## Gemini Integration\n');
    const geminiDetected = toolDetection.gemini.check();
    if (geminiDetected) {
        installGeminiCommands();
    } else {
        console.log(`⚠️  Skipped (${toolDetection.gemini.name} CLI not detected)\n💡 To enable Gemini integration:\n   1. Install Gemini: ${toolDetection.gemini.installUrl}\n   2. Run: superpowers-agent ${toolDetection.gemini.bootstrapCommand}`);
    }
    console.log('\n---\n');

    // Install Claude Code integration
    console.log('## Claude Code Integration\n');
    const claudeDetected = toolDetection.claude.check();
    if (claudeDetected) {
        installClaudeCommands();
    } else {
        console.log(`⚠️  Skipped (${toolDetection.claude.name} CLI not detected)\n💡 To enable Claude Code integration:\n   1. Install Claude Code: ${toolDetection.claude.installUrl}\n   2. Run: superpowers-agent ${toolDetection.claude.bootstrapCommand}`);
    }
    console.log('\n---\n');

    // Install OpenCode integration
    console.log('## OpenCode Integration\n');
    const opencodeDetected = toolDetection.opencode.check();
    if (opencodeDetected) {
        installOpencodeCommands();
    } else {
        console.log(`⚠️  Skipped (${toolDetection.opencode.name} CLI not detected)\n💡 To enable OpenCode integration:\n   1. Install OpenCode: ${toolDetection.opencode.installUrl}\n   2. Run: superpowers-agent ${toolDetection.opencode.bootstrapCommand}`);
    }
    console.log('\n---\n');

    // Generate platform-specific files
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
    console.log('# Bootstrap Complete!\n');
    console.log('✓ All integrations installed');
    console.log('✓ Skills system ready\n');
    console.log('Next steps:');
    console.log('  - Run `superpowers-agent find-skills` to see available skills');
    console.log('  - Run `superpowers-agent setup-skills` in your project directory');
};

export {
    runBootstrap,
    runSetupSkills,
    installAliases,
    updatePlatformFile
};
