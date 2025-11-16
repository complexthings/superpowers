#!/usr/bin/env node

/**
 * Playwright Script Executor
 * Handles module resolution and execution of Playwright scripts
 * Based on lackeyjb/playwright-skill
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scriptPath = process.argv[2];

if (!scriptPath) {
  console.error('Usage: node run.js <script-path>');
  console.error('Example: node run.js ./my-automation.js');
  process.exit(1);
}

const fullPath = resolve(process.cwd(), scriptPath);

if (!existsSync(fullPath)) {
  console.error(`Error: Script not found: ${fullPath}`);
  process.exit(1);
}

// Set NODE_PATH to include this directory's node_modules
const nodeModulesPath = resolve(__dirname, 'node_modules');
const env = {
  ...process.env,
  NODE_PATH: nodeModulesPath
};

console.log(`Executing: ${fullPath}`);
console.log('');

const child = spawn('node', [fullPath], {
  env,
  stdio: 'inherit',
  cwd: dirname(fullPath)
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('Error executing script:', error.message);
  process.exit(3);
});
