import { existsSync } from 'fs';
import { join, relative } from 'path';
import { paths } from '../core/paths.js';
import { parseSkillName, readSkillJson } from './parser.js';
import { findMatchingSkills, findSkillsInDir, throwAmbiguousError } from './finder.js';

/**
 * Locate a skill by name with priority-based search
 */
export const locateSkill = (skillName) => {
    const { type, path: actualSkillPath } = parseSkillName(skillName);
    
    // Map type to directory path
    const typeToDirMap = {
        'superpowers': paths.homeSuperpowersSkills,
        'claude': paths.projectClaudeSkills,
        'project': paths.projectAgentsSkills,
        'personal': paths.homePersonalSkills
    };
    
    // Build search order
    let searchOrder;
    if (type) {
        searchOrder = [{ type, dir: typeToDirMap[type] }];
    } else {
        // Default search order - check if we're in superpowers repo
        if (paths.isSuperpowersRepo && existsSync(paths.projectSkillsDir)) {
            // When in superpowers repo, treat skills/ as highest priority "project" source
            searchOrder = [
                { type: 'project', dir: paths.projectSkillsDir },
                { type: 'project', dir: paths.projectAgentsSkills },
                { type: 'claude', dir: paths.projectClaudeSkills },
                { type: 'personal', dir: paths.homePersonalSkills },
                { type: 'superpowers', dir: paths.homeSuperpowersSkills }
            ];
        } else {
            searchOrder = [
                { type: 'project', dir: paths.projectAgentsSkills },
                { type: 'claude', dir: paths.projectClaudeSkills },
                { type: 'personal', dir: paths.homePersonalSkills },
                { type: 'superpowers', dir: paths.homeSuperpowersSkills }
            ];
        }
    }

    // For each priority level, find all matching skills
    for (const { type: sourceType, dir } of searchOrder) {
        const matches = findMatchingSkills(dir, actualSkillPath);
        
        if (matches.length === 1) {
            // Unique match found - return it
            return { 
                skillFile: matches[0].file, 
                sourceType, 
                actualSkillPath: matches[0].path 
            };
        }
        
        if (matches.length > 1) {
            // Multiple matches at same priority level - error
            throwAmbiguousError(actualSkillPath, matches, sourceType);
        }
        
        // No matches at this level - continue to next priority
    }

    return null;
};

/**
 * Locate skill by name or alias with fallback to alias search
 */
export const locateSkillByNameOrAlias = (skillIdentifier) => {
    // First try normal skill location
    const location = locateSkill(skillIdentifier);
    if (location) {
        return location;
    }
    
    // If not found, search for aliases in skill.json files
    const { type, path: actualSkillPath } = parseSkillName(skillIdentifier);
    
    // Build search order
    let searchOrder;
    if (type) {
        searchOrder = [{ type, dir: {
            'superpowers': paths.homeSuperpowersSkills,
            'claude': paths.projectClaudeSkills,
            'project': paths.projectAgentsSkills,
            'personal': paths.homePersonalSkills
        }[type] }];
    } else {
        // Default search order - check if we're in superpowers repo
        if (paths.isSuperpowersRepo && existsSync(paths.projectSkillsDir)) {
            searchOrder = [
                { type: 'project', dir: paths.projectSkillsDir },
                { type: 'project', dir: paths.projectAgentsSkills },
                { type: 'claude', dir: paths.projectClaudeSkills },
                { type: 'personal', dir: paths.homePersonalSkills },
                { type: 'superpowers', dir: paths.homeSuperpowersSkills }
            ];
        } else {
            searchOrder = [
                { type: 'project', dir: paths.projectAgentsSkills },
                { type: 'claude', dir: paths.projectClaudeSkills },
                { type: 'personal', dir: paths.homePersonalSkills },
                { type: 'superpowers', dir: paths.homeSuperpowersSkills }
            ];
        }
    }
    
    // Search through all skill directories for matching aliases
    for (const { type: sourceType, dir } of searchOrder) {
        if (!existsSync(dir)) continue;
        
        const skills = findSkillsInDir(dir, sourceType, null);
        
        for (const skillPath of skills) {
            const skillJson = readSkillJson(skillPath);
            
            if (skillJson && skillJson.aliases && Array.isArray(skillJson.aliases)) {
                const normalizedIdentifier = actualSkillPath.toLowerCase();
                
                for (const alias of skillJson.aliases) {
                    if (alias.toLowerCase() === normalizedIdentifier) {
                        const skillFile = join(skillPath, 'SKILL.md');
                        const relPath = relative(dir, skillPath);
                        return {
                            skillFile,
                            sourceType,
                            actualSkillPath: relPath
                        };
                    }
                }
            }
        }
    }
    
    return null;
};
