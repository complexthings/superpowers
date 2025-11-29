import { execSync } from 'child_process';

/**
 * Detect if a command is available
 * @param {string} command - Command to check
 * @returns {boolean} True if command exists
 */
export const detectTool = (command) => {
    try {
        execSync(`which ${command}`, { 
            stdio: 'pipe',
            timeout: 2000 
        });
        return true;
    } catch {
        return false;
    }
};
