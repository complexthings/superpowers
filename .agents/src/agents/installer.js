import { readFileSync, existsSync, unlinkSync, lstatSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { getAgentSourcePath, getAgentDestPaths, getSupportedPlatforms } from './platforms.js';
import { readConfigFile, writeConfigFile } from '../core/config.js';
import { createSymlink } from '../utils/symlinks.js';

/**
 * Validate agents.json manifest structure
 * Required: version (string), agents (object with platform keys mapping to string arrays)
 * Optional: repository (string)
 * Returns { valid: true, data, skippedPlatforms: string[] } or { valid: false, error: string }
 */
export function validateAgentsManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') {
        return { valid: false, error: 'agents.json must be a JSON object' };
    }
    if (!manifest.version || typeof manifest.version !== 'string') {
        return { valid: false, error: 'agents.json must have a "version" string field' };
    }
    if (!manifest.agents || typeof manifest.agents !== 'object') {
        return { valid: false, error: 'agents.json must have an "agents" object field' };
    }
    const supported = getSupportedPlatforms();
    const skippedPlatforms = [];
    for (const [key, agents] of Object.entries(manifest.agents)) {
        if (!supported.includes(key)) {
            skippedPlatforms.push(key);
            continue;
        }
        if (!Array.isArray(agents)) {
            return { valid: false, error: `agents.${key} must be an array of agent names` };
        }
        for (const name of agents) {
            if (typeof name !== 'string') {
                return { valid: false, error: `agents.${key} must contain only string agent names` };
            }
        }
    }
    return { valid: true, data: manifest, skippedPlatforms };
}

/**
 * Install a single agent file via symlink.
 * Pre-removes existing non-symlink files to handle overwrite.
 * Returns { installed: boolean, error?: string }
 */
export function installAgentFile(sourcePath, destPath) {
    // Check source exists
    if (!existsSync(sourcePath)) {
        return { installed: false, error: `Source file not found: ${sourcePath}` };
    }
    
    // If destination exists and is NOT a symlink, remove it first
    if (existsSync(destPath)) {
        try {
            const stats = lstatSync(destPath);
            if (!stats.isSymbolicLink()) {
                unlinkSync(destPath);
            }
        } catch (e) {
            // If we can't stat/remove, let createSymlink handle the error
        }
    }
    
    // Ensure destination directory exists
    mkdirSync(dirname(destPath), { recursive: true });
    
    // Create symlink
    const result = createSymlink(sourcePath, destPath);
    if (result.error) {
        return { installed: false, error: result.error };
    }
    return { installed: true };
}

/**
 * Main entry point. Called from runAdd/runPull after skill installation.
 * 
 * @param {string} repoRoot - Root directory of the cloned/local repository
 * @param {object} options - { isUpdate: boolean } (true for pull, false for add)
 */
export function installAgents(repoRoot, options = {}) {
    const agentsJsonPath = join(repoRoot, 'agents.json');
    
    // Check if agents.json exists
    if (!existsSync(agentsJsonPath)) {
        return; // No agents.json, nothing to do — silent return
    }
    
    // Read and parse
    let manifest;
    try {
        manifest = JSON.parse(readFileSync(agentsJsonPath, 'utf8'));
    } catch (e) {
        console.log(`\n  ⚠ Could not parse agents.json: ${e.message}`);
        return;
    }
    
    // Validate
    const validation = validateAgentsManifest(manifest);
    if (!validation.valid) {
        console.log(`\n  ⚠ Invalid agents.json: ${validation.error}`);
        return;
    }
    
    // Log any skipped platforms
    for (const skipped of validation.skippedPlatforms) {
        console.log(`  ⚠ Skipping unknown platform: ${skipped}`);
    }
    
    const repoAlias = manifest.repository || 'unknown';
    const version = manifest.version;
    const verb = options.isUpdate ? 'Updating' : 'Installing';
    const pastVerb = options.isUpdate ? 'Updated' : 'Installed';
    
    console.log(`\n  📦 Found agents.json (${repoAlias} v${version})`);
    
    const supported = getSupportedPlatforms();
    let totalInstalled = 0;
    let totalFailed = 0;
    
    // Batch tracking — collect all installs, write config once at the end
    const trackingBatch = [];
    
    for (const [platformKey, agentNames] of Object.entries(manifest.agents)) {
        if (!supported.includes(platformKey)) continue;
        
        console.log(`\n  ${verb} ${platformKey} agents:`);
        
        for (const agentName of agentNames) {
            const sourcePath = getAgentSourcePath(repoRoot, platformKey, agentName);
            const destPaths = getAgentDestPaths(platformKey, agentName);

            // An agent may map to more than one destination (e.g. github agents
            // go to both the VS Code prompts dir and ~/.copilot/agents). Install
            // each; count the agent as installed if at least one destination took.
            const installedDests = [];
            const errors = [];
            for (const destPath of destPaths) {
                const result = installAgentFile(sourcePath, destPath);
                if (result.installed) {
                    installedDests.push(destPath);
                } else {
                    errors.push(result.error);
                }
            }

            if (installedDests.length > 0) {
                console.log(`    ✓ ${agentName}`);
                trackingBatch.push({ platformKey, agentName, sourcePath, destPaths: installedDests });
                totalInstalled++;
            } else {
                console.log(`    ✗ ${agentName}: ${errors.join('; ')}`);
                totalFailed++;
            }
        }
    }
    
    // Write all tracking data in a single config write
    if (trackingBatch.length > 0) {
        const config = readConfigFile(true);
        if (!config.installedAgents) config.installedAgents = {};
        if (!config.installedAgents[repoAlias]) {
            config.installedAgents[repoAlias] = { version, agents: {} };
        }
        config.installedAgents[repoAlias].version = version;
        
        for (const { platformKey, agentName, sourcePath, destPaths } of trackingBatch) {
            if (!config.installedAgents[repoAlias].agents[platformKey]) {
                config.installedAgents[repoAlias].agents[platformKey] = {};
            }
            config.installedAgents[repoAlias].agents[platformKey][agentName] = {
                source: sourcePath,
                // `destination` kept for backward compatibility with older
                // configs/readers; `destinations` is the full list to clean up.
                destination: destPaths[0],
                destinations: destPaths,
                installedAt: new Date().toISOString()
            };
        }
        
        writeConfigFile(config, true);
    }
    
    if (totalInstalled > 0) {
        console.log(`\n  ${pastVerb} ${totalInstalled} agent(s)${totalFailed > 0 ? ` (${totalFailed} failed)` : ''}`);
    }
}
