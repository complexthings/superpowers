/**
 * Update commands for superpowers-agent
 */

import { checkForUpdates } from '../core/git.js';
import { getLocalVersion, getRemoteVersion, isNewerVersion, printVersion } from '../utils/output.js';

/**
 * Command: update
 * Check for updates and instruct user to upgrade via npm
 */
const runUpdate = async () => {
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
    console.log('   Run the following to update:\n');
    console.log('   npm install -g @complexthings/superpowers-agent\n');
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
