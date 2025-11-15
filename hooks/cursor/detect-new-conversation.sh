#!/usr/bin/env bash
# afterAgentResponse hook - Detects new conversations that need bootstrap

set -euo pipefail

# Read JSON input
input=$(cat)

# Extract conversation_id
conversation_id=$(echo "$input" | jq -r '.conversation_id // "unknown"')

# Skip if unknown conversation
if [ "$conversation_id" = "unknown" ]; then
    exit 0
fi

# Define tracking files
bootstrap_file="${HOME}/.cursor/bootstrapped_conversations.txt"
pending_file="${HOME}/.cursor/pending_bootstrap.txt"

# Create files if they don't exist
touch "$bootstrap_file" "$pending_file"

# Check if already bootstrapped
if grep -q "^${conversation_id}$" "$bootstrap_file" 2>/dev/null; then
    exit 0
fi

# Check if already pending
if grep -q "^${conversation_id}$" "$pending_file" 2>/dev/null; then
    exit 0
fi

# Mark as pending bootstrap
echo "$conversation_id" >> "$pending_file"

exit 0

