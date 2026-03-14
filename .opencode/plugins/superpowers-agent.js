/**
 * Superpowers-Agent plugin for OpenCode.ai
 *
 * Injects superpowers-agent bootstrap context via system prompt transform.
 * Skills are discovered via OpenCode's native skill tool from symlinked directory.
 */

import { execSync } from 'child_process';

export const SuperpowersAgentPlugin = async ({ client, directory }) => {
  // Generate bootstrap content once at plugin init via CLI
  const getBootstrapContent = () => {
    try {
      const content = execSync('superpowers-agent use-skill using-superpowers', {
        encoding: 'utf8',
        timeout: 10000,
      });

      return `<EXTREMELY_IMPORTANT>
You have superpowers.

**IMPORTANT: The using-superpowers skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-superpowers" again - that would be redundant.**

${content}
</EXTREMELY_IMPORTANT>`;
    } catch (_err) {
      return null;
    }
  };

  const bootstrap = getBootstrapContent();

  return {
    // Inject bootstrap on every new chat turn
    'experimental.chat.system.transform': async (_input, output) => {
      if (bootstrap) {
        (output.system ||= []).push(bootstrap);
      }
    },

    // Re-inject bootstrap into compaction context so it persists after compaction
    'experimental.session.compacting': async (_input, output) => {
      if (bootstrap) {
        output.context.push(bootstrap);
      }
    },
  };
};
