#!/usr/bin/env bash
# SessionStart hook for superpowers plugin

set -euo pipefail

# Check if superpowers-agent is available
if ! command -v superpowers-agent &> /dev/null; then
    echo '{"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": ""}}'
    exit 0
fi
# Use superpowers-agent to load the using-a-skill content
using_superpowers_content=$(superpowers-agent use-skill using-superpowers 2>&1 || echo "Error: Unable to load using-superpowers. Run: superpowers-agent bootstrap")

# Escape outputs for JSON
using_superpowers_escaped=$(echo "$using_superpowers_content" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')

# Output context injection as JSON
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have superpowers.\n\n**Below is the full content of your 'using-superpowers' skill - your introduction to using skills.:**\n\n${using_superpowers_escaped}\n\n\n</EXTREMELY_IMPORTANT>"
  }
}
EOF

exit 0
