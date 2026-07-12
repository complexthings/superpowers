import { dirname } from 'path';
import { extractSkillContent } from '../utils/frontmatter.js';
import { skillTypes } from './parser.js';

/**
 * Format and display skill for execution
 * @param {string} skillFile - Path to SKILL.md file
 * @param {string} sourceType - Type of skill source (project, claude, personal, superpowers)
 * @param {string} actualSkillPath - Relative path to skill
 * @returns {string} Formatted skill content
 */
export const formatSkillForExecution = (skillFile, sourceType, actualSkillPath) => {
    const { content, frontmatter } = extractSkillContent(skillFile);
    const displayName = skillTypes[sourceType].prefix + actualSkillPath;
    const skillDirectory = dirname(skillFile);

    // Display skill header
    let header = `# ${frontmatter.name || displayName}`;
    if (frontmatter.description) header += `\n# ${frontmatter.description}`;
    if (frontmatter.whenToUse) header += `\n# When to use: ${frontmatter.whenToUse}`;
    header += `\n# Supporting tools and docs are in ${skillDirectory}\n# ============================================\n\n${content}`;
    
    return header;
};
