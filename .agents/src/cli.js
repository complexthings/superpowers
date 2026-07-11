/**
 * Superpowers Agent CLI
 * Main entry point for command routing
 * The shebang will be added by the build process
 */

// Import command modules
import {
    runConfigGet,
    runConfigSet,
    runListRepositories
} from './commands/simple-commands.js';

import { 
    runUpdate, 
    runCheckUpdates, 
    runVersion 
} from './commands/update.js';

import { 
    runBootstrap, 
    runSetupSkills,
    installAliases
} from './commands/bootstrap.js';

import {
    runAdd,
    runAddRepository,
    runPull,
    runRm
} from './skills/installer.js';

// Import session-context command (used by platform session-start hooks)
import { runSessionContext } from './integrations/session-context.js';

/**
 * Command dispatcher
 */
const commands = {
    // Core commands
    'bootstrap': runBootstrap,
    'version': runVersion,
    'check-updates': () => {
        runCheckUpdates().catch(err => {
            console.error(err.message);
            process.exit(1);
        });
    },
    'update': () => {
        const skipReinstall = process.argv.includes('--no-reinstall');
        runUpdate({ skipReinstall });
    },
    
    // Config commands
    'config-get': runConfigGet,
    'config-set': runConfigSet,
    
    // Skill commands
    'setup-skills': runSetupSkills,
    'session-context': runSessionContext,
    'add': runAdd,
    'add-repository': runAddRepository,
    'list-repositories': runListRepositories,
    'pull': runPull,
    'rm': runRm,
    
    // Integration install commands
    'install-aliases': installAliases,
    
    // Default help
    'default': () => {
        console.log(`Superpowers for Agents
Usage:
  superpowers-agent bootstrap [--no-update] [--force]               # Run complete bootstrap
  superpowers-agent version                                         # Show current version
  superpowers-agent check-updates                                   # Check for updates
  superpowers-agent update [--no-reinstall]                         # Update to latest version
  superpowers-agent config-get                                      # Show configuration
  superpowers-agent config-set <key> <value>                        # Update configuration
  superpowers-agent setup-skills                                    # Initialize project skills
  superpowers-agent session-context [--format=claude|copilot|raw]   # Print session-start context (used by hooks)
  superpowers-agent add <url-or-path|@alias> [path] [options]      # Install skills
  superpowers-agent add-repository <git-url> [--as=@alias] [opts]  # Add repository alias
  superpowers-agent list-repositories                              # List configured repository aliases
  superpowers-agent pull <url-or-path|@alias> [path] [options]     # Update skills
  superpowers-agent rm <url-or-path|@alias> [options]               # Remove skills
  superpowers-agent install-aliases                                 # Install universal aliases (superpowers, superpowers-agent)

Documentation: https://github.com/complexthings/superpowers
`);
    }
};

// Parse command and execute
const command = process.argv[2] || 'default';
const handler = commands[command] || commands['default'];

try {
    const result = handler();
    if (result && typeof result.then === 'function') {
        result.catch(error => {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        });
    }
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}
