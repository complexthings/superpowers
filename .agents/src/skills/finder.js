import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { extractFrontmatter } from '../utils/frontmatter.js';
import { skillTypes } from './parser.js';

/**
 * Find all skills in a directory that match the given suffix
 */
export const findMatchingSkills = (baseDir, skillPath) => {
    if (!existsSync(baseDir)) return [];

    const matches = [];
    const normalizedInput = skillPath.toLowerCase().replace(/\\/g, '/');

    const scanDirectory = (dir, relativePath = '') => {
        try {
            const entries = readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = join(dir, entry.name);
                const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

                let isDir = entry.isDirectory();
                if (entry.isSymbolicLink()) {
                    try {
                        isDir = statSync(fullPath).isDirectory();
                    } catch {
                        continue;
                    }
                }

                if (isDir && (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.'))) {
                    continue;
                }

                if (isDir) {
                    scanDirectory(fullPath, relPath);
                } else if (entry.name === 'SKILL.md') {
                    const skillRelPath = relativePath.toLowerCase().replace(/\\/g, '/');
                    if (skillRelPath === normalizedInput ||
                        skillRelPath.endsWith('/' + normalizedInput) ||
                        skillRelPath.endsWith(normalizedInput)) {
                        matches.push({ file: fullPath, path: relativePath });
                    }
                }
            }
        } catch {
            // Ignore directories we can't read.
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
        'copilot': 'copilot skills (.copilot/skills/)',
        'opencode': 'opencode skills (.opencode/skill/)',
        'personal': 'personal skills (~/.agents/skills/)',
        'personalClaude': 'personal claude skills (~/.claude/skills/)',
        'personalCopilot': 'personal copilot skills (~/.copilot/skills/)',
        'personalOpencode': 'personal opencode skills (~/.config/opencode/skill/)',
        'superpowers': 'superpowers skills (~/.agents/superpowers/skills/)'
    }[sourceType];

    console.log(`Error: Multiple skills match "${skillPath}" in ${sourceLabel}:\n`);

    for (const match of matches) {
        const prefix = skillTypes[sourceType].prefix;
        const fullName = prefix + match.path;

        try {
            const frontmatter = extractFrontmatter(match.file);
            const description = frontmatter.description || frontmatter.whenToUse || '(no description)';
            console.log(`  ${fullName}`);
            console.log(`    ${description}\n`);
        } catch {
            console.log(`  ${fullName}`);
            console.log(`    (unable to read description)\n`);
        }
    }

    console.log("Please choose one of these skill names in your platform's native skill tool.");
};
