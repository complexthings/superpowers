import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Read skill.json from a directory
 */
export const readSkillJson = (skillDir) => {
    const skillJsonPath = join(skillDir, 'skill.json');
    if (!existsSync(skillJsonPath)) {
        return null;
    }
    
    try {
        const content = readFileSync(skillJsonPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
};

/**
 * Read skill.json from a specified path
 */
export const readSkillJsonFromPath = (path) => {
    const skillJsonPath = join(path, 'skill.json');
    if (!existsSync(skillJsonPath)) {
        return null;
    }
    
    try {
        const content = readFileSync(skillJsonPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Failed to read skill.json: ${error.message}`);
    }
};

/**
 * Parse skill name (handle prefixes like superpowers:, claude:)
 */
export const parseSkillName = (skillName) => {
    if (skillName.startsWith('superpowers:')) {
        return { type: 'superpowers', path: skillName.substring(12).replace(/^skills\//, '') };
    }
    if (skillName.startsWith('claude:')) {
        return { type: 'claude', path: skillName.substring(7).replace(/^skills\//, '') };
    }
    return { type: null, path: skillName.replace(/^skills\//, '') };
};

/**
 * Find helper file in skill directory based on search term
 */
export const findHelperInSkill = (skillDir, helperSearchTerm) => {
    const skillJson = readSkillJson(skillDir);
    
    if (!skillJson || !skillJson.helpers || !Array.isArray(skillJson.helpers)) {
        return null;
    }
    
    const helpers = skillJson.helpers;
    const normalizedSearchTerm = helperSearchTerm.toLowerCase();
    
    // Try to find best match using substring matching
    let bestMatch = null;
    let bestScore = 0;
    
    for (const helper of helpers) {
        const helperLower = helper.toLowerCase();
        
        // Exact match (highest priority)
        if (helperLower === normalizedSearchTerm) {
            bestMatch = helper;
            break;
        }
        
        // Helper contains search term
        if (helperLower.includes(normalizedSearchTerm)) {
            const score = normalizedSearchTerm.length / helperLower.length;
            if (score > bestScore) {
                bestScore = score;
                bestMatch = helper;
            }
        }
        
        // Search term contains helper basename
        const helperBasename = helper.split('/').pop().split('.')[0].toLowerCase();
        if (normalizedSearchTerm.includes(helperBasename)) {
            const score = helperBasename.length / normalizedSearchTerm.length;
            if (score > bestScore) {
                bestScore = score;
                bestMatch = helper;
            }
        }
    }
    
    return bestMatch ? join(skillDir, bestMatch) : null;
};

/**
 * Skill types configuration
 */
export const skillTypes = {
    claude: { dir: 'projectClaudeSkills', prefix: 'claude:' },
    project: { dir: 'projectAgentsSkills', prefix: '' },
    personal: { dir: 'homePersonalSkills', prefix: '' },
    superpowers: { dir: 'homeSuperpowersSkills', prefix: 'superpowers:' }
};
