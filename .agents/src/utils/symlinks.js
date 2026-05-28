/**
 * Symlink management for skill directories
 * 
 * Creates and manages symlinks from ~/.agents/skills and ~/.agents/superpowers/skills
 * to platform-specific skill directories (~/.claude/skills/, ~/.copilot/skills/)
 */

import { existsSync, readdirSync, lstatSync, symlinkSync, unlinkSync, mkdirSync, readlinkSync } from 'fs';
import { join, dirname, basename } from 'path';
import { homedir, platform } from 'os';
import { paths } from '../core/paths.js';
import { readConfigFile, writeConfigFile } from '../core/config.js';

/**
 * Platform configurations for skill symlinks
 */
export const SKILL_PLATFORMS = [
    {
        name: 'claude',
        parentDir: () => join(homedir(), '.claude'),
        skillsDir: () => join(homedir(), '.claude', 'skills')
    },
    {
        name: 'copilot',
        parentDir: () => join(homedir(), '.copilot'),
        skillsDir: () => join(homedir(), '.copilot', 'skills')
    },
    {
        name: 'opencode',
        parentDir: () => join(homedir(), '.config', 'opencode'),
        skillsDir: () => join(homedir(), '.config', 'opencode', 'skill')
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
export const untrackSymlink = (platformName, symlinkPath, type = 'skills') => {
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
 * Recursively collect all directories that contain a SKILL.md file.
 *
 * @param {string} dir - Directory to scan
 * @param {string[]} results - Accumulator (populated in place)
 */
const collectSkillDirs = (dir, results = []) => {
    let entries;
    try {
        entries = readdirSync(dir, { withFileTypes: true });
    } catch {
        return results;
    }

    let hasSkillMd = false;
    const subdirs = [];

    for (const entry of entries) {
        if (!entry.isDirectory() && entry.name === 'SKILL.md') {
            hasSkillMd = true;
        }
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
            subdirs.push(join(dir, entry.name));
        }
    }

    if (hasSkillMd) {
        results.push(dir);
    }

    for (const subdir of subdirs) {
        collectSkillDirs(subdir, results);
    }

    return results;
};

/**
 * Sync repo skill symlinks into ~/.agents/skills/
 *
 * Scans ./skills in the superpowers repo recursively for any directory
 * containing a SKILL.md file. For each match, creates a symlink:
 *   ~/.agents/skills/<leaf-directory-name> -> <absolute-path-to-skill-directory>
 *
 * - If the symlink already exists and points to the correct source: leave it.
 * - If the symlink exists but points elsewhere: update it.
 * - If no symlink exists: create it.
 *
 * @returns {{ created: number, existed: number, updated: number, errors: string[] }}
 */
export const syncRepoSkillSymlinks = () => {
    const repoSkillsDir = paths.homeSuperpowersSkills; // <repo>/skills
    const targetDir = paths.homePersonalSkills;        // ~/.agents/skills

    if (!existsSync(repoSkillsDir)) {
        return { created: 0, existed: 0, updated: 0, errors: [`Skills directory not found: ${repoSkillsDir}`] };
    }

    // Ensure ~/.agents/skills exists
    if (!existsSync(targetDir)) {
        try {
            mkdirSync(targetDir, { recursive: true });
        } catch (error) {
            return { created: 0, existed: 0, updated: 0, errors: [`Failed to create ${targetDir}: ${error.message}`] };
        }
    }

    const skillDirs = collectSkillDirs(repoSkillsDir);
    const results = { created: 0, existed: 0, updated: 0, errors: [] };

    for (const skillDir of skillDirs) {
        const leafName = basename(skillDir);
        const linkPath = join(targetDir, leafName);

        // Already points to the correct source — nothing to do
        if (symlinkPointsTo(linkPath, skillDir)) {
            results.existed++;
            continue;
        }

        // Stale symlink or wrong target — remove and recreate
        if (isSymlink(linkPath)) {
            try {
                unlinkSync(linkPath);
                results.updated++;
            } catch (error) {
                results.errors.push(`Failed to remove stale symlink ${linkPath}: ${error.message}`);
                continue;
            }
        } else if (existsSync(linkPath)) {
            // Exists but is not a symlink — skip to avoid data loss
            results.errors.push(`Skipped ${linkPath}: path exists and is not a symlink`);
            continue;
        }

        // Create the symlink
        const plat = platform();
        try {
            if (plat === 'win32') {
                symlinkSync(skillDir, linkPath, 'junction');
            } else {
                symlinkSync(skillDir, linkPath, 'dir');
            }
            const shortLink = linkPath.replace(homedir(), '~');
            const shortSrc = skillDir.replace(homedir(), '~');
            console.log(`  ✓ ${shortLink} -> ${shortSrc}`);
            results.created++;
        } catch (error) {
            results.errors.push(`Failed to create symlink ${linkPath}: ${error.message}`);
        }
    }

    return results;
};

