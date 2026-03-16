import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get local version from package.json
 * @returns {string} Version number
 */
export const getLocalVersion = () => {
    try {
        // After bundling, __dirname is where the compiled file lives (.agents/)
        // So package.json is in the same directory
        let packagePath = join(__dirname, 'package.json');
        
        // During development/source, it's two levels up from src/utils/
        if (!existsSync(packagePath)) {
            packagePath = join(__dirname, '..', '..', 'package.json');
        }
        
        const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
        return pkg.version || '0.0.0';
    } catch {
        return '0.0.0'; // Fallback ensures any real version is detected as newer
    }
};

/**
 * Print version marker at start of command output
 */
export const printVersion = () => {
    const version = getLocalVersion();
    console.log(`^^SAV:${version}^^`);
};

/**
 * Fetch latest published version from npm registry
 * @returns {Promise<string>} Remote version number
 */
export const getRemoteVersion = async () => {
    try {
        const url = 'https://registry.npmjs.org/@complexthings/superpowers-agent/latest';
        
        const response = execSync(`curl -sS "${url}"`, {
            encoding: 'utf8',
            timeout: 10000
        });
        
        const pkg = JSON.parse(response);
        
        if (!pkg.version) {
            return getLocalVersion();
        }
        
        return pkg.version;
    } catch (error) {
        throw new Error(`Failed to fetch remote version: ${error.message}`);
    }
};

/**
 * Compare two semver versions
 * @param {string} remote - Remote version
 * @param {string} local - Local version
 * @returns {boolean} True if remote is newer than local
 */
export const isNewerVersion = (remote, local) => {
    const remoteParts = remote.split('.').map(Number);
    const localParts = local.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
        const r = remoteParts[i] || 0;
        const l = localParts[i] || 0;
        
        if (r > l) return true;
        if (r < l) return false;
    }
    
    return false;
};
