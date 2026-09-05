/**
 * Superpowers Agent CLI
 * Main entry point for command routing
 * The shebang will be added by the build process
 */

import { runUpdate, runCheckUpdates, runVersion } from './commands/update.js';
import { runBootstrap } from './commands/bootstrap.js';
import { printRetirementBanner } from './commands/retirement-cleanup.js';

/**
 * Command dispatcher
 */
const commands = {
    'bootstrap': runBootstrap,
    'version': runVersion,
    'check-updates': () => {
        runCheckUpdates().catch(err => {
            console.error(err.message);
            process.exit(1);
        });
    },
    'update': () => {
        runUpdate().catch(err => {
            console.error(err.message);
            process.exit(1);
        });
    },

    // Default help
    'default': () => {
        console.log(`Superpowers for Agents
Usage:
  superpowers-agent bootstrap                                        # Remove everything this package installed
  superpowers-agent version                                          # Show current version
  superpowers-agent check-updates                                    # Check for updates
  superpowers-agent update                                           # Clean up, then show how to update

Documentation: https://github.com/complexthings/superpowers
`);
    }
};

// The banner goes to stderr so stdout stays a clean, parseable contract.
printRetirementBanner();

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
