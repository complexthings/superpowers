#!/usr/bin/env bash
# beforeSubmitPrompt hook - Ensures skills context is available before prompt submission

set -euo pipefail

# Read JSON input
input=$(cat)

# Extract prompt from input
prompt=$(echo "$input" | jq -r '.prompt // ""')

# Check if project has AGENTS.md with superpowers content
project_agents_md="./AGENTS.md"
has_superpowers=false
has_cursor=false

if [ -f "$project_agents_md" ]; then
    # Check if file contains superpowers markers
    if grep -q "<!-- SUPERPOWERS_SKILLS_START -->" "$project_agents_md" 2>/dev/null && \
       grep -q "<!-- SUPERPOWERS_SKILLS_END -->" "$project_agents_md" 2>/dev/null; then
        has_superpowers=true
        
        # Check if Cursor is mentioned in the superpowers section
        if sed -n '/<!-- SUPERPOWERS_SKILLS_START -->/,/<!-- SUPERPOWERS_SKILLS_END -->/p' "$project_agents_md" | \
           grep -qi "cursor" 2>/dev/null; then
            has_cursor=true
        fi
    fi
fi

# If project has proper superpowers setup with Cursor, continue normally
if [ "$has_superpowers" = true ] && [ "$has_cursor" = true ]; then
    # Return original prompt unchanged
    jq -n --arg prompt "$prompt" '{prompt: $prompt}'
    exit 0
fi

# Otherwise, prepend instruction to read global AGENTS.md
global_agents_md="${HOME}/.agents/AGENTS.md"

if [ -f "$global_agents_md" ]; then
    # Prepend instruction to read global skills documentation
    prepended_prompt="First, use read_file to read ${global_agents_md} to understand available skills and how to use them. Then proceed with: ${prompt}"
    
    jq -n --arg prompt "$prepended_prompt" '{prompt: $prompt}'
    exit 0
fi

# If no global AGENTS.md either, just continue with original prompt
jq -n --arg prompt "$prompt" '{prompt: $prompt}'
exit 0
