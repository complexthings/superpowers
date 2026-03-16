/**
 * Update commands for superpowers-agent
 */

import { checkForUpdates } from '../core/git.js';
import { getLocalVersion, getRemoteVersion, isNewerVersion, printVersion } from '../utils/output.js';
import { execSync } from 'child_process';

/**
 * Command: update
 * Check for updates and install if available
 */
const runUpdate = async ({ skipReinstall = false } = {}) => {
    console.log('# Checking for Superpowers updates...\n');

    const updateInfo = await checkForUpdates();

    if (updateInfo.error) {
        console.log('⚠️  Could not check for updates (network issue)');
        return;
    }

    if (!updateInfo.hasUpdates) {
        console.log(`✓ Already up to date (v${updateInfo.localVersion})`);
        return;
    }

    console.log(`📦 Update available: v${updateInfo.localVersion} → v${updateInfo.remoteVersion}\n`);

    if (skipReinstall) {
        console.log('   Skipping install (--no-reinstall flag set)');
        console.log('   Run manually: npm install -g @complexthings/superpowers-agent\n');
        return;
    }

    console.log('   Installing update...\n');
    try {
        execSync('npm install -g @complexthings/superpowers-agent', { stdio: 'inherit' });
        console.log('\n✓ Update complete!');
    } catch (error) {
        console.log(`\n✗ Update failed: ${error.message}`);
        console.log('   Try running manually: npm install -g @complexthings/superpowers-agent');
        process.exit(1);
    }
};

/**
 * Command: check-updates
 * Check if updates are available
 */
const runCheckUpdates = async () => {
    printVersion();
    const localVersion = getLocalVersion();
    console.log(`Current version: ${localVersion}`);
    
    try {
        const remoteVersion = await getRemoteVersion();
        console.log(`Latest version: ${remoteVersion}`);
        
        if (isNewerVersion(remoteVersion, localVersion)) {
            console.log('Update available: Yes');
            process.exit(1);
        } else {
            console.log('You are up to date');
            process.exit(0);
        }
    } catch (error) {
        console.log(`Error checking for updates: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Command: version
 * Show current version
 */
const runVersion = () => {
    const version = getLocalVersion();
    console.log(version);
};

export {
    runUpdate,
    runCheckUpdates,
    runVersion
};
