/**
 * Session context builder — the single source of truth for the prompt that
 * every platform injects at session start (Claude Code hook, GitHub Copilot
 * hook, OpenCode plugin, and the bundled plugin session-start.sh).
 */

// Imperative, high-priority pointer (per design) — names the skill so the agent loads it.
const CLI_TOOLS_NUDGE = `---

**YOU MUST read and use the \`leveraging-cli-tools\` skill** the moment a task involves using BASH, searching code, parsing JSON/YAML, finding files, structural refactors, data wrangling, or any command that floods your context with verbose output (logs, CI logs, test runs). Load it with your skill tool BEFORE you reach for grep/find/sed or before you read large command output. It routes you to high-performance tools (rg, jq, fd, yq, ast-grep, gh, sd) and reduces output to just the signal — cutting token cost and latency 5-50x. Skipping it wastes tokens and time on work the right tool does instantly.`;

/**
 * Build the raw injected-context text (no platform JSON wrapping).
 * @returns {string} The wrapped CLI-tools nudge.
 */
export const buildSessionContext = () => `<EXTREMELY_IMPORTANT>
${CLI_TOOLS_NUDGE}
</EXTREMELY_IMPORTANT>`;

/**
 * Format the session context for a specific platform's hook output.
 * @param {'claude'|'copilot'|'raw'} format
 * @returns {string} JSON (claude/copilot) or raw text. Always safe to print.
 */
export const formatSessionContext = (format = 'raw') => {
    const context = buildSessionContext();

    if (format === 'claude') {
        // Claude Code SessionStart hook schema
        return JSON.stringify({
            hookSpecificOutput: {
                hookEventName: 'SessionStart',
                additionalContext: context,
            },
        });
    }

    if (format === 'copilot') {
        // GitHub Copilot CLI sessionStart hook schema
        return JSON.stringify({ additionalContext: context });
    }

    return context;
};

/**
 * Command: session-context [--format=claude|copilot|raw]
 * Prints the injected session context. Called by the platform hooks.
 */
export const runSessionContext = () => {
    const formatArg = process.argv.find(a => a.startsWith('--format='));
    const format = formatArg ? formatArg.split('=')[1] : 'raw';
    process.stdout.write(formatSessionContext(format) + '\n');
};
