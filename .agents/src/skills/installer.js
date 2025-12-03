import { existsSync, readFileSync } from 'fs';
import { join, dirname, parse } from 'path';
import { execSync } from 'child_process';
import { homedir } from 'os';
import { getRepositories, addRepositoryToConfig, readConfigFile, writeConfigFile } from '../core/config.js';

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
    const gitMatch = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)(?:\.git)?$/);
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
    
    const targetName = skillJson.name || skillName;
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
    
    // Check if urlOrPath is a repository alias
    let repoUrl = null;
    let skillPath = null;
    
    if (urlOrPath.startsWith('@')) {
        // It's a repository alias
        const alias = urlOrPath;
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
                // Git URL - construct tree URL
                urlOrPath = `${repoUrl}/tree/main/${skillPath}`;
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
