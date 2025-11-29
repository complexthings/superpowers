#!/usr/bin/env node

/**
 * Link management script for superpowers-agent
 * Manages symlinks between dev and production builds
 * Creates both 'superpowers-agent' and 'superpowers' symlinks
 * 
 * Usage:
 *   node scripts/link.cjs dev         # Link to local dev build
 *   node scripts/link.cjs production  # Link to production install
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const mode = process.argv[2]; // 'dev' or 'production'

// Validate mode
if (mode !== 'dev' && mode !== 'production') {
  console.error('Error: Mode must be "dev" or "production"');
  console.error('Usage: node scripts/link.cjs [dev|production]');
  process.exit(1);
}

// Define paths
const homeDir = os.homedir();
const localBinDir = path.join(homeDir, '.local', 'bin');

// Both symlink names that should point to the same source
const targetLinks = [
  path.join(localBinDir, 'superpowers-agent'),
  path.join(localBinDir, 'superpowers')
];

const devSource = path.join(__dirname, '..', 'superpowers-agent');
const productionSource = path.join(homeDir, '.agents', 'superpowers', '.agents', 'superpowers-agent');

const source = mode === 'dev' ? devSource : productionSource;

// Check if ~/.local/bin exists
if (!fs.existsSync(localBinDir)) {
  console.error(`Error: Directory does not exist: ${localBinDir}`);
  console.error('Please create it first: mkdir -p ~/.local/bin');
  process.exit(1);
}

// Check if source file exists
if (!fs.existsSync(source)) {
  if (mode === 'production') {
    console.error(`Error: Production superpowers-agent not found at:`);
    console.error(`  ${productionSource}`);
    console.error('Please install superpowers first.');
  } else {
    console.error(`Error: Dev build not found at:`);
    console.error(`  ${devSource}`);
    console.error('Please run: npm run build');
  }
  process.exit(1);
}

// Create both symlinks
let successCount = 0;
for (const targetLink of targetLinks) {
  // Remove existing link/file if it exists
  if (fs.existsSync(targetLink)) {
    fs.unlinkSync(targetLink);
  }

  // Create symlink
  try {
    fs.symlinkSync(source, targetLink);
    successCount++;
  } catch (error) {
    console.error(`Error creating symlink ${path.basename(targetLink)}: ${error.message}`);
  }
}

// Report results
if (successCount === targetLinks.length) {
  console.log(`✓ Linked ${mode} build to ~/.local/bin/`);
  console.log(`  Commands: superpowers-agent, superpowers`);
  console.log(`  Source: ${source}`);
} else {
  console.error(`Warning: Only ${successCount} of ${targetLinks.length} symlinks created successfully`);
  process.exit(1);
}
