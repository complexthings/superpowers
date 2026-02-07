import { join, dirname } from 'path';
import { chmodSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SHEBANG = [
    '#!/bin/sh',
    '// 2>/dev/null; exec "$(command -v bun 2>/dev/null || echo node)" "$0" "$@"',
].join('\n');

const entrypoint = join(__dirname, 'src', 'cli.js');
const finalPath = join(__dirname, 'superpowers-agent');

async function build() {
    try {
        const result = await Bun.build({
            entrypoints: [entrypoint],
            target: 'node',
            format: 'esm',
            minify: true,
        });

        if (!result.success) {
            console.error('❌ Build failed:');
            for (const log of result.logs) {
                console.error(log);
            }
            process.exit(1);
        }

        const builtCode = await result.outputs[0].text();
        const finalCode = SHEBANG + '\n' + builtCode;

        await Bun.write(finalPath, finalCode);
        chmodSync(finalPath, 0o755);

        console.log('✅ Build complete!');
        console.log(`   Output: ${finalPath}`);
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

build();
