/**
 * Simple command handlers for superpowers-agent
 */

import { relative, dirname, join } from 'path';
import { existsSync } from 'fs';
import { paths } from '../core/paths.js';
import { extractFrontmatter } from '../utils/frontmatter.js';
import { findSkillsInDir } from '../skills/finder.js';
import { locateSkillByNameOrAlias } from '../skills/locator.js';
import { readSkillJson, findHelperInSkill } from '../skills/parser.js';
import { readConfig, writeConfig, getRepositories } from '../core/config.js';
import { printVersion } from '../utils/output.js';

// Skill type definitions for display
const skillTypes = {
    project: { dir: 'projectAgentsSkills', prefix: '' },
    claude: { dir: 'projectClaudeSkills', prefix: 'claude:' },
    copilot: { dir: 'projectCopilotSkills', prefix: 'copilot:' },
    opencode: { dir: 'projectOpencodeSkills', prefix: 'opencode:' },
    gemini: { dir: 'projectGeminiSkills', prefix: 'gemini:' },
    personal: { dir: 'homePersonalSkills', prefix: '' },
    personalClaude: { dir: 'homeClaudeSkills', prefix: 'claude:' },
    personalCopilot: { dir: 'homeCopilotSkills', prefix: 'copilot:' },
    personalOpencode: { dir: 'homeOpencodeSkills', prefix: 'opencode:' },
    personalGemini: { dir: 'homeGeminiSkills', prefix: 'gemini:' },
    superpowers: { dir: 'homeSuperpowersSkills', prefix: 'superpowers:' }
};

/**
 * Print a single skill with its metadata
 */
const printSkill = (skillPath, sourceType) => {
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
 * Command: find-skills
 * Lists all available skills across all sources
 */
const runFindSkills = () => {
    printVersion();
    const foundSkills = new Set();
    
    // Skill discovery order (priority: project tier > personal tier > superpowers)
    // Within each tier, first directory wins. maxDepth: null means unlimited recursion.
    const discoveryOrder = [
        // Project tier
        { type: 'project', dir: paths.projectAgentsSkills, maxDepth: null },
        { type: 'claude', dir: paths.projectClaudeSkills, maxDepth: null },
        { type: 'copilot', dir: paths.projectCopilotSkills, maxDepth: null },
        { type: 'opencode', dir: paths.projectOpencodeSkills, maxDepth: null },
        { type: 'gemini', dir: paths.projectGeminiSkills, maxDepth: null },
        // Personal tier
        { type: 'personal', dir: paths.homePersonalSkills, maxDepth: null },
        { type: 'personalClaude', dir: paths.homeClaudeSkills, maxDepth: null },
        { type: 'personalCopilot', dir: paths.homeCopilotSkills, maxDepth: null },
        { type: 'personalOpencode', dir: paths.homeOpencodeSkills, maxDepth: null },
        { type: 'personalGemini', dir: paths.homeGeminiSkills, maxDepth: null },
        // Superpowers tier
        { type: 'superpowers', dir: paths.homeSuperpowersSkills, maxDepth: null }
    ];

    for (const { type, dir, maxDepth } of discoveryOrder) {
        const skills = findSkillsInDir(dir, type, maxDepth);
        for (const skillPath of skills) {
            const relPath = relative(dir, skillPath);
            if (!foundSkills.has(relPath)) {
                foundSkills.add(relPath);
                printSkill(skillPath, type);
            }
        }
    }

    console.log(`Usage:
  superpowers-agent execute <skill-name> # Load a specific skill`);
};

/**
 * Command: execute <skill-name>
 * Instructs the agent to execute a specific skill
 */
const runExecute = () => {
    printVersion();
    const skillName = process.argv[3];
    
    if (!skillName) {
        console.log(`Usage: superpowers-agent execute <skill-name-or-alias>

Examples:
  superpowers-agent execute brainstorming
  superpowers-agent execute superpowers:collaboration/brainstorming
  superpowers-agent execute aem/block-collection-and-party
  superpowers-agent execute block-collection  # Using alias

Description:
  Instructs the agent to execute the specified skill.
  Supports skill aliases defined in skill.json files.`);
        return;
    }
    
    // Locate the skill (supporting aliases)
    const location = locateSkillByNameOrAlias(skillName);
    
    if (!location) {
        console.log(`Error: Skill not found: ${skillName}\n\nAvailable skills:`);
        runFindSkills();
        return;
    }
    
    const { skillFile, sourceType } = location;
    
    // Determine if skill is workspace-accessible
    const cwd = process.cwd();
    const isWorkspaceRelative = skillFile.startsWith(cwd);
    
    // Check if we're in a workspace context with project skills
    const hasProjectSkills = existsSync(paths.projectAgentsSkills) || existsSync(paths.projectClaudeSkills);
    
    // Output instruction based on accessibility
    if (isWorkspaceRelative) {
        // Skill is in workspace - all Read tools should work
        console.log(`Open this file with your Read Tool: ${skillFile}

<IMPORTANT>
USE YOUR Read Tool to process this file. DO NOT use \`cat\` or print commands.
</IMPORTANT>`);
    } else if (hasProjectSkills && sourceType !== 'project') {
        // Workspace has project skills but we're using a global skill
        // Suggest using workspace copy if available
        console.log(`Open this file with your Read Tool: ${skillFile}

<IMPORTANT>
1. Try using your Read Tool first
2. If your Read tool fails (file outside workspace), use: cat "${skillFile}"
3. Consider using workspace-local skills for better tool compatibility
   Run: superpowers-agent setup-skills
</IMPORTANT>`);
    } else {
        // Global skill and no project alternative
        console.log(`Open this file with your Read Tool: ${skillFile}

<IMPORTANT>
1. Try using your Read Tool first
2. If your Read tool fails (file outside workspace), use: cat "${skillFile}"
3. NEVER skip loading the skill content
</IMPORTANT>`);
    }
};

/**
 * Command: path <skill-name>
 * Returns the file path to a skill's SKILL.md file
 */
const runPath = () => {
    const skillName = process.argv[3];
    
    if (!skillName) {
        console.log(`Usage: superpowers-agent path <skill-name-or-alias>

Examples:
  superpowers-agent path brainstorming
  superpowers-agent path superpowers:collaboration/brainstorming
  superpowers-agent path aem/block-collection-and-party
  superpowers-agent path block-collection  # Using alias

Description:
  Outputs the file system path of the specified SKILL.md file.
  Supports skill aliases defined in skill.json files.`);
        return;
    }
    
    // Locate the skill (supporting aliases)
    const location = locateSkillByNameOrAlias(skillName);
    
    if (!location) {
        console.log(`Error: Skill not found: ${skillName}\n\nAvailable skills:`);
        runFindSkills();
        return;
    }
    
    const { skillFile } = location;
    
    // Output the SKILL.md file path
    console.log(skillFile);
};

/**
 * Command: dir <skill-name>
 * Returns the directory path where a skill is located
 */
const runDir = () => {
    const skillName = process.argv[3];
    
    if (!skillName) {
        console.log(`Usage: superpowers-agent dir <skill-name>

Examples:
  superpowers-agent dir brainstorming
  superpowers-agent dir aem/block-collection-and-party
  superpowers-agent dir block-collection  # Using alias
  superpowers-agent dir superpowers:testing/test-driven-development

Description:
  Returns the directory path where the specified skill is located.
  Supports skill aliases defined in skill.json files.`);
        return;
    }
    
    // Locate the skill (supporting aliases)
    const location = locateSkillByNameOrAlias(skillName);
    
    if (!location) {
        console.log(`Error: Skill not found: ${skillName}\n\nAvailable skills:`);
        runFindSkills();
        return;
    }
    
    const { skillFile } = location;
    const skillDir = dirname(skillFile);
    
    // Output the directory path
    console.log(skillDir);
};

/**
 * Command: get-helpers <skill-name> <helper-search-term>
 * Searches for helper files within a skill's configuration
 */
const runGetHelpers = () => {
    printVersion();
    const skillName = process.argv[3];
    const helperSearchTerm = process.argv[4];
    
    if (!skillName || !helperSearchTerm) {
        console.log(`Usage: superpowers-agent get-helpers <skill-name> <helper-search-term>

Examples:
  superpowers-agent get-helpers block-collection search-block
  superpowers-agent get-helpers aem/block-collection-and-party get-block-structure
  superpowers-agent get-helpers superpowers:testing/test-driven-development example

Description:
  Searches for helper files within a skill's skill.json configuration.
  Returns the full path to the best matching helper file.
  
  The command uses the skill's aliases if available, so you can use
  short names like "block-collection" instead of the full path.`);
        return;
    }
    
    // Locate the skill (supporting aliases)
    const location = locateSkillByNameOrAlias(skillName);
    
    if (!location) {
        console.log(`Error: Skill not found: ${skillName}\n\nAvailable skills:`);
        runFindSkills();
        return;
    }
    
    const { skillFile } = location;
    const skillDir = dirname(skillFile);
    
    // Check if skill.json exists
    const skillJson = readSkillJson(skillDir);
    
    if (!skillJson) {
        console.log(`Error: No skill.json found for skill: ${skillName}\n  Location: ${skillDir}`);
        return;
    }
    
    if (!skillJson.helpers || !Array.isArray(skillJson.helpers) || skillJson.helpers.length === 0) {
        console.log(`Error: No helpers defined in skill.json for skill: ${skillName}\n  Location: ${skillDir}`);
        return;
    }
    
    // Find the best matching helper
    const helperPath = findHelperInSkill(skillDir, helperSearchTerm);
    
    if (!helperPath) {
        console.log(`Error: No helper found matching "${helperSearchTerm}" in skill: ${skillName}`);
        console.log(`\nAvailable helpers:`);
        for (const helper of skillJson.helpers) {
            console.log(`  - ${helper}`);
        }
        return;
    }
    
    // Verify the helper file exists
    if (!existsSync(helperPath)) {
        console.log(`Error: Helper file not found: ${helperPath}\n  Defined in skill.json but missing from filesystem`);
        return;
    }
    
    // Output the full path
    console.log(helperPath);
};

/**
 * Command: config-get
 * Shows current configuration
 */
const runConfigGet = () => {
    const config = readConfig();
    console.log('Current configuration:');
    console.log(JSON.stringify(config, null, 2));
};

/**
 * Command: config-set <key> <value>
 * Sets a configuration value
 */
const runConfigSet = () => {
    const key = process.argv[3];
    const value = process.argv[4];
    
    if (!key || value === undefined) {
        console.log(`Usage: .agents/superpowers-agent config-set <key> <value>

Available keys:
  auto_update (true/false) - Enable/disable automatic updates during bootstrap

Examples:
  .agents/superpowers-agent config-set auto_update false
  .agents/superpowers-agent config-set auto_update true`);
        return;
    }
    
    // Parse boolean strings
    let parsedValue = value;
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    
    const updates = {};
    updates[key] = parsedValue;
    writeConfig(updates);
    
    console.log(`✓ Set ${key} = ${parsedValue}`);
};

/**
 * Command: list-repositories
 * Display all configured repository aliases
 */
const runListRepositories = () => {
    printVersion();
    
    const globalRepos = getRepositories(true);
    const projectRepos = getRepositories(false);
    
    // Combine with source labels
    const allRepos = [];
    
    for (const [alias, url] of Object.entries(globalRepos)) {
        allRepos.push({ alias, url, source: 'global' });
    }
    
    for (const [alias, url] of Object.entries(projectRepos)) {
        // Project repos override global if same alias
        const existing = allRepos.findIndex(r => r.alias === alias);
        if (existing >= 0) {
            allRepos[existing] = { alias, url, source: 'project' };
        } else {
            allRepos.push({ alias, url, source: 'project' });
        }
    }
    
    if (allRepos.length === 0) {
        console.log(`No repository aliases configured.

Add a repository using:
  superpowers-agent add-repository <git-url> [--as=@alias]`);
        return;
    }
    
    // Calculate column widths for alignment
    const aliasWidth = Math.max(5, ...allRepos.map(r => r.alias.length));
    const urlWidth = Math.max(3, ...allRepos.map(r => r.url.length));
    
    console.log('Repositories:\n');
    console.log(`${'Alias'.padEnd(aliasWidth)}  ${'URL'.padEnd(urlWidth)}  Source`);
    
    for (const repo of allRepos) {
        console.log(`${repo.alias.padEnd(aliasWidth)}  ${repo.url.padEnd(urlWidth)}  (${repo.source})`);
    }
    
    console.log(`\nTotal: ${allRepos.length} repository alias(es)`);
};

export {
    runFindSkills,
    runExecute,
    runPath,
    runDir,
    runGetHelpers,
    runConfigGet,
    runConfigSet,
    runListRepositories
};