import { existsSync } from 'fs';
import { paths } from '../core/paths.js';
import { parseSkillName } from './parser.js';
import { findMatchingSkills, throwAmbiguousError } from './finder.js';

/**
 * Locate a skill by name with priority-based search
 */
export const locateSkill = (skillName) => {
    const { type, path: actualSkillPath } = parseSkillName(skillName);

    const typeToDirMap = {
        'superpowers': [paths.homeSuperpowersSkills],
        'claude': [paths.projectClaudeSkills, paths.homeClaudeSkills],
        'copilot': [paths.projectCopilotSkills, paths.homeCopilotSkills],
        'opencode': [paths.projectOpencodeSkills, paths.homeOpencodeSkills],
        'project': [paths.projectAgentsSkills],
        'personal': [paths.homePersonalSkills]
    };

    let searchOrder;
    if (type) {
        searchOrder = (typeToDirMap[type] || []).map(dir => ({ type, dir }));
    } else if (paths.isSuperpowersRepo && existsSync(paths.projectSkillsDir)) {
        searchOrder = [
            { type: 'project', dir: paths.projectSkillsDir },
            { type: 'project', dir: paths.projectAgentsSkills },
            { type: 'claude', dir: paths.projectClaudeSkills },
            { type: 'copilot', dir: paths.projectCopilotSkills },
            { type: 'opencode', dir: paths.projectOpencodeSkills },
            { type: 'personal', dir: paths.homePersonalSkills },
            { type: 'personalClaude', dir: paths.homeClaudeSkills },
            { type: 'personalCopilot', dir: paths.homeCopilotSkills },
            { type: 'personalOpencode', dir: paths.homeOpencodeSkills },
            { type: 'superpowers', dir: paths.homeSuperpowersSkills }
        ];
    } else {
        searchOrder = [
            { type: 'project', dir: paths.projectAgentsSkills },
            { type: 'claude', dir: paths.projectClaudeSkills },
            { type: 'copilot', dir: paths.projectCopilotSkills },
            { type: 'opencode', dir: paths.projectOpencodeSkills },
            { type: 'personal', dir: paths.homePersonalSkills },
            { type: 'personalClaude', dir: paths.homeClaudeSkills },
            { type: 'personalCopilot', dir: paths.homeCopilotSkills },
            { type: 'personalOpencode', dir: paths.homeOpencodeSkills },
            { type: 'superpowers', dir: paths.homeSuperpowersSkills }
        ];
    }

    for (const { type: sourceType, dir } of searchOrder) {
        const matches = findMatchingSkills(dir, actualSkillPath);

        if (matches.length === 1) {
            return {
                skillFile: matches[0].file,
                sourceType,
                actualSkillPath: matches[0].path
            };
        }

        if (matches.length > 1) {
            throwAmbiguousError(actualSkillPath, matches, sourceType);
        }
    }

    return null;
};
