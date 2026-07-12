/**
 * Update commands for superpowers-agent
 */

import { checkForUpdates } from '../core/git.js';
import { getLocalVersion, getRemoteVersion, isNewerVersion, printVersion } from '../utils/output.js';
import { paths } from '../core/paths.js';

/**
 * Install command per package manager. superpowers-agent is a global CLI, so
 * every command installs/updates it globally.
 */
export const PM_INSTALL = {
    npm: 'npm install -g @complexthings/superpowers-agent',
    pnpm: 'pnpm add -g @complexthings/superpowers-agent',
    yarn: 'yarn global add @complexthings/superpowers-agent',
    bun: 'bun add -g @complexthings/superpowers-agent',
    deno: 'deno install -g -A -n superpowers-agent npm:@complexthings/superpowers-agent',
};

/**
 * Guess which package manager installed the global CLI from its install path.
 * Each manager stages global packages under a recognizable directory. Falls
 * back to npm, the documented default install method.
 *
 * ponytail: path-substring heuristic, good enough for the common global layouts;
 * revisit only if a manager changes where it stages globals.
 *
 * @param {string} installPath - where this package is installed (defaults to the resolved repo/package root)
 * @returns {'npm'|'pnpm'|'yarn'|'bun'|'deno'}
 */
export const detectPackageManager = (installPath = paths.superpowersRepo) => {
    const p = String(installPath).toLowerCase().replace(/\\/g, '/');
    if (p.includes('/.bun/') || p.includes('/bun/install')) return 'bun';
    if (p.includes('/pnpm')) return 'pnpm';
    if (p.includes('/yarn')) return 'yarn';
    if (p.includes('/.deno/') || p.includes('/deno/')) return 'deno';
    return 'npm';
};

/**
 * Command: update
 * Report whether an update is available and how to install it. Never runs a
 * global install itself — that can need sudo/permissions and should be the
 * user's explicit call. We just print the exact commands to run.
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

    const pm = detectPackageManager();
    console.log('   To update, run:\n');
    console.log(`   ${PM_INSTALL[pm]}`);
    console.log('   superpowers-agent bootstrap && superpowers-agent setup-skills\n');
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
