import { dirname } from 'path';
import { extractSkillContent } from '../utils/frontmatter.js';
import { skillTypes } from './parser.js';
import { locateSkillByNameOrAlias } from './locator.js';

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

/**
 * Command: use-skill <skill-name>
 * Load and display a skill for the agent to use
 */
export const runUseSkill = (skillName) => {
    if (!skillName) {
        console.log(`Usage: superpowers-agent use-skill <skill-name>

Examples (smart matching):
  superpowers-agent use-skill brainstorming              # Matches superpowers:collaboration/brainstorming
  superpowers-agent use-skill collaboration/brainstorming # More specific suffix
  superpowers-agent use-skill test-driven-development    # Matches superpowers:testing/test-driven-development

Examples (explicit paths):
  superpowers-agent use-skill superpowers:collaboration/brainstorming  # Full superpowers skill path
  superpowers-agent use-skill claude:email-assistant                   # Full claude skill path
  superpowers-agent use-skill my-custom-skill                          # Project skill

Smart matching:
  - Type just the skill name or any suffix of the path
  - Priority: .agents/skills/ > .claude/skills/ > ~/.agents/skills/ > ~/.agents/superpowers/skills/
  - If multiple skills match at same priority, you'll see them with descriptions`);
        return;
    }

    const location = locateSkillByNameOrAlias(skillName);
    
    if (!location) {
        console.log(`Error: Skill not found: ${skillName}\n\nAvailable skills:`);
        // Note: This would need runFindSkills imported, but to avoid circular dependency,
        // we'll just show the error message
        console.log('Run: superpowers-agent find-skills');
        return;
    }

    const { skillFile, sourceType, actualSkillPath } = location;
    
    try {
        const { content, frontmatter } = extractSkillContent(skillFile);
        const displayName = skillTypes[sourceType].prefix + actualSkillPath;
        const skillDirectory = dirname(skillFile);

        // Display skill header
        let header = `# ${frontmatter.name || displayName}`;
        if (frontmatter.description) header += `\n# ${frontmatter.description}`;
        if (frontmatter.whenToUse) header += `\n# When to use: ${frontmatter.whenToUse}`;
        header += `\n# Supporting tools and docs are in ${skillDirectory}\n# ============================================\n\n${content}`;
        
        console.log(header);
    } catch (error) {
        console.log(error.message);
    }
};
