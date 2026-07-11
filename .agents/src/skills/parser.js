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
    if (skillName.startsWith('copilot:')) {
        return { type: 'copilot', path: skillName.substring(8).replace(/^skills\//, '') };
    }
    if (skillName.startsWith('opencode:')) {
        return { type: 'opencode', path: skillName.substring(9).replace(/^skills\//, '') };
    }
    return { type: null, path: skillName.replace(/^skills\//, '') };
};

/**
 * Skill types configuration
 */
export const skillTypes = {
    project: { dir: 'projectAgentsSkills', prefix: '' },
    claude: { dir: 'projectClaudeSkills', prefix: 'claude:' },
    copilot: { dir: 'projectCopilotSkills', prefix: 'copilot:' },
    opencode: { dir: 'projectOpencodeSkills', prefix: 'opencode:' },
    personal: { dir: 'homePersonalSkills', prefix: '' },
    personalClaude: { dir: 'homeClaudeSkills', prefix: 'claude:' },
    personalCopilot: { dir: 'homeCopilotSkills', prefix: 'copilot:' },
    personalOpencode: { dir: 'homeOpencodeSkills', prefix: 'opencode:' },
    superpowers: { dir: 'homeSuperpowersSkills', prefix: 'superpowers:' }
};
