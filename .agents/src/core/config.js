import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { paths } from './paths.js';

/**
 * Get default configuration
 */
export const getDefaultConfig = () => ({
    auto_update: true,
    last_update_check: null,
    last_updated_commit: null
});

/**
 * Read configuration from superpowers repo
 */
export const readConfig = () => {
    const configPath = join(paths.superpowersRepo, '.config.json');
    try {
        if (!existsSync(configPath)) {
            return getDefaultConfig();
        }
        const content = readFileSync(configPath, 'utf8');
        return { ...getDefaultConfig(), ...JSON.parse(content) };
    } catch {
        return getDefaultConfig();
    }
};

/**
 * Write configuration updates
 */
export const writeConfig = (updates) => {
    const configPath = join(paths.superpowersRepo, '.config.json');
    const current = readConfig();
    const updated = { ...current, ...updates };
    try {
        writeFileSync(configPath, JSON.stringify(updated, null, 2));
    } catch (error) {
        console.log(`Warning: couldn't save config: ${error.message}`);
    }
};

/**
 * Read config file from specified location (global or project)
 */
export const readConfigFile = (isGlobal) => {
    const configPath = isGlobal 
        ? join(paths.home, '.agents', 'config.json')
        : join(process.cwd(), '.agents', 'config.json');
    
    if (!existsSync(configPath)) {
        return {};
    }
    
    try {
        const content = readFileSync(configPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return {};
    }
};

/**
 * Write config to specified location (global or project)
 */
export const writeConfigFile = (config, isGlobal) => {
    const configDir = isGlobal 
        ? join(paths.home, '.agents')
        : join(process.cwd(), '.agents');
    
    const configPath = join(configDir, 'config.json');
    
    try {
        // Create directory if it doesn't exist
        if (!existsSync(configDir)) {
            execSync(`mkdir -p "${configDir}"`, { stdio: 'pipe' });
        }
        
        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (error) {
        throw new Error(`Failed to write config: ${error.message}`);
    }
};

/**
 * Get repositories configuration (for skill installation)
 */
export const getRepositories = (isGlobal = false) => {
    const config = readConfigFile(isGlobal);
    return config.repositories || {};
};

/**
 * Add repository to config
 */
export const addRepositoryToConfig = (alias, url, isGlobal) => {
    const config = readConfigFile(isGlobal);
    
    if (!config.repositories) {
        config.repositories = {};
    }
    
    config.repositories[alias] = url;
    writeConfigFile(config, isGlobal);
};
