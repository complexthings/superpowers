/**
 * Superpowers-Agent plugin for OpenCode.ai
 *
 * Injects superpowers-agent bootstrap context via system prompt transform.
 * Skills are discovered via OpenCode's native skill tool from symlinked directory.
 */

import path from 'path';
import fs from 'fs';
import os from 'os';

// Simple frontmatter extraction (avoid dependency on skills-core for bootstrap)
const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

// Normalize a path: trim whitespace, expand ~, resolve to absolute
const normalizePath = (p, homeDir) => {
  if (!p || typeof p !== 'string') return null;
  let normalized = p.trim();
  if (!normalized) return null;
  if (normalized.startsWith('~/')) {
    normalized = path.join(homeDir, normalized.slice(2));
  } else if (normalized === '~') {
    normalized = homeDir;
  }
  return path.resolve(normalized);
};

export const SuperpowersAgentPlugin = async ({ client, directory }) => {
  const homeDir = os.homedir();
  
  // Skill locations for superpowers-agent (in priority order)
  const skillLocations = [
    path.join(homeDir, '.config/opencode/skill/superpowers')
  ];
  
  const envConfigDir = normalizePath(process.env.OPENCODE_CONFIG_DIR, homeDir);
  const configDir = envConfigDir || path.join(homeDir, '.config/opencode');

  // Find the using-superpowers skill from available locations
  const findUsingSuperpowersSkill = () => {
    // Check using-superpowers first (behavioral enforcement skill)
    for (const dir of skillLocations) {
      // Try meta/using-superpowers first (superpowers-agent structure)
      const metaPath = path.join(dir, 'meta', 'using-superpowers', 'SKILL.md');
      if (fs.existsSync(metaPath)) {
        return metaPath;
      }
      // Fallback to flat using-superpowers (original structure)
      const flatPath = path.join(dir, 'using-superpowers', 'SKILL.md');
      if (fs.existsSync(flatPath)) {
        return flatPath;
      }
    }
    return null;
  };

  // Helper to generate bootstrap content
  const getBootstrapContent = () => {
    const skillPath = findUsingSuperpowersSkill();
    if (!skillPath) return null;

    const fullContent = fs.readFileSync(skillPath, 'utf8');
    const { content } = extractAndStripFrontmatter(fullContent);

    const toolMapping = `**Tool Mapping for OpenCode:**
When skills reference tools you don't have, substitute OpenCode equivalents:
- \`TodoWrite\` → \`update_plan\`
- \`Task\` tool with subagents → Use OpenCode's subagent system (@mention)
- \`Skill\` tool → OpenCode's native \`skill\` tool
- \`Read\`, \`Write\`, \`Edit\`, \`Bash\` → Your native tools

**CLI Commands:**
Use \`superpowers-agent\` CLI for skill operations:
- \`superpowers-agent find-skills [PATTERN]\` - Discover available skills
- \`superpowers-agent use-skill <skill-name>\` - Load a specific skill

**Skills locations:**
- System skills: \`~/.agents/superpowers/skills/\`
- OpenCode skills: \`${configDir}/skills/superpowers/\`

Use OpenCode's native \`skill\` tool to list and load skills.`;

    return `<EXTREMELY_IMPORTANT>
You have superpowers.

**IMPORTANT: The using-superpowers skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-superpowers" again - that would be redundant.**

${content}

${toolMapping}
</EXTREMELY_IMPORTANT>`;
  };

  return {
    // Use system prompt transform to inject bootstrap (fixes agent reset bug)
    'experimental.chat.system.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (bootstrap) {
        (output.system ||= []).push(bootstrap);
      }
    }
  };
};
