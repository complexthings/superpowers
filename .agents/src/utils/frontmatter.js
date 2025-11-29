import { readFileSync } from 'fs';

/**
 * Extract frontmatter from a SKILL.md file
 * @param {string} filePath - Path to the SKILL.md file
 * @returns {Object} Frontmatter object with name, description, whenToUse
 */
export const extractFrontmatter = (filePath) => {
    try {
        const content = readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const frontmatter = { name: '', description: '', whenToUse: '' };
        let inFrontmatter = false;

        for (const line of lines) {
            if (line.trim() === '---') {
                if (inFrontmatter) break;
                inFrontmatter = true;
                continue;
            }

            if (inFrontmatter) {
                const match = line.match(/^(\w+):\s*(.*)$/);
                if (match) {
                    const [, key, value] = match;
                    const fieldMap = {
                        'name': 'name',
                        'description': 'description',
                        'when_to_use': 'whenToUse'
                    };
                    if (fieldMap[key]) {
                        frontmatter[fieldMap[key]] = value.trim();
                    }
                }
            }
        }

        return frontmatter;
    } catch {
        return { name: '', description: '', whenToUse: '' };
    }
};

/**
 * Extract skill content (excluding frontmatter)
 * @param {string} skillFile - Path to SKILL.md file
 * @returns {Object} Object with content and frontmatter
 */
export const extractSkillContent = (skillFile) => {
    try {
        const fullContent = readFileSync(skillFile, 'utf8');
        const frontmatter = extractFrontmatter(skillFile);
        
        const lines = fullContent.split('\n');
        let inFrontmatter = false;
        let frontmatterEnded = false;
        const contentLines = [];

        for (const line of lines) {
            if (line.trim() === '---') {
                if (inFrontmatter) {
                    frontmatterEnded = true;
                    continue;
                }
                inFrontmatter = true;
                continue;
            }

            if (frontmatterEnded || !inFrontmatter) {
                contentLines.push(line);
            }
        }

        return {
            content: contentLines.join('\n').trim(),
            frontmatter
        };
    } catch (error) {
        throw new Error(`Error reading skill file: ${error.message}`);
    }
};
