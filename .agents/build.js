import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, chmodSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const watch = process.argv.includes('--watch');

const buildConfig = {
    entryPoints: [join(__dirname, 'src', 'cli.js')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: join(__dirname, 'superpowers-agent.tmp'),
    minify: true,
    sourcemap: false,
    external: []
};

async function build() {
    try {
        if (watch) {
            const ctx = await esbuild.context(buildConfig);
            await ctx.watch();
            console.log('👀 Watching for changes...');
        } else {
            await esbuild.build(buildConfig);
            
            // Read the built file
            const builtCode = readFileSync(buildConfig.outfile, 'utf8');
            
            // Prepend shebang and write to final location
            const finalPath = join(__dirname, 'superpowers-agent');
            const finalCode = '#!/usr/bin/env node\n' + builtCode;
            writeFileSync(finalPath, finalCode, 'utf8');
            
            // Make executable
            chmodSync(finalPath, 0o755);
            
            // Remove temp file
            const fs = await import('fs/promises');
            await fs.unlink(buildConfig.outfile);
            
            console.log('✅ Build complete!');
            console.log(`   Output: ${finalPath}`);
        }
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

build();
