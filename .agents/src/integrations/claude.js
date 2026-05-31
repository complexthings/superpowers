import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { paths } from '../core/paths.js';

// The command our SessionStart hook runs. Identified by this substring so we can
// find/replace our own entry idempotently without disturbing the user's other hooks.
const HOOK_COMMAND_MARKER = 'superpowers-agent session-context';
const HOOK_COMMAND = 'superpowers-agent session-context --format=claude 2>/dev/null || true';
const HOOK_MATCHER = 'startup|resume|clear|compact';

/**
 * Install (or refresh) the Superpowers SessionStart hook in a Claude Code
 * settings.json. Merges into existing settings, preserving any other hooks and
 * settings. Idempotent: re-running replaces our own entry rather than duplicating.
 *
 * @param {string} settingsPath - path to settings.json (defaults to ~/.claude/settings.json).
 *   Overridable for tests.
 * @returns {{created?:boolean, updated?:boolean, existed?:boolean, error?:boolean, message?:string, backup?:string}}
 */
export const installClaudeSessionHook = (settingsPath = paths.claudeSettings) => {
    let settings = {};
    let fileExisted = false;
    let backupPath;

    if (existsSync(settingsPath)) {
        fileExisted = true;
        let raw;
        try {
            raw = readFileSync(settingsPath, 'utf8');
        } catch (error) {
            return { error: true, message: `Failed to read settings.json: ${error.message}` };
        }
        try {
            settings = raw.trim() ? JSON.parse(raw) : {};
        } catch (error) {
            // Never clobber an unparseable settings file — bail loudly instead.
            return { error: true, message: `settings.json is not valid JSON, leaving it untouched: ${error.message}` };
        }
        // Back up before modifying.
        const timestamp = new Date().toISOString().split('T')[0];
        backupPath = `${settingsPath}.backup-${timestamp}`;
        try {
            copyFileSync(settingsPath, backupPath);
        } catch (error) {
            return { error: true, message: `Failed to back up settings.json: ${error.message}` };
        }
    }

    if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
        return { error: true, message: 'settings.json root is not an object' };
    }

    settings.hooks = settings.hooks || {};
    const existingSessionStart = Array.isArray(settings.hooks.SessionStart)
        ? settings.hooks.SessionStart
        : [];

    // Drop any prior Superpowers entry (current or older form), keep everything else.
    const isOurs = (entry) => {
        try {
            return JSON.stringify(entry).includes(HOOK_COMMAND_MARKER);
        } catch {
            return false;
        }
    };
    const hadOurs = existingSessionStart.some(isOurs);
    const preserved = existingSessionStart.filter(e => !isOurs(e));

    const ourEntry = {
        matcher: HOOK_MATCHER,
        hooks: [{ type: 'command', command: HOOK_COMMAND }],
    };

    settings.hooks.SessionStart = [...preserved, ourEntry];

    // Ensure parent dir exists (fresh install with no ~/.claude yet).
    const dir = dirname(settingsPath);
    if (!existsSync(dir)) {
        try {
            mkdirSync(dir, { recursive: true });
        } catch (error) {
            return { error: true, message: `Failed to create ${dir}: ${error.message}` };
        }
    }

    try {
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
    } catch (error) {
        return { error: true, message: `Failed to write settings.json: ${error.message}` };
    }

    if (!fileExisted) return { created: true };
    if (hadOurs) return { existed: true, updated: true, backup: backupPath };
    return { updated: true, backup: backupPath };
};

/**
 * Install Claude Code commands
 */

/**
 * Install Claude Code commands
 */
export const installClaudeCommands = () => {
    const commandsSourceDir = join(paths.superpowersRepo, 'commands');
    const commandsDestDir = join(paths.home, '.claude', 'commands');

    if (!existsSync(commandsSourceDir)) {
        console.log('⚠️  No Claude commands to install (source directory not found).');
        return;
    }

    // Create destination directory
    try {
        if (!existsSync(commandsDestDir)) {
            execSync(`mkdir -p "${commandsDestDir}"`, { stdio: 'pipe' });
        }
    } catch (error) {
        console.log(`Error creating Claude commands directory: ${error.message}`);
        return;
    }

    // Copy all .md files
    let commandFiles;
    try {
        commandFiles = readdirSync(commandsSourceDir)
            .filter(f => f.endsWith('.md'));
    } catch (error) {
        console.log(`Error reading Claude commands directory: ${error.message}`);
        return;
    }

    if (commandFiles.length === 0) {
        console.log('⚠️  No command files found to install.');
        return;
    }

    console.log('Installing Claude Code commands...');
    let installed = 0;
    for (const file of commandFiles) {
        try {
            const source = join(commandsSourceDir, file);
            const dest = join(commandsDestDir, file);
            execSync(`cp "${source}" "${dest}"`, { stdio: 'pipe' });
            console.log(`  ✓ Installed ${file}`);
            installed++;
        } catch (error) {
            console.log(`  ✗ Failed to install ${file}: ${error.message}`);
        }
    }

    if (installed > 0) {
        console.log(`\n✓ Installed ${installed} command(s) to ${commandsDestDir}\n  Use slash commands in Claude Code:\n    /brainstorm - Refine ideas into designs\n    /execute-plan - Execute plans in batches\n    /write-plan - Create implementation plans\n    /skills - Discover available skills\n    /use-skill - Load and apply a specific skill`);
    }
};
