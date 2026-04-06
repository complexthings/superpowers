import { existsSync, readFileSync, mkdirSync, rmSync, cpSync, lstatSync } from 'fs';
import { join, dirname, parse, sep } from 'path';
import { execSync } from 'child_process';
import { homedir } from 'os';
import { createInterface } from 'readline';
import { getRepositories, addRepositoryToConfig, readConfigFile, writeConfigFile, getInstalledSkills, removeInstalledSkills, getInstalledAgents } from '../core/config.js';
import { syncPersonalSkillSymlinks, SKILL_PLATFORMS, removeSymlink, untrackSymlink } from '../utils/symlinks.js';
import { installAgents } from '../agents/installer.js';

/**
 * Get the repository root from a clone path.
 * For git-tree clones, sourcePath may be a subdirectory of the tmp clone.
 * This resolves back to the root of the cloned repo.
 */
export const getRepoRoot = (sourcePath, parsed) => {
    if (parsed.type === 'local') {
        // For local paths, walk up to find agents.json
        let dir = sourcePath;
        for (let i = 0; i < 10; i++) {
            if (existsSync(join(dir, 'agents.json'))) return dir;
            const parent = dirname(dir);
            if (parent === dir) break;
            dir = parent;
        }
        return sourcePath;
    }
    
    // For git clones, the tmp root is the clone root
    const tmpMarker = join('.agents', 'tmp');
    if (sourcePath.includes(tmpMarker)) {
        const idx = sourcePath.indexOf(tmpMarker);
        const afterTmp = sourcePath.substring(idx + tmpMarker.length + 1);
        const tmpName = afterTmp.split(sep)[0];
        return join(sourcePath.substring(0, idx), '.agents', 'tmp', tmpName);
    }
    return sourcePath;
};

/**
 * Persist a cloned repository for agent symlinks.
 * Copies the clone to ~/.agents/repos/<alias>/ so symlinks remain valid.
 * Returns the new persistent repo root path.
 */
export const persistRepoForAgents = (tmpRepoRoot, alias) => {
    const reposDir = join(homedir(), '.agents', 'repos');
    const safeName = alias.replace(/^@/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const destDir = join(reposDir, safeName);
    
    try {
        // Create repos dir
        mkdirSync(reposDir, { recursive: true });
        
        // Remove existing if present
        if (existsSync(destDir)) {
            rmSync(destDir, { recursive: true, force: true });
        }
        
        // Copy clone to persistent location
        cpSync(tmpRepoRoot, destDir, { recursive: true });
        
        return destDir;
    } catch (error) {
        console.log(`  Warning: Could not persist repository for agents: ${error.message}`);
        return null;
    }
};

/**
 * Parse a Git URL or local path
 */
export const parseGitUrl = (url) => {
    // Check if it's a GitHub tree URL (HTTPS)
    const treeMatch = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/);
    if (treeMatch) {
        const [, org, repo, branch, path] = treeMatch;
        return {
            type: 'git-tree',
            repoUrl: `https://github.com/${org}/${repo}.git`,
            branch,
            path,
            original: url
        };
    }
    
    // Check if it's an SSH Git URL (git@github.com:org/repo.git)
    const sshMatch = url.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (sshMatch) {
        const [, org, repo] = sshMatch;
        return {
            type: 'git-repo',
            repoUrl: `git@github.com:${org}/${repo}.git`,
            branch: null,
            path: null,
            original: url
        };
    }
    
    // Check if it's a standard HTTPS git URL
    const gitMatch = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (gitMatch) {
        const [, org, repo] = gitMatch;
        return {
            type: 'git-repo',
            repoUrl: `https://github.com/${org}/${repo}.git`,
            branch: null,
            path: null,
            original: url
        };
    }
    
    // Check if it's a local path
    if (existsSync(url)) {
        return {
            type: 'local',
            path: url,
            original: url
        };
    }
    
    return null;
};

/**
 * Determine installation location based on flags and config
 */
export const getInstallLocation = (flags) => {
    const hasGlobalFlag = flags.includes('--global') || flags.includes('-g');
    const hasProjectFlag = flags.includes('--project') || flags.includes('-p');
    
    // Flags override config
    if (hasGlobalFlag) {
        return join(homedir(), '.agents', 'skills');
    }
    
    if (hasProjectFlag) {
        return join(process.cwd(), '.agents', 'skills');
    }
    
    // Check config files for default
    const projectConfigPath = join(process.cwd(), '.agents', 'config.json');
    const globalConfigPath = join(homedir(), '.agents', 'config.json');
    
    // Project config takes precedence
    for (const configPath of [projectConfigPath, globalConfigPath]) {
        if (existsSync(configPath)) {
            try {
                const config = JSON.parse(readFileSync(configPath, 'utf8'));
                if (config.installLocation === 'project') {
                    return join(process.cwd(), '.agents', 'skills');
                }
            } catch (error) {
                // Ignore parse errors
            }
        }
    }
    
    // Default to global
    return join(homedir(), '.agents', 'skills');
};

/**
 * Clone a Git repository to a temporary directory
 */
export const cloneRepository = (repoUrl, branch) => {
    const tmpDir = join(homedir(), '.agents', 'tmp', `skill-install-${Date.now()}`);
    
    try {
        execSync(`mkdir -p "${tmpDir}"`, { stdio: 'pipe' });
        
        if (branch) {
            execSync(`git clone --branch ${branch} --depth 1 "${repoUrl}" "${tmpDir}"`, { 
                stdio: 'pipe',
                timeout: 30000 
            });
        } else {
            execSync(`git clone --depth 1 "${repoUrl}" "${tmpDir}"`, { 
                stdio: 'pipe',
                timeout: 30000 
            });
        }
        
        return tmpDir;
    } catch (error) {
        // Clean up on error
        try {
            execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });
        } catch {}
        throw new Error(`Failed to clone repository: ${error.message}`);
    }
};

/**
 * Read skill.json from a path (used during installation)
 */
export const readSkillJsonFromPath = (path) => {
    const skillJsonPath = join(path, 'skill.json');
    if (!existsSync(skillJsonPath)) {
        return null;
    }
    
    try {
        const content = readFileSync(skillJsonPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Failed to read skill.json: ${error.message}`);
    }
};

/**
 * Install a single skill to the target location
 */
export const installSingleSkill = (sourcePath, skillName, installBase, results) => {
    const skillSourcePath = join(sourcePath, skillName);
    
    if (!existsSync(skillSourcePath)) {
        results.errors.push(`Skill directory not found: ${skillName}`);
        return;
    }
    
    const skillJson = readSkillJsonFromPath(skillSourcePath);
    if (!skillJson) {
        results.errors.push(`No skill.json found in: ${skillName}`);
        return;
    }
    
    const rawTargetName = skillJson.name || skillName;
    const targetName = rawTargetName.split('/').pop() || rawTargetName;
    const targetPath = join(installBase, targetName);
    
    // Create parent directory if needed
    const targetParent = dirname(targetPath);
    try {
        execSync(`mkdir -p "${targetParent}"`, { stdio: 'pipe' });
    } catch (error) {
        results.errors.push(`Failed to create directory ${targetParent}: ${error.message}`);
        return;
    }
    
    // Copy skill files
    try {
        // Remove existing skill if present
        if (existsSync(targetPath)) {
            execSync(`rm -rf "${targetPath}"`, { stdio: 'pipe' });
        }
        
        execSync(`cp -R "${skillSourcePath}" "${targetPath}"`, { stdio: 'pipe' });
        
        results.installed.push({
            name: targetName,
            path: targetPath,
            title: skillJson.title || skillJson.description || targetName
        });
    } catch (error) {
        results.errors.push(`Failed to install ${skillName}: ${error.message}`);
    }
};

/**
 * Track installed skills in config for later removal
 */
export const trackInstalledSkills = (source, installBase, results, isGlobal, alias = null) => {
    const config = readConfigFile(isGlobal);
    if (!config.installedSkills) config.installedSkills = {};

    const entry = {
        source,
        installBase,
        installedAt: new Date().toISOString(),
        skills: results.installed.map(s => ({ name: s.name, path: s.path }))
    };

    config.installedSkills[source] = entry;
    if (alias && alias !== source) {
        config.installedSkills[alias] = entry;
    }

    writeConfigFile(config, isGlobal);
};

/**
 * Command: add <url-or-path>
 * Install skills from repository or local path
 */
export const runAdd = () => {
    const args = process.argv.slice(3);
    let urlOrPath = args.find(arg => !arg.startsWith('-'));
    const flags = args.filter(arg => arg.startsWith('-'));

    if (!urlOrPath) {
        console.log(`Usage: superpowers-agent add <url-or-path|@alias> [skill-path] [options]

Options:
  --global, -g   Install skills globally in ~/.agents/skills/ (default)
  --project, -p  Install skills in current project's .agents/skills/

Examples:
  superpowers-agent add https://github.com/example/skills
  superpowers-agent add https://github.com/example/repo/tree/main/skills
  superpowers-agent add ~/my-local-skills
  superpowers-agent add https://github.com/example/skills --project
  superpowers-agent add ~/my-local-skills --global
  superpowers-agent add @myrepo path/to/skill
  superpowers-agent add @myrepo path/to/skills --project

Description:
  Installs skill(s) from a Git repository, local directory, or repository alias.
  Supports repositories with single or multiple skills.
  Reads skill.json to determine skill names and installation paths.

  Repository aliases can be added using:
    superpowers-agent add-repository <git-url> [--as=@alias]`);
        return;
    }

    console.log('Installing skill(s)...\n');

    const isGlobal = !flags.includes('--project') && !flags.includes('-p');

    // Check if urlOrPath is a repository alias
    let repoUrl = null;
    let skillPath = null;
    let resolvedAlias = null;

    if (urlOrPath.startsWith('@')) {
        // It's a repository alias
        const alias = urlOrPath;
        resolvedAlias = alias;
        skillPath = args.find((arg, i) => i > 0 && !arg.startsWith('-') && arg !== alias);

        // Look for alias in config (project first, then global)
        const projectRepos = getRepositories(false);
        const globalRepos = getRepositories(true);

        if (projectRepos[alias]) {
            repoUrl = projectRepos[alias];
            console.log(`Using project repository alias: ${alias}`);
        } else if (globalRepos[alias]) {
            repoUrl = globalRepos[alias];
            console.log(`Using global repository alias: ${alias}`);
        } else {
            console.log(`Error: Repository alias not found: ${alias}`);
            console.log(`\nAvailable aliases:`);

            const allRepos = { ...globalRepos, ...projectRepos };
            if (Object.keys(allRepos).length === 0) {
                console.log(`  (none)`);
                console.log(`\nAdd a repository using:`);
                console.log(`  superpowers-agent add-repository <git-url>`);
            } else {
                for (const [name, url] of Object.entries(allRepos)) {
                    console.log(`  ${name} -> ${url}`);
                }
            }
            return;
        }

        // Check if repoUrl is a local path or Git URL
        const isLocalPath = existsSync(repoUrl);
        
        if (skillPath) {
            if (isLocalPath) {
                // Local path - just append the skill path
                urlOrPath = join(repoUrl, skillPath);
                console.log(`Repository path: ${repoUrl}`);
                console.log(`Skill path: ${skillPath}\n`);
            } else {
                // Git URL - pass the repo URL as-is; subpath is applied after clone
                urlOrPath = repoUrl;
                console.log(`Repository URL: ${repoUrl}`);
                console.log(`Skill path: ${skillPath}\n`);
            }
        } else {
            urlOrPath = repoUrl;
            if (isLocalPath) {
                console.log(`Repository path: ${repoUrl}\n`);
            } else {
                console.log(`Repository URL: ${repoUrl}\n`);
            }
        }
    }

    // Parse URL/path
    const parsed = parseGitUrl(urlOrPath);
    if (!parsed) {
        console.log(`Error: Invalid URL or path not found: ${urlOrPath}`);
        return;
    }

    // If resolved from an alias with a subpath, apply it to the parsed result
    if (skillPath && parsed.type === 'git-repo' && !parsed.path) {
        parsed.path = skillPath;
    }

    // Determine installation location
    const installBase = getInstallLocation(flags);
    console.log(`Install location: ${installBase}\n`);
    
    let sourcePath;
    let cleanup = false;
    
    try {
        // Get source path based on type
        if (parsed.type === 'git-repo' || parsed.type === 'git-tree') {
            console.log(`Cloning repository: ${parsed.repoUrl}`);
            if (parsed.branch) {
                console.log(`Branch: ${parsed.branch}`);
            }
            sourcePath = cloneRepository(parsed.repoUrl, parsed.branch);
            cleanup = true;
            
            if (parsed.path) {
                sourcePath = join(sourcePath, parsed.path);
                if (!existsSync(sourcePath)) {
                    throw new Error(`Path not found in repository: ${parsed.path}`);
                }
            }
            console.log('');
        } else {
            sourcePath = parsed.path;
        }
        
        // Read skill.json from source
        const rootSkillJson = readSkillJsonFromPath(sourcePath);
        if (!rootSkillJson) {
            throw new Error('No skill.json found in source directory');
        }
        
        // Install skills
        const results = {
            installed: [],
            errors: [],
            source: parsed.original
        };
        
        if (rootSkillJson.skills && Array.isArray(rootSkillJson.skills)) {
            // Multiple skills
            console.log(`Found ${rootSkillJson.skills.length} skill(s) to install\n`);
            for (const skillName of rootSkillJson.skills) {
                installSingleSkill(sourcePath, skillName, installBase, results);
            }
        } else {
            // Single skill
            const skillName = rootSkillJson.name || parse(sourcePath).base;
            installSingleSkill(dirname(sourcePath), parse(sourcePath).base, installBase, results);
        }
        
        // Check for agents.json and install agents
        const repoRoot = getRepoRoot(sourcePath, parsed);
        const agentsJsonPath = join(repoRoot, 'agents.json');
        if (existsSync(agentsJsonPath)) {
            let agentRepoRoot = repoRoot;
            // For git sources, persist the clone so symlinks remain valid
            if (cleanup) {
                // Determine alias from agents.json or URL
                let agentManifest;
                try {
                    agentManifest = JSON.parse(readFileSync(agentsJsonPath, 'utf8'));
                } catch {}
                const alias = agentManifest?.repository || parsed.original;
                const persistedRoot = persistRepoForAgents(repoRoot, alias);
                if (persistedRoot) {
                    agentRepoRoot = persistedRoot;
                }
            }
            installAgents(agentRepoRoot, { isUpdate: false });
        }
        
        // Clean up temporary clone
        if (cleanup && sourcePath) {
            try {
                // Get the tmp directory (parent of the actual source in case of tree URLs)
                const tmpDir = sourcePath.split('/.agents/tmp/')[0] + '/.agents/tmp/' + 
                               sourcePath.split('/.agents/tmp/')[1].split('/')[0];
                execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });
            } catch {}
        }
        
        // Report results
        console.log('\n**Successfully installed skills:**');
        console.log(`- Source: ${results.source}`);
        
        if (results.installed.length > 0) {
            for (const skill of results.installed) {
                console.log(`  - Installed: ${skill.name} at ${skill.path}`);
                console.log(`    ${skill.title}`);
            }
        }
        
        if (results.errors.length > 0) {
            console.log('\n**Errors:**');
            for (const error of results.errors) {
                console.log(`  - ${error}`);
            }
        }
        
        if (results.installed.length === 0 && results.errors.length === 0) {
            console.log('  No skills were installed');
        }
        
        // Sync symlinks for newly installed skills
        if (results.installed.length > 0) {
            console.log('\n**Syncing skill symlinks...**');
            syncPersonalSkillSymlinks();
            // Track installed skills for future removal
            trackInstalledSkills(parsed.original, installBase, results, isGlobal, resolvedAlias);
        }

    } catch (error) {
        // Clean up on error
        if (cleanup && sourcePath) {
            try {
                const tmpDir = sourcePath.split('/.agents/tmp/')[0] + '/.agents/tmp/' +
                               sourcePath.split('/.agents/tmp/')[1].split('/')[0];
                execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });
            } catch {}
        }

        console.log(`\nError: ${error.message}`);
    }
};

/**
 * Command: pull <url-or-path>
 * Update or add skills from repository or local path
 */
export const runPull = () => {
    const args = process.argv.slice(3);
    let urlOrPath = args.find(arg => !arg.startsWith('-'));
    const flags = args.filter(arg => arg.startsWith('-'));
    
    if (!urlOrPath) {
        console.log(`Usage: superpowers-agent pull <url-or-path|@alias> [skill-path] [options]

Options:
  --global, -g   Update skills globally in ~/.agents/skills/ (default)
  --project, -p  Update skills in current project's .agents/skills/

Examples:
  superpowers-agent pull https://github.com/example/skills
  superpowers-agent pull https://github.com/example/repo/tree/main/skills
  superpowers-agent pull ~/my-local-skills
  superpowers-agent pull https://github.com/example/skills --project
  superpowers-agent pull ~/my-local-skills --global
  superpowers-agent pull @myrepo
  superpowers-agent pull @myrepo path/to/skill
  superpowers-agent pull @myrepo path/to/skills --project

Description:
  Updates or adds skill(s) from a Git repository, local directory, or repository alias.
  If skills already exist, they will be updated (replaced).
  If skills don't exist, they will be added.
  Supports repositories with single or multiple skills.
  Reads skill.json to determine skill names and installation paths.
  
  Repository aliases can be added using:
    superpowers-agent add-repository <git-url> [--as=@alias]`);
        return;
    }
    
    console.log('Updating skill(s)...\n');

    const isGlobal = !flags.includes('--project') && !flags.includes('-p');

    // Check if urlOrPath is a repository alias
    let repoUrl = null;
    let skillPath = null;
    let resolvedAlias = null;

    if (urlOrPath.startsWith('@')) {
        // It's a repository alias
        const alias = urlOrPath;
        resolvedAlias = alias;
        skillPath = args.find((arg, i) => i > 0 && !arg.startsWith('-') && arg !== alias);

        // Look for alias in config (project first, then global)
        const projectRepos = getRepositories(false);
        const globalRepos = getRepositories(true);

        if (projectRepos[alias]) {
            repoUrl = projectRepos[alias];
            console.log(`Using project repository alias: ${alias}`);
        } else if (globalRepos[alias]) {
            repoUrl = globalRepos[alias];
            console.log(`Using global repository alias: ${alias}`);
        } else {
            console.log(`Error: Repository alias not found: ${alias}`);
            console.log(`\nAvailable aliases:`);

            const allRepos = { ...globalRepos, ...projectRepos };
            if (Object.keys(allRepos).length === 0) {
                console.log(`  (none)`);
                console.log(`\nAdd a repository using:`);
                console.log(`  superpowers-agent add-repository <git-url>`);
            } else {
                for (const [name, url] of Object.entries(allRepos)) {
                    console.log(`  ${name} -> ${url}`);
                }
            }
            return;
        }

        // Check if repoUrl is a local path or Git URL
        const isLocalPath = existsSync(repoUrl);
        
        if (skillPath) {
            if (isLocalPath) {
                // Local path - just append the skill path
                urlOrPath = join(repoUrl, skillPath);
                console.log(`Repository path: ${repoUrl}`);
                console.log(`Skill path: ${skillPath}\n`);
            } else {
                // Git URL - pass the repo URL as-is; subpath is applied after clone
                urlOrPath = repoUrl;
                console.log(`Repository URL: ${repoUrl}`);
                console.log(`Skill path: ${skillPath}\n`);
            }
        } else {
            urlOrPath = repoUrl;
            if (isLocalPath) {
                console.log(`Repository path: ${repoUrl}\n`);
            } else {
                console.log(`Repository URL: ${repoUrl}\n`);
            }
        }
    }

    // Parse URL/path
    const parsed = parseGitUrl(urlOrPath);
    if (!parsed) {
        console.log(`Error: Invalid URL or path not found: ${urlOrPath}`);
        return;
    }

    // If resolved from an alias with a subpath, apply it to the parsed result
    if (skillPath && parsed.type === 'git-repo' && !parsed.path) {
        parsed.path = skillPath;
    }

    // Determine installation location
    const installBase = getInstallLocation(flags);
    console.log(`Install location: ${installBase}\n`);
    
    let sourcePath;
    let cleanup = false;
    
    try {
        // Get source path based on type
        if (parsed.type === 'git-repo' || parsed.type === 'git-tree') {
            console.log(`Cloning repository: ${parsed.repoUrl}`);
            if (parsed.branch) {
                console.log(`Branch: ${parsed.branch}`);
            }
            sourcePath = cloneRepository(parsed.repoUrl, parsed.branch);
            cleanup = true;
            
            if (parsed.path) {
                sourcePath = join(sourcePath, parsed.path);
                if (!existsSync(sourcePath)) {
                    throw new Error(`Path not found in repository: ${parsed.path}`);
                }
            }
            console.log('');
        } else {
            sourcePath = parsed.path;
        }
        
        // Read skill.json from source
        const rootSkillJson = readSkillJsonFromPath(sourcePath);
        if (!rootSkillJson) {
            throw new Error('No skill.json found in source directory');
        }
        
        // Install/update skills
        const results = {
            installed: [],
            errors: [],
            source: parsed.original
        };
        
        if (rootSkillJson.skills && Array.isArray(rootSkillJson.skills)) {
            // Multiple skills
            console.log(`Found ${rootSkillJson.skills.length} skill(s) to update\n`);
            for (const skillName of rootSkillJson.skills) {
                installSingleSkill(sourcePath, skillName, installBase, results);
            }
        } else {
            // Single skill
            const skillName = rootSkillJson.name || parse(sourcePath).base;
            installSingleSkill(dirname(sourcePath), parse(sourcePath).base, installBase, results);
        }
        
        // Check for agents.json and install agents
        const repoRoot = getRepoRoot(sourcePath, parsed);
        const agentsJsonPath = join(repoRoot, 'agents.json');
        if (existsSync(agentsJsonPath)) {
            let agentRepoRoot = repoRoot;
            // For git sources, persist the clone so symlinks remain valid
            if (cleanup) {
                let agentManifest;
                try {
                    agentManifest = JSON.parse(readFileSync(agentsJsonPath, 'utf8'));
                } catch {}
                const alias = agentManifest?.repository || parsed.original;
                const persistedRoot = persistRepoForAgents(repoRoot, alias);
                if (persistedRoot) {
                    agentRepoRoot = persistedRoot;
                }
            }
            installAgents(agentRepoRoot, { isUpdate: true });
        }
        
        // Clean up temporary clone
        if (cleanup && sourcePath) {
            try {
                // Get the tmp directory (parent of the actual source in case of tree URLs)
                const tmpDir = sourcePath.split('/.agents/tmp/')[0] + '/.agents/tmp/' + 
                               sourcePath.split('/.agents/tmp/')[1].split('/')[0];
                execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });
            } catch {}
        }
        
        // Report results
        console.log('\n**Successfully updated skills:**');
        console.log(`- Source: ${results.source}`);
        
        if (results.installed.length > 0) {
            for (const skill of results.installed) {
                console.log(`  - Updated: ${skill.name} at ${skill.path}`);
                console.log(`    ${skill.title}`);
            }
        }
        
        if (results.errors.length > 0) {
            console.log('\n**Errors:**');
            for (const error of results.errors) {
                console.log(`  - ${error}`);
            }
        }
        
        if (results.installed.length === 0 && results.errors.length === 0) {
            console.log('  No skills were updated');
        }
        
        // Sync symlinks for updated skills
        if (results.installed.length > 0) {
            console.log('\n**Syncing skill symlinks...**');
            syncPersonalSkillSymlinks();
            // Track installed skills for future removal
            trackInstalledSkills(parsed.original, installBase, results, isGlobal, resolvedAlias);
        }

    } catch (error) {
        // Clean up on error
        if (cleanup && sourcePath) {
            try {
                const tmpDir = sourcePath.split('/.agents/tmp/')[0] + '/.agents/tmp/' + 
                               sourcePath.split('/.agents/tmp/')[1].split('/')[0];
                execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });
            } catch {}
        }
        
        console.log(`\nError: ${error.message}`);
    }
};

/**
 * Prompt user for confirmation (returns promise resolving to trimmed answer)
 */
const confirmPrompt = (question) => new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => {
        rl.close();
        resolve(answer.trim());
    });
});

/**
 * Check if a path is a symlink (works for broken symlinks too)
 */
const isSymlinkPath = (p) => {
    try { return lstatSync(p).isSymbolicLink(); } catch { return false; }
};

/**
 * Command: rm <url-or-path|@alias>
 * Remove skills and symlinks installed via 'add'
 */
export const runRm = async () => {
    const args = process.argv.slice(3);
    const urlOrPath = args.find(arg => !arg.startsWith('-'));
    const flags = args.filter(arg => arg.startsWith('-'));

    if (!urlOrPath) {
        console.log(`Usage: superpowers-agent rm <url-or-path|@alias> [options]

Options:
  --global, -g   Remove globally installed skills (default)
  --project, -p  Remove project-installed skills

Examples:
  superpowers-agent rm https://github.com/example/skills
  superpowers-agent rm @myrepo
  superpowers-agent rm ~/my-local-skills`);
        return;
    }

    const isGlobal = !flags.includes('--project') && !flags.includes('-p');

    // Resolve alias → URL
    let resolvedUrl = urlOrPath;
    let originalAlias = null;

    if (urlOrPath.startsWith('@')) {
        originalAlias = urlOrPath;
        const projectRepos = getRepositories(false);
        const globalRepos = getRepositories(true);

        if (projectRepos[urlOrPath]) {
            resolvedUrl = projectRepos[urlOrPath];
        } else if (globalRepos[urlOrPath]) {
            resolvedUrl = globalRepos[urlOrPath];
        } else {
            console.log(`Error: Repository alias not found: ${urlOrPath}`);
            return;
        }
    }

    // Look up tracking in config (try alias key first, then resolved URL)
    const installedSkills = getInstalledSkills(isGlobal);
    const trackingEntry = installedSkills[urlOrPath] || installedSkills[resolvedUrl];

    // Determine install base
    const installBase = trackingEntry?.installBase || getInstallLocation(flags);

    // Build list of skills to remove
    let skillsToRemove = [];

    if (trackingEntry) {
        skillsToRemove = trackingEntry.skills;
    } else {
        console.log('No tracking data found. Attempting to re-resolve skills from source...\n');

        const parsed = parseGitUrl(resolvedUrl);
        if (!parsed) {
            console.log(`Error: Invalid URL or path not found: ${resolvedUrl}`);
            return;
        }

        let sourcePath;
        let cleanup = false;

        try {
            if (parsed.type === 'git-repo' || parsed.type === 'git-tree') {
                console.log(`Cloning repository: ${parsed.repoUrl}`);
                sourcePath = cloneRepository(parsed.repoUrl, parsed.branch);
                cleanup = true;
                if (parsed.path) {
                    sourcePath = join(sourcePath, parsed.path);
                    if (!existsSync(sourcePath)) {
                        throw new Error(`Path not found in repository: ${parsed.path}`);
                    }
                }
            } else {
                sourcePath = parsed.path;
            }

            const rootSkillJson = readSkillJsonFromPath(sourcePath);
            if (!rootSkillJson) {
                throw new Error('No skill.json found in source');
            }

            const skillNames = (rootSkillJson.skills && Array.isArray(rootSkillJson.skills))
                ? rootSkillJson.skills
                : [rootSkillJson.name || parse(sourcePath).base];

            for (const skillName of skillNames) {
                let installedName = skillName;
                if (rootSkillJson.skills) {
                    // Multi-skill repo: read sub-skill's skill.json for the installed name
                    const subPath = join(sourcePath, skillName);
                    if (existsSync(subPath)) {
                        const subJson = readSkillJsonFromPath(subPath);
                        if (subJson?.name) installedName = subJson.name;
                    }
                }
                skillsToRemove.push({ name: installedName, path: join(installBase, installedName) });
            }

            if (cleanup) {
                try {
                    const tmpDir = sourcePath.split('/.agents/tmp/')[0] + '/.agents/tmp/' +
                                   sourcePath.split('/.agents/tmp/')[1].split('/')[0];
                    execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });
                } catch {}
            }
        } catch (error) {
            if (cleanup && sourcePath) {
                try {
                    const tmpDir = sourcePath.split('/.agents/tmp/')[0] + '/.agents/tmp/' +
                                   sourcePath.split('/.agents/tmp/')[1].split('/')[0];
                    execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });
                } catch {}
            }
            console.log(`Error resolving source: ${error.message}`);
            return;
        }
    }

    // Build removal plan
    const skillDirsToRemove = skillsToRemove.filter(s => existsSync(s.path) || isSymlinkPath(s.path));
    const platformSymlinksToRemove = [];

    for (const skill of skillsToRemove) {
        for (const platform of SKILL_PLATFORMS) {
            const symlinkPath = join(platform.skillsDir(), skill.name);
            if (existsSync(symlinkPath) || isSymlinkPath(symlinkPath)) {
                platformSymlinksToRemove.push({ platform: platform.name, path: symlinkPath });
            }
        }
    }

    // Agent symlinks
    const installedAgents = getInstalledAgents();
    const agentKey = originalAlias || resolvedUrl;
    const agentSymlinksToRemove = [];

    if (installedAgents[agentKey]) {
        for (const [, agents] of Object.entries(installedAgents[agentKey].agents || {})) {
            for (const [, agentInfo] of Object.entries(agents)) {
                if (agentInfo.destination && (existsSync(agentInfo.destination) || isSymlinkPath(agentInfo.destination))) {
                    agentSymlinksToRemove.push({ path: agentInfo.destination });
                }
            }
        }
    }

    // Persisted repo
    const safeName = agentKey.replace(/^@/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const persistedRepoPath = join(homedir(), '.agents', 'repos', safeName);
    const persistedRepoExists = existsSync(persistedRepoPath);

    // Print removal plan
    const home = homedir();
    const shorten = (p) => p.replace(home, '~');

    if (skillDirsToRemove.length === 0 && platformSymlinksToRemove.length === 0 &&
        agentSymlinksToRemove.length === 0 && !persistedRepoExists) {
        console.log('Nothing to remove.');
        return;
    }

    console.log('Will remove:');

    if (skillDirsToRemove.length > 0) {
        console.log('  Skills:');
        for (const s of skillDirsToRemove) console.log(`    ${shorten(s.path)}`);
    }

    if (platformSymlinksToRemove.length > 0) {
        console.log('  Platform symlinks:');
        for (const s of platformSymlinksToRemove) console.log(`    ${shorten(s.path)}`);
    }

    if (agentSymlinksToRemove.length > 0) {
        console.log('  Agents:');
        for (const a of agentSymlinksToRemove) console.log(`    ${shorten(a.path)}`);
    }

    if (persistedRepoExists) {
        console.log('  Persisted repo:');
        console.log(`    ${shorten(persistedRepoPath)}`);
    }

    // Confirm
    const answer = await confirmPrompt('\nProceed? [y/N] ');
    if (answer.toLowerCase() !== 'y') {
        console.log('Aborted.');
        return;
    }

    // 1. Platform symlinks
    for (const s of platformSymlinksToRemove) {
        const result = removeSymlink(s.path);
        if (result.removed) {
            console.log(`Removed symlink: ${shorten(s.path)}`);
            untrackSymlink(s.platform, s.path, 'skills');
        } else if (result.error === 'Symlink does not exist') {
            console.log(`Already removed: ${shorten(s.path)}`);
        } else {
            console.log(`Warning: ${shorten(s.path)}: ${result.error}`);
        }
    }

    // 2. Agent symlinks
    for (const a of agentSymlinksToRemove) {
        const result = removeSymlink(a.path);
        if (result.removed) {
            console.log(`Removed agent: ${shorten(a.path)}`);
        } else if (result.error === 'Symlink does not exist') {
            console.log(`Already removed: ${shorten(a.path)}`);
        } else {
            console.log(`Warning: ${shorten(a.path)}: ${result.error}`);
        }
    }

    // 3. Persisted repo
    if (persistedRepoExists) {
        try {
            rmSync(persistedRepoPath, { recursive: true, force: true });
            console.log(`Removed persisted repo: ${shorten(persistedRepoPath)}`);
        } catch (error) {
            console.log(`Warning: Failed to remove persisted repo: ${error.message}`);
        }
    }

    // 4. Skill directories
    for (const s of skillDirsToRemove) {
        if (!existsSync(s.path)) {
            console.log(`Already removed: ${shorten(s.path)}`);
            continue;
        }
        try {
            rmSync(s.path, { recursive: true, force: true });
            console.log(`Removed skill: ${shorten(s.path)}`);
        } catch (error) {
            console.log(`Warning: Failed to remove ${shorten(s.path)}: ${error.message}`);
        }
    }

    // 5. Config cleanup
    removeInstalledSkills(urlOrPath, isGlobal);
    if (resolvedUrl !== urlOrPath) {
        removeInstalledSkills(resolvedUrl, isGlobal);
    }

    if (installedAgents[agentKey]) {
        const config = readConfigFile(true);
        if (config.installedAgents) {
            delete config.installedAgents[agentKey];
            writeConfigFile(config, true);
        }
    }

    console.log('\nDone.');
};

/**
 * Command: add-repository <git-url>
 * Add a repository alias for easier skill installation
 */
export const runAddRepository = () => {
    const args = process.argv.slice(3);
    const url = args.find(arg => !arg.startsWith('-'));
    const flags = args.filter(arg => arg.startsWith('-'));
    
    if (!url) {
        console.log(`Usage: superpowers-agent add-repository <git-url> [options]

Options:
  --global, -g        Add repository globally in ~/.agents/config.json (default)
  --project, -p       Add repository in current project's .agents/config.json
  --as=<alias>        Specify custom alias for the repository

Examples:
  superpowers-agent add-repository https://github.com/example/skills.git
  superpowers-agent add-repository https://github.com/example/skills.git --as=@myskills
  superpowers-agent add-repository https://github.com/example/skills.git --project
  superpowers-agent add-repository https://github.com/example/skills.git --as=@custom --global

Description:
  Adds a skill repository alias to your configuration.
  The repository's skill.json will be read to determine the default alias.
  Use --as to specify a custom alias.
  After adding, you can install skills using: superpowers-agent add @alias path/to/skill`);
        return;
    }
    
    console.log('Adding repository...\n');
    
    // Parse flags
    const hasGlobalFlag = flags.some(f => f === '--global' || f === '-g');
    const hasProjectFlag = flags.some(f => f === '--project' || f === '-p');
    const asFlag = flags.find(f => f.startsWith('--as='));
    const customAlias = asFlag ? asFlag.split('=')[1] : null;
    
    // Determine if global or project
    const isGlobal = hasProjectFlag ? false : true; // Default to global unless --project specified
    
    let tmpDir;
    try {
        // Clone repository to temp location
        console.log(`Cloning repository: ${url}`);
        tmpDir = join(homedir(), '.agents', 'tmp', `repo-add-${Date.now()}`);
        execSync(`mkdir -p "${tmpDir}"`, { stdio: 'pipe' });
        execSync(`git clone --depth 1 "${url}" "${tmpDir}"`, { 
            stdio: 'pipe',
            timeout: 30000 
        });
        console.log('');
        
        // Read skill.json
        const skillJson = readSkillJsonFromPath(tmpDir);
        if (!skillJson) {
            throw new Error('No skill.json found in repository');
        }
        
        // Determine alias
        let alias;
        if (customAlias) {
            alias = customAlias;
        } else if (skillJson.repository) {
            alias = skillJson.repository;
        } else {
            // Derive from repository name
            const match = url.match(/\/([^/]+?)(?:\.git)?$/);
            if (match) {
                alias = '@' + match[1];
            } else {
                throw new Error('Could not determine repository alias. Use --as=@alias to specify manually.');
            }
        }
        
        // Add to config
        addRepositoryToConfig(alias, url, isGlobal);
        
        // Clean up
        execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });
        
        // Report success
        const location = isGlobal ? 'globally' : 'in project';
        const configPath = isGlobal 
            ? join(homedir(), '.agents', 'config.json')
            : join(process.cwd(), '.agents', 'config.json');
        
        console.log(`✓ Repository added ${location}`);
        console.log(`  Alias: ${alias}`);
        console.log(`  URL: ${url}`);
        console.log(`  Config: ${configPath}`);
        console.log(`\nYou can now install skills using:`);
        console.log(`  superpowers-agent add ${alias} <path-to-skill>`);
        
    } catch (error) {
        // Clean up on error
        if (tmpDir) {
            try {
                execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });
            } catch {}
        }
        
        console.log(`\nError: ${error.message}`);
    }
};
