/**
 * Superpowers-Agent plugin for OpenCode.ai
 *
 * Injects superpowers-agent bootstrap context via system prompt transform.
 * Skills are discovered via OpenCode's native skill tool from symlinked directory.
 */

import { execSync } from 'child_process';

export const SuperpowersAgentPlugin = async ({ client, directory }) => {
  // Generate bootstrap content once at plugin init via CLI.
  // session-context is the single source of truth for the CLI-tools nudge.
  // Its raw output already includes the <EXTREMELY_IMPORTANT> wrapper.
  const getBootstrapContent = () => {
    try {
      const content = execSync('superpowers-agent session-context --format=raw', {
        encoding: 'utf8',
        timeout: 10000,
      }).trim();

      return content || null;
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
