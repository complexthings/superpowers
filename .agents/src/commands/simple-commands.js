/**
 * Simple command handlers for superpowers-agent
 */

import { readConfig, writeConfig, getRepositories } from '../core/config.js';
import { printVersion } from '../utils/output.js';

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

    let parsedValue = value;
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;

    writeConfig({ [key]: parsedValue });
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
    const allRepos = [];

    for (const [alias, url] of Object.entries(globalRepos)) {
        allRepos.push({ alias, url, source: 'global' });
    }

    for (const [alias, url] of Object.entries(projectRepos)) {
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

    const aliasWidth = Math.max(5, ...allRepos.map(r => r.alias.length));
    const urlWidth = Math.max(3, ...allRepos.map(r => r.url.length));

    console.log('Repositories:\n');
    console.log(`${'Alias'.padEnd(aliasWidth)}  ${'URL'.padEnd(urlWidth)}  Source`);

    for (const repo of allRepos) {
        console.log(`${repo.alias.padEnd(aliasWidth)}  ${repo.url.padEnd(urlWidth)}  (${repo.source})`);
    }

    console.log(`\nTotal: ${allRepos.length} repository alias(es)`);
};

export { runConfigGet, runConfigSet, runListRepositories };
