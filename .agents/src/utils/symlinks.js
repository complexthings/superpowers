/**
 * Symlink management for skill directories
 * 
 * Creates and manages symlinks from ~/.agents/skills and ~/.agents/superpowers/skills
 * to platform-specific skill directories (~/.claude/skills/, ~/.copilot/skills/)
 */

import { existsSync, readdirSync, lstatSync, symlinkSync, unlinkSync, mkdirSync, readlinkSync } from 'fs';
import { join, dirname } from 'path';
import { homedir, platform } from 'os';
import { paths } from '../core/paths.js';
import { readConfigFile, writeConfigFile } from '../core/config.js';

/**
 * Platform configurations for skill symlinks
 */
const SKILL_PLATFORMS = [
    {
        name: 'claude',
        parentDir: () => join(homedir(), '.claude'),
        skillsDir: () => join(homedir(), '.claude', 'skills'),
        superpowersTarget: 'superpowers'
    },
    {
        name: 'copilot',
        parentDir: () => join(homedir(), '.copilot'),
        skillsDir: () => join(homedir(), '.copilot', 'skills'),
        superpowersTarget: 'superpowers'
    },
    {
        name: 'opencode',
        parentDir: () => join(homedir(), '.config', 'opencode'),
        skillsDir: () => join(homedir(), '.config', 'opencode', 'skill'),
        superpowersTarget: 'superpowers'
    },
    {
        name: 'cursor',
        parentDir: () => join(homedir(), '.cursor'),
        skillsDir: () => join(homedir(), '.cursor', 'skills'),
        superpowersTarget: 'superpowers'
    },
    {
        name: 'gemini',
        parentDir: () => join(homedir(), '.gemini'),
        skillsDir: () => join(homedir(), '.gemini', 'skills'),
        superpowersTarget: 'superpowers'
    },
    {
        name: 'codex',
        parentDir: () => join(homedir(), '.codex'),
        skillsDir: () => join(homedir(), '.codex', 'skills'),
        superpowersTarget: 'superpowers'
    }
];

/**
 * Project-level platform configurations for skill symlinks
 * These detect agent directories in the project root and create symlinks
 * from agent-specific skill directories TO .agents/skills
 */
const PROJECT_SKILL_PLATFORMS = [
    {
        name: 'claude',
        agentDir: (projectRoot) => join(projectRoot, '.claude'),
        skillsDir: (projectRoot) => join(projectRoot, '.claude', 'skills'),
        detect: (projectRoot) => existsSync(join(projectRoot, '.claude'))
    },
    {
        name: 'copilot',
        agentDir: (projectRoot) => join(projectRoot, '.github'),
        skillsDir: (projectRoot) => join(projectRoot, '.github', 'skills'),
        detect: (projectRoot) => {
            const hasGithub = existsSync(join(projectRoot, '.github'));
            const hasAgentsMd = existsSync(join(projectRoot, 'AGENTS.md')) || 
                               existsSync(join(projectRoot, '.agents', 'AGENTS.md'));
            return hasGithub && hasAgentsMd;
        }
    },
    {
        name: 'opencode',
        agentDir: (projectRoot) => join(projectRoot, '.opencode'),
        skillsDir: (projectRoot) => join(projectRoot, '.opencode', 'skill'), // singular!
        detect: (projectRoot) => {
            const hasOpencode = existsSync(join(projectRoot, '.opencode'));
            const hasAgentsMd = existsSync(join(projectRoot, 'AGENTS.md')) || 
                               existsSync(join(projectRoot, '.agents', 'AGENTS.md')) ||
                               existsSync(join(projectRoot, '.opencode', 'AGENTS.md'));
            return hasOpencode && hasAgentsMd;
        }
    },
    {
        name: 'cursor',
        agentDir: (projectRoot) => join(projectRoot, '.cursor'),
        skillsDir: (projectRoot) => join(projectRoot, '.cursor', 'skills'),
        detect: (projectRoot) => existsSync(join(projectRoot, '.cursor'))
    },
    {
        name: 'gemini',
        agentDir: (projectRoot) => join(projectRoot, '.gemini'),
        skillsDir: (projectRoot) => join(projectRoot, '.gemini', 'skills'),
        detect: (projectRoot) => {
            const hasGemini = existsSync(join(projectRoot, '.gemini'));
            const hasGeminiMd = existsSync(join(projectRoot, 'GEMINI.md')) || 
                               existsSync(join(projectRoot, '.agents', 'GEMINI.md'));
            return hasGemini && hasGeminiMd;
        }
    },
    {
        name: 'codex',
        agentDir: (projectRoot) => join(projectRoot, '.codex'),
        skillsDir: (projectRoot) => join(projectRoot, '.codex', 'skills'),
        detect: (projectRoot) => {
            const hasCodex = existsSync(join(projectRoot, '.codex'));
            const hasAgentsMd = existsSync(join(projectRoot, 'AGENTS.md')) ||
                               existsSync(join(projectRoot, '.agents', 'AGENTS.md'));
            return hasCodex && hasAgentsMd;
        }
    }
];

/**
 * Check if a path is a symlink
 */
const isSymlink = (path) => {
    try {
        return lstatSync(path).isSymbolicLink();
    } catch {
        return false;
    }
};

/**
 * Check if symlink already points to the correct source
 */
const symlinkPointsTo = (linkPath, expectedSource) => {
    try {
        if (!isSymlink(linkPath)) return false;
        const currentTarget = readlinkSync(linkPath);
        return currentTarget === expectedSource;
    } catch {
        return false;
    }
};

/**
 * Create a symlink (cross-platform)
 * 
 * @param {string} source - Source directory to link to
 * @param {string} target - Target symlink path to create
 * @returns {{ created: boolean, existed: boolean, error?: string }}
 */
export const createSymlink = (source, target) => {
    // Check if source exists
    if (!existsSync(source)) {
        return { created: false, existed: false, error: `Source does not exist: ${source}` };
    }

    // Check if symlink already exists and points to correct source
    if (symlinkPointsTo(target, source)) {
        return { created: false, existed: true };
    }

    // If target exists, handle appropriately
    if (existsSync(target) || isSymlink(target)) {
        if (isSymlink(target)) {
            // Remove existing symlink that points elsewhere
            try {
                unlinkSync(target);
            } catch (error) {
                return { created: false, existed: false, error: `Failed to remove existing symlink: ${error.message}` };
            }
        } else {
            // Target exists but is not a symlink - don't overwrite
            return { created: false, existed: false, error: `Target exists and is not a symlink: ${target}` };
        }
    }

    // Ensure parent directory exists
    const parentDir = dirname(target);
    if (!existsSync(parentDir)) {
        try {
            mkdirSync(parentDir, { recursive: true });
        } catch (error) {
            return { created: false, existed: false, error: `Failed to create parent directory: ${error.message}` };
        }
    }

    // Create the symlink
    const plat = platform();
    try {
        if (plat === 'win32') {
            // On Windows, use 'junction' for directories (doesn't require admin)
            symlinkSync(source, target, 'junction');
        } else {
            // On Unix/macOS, use 'dir' type
            symlinkSync(source, target, 'dir');
        }
        return { created: true, existed: false };
    } catch (error) {
        if (plat === 'win32' && error.code === 'EPERM') {
            return { 
                created: false, 
                existed: false, 
                error: 'Windows requires Developer Mode or admin privileges for symlinks. Enable Developer Mode: Settings > Update & Security > For developers'
            };
        }
        return { created: false, existed: false, error: `Failed to create symlink: ${error.message}` };
    }
};

/**
 * Remove a symlink
 * 
 * @param {string} target - Symlink path to remove
 * @returns {{ removed: boolean, error?: string }}
 */
export const removeSymlink = (target) => {
    if (!existsSync(target) && !isSymlink(target)) {
        return { removed: false, error: 'Symlink does not exist' };
    }

    if (!isSymlink(target)) {
        return { removed: false, error: 'Target is not a symlink' };
    }

    try {
        unlinkSync(target);
        return { removed: true };
    } catch (error) {
        return { removed: false, error: `Failed to remove symlink: ${error.message}` };
    }
};

/**
 * Track a symlink in config
 */
const trackSymlink = (platformName, symlinkPath, type = 'skills') => {
    const config = readConfigFile(true); // Global config
    
    if (!config.symlinks) {
        config.symlinks = {};
    }
    
    if (!config.symlinks[platformName]) {
        config.symlinks[platformName] = {
            superpowers: null,
            skills: []
        };
    }
    
    if (type === 'superpowers') {
        config.symlinks[platformName].superpowers = symlinkPath;
    } else {
        const skills = config.symlinks[platformName].skills || [];
        if (!skills.includes(symlinkPath)) {
            skills.push(symlinkPath);
            config.symlinks[platformName].skills = skills;
        }
    }
    
    writeConfigFile(config, true);
};

/**
 * Remove symlink tracking from config
 */
const untrackSymlink = (platformName, symlinkPath, type = 'skills') => {
    const config = readConfigFile(true);
    
    if (!config.symlinks || !config.symlinks[platformName]) {
        return;
    }
    
    if (type === 'superpowers') {
        config.symlinks[platformName].superpowers = null;
    } else {
        const skills = config.symlinks[platformName].skills || [];
        config.symlinks[platformName].skills = skills.filter(s => s !== symlinkPath);
    }
    
    writeConfigFile(config, true);
};

/**
 * Get all tracked symlinks from config
 */
export const getTrackedSymlinks = () => {
    const config = readConfigFile(true);
    return config.symlinks || {};
};

/**
 * Sync superpowers skills symlink for a specific platform
 */
const syncSuperpowersForPlatform = (platform, options = {}) => {
    const source = paths.homeSuperpowersSkills;
    const target = join(platform.skillsDir(), platform.superpowersTarget);
    
    const result = createSymlink(source, target);
    
    if (result.created) {
        trackSymlink(platform.name, target, 'superpowers');
        const shortSource = source.replace(homedir(), '~');
        const shortTarget = target.replace(homedir(), '~');
        console.log(`  ✓ Created ${shortTarget} -> ${shortSource}`);
        return { created: true };
    } else if (result.existed) {
        return { created: false, existed: true };
    } else if (result.error) {
        console.log(`  ⚠️  ${platform.name} superpowers: ${result.error}`);
        return { created: false, error: result.error };
    }
    
    return { created: false };
};

/**
 * Sync personal skills symlinks for a specific platform
 */
const syncPersonalSkillsForPlatform = (platform, options = {}) => {
    const personalSkillsDir = paths.homePersonalSkills;
    
    if (!existsSync(personalSkillsDir)) {
        return { created: 0, existed: 0 };
    }
    
    // Get all skill directories
    let skills;
    try {
        skills = readdirSync(personalSkillsDir, { withFileTypes: true })
            .filter(d => d.isDirectory() && !d.name.startsWith('.'))
            .map(d => d.name);
    } catch {
        return { created: 0, existed: 0 };
    }
    
    if (skills.length === 0) {
        return { created: 0, existed: 0 };
    }
    
    const results = { created: 0, existed: 0, names: [] };
    
    for (const skillName of skills) {
        const source = join(personalSkillsDir, skillName);
        const target = join(platform.skillsDir(), skillName);
        
        const result = createSymlink(source, target);
        
        if (result.created) {
            trackSymlink(platform.name, target, 'skills');
            results.created++;
            results.names.push(skillName);
        } else if (result.existed) {
            results.existed++;
        } else if (result.error) {
            // Log error but continue with other skills
            console.log(`  ⚠️  ${skillName}: ${result.error}`);
        }
    }
    
    if (results.created > 0) {
        console.log(`  ✓ Synced ${results.created} personal skill(s): ${results.names.join(', ')}`);
    }
    
    return results;
};

/**
 * Sync all skill symlinks for all platforms
 * 
 * @param {Object} options - Options
 * @param {boolean} options.force - Create parent directories even if they don't exist
 */
export const syncAllSkillSymlinks = (options = {}) => {
    const { force = false } = options;
    
    for (const platform of SKILL_PLATFORMS) {
        const parentDir = platform.parentDir();
        const skillsDir = platform.skillsDir();
        
        // Check if parent directory exists
        if (!existsSync(parentDir)) {
            if (force) {
                try {
                    mkdirSync(parentDir, { recursive: true });
                    console.log(`✓ Created ${parentDir.replace(homedir(), '~')}`);
                } catch (error) {
                    console.log(`⚠️  Failed to create ${parentDir.replace(homedir(), '~')}: ${error.message}`);
                    continue;
                }
            } else {
                console.log(`⚠️  Skipping ${platform.name} (${parentDir.replace(homedir(), '~')} not found)`);
                console.log(`   Use --force to create directory`);
                continue;
            }
        }
        
        // Ensure skills directory exists
        if (!existsSync(skillsDir)) {
            try {
                mkdirSync(skillsDir, { recursive: true });
            } catch (error) {
                console.log(`⚠️  Failed to create skills directory for ${platform.name}: ${error.message}`);
                continue;
            }
        }
        
        console.log(`${platform.name}:`);
        
        // Sync superpowers skills
        syncSuperpowersForPlatform(platform, options);
        
        // Sync personal skills
        syncPersonalSkillsForPlatform(platform, options);
    }
};

/**
 * Sync only personal skills (called after 'add' command)
 */
export const syncPersonalSkillSymlinks = (options = {}) => {
    const { force = false } = options;
    
    for (const platform of SKILL_PLATFORMS) {
        const parentDir = platform.parentDir();
        const skillsDir = platform.skillsDir();
        
        // Skip if parent doesn't exist and not forcing
        if (!existsSync(parentDir)) {
            if (!force) continue;
            try {
                mkdirSync(parentDir, { recursive: true });
            } catch {
                continue;
            }
        }
        
        // Ensure skills directory exists
        if (!existsSync(skillsDir)) {
            try {
                mkdirSync(skillsDir, { recursive: true });
            } catch {
                continue;
            }
        }
        
        // Sync personal skills only
        syncPersonalSkillsForPlatform(platform, options);
    }
};

/**
 * Clean up stale symlinks (symlinks that no longer have valid sources)
 */
export const cleanupStaleSymlinks = () => {
    const tracked = getTrackedSymlinks();
    const removed = [];
    
    for (const [platformName, platformSymlinks] of Object.entries(tracked)) {
        // Check superpowers symlink
        if (platformSymlinks.superpowers && isSymlink(platformSymlinks.superpowers)) {
            try {
                const target = readlinkSync(platformSymlinks.superpowers);
                if (!existsSync(target)) {
                    removeSymlink(platformSymlinks.superpowers);
                    untrackSymlink(platformName, platformSymlinks.superpowers, 'superpowers');
                    removed.push(platformSymlinks.superpowers);
                }
            } catch {}
        }
        
        // Check skill symlinks
        const skills = platformSymlinks.skills || [];
        for (const skillPath of skills) {
            if (isSymlink(skillPath)) {
                try {
                    const target = readlinkSync(skillPath);
                    if (!existsSync(target)) {
                        removeSymlink(skillPath);
                        untrackSymlink(platformName, skillPath, 'skills');
                        removed.push(skillPath);
                    }
                } catch {}
            }
        }
    }
    
    return removed;
};

/**
 * Sync skill symlinks for project-level agent directories
 * Creates symlinks from agent-specific directories TO .agents/skills
 * e.g., .claude/skills -> .agents/skills
 * 
 * @param {Object} options - Options
 * @param {string} options.projectRoot - Project root directory (defaults to cwd)
 * @returns {{ created: number, existed: number, skipped: number, errors: Array }}
 */
export const syncProjectSkillSymlinks = (options = {}) => {
    const projectRoot = options.projectRoot || process.cwd();
    const agentsSkillsDir = join(projectRoot, '.agents', 'skills');
    
    // Source must exist
    if (!existsSync(agentsSkillsDir)) {
        return { created: 0, existed: 0, skipped: 0, errors: [] };
    }
    
    const results = { created: 0, existed: 0, skipped: 0, errors: [] };
    
    for (const platform of PROJECT_SKILL_PLATFORMS) {
        // Check if platform is detected in this project
        if (!platform.detect(projectRoot)) {
            results.skipped++;
            continue;
        }
        
        const targetDir = platform.skillsDir(projectRoot);
        const agentDir = platform.agentDir(projectRoot);
        
        // Agent directory must exist (we don't create it)
        if (!existsSync(agentDir)) {
            results.skipped++;
            continue;
        }
        
        // Create symlink: targetDir -> agentsSkillsDir
        const result = createSymlink(agentsSkillsDir, targetDir);
        
        if (result.created) {
            const shortTarget = targetDir.replace(projectRoot, '.');
            console.log(`  ✓ Created ${shortTarget} -> .agents/skills`);
            results.created++;
        } else if (result.existed) {
            results.existed++;
        } else if (result.error) {
            console.log(`  ⚠️  ${platform.name}: ${result.error}`);
            results.errors.push({ platform: platform.name, error: result.error });
        }
    }
    
    return results;
};
