import { homedir, platform } from 'os';
import { join, parse, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get VS Code User profile directory based on platform
 */
const getVSCodeUserDir = () => {
    const home = homedir();
    const plat = platform();
    
    switch (plat) {
        case 'darwin': // macOS
            return join(home, 'Library', 'Application Support', 'Code', 'User');
        case 'win32': // Windows
            return join(home, 'AppData', 'Roaming', 'Code', 'User');
        case 'linux': // Linux
            return join(home, '.config', 'Code', 'User');
        default:
            // Fallback to Linux path for unknown platforms
            return join(home, '.config', 'Code', 'User');
    }
};

/**
 * Detect project root (where .agents directory exists)
 */
const findProjectRoot = () => {
    let currentDir = process.cwd();
    const root = parse(currentDir).root;
    
    while (currentDir !== root) {
        if (existsSync(join(currentDir, '.agents'))) {
            return currentDir;
        }
        currentDir = dirname(currentDir);
    }
    
    return process.cwd();
};

/**
 * Paths configuration object
 */
export const paths = {
    home: homedir(),
    vscodeUserDir: getVSCodeUserDir(),
    projectRoot: findProjectRoot(),
    get projectClaudeSkills() { return join(this.projectRoot, '.claude', 'skills'); },
    get projectAgentsSkills() { return join(this.projectRoot, '.agents', 'skills'); },
    get projectCopilotSkills() { return join(this.projectRoot, '.copilot', 'skills'); },
    get projectOpencodeSkills() { return join(this.projectRoot, '.opencode', 'skill'); },
    get projectCursorSkills() { return join(this.projectRoot, '.cursor', 'skills'); },
    get projectGeminiSkills() { return join(this.projectRoot, '.gemini', 'skills'); },
    get projectCodexSkills() { return join(this.projectRoot, '.codex', 'skills'); },
    get projectSkillsDir() { return join(this.projectRoot, 'skills'); }, // For superpowers repo itself
    get homePersonalSkills() { return join(this.home, '.agents', 'skills'); },
    get homeClaudeSkills() { return join(this.home, '.claude', 'skills'); },
    get homeCopilotSkills() { return join(this.home, '.copilot', 'skills'); },
    get homeOpencodeSkills() { return join(this.home, '.config', 'opencode', 'skill'); },
    get homeCursorSkills() { return join(this.home, '.cursor', 'skills'); },
    get homeGeminiSkills() { return join(this.home, '.gemini', 'skills'); },
    get homeCodexSkills() { return join(this.home, '.codex', 'skills'); },
    get bootstrap() { return join(this.projectRoot, '.agents', 'superpowers-bootstrap.md'); },
    get superpowersRepo() { 
        // If running from the superpowers repo itself, use current location
        // Otherwise use installed location
        // Navigate from src/core/ up to repo root
        const currentRepoCheck = join(__dirname, '..', '..', '..', 'skills');
        if (existsSync(currentRepoCheck) && existsSync(join(__dirname, '..', '..', '..', '.github', 'prompts'))) {
            return join(__dirname, '..', '..', '..');
        }
        return join(this.home, '.agents', 'superpowers');
    },
    get homeSuperpowersSkills() { return join(this.superpowersRepo, 'skills'); },
    get isSuperpowersRepo() {
        // Check if we're running from within the superpowers repo
        const currentRepoCheck = join(__dirname, '..', '..', '..', 'skills');
        return existsSync(currentRepoCheck) && existsSync(join(__dirname, '..', '..', '..', '.github', 'prompts'));
    }
};
