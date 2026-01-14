/**
 * Update commands for superpowers-agent
 */

import { execSync } from 'child_process';
import { paths } from '../core/paths.js';
import { writeConfig } from '../core/config.js';
import { checkForUpdates, isOnMainBranch, determineReinstalls } from '../core/git.js';
import { getLocalVersion, getRemoteVersion, isNewerVersion, printVersion } from '../utils/output.js';

// Import integration install functions
import { 
    installCopilotPrompts, 
    installCopilotInstructions 
} from '../integrations/copilot.js';
import { 
    installCursorCommands, 
    installCursorHooks 
} from '../integrations/cursor.js';
import { installCodexPrompts } from '../integrations/codex.js';
import { installGeminiCommands } from '../integrations/gemini.js';
import { installClaudeCommands } from '../integrations/claude.js';
import { installOpencodeCommands } from '../integrations/opencode.js';

// Import symlink utilities
import { syncAllSkillSymlinks } from '../utils/symlinks.js';

/**
 * Reinstall a specific integration
 */
const reinstallIntegration = (integration) => {
    const installFunctions = {
        'copilot-prompts': installCopilotPrompts,
        'copilot-instructions': installCopilotInstructions,
        'cursor-commands': installCursorCommands,
        'cursor-hooks': installCursorHooks,
        'codex-prompts': installCodexPrompts,
        'gemini-commands': installGeminiCommands,
        'claude-commands': installClaudeCommands,
        'opencode-commands': installOpencodeCommands
    };
    
    const installFn = installFunctions[integration];
    if (installFn) {
        try {
            installFn();
            return { success: true, integration };
        } catch (error) {
            return { success: false, integration, error: error.message };
        }
    }
    return { success: false, integration, error: 'Unknown integration' };
};

/**
 * Install command aliases (stub for now - will need to import from bootstrap)
 */
const installAliases = () => {
    // This will be implemented when we extract bootstrap
    console.log('Installing aliases...');
};

/**
 * Command: update [--no-reinstall]
 * Update superpowers from GitHub
 */
const runUpdate = (options = {}) => {
    const skipReinstall = options.skipReinstall || false;
    
    console.log('# Checking for Superpowers updates...\n');
    
    // 1. Check current state
    const updateInfo = checkForUpdates();
    
    if (updateInfo.error) {
        console.log('⚠️  Could not check for updates (network issue)');
        return;
    }
    
    if (!updateInfo.hasUpdates) {
        console.log('✓ Already up to date');
        return;
    }
    
    // 2. Safety check - is repo clean?
    if (updateInfo.hasLocalChanges) {
        console.log(`⚠️  Cannot auto-update: local changes detected\n   Commit or stash your changes first, then run update again\n   Or manually update: cd ${paths.superpowersRepo} && git pull`);
        return;
    }
    
    // 3. Check if on main branch
    if (!isOnMainBranch()) {
        console.log(`⚠️  Not on main branch, skipping auto-update\n   Switch to main branch first: cd ${paths.superpowersRepo} && git checkout main`);
        return;
    }
    
    // 4. Perform git pull
    console.log(`📦 Updating from ${updateInfo.currentCommit.substring(0,7)} to ${updateInfo.latestCommit.substring(0,7)}
   (${updateInfo.commitsBehind} new commit${updateInfo.commitsBehind > 1 ? 's' : ''})\n`);
    
    try {
        execSync('git pull origin main', { 
            cwd: paths.superpowersRepo, 
            stdio: 'pipe',
            timeout: 10000
        });
        console.log('✓ Updated superpowers repository');
    } catch (error) {
        console.log(`✗ Git pull failed: ${error.message}\n   Please resolve manually and try again`);
        return;
    }
    
    console.log('');
    
    // 5. Update config
    writeConfig({ 
        last_updated_commit: updateInfo.latestCommit,
        last_update_check: new Date().toISOString()
    });
    
    // 6. Determine what needs reinstalling
    if (skipReinstall) {
        console.log('ℹ️  Skipping integration reinstall (--no-reinstall flag)\n\n✓ Update complete!');
        return;
    }
    
    const integrationsToReinstall = determineReinstalls(updateInfo.changedFiles);
    
    if (integrationsToReinstall.length === 0) {
        console.log('ℹ️  No integration files changed, skipping reinstalls\n\n✓ Update complete!');
        return;
    }
    
    // 7. Reinstall affected integrations
    console.log('🔄 Reinstalling updated integrations:\n');
    
    const results = [];
    for (const integration of integrationsToReinstall) {
        const result = reinstallIntegration(integration);
        results.push(result);
        if (result.success) {
            console.log(`  ✓ ${integration}`);
        } else {
            console.log(`  ✗ ${integration} (${result.error})`);
        }
    }
    
    console.log('');
    
    // 8. Reinstall aliases in case paths changed
    console.log('\n---\n');
    installAliases();
    
    // 9. Sync skill symlinks
    console.log('\n---\n');
    console.log('## Syncing Skill Symlinks\n');
    syncAllSkillSymlinks();
    
    // 10. Show summary
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
        console.log('⚠️  Update completed with errors:');
        for (const failure of failures) {
            console.log(`  - ${failure.integration} failed to install`);
            const commandName = `install-${failure.integration}`;
            console.log(`    Run manually: superpowers-agent ${commandName}`);
        }
    } else {
        console.log('✓ Update complete!');
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
    runVersion,
    reinstallIntegration,
    installAliases
};
