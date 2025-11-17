#!/usr/bin/env node

import os from 'os';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('=== OS Detection ===');
console.log(`os.platform(): ${os.platform()}`);
console.log(`os.type(): ${os.type()}`);
console.log(`process.platform: ${process.platform}`);

console.log('\n=== Shell Detection ===');

// Method 1: SHELL environment variable
console.log(`$SHELL: ${process.env.SHELL || 'not set'}`);

// Method 2: Parent process (most reliable for current shell)
try {
  const psOutput = execSync('ps -p $$ -o comm=', { encoding: 'utf8' }).trim();
  console.log(`ps -p $$ -o comm=: ${psOutput}`);
} catch (err) {
  console.log(`ps command failed: ${err.message}`);
}

// Method 3: Check for shell-specific environment variables
console.log('\nShell-specific environment variables:');
console.log(`$BASH_VERSION: ${process.env.BASH_VERSION || 'not set'}`);
console.log(`$ZSH_VERSION: ${process.env.ZSH_VERSION || 'not set'}`);
console.log(`$FISH_VERSION: ${process.env.FISH_VERSION || 'not set'}`);

console.log('\n=== Shell RC File Detection ===');

const homeDir = os.homedir();
const rcFiles = {
  bash: ['.bashrc', '.bash_profile', '.profile'],
  zsh: ['.zshrc', '.zprofile'],
  fish: ['.config/fish/config.fish']
};

for (const [shell, files] of Object.entries(rcFiles)) {
  console.log(`\n${shell.toUpperCase()} RC files:`);
  for (const file of files) {
    const fullPath = path.join(homeDir, file);
    const exists = fs.existsSync(fullPath);
    console.log(`  ${file}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  }
}

console.log('\n=== Windows Detection (if applicable) ===');
if (process.platform === 'win32') {
  console.log(`$COMSPEC: ${process.env.COMSPEC || 'not set'}`);
  console.log(`$PSModulePath: ${process.env.PSModulePath ? 'set (PowerShell)' : 'not set'}`);
  
  // Check for PowerShell profile location
  const psProfile = path.join(os.homedir(), 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1');
  console.log(`PowerShell profile exists: ${fs.existsSync(psProfile)}`);
}
