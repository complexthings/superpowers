/**
 * Superpowers Agent CLI
 * Main entry point for command routing
 * The shebang will be added by the build process
 */

// Import command modules
import { 
    runFindSkills, 
    runExecute, 
    runPath, 
    runDir, 
    runGetHelpers,
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

// Import integration installers
import { 
    installCursorHooks 
} from './integrations/cursor.js';

// Import use-skill command
import { runUseSkill } from './skills/executor.js';

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
    'use-skill': () => runUseSkill(process.argv[3]),
    'execute': runExecute,
    'find-skills': runFindSkills,
    'add': runAdd,
    'add-repository': runAddRepository,
    'list-repositories': runListRepositories,
    'pull': runPull,
    'rm': runRm,
    'dir': runDir,
    'path': runPath,
    'get-helpers': runGetHelpers,
    
    // Integration install commands
    'install-cursor-hooks': installCursorHooks,
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
  superpowers-agent use-skill <skill-name>                          # Load a skill
  superpowers-agent find-skills                                     # List available skills
  superpowers-agent add <url-or-path|@alias> [path] [options]      # Install skills
  superpowers-agent add-repository <git-url> [--as=@alias] [opts]  # Add repository alias
  superpowers-agent list-repositories                              # List configured repository aliases
  superpowers-agent pull <url-or-path|@alias> [path] [options]     # Update skills
  superpowers-agent rm <url-or-path|@alias> [options]             # Remove skills
  superpowers-agent dir <skill-name>                                # Get skill directory
  superpowers-agent path <skill-name>                               # Get skill file path
  superpowers-agent execute <skill-name>                            # Execute a skill
  superpowers-agent get-helpers <skill> <search-term>               # Get helper file path
  superpowers-agent install-cursor-hooks                            # Install Cursor hooks
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
