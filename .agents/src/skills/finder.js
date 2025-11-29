import { existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { paths } from '../core/paths.js';
import { extractFrontmatter } from '../utils/frontmatter.js';
import { skillTypes } from './parser.js';

/**
 * Print skill information with formatting
 */
export const printSkill = (skillPath, sourceType) => {
    const skillFile = join(skillPath, 'SKILL.md');
    const { dir, prefix } = skillTypes[sourceType];
    const relPath = relative(paths[dir], skillPath).replace(/\\/g, '/');
    
    console.log(`${prefix}${relPath}`);
    
    const { description, whenToUse } = extractFrontmatter(skillFile);
    if (description) console.log(`  ${description}`);
    if (whenToUse) console.log(`  When to use: ${whenToUse}`);
    console.log('');
};

/**
 * Find all skills in a directory recursively
 */
export const findSkillsInDir = (dir, sourceType, maxDepth = null) => {
    const skills = [];
    if (!existsSync(dir)) return skills;

    const searchDir = (currentDir, currentDepth) => {
        // If maxDepth is null, recurse indefinitely; otherwise respect the limit
        if (maxDepth !== null && currentDepth > maxDepth) return;

        try {
            const entries = readdirSync(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                // Skip common directories that shouldn't contain skills
                if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.')) {
                    continue;
                }
                
                const skillDir = join(currentDir, entry.name);
                
                // Check if entry is a directory or a symlink pointing to a directory
                let isDir = entry.isDirectory();
                if (entry.isSymbolicLink()) {
                    try {
                        const stats = statSync(skillDir);
                        isDir = stats.isDirectory();
                    } catch {
                        // Broken symlink, skip it
                        continue;
                    }
                }
                
                if (!isDir) continue;
                
                const skillFile = join(skillDir, 'SKILL.md');

                if (existsSync(skillFile)) {
                    skills.push(skillDir);
                }

                // Always recurse into subdirectories (unless maxDepth limit reached)
                if (maxDepth === null || currentDepth < maxDepth) {
                    searchDir(skillDir, currentDepth + 1);
                }
            }
        } catch {
            // Ignore permission errors
        }
    };

    searchDir(dir, 0);
    return skills;
};

/**
 * Find a SKILL.md file in a given path
 */
export const findSkillFile = (searchPath) => {
    const skillMdPath = join(searchPath, 'SKILL.md');
    if (existsSync(skillMdPath)) return skillMdPath;
    if (searchPath.endsWith('SKILL.md') && existsSync(searchPath)) return searchPath;
    return null;
};

/**
 * Find all skills in a directory that match the given suffix
 */
export const findMatchingSkills = (baseDir, skillPath) => {
    if (!existsSync(baseDir)) return [];
    
    const matches = [];
    const normalizedInput = skillPath.toLowerCase().replace(/\\/g, '/');
    
    // Recursively scan directory for SKILL.md files
    const scanDirectory = (dir, relativePath = '') => {
        try {
            const entries = readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = join(dir, entry.name);
                const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
                
                // Check if entry is a directory or a symlink pointing to a directory
                let isDir = entry.isDirectory();
                if (entry.isSymbolicLink()) {
                    try {
                        const stats = statSync(fullPath);
                        isDir = stats.isDirectory();
                    } catch {
                        // Broken symlink, skip it
                        continue;
                    }
                }
                
                // Skip common directories that shouldn't contain skills
                if (isDir && (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.'))) {
                    continue;
                }
                
                if (isDir) {
                    scanDirectory(fullPath, relPath);
                } else if (entry.name === 'SKILL.md') {
                    // The skill path is the parent directory path (relativePath)
                    const skillRelPath = relativePath.toLowerCase().replace(/\\/g, '/');
                    
                    // Match if:
                    // 1. Exact match: "brainstorming" === "brainstorming"
                    // 2. Suffix match: "collaboration/brainstorming".endsWith("brainstorming")
                    // 3. Suffix match: "collaboration/brainstorming".endsWith("collaboration/brainstorming")
                    if (skillRelPath === normalizedInput || 
                        skillRelPath.endsWith('/' + normalizedInput) ||
                        skillRelPath.endsWith(normalizedInput)) {
                        matches.push({
                            file: fullPath,
                            path: relativePath
                        });
                    }
                }
            }
        } catch (error) {
            // Ignore directories we can't read
        }
    };
    
    scanDirectory(baseDir);
    return matches;
};

/**
 * Display error when multiple skills match at the same priority level
 */
export const throwAmbiguousError = (skillPath, matches, sourceType) => {
    const sourceLabel = {
        'project': 'project skills (.agents/skills/)',
        'claude': 'claude skills (.claude/skills/)',
        'personal': 'personal skills (~/.agents/skills/)',
        'superpowers': 'superpowers skills (~/.agents/superpowers/skills/)'
    }[sourceType];
    
    console.log(`Error: Multiple skills match "${skillPath}" in ${sourceLabel}:\n`);
    
    // Load and display each match with its description
    for (const match of matches) {
        const prefix = skillTypes[sourceType].prefix;
        const fullName = prefix + match.path;
        
        try {
            const frontmatter = extractFrontmatter(match.file);
            const description = frontmatter.description || frontmatter.whenToUse || '(no description)';
            console.log(`  ${fullName}`);
            console.log(`    ${description}\n`);
        } catch (error) {
            console.log(`  ${fullName}`);
            console.log(`    (unable to read description)\n`);
        }
    }
    
    console.log(`Please be more specific. Examples:`);
    for (const match of matches.slice(0, 2)) {
        const prefix = skillTypes[sourceType].prefix;
        console.log(`  superpowers-agent execute ${prefix}${match.path}`);
    }
};
