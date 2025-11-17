#!/usr/bin/env bash
# stop hook - Injects bootstrap content for new conversations

set -euo pipefail

# Read JSON input
input=$(cat)

# Extract conversation_id and status
conversation_id=$(echo "$input" | jq -r '.conversation_id // "unknown"')
status=$(echo "$input" | jq -r '.status // "completed"')
loop_count=$(echo "$input" | jq -r '.loop_count // 0')

# Skip if unknown conversation
if [ "$conversation_id" = "unknown" ]; then
    echo '{"followup_message": ""}'
    exit 0
fi

# Define tracking files
bootstrap_file="${HOME}/.cursor/bootstrapped_conversations.txt"
pending_file="${HOME}/.cursor/pending_bootstrap.txt"

# Create files if they don't exist
touch "$bootstrap_file" "$pending_file"

# Check if this conversation is pending bootstrap
if ! grep -q "^${conversation_id}$" "$pending_file" 2>/dev/null; then
    echo '{"followup_message": ""}'
    exit 0
fi

# Only inject on successful completion (not errors or aborts)
if [ "$status" != "completed" ]; then
    echo '{"followup_message": ""}'
    exit 0
fi

# Prevent infinite loops - only inject on first stop (loop_count 0)
if [ "$loop_count" -gt 0 ]; then
    echo '{"followup_message": ""}'
    exit 0
fi

# Build bootstrap message
superpowers_root="${HOME}/.agents/superpowers"

# Check if superpowers is installed
if [ ! -d "$superpowers_root" ]; then
    echo '{"followup_message": ""}'
    exit 0
fi

# Build the bootstrap content
bootstrap_content="<EXTREMELY_IMPORTANT>
You have superpowers. Superpowers teach you new skills and capabilities.

**Available Cursor Commands:**
- \`/brainstorm-with-superpowers\` - Refine ideas into designs through collaborative questioning
- \`/write-a-skill\` - Create new skills following TDD methodology
- \`/skills\` - Discover and search available skills
- \`/use-skill <skill-name>\` - Load and apply a specific skill

**Command-line tool:**
\`superpowers-agent <command>\`

**Common commands:**
- \`find-skills\` - List all available skills
- \`use-skill <skill-name>\` - Load a specific skill
- \`bootstrap\` - Run complete bootstrap

**Skill naming:**
- Project skills: \`skill-name\` (from .agents/skills/ - highest priority)
- Claude skills: \`claude:skill-name\` (from .claude/skills/)
- Personal skills: \`skill-name\` (from ~/.agents/skills/)
- Superpowers skills: \`superpowers:skill-name\` (from ~/.agents/superpowers/skills/)

**Critical Rules:**
- Before ANY task, check if a relevant skill exists
- If a skill exists for your task, you MUST use it
- Use \`/skills\` or \`find-skills\` to discover available skills
- Announce: \"I'm using [Skill Name] to [purpose]\"

**Common skills:**
- \`superpowers:brainstorming\` - Refine ideas into designs (use BEFORE coding)
- \`superpowers:test-driven-development\` - TDD workflow
- \`superpowers:systematic-debugging\` - Debug systematically
- \`superpowers:writing-skills\` - Create new skills
- \`superpowers:writing-plans\` - Create implementation plans
- \`superpowers:verification-before-completion\` - Verify before claiming complete

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.
</EXTREMELY_IMPORTANT>"

# Escape for JSON
bootstrap_escaped=$(echo "$bootstrap_content" | jq -Rs .)

# Mark as bootstrapped
echo "$conversation_id" >> "$bootstrap_file"

# Remove from pending
grep -v "^${conversation_id}$" "$pending_file" > "${pending_file}.tmp" || true
mv "${pending_file}.tmp" "$pending_file"

# Cleanup old entries (keep last 100)
tail -n 100 "$bootstrap_file" > "${bootstrap_file}.tmp" && mv "${bootstrap_file}.tmp" "$bootstrap_file"

# Output with followup message
cat <<EOF
{
  "followup_message": ${bootstrap_escaped}
}
EOF

exit 0

