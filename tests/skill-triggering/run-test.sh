#!/bin/bash
# Test skill triggering with naive prompts
# Usage: ./run-test.sh <skill-name> <prompt-file> [max-turns]
#
# Tests whether an AI agent triggers a skill based on a natural prompt
# (without explicitly mentioning the skill)
#
# AGENT-AGNOSTIC: Configure via environment variables (see README.md)

set -e

SKILL_NAME="$1"
PROMPT_FILE="$2"
MAX_TURNS="${3:-3}"

if [ -z "$SKILL_NAME" ] || [ -z "$PROMPT_FILE" ]; then
    echo "Usage: $0 <skill-name> <prompt-file> [max-turns]"
    echo "Example: $0 systematic-debugging ./prompts/systematic-debugging.txt"
    exit 1
fi

# Agent configuration with sensible defaults
# Override these environment variables for your specific agent
AGENT_CLI="${AGENT_CLI:-claude}"
AGENT_PROMPT_FLAG="${AGENT_PROMPT_FLAG:--p}"
AGENT_OUTPUT_FORMAT="${AGENT_OUTPUT_FORMAT:---output-format stream-json}"
AGENT_MAX_TURNS_FLAG="${AGENT_MAX_TURNS_FLAG:---max-turns}"
AGENT_EXTRA_FLAGS="${AGENT_EXTRA_FLAGS:---dangerously-skip-permissions}"

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the superpowers-agent root (two levels up from tests/skill-triggering)
AGENT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

TIMESTAMP=$(date +%s)
OUTPUT_DIR="/tmp/superpowers-agent-tests/${TIMESTAMP}/skill-triggering/${SKILL_NAME}"
mkdir -p "$OUTPUT_DIR"

# Read prompt from file
PROMPT=$(cat "$PROMPT_FILE")

echo "=== Skill Triggering Test ==="
echo "Skill: $SKILL_NAME"
echo "Prompt file: $PROMPT_FILE"
echo "Max turns: $MAX_TURNS"
echo "Agent CLI: $AGENT_CLI"
echo "Output dir: $OUTPUT_DIR"
echo ""

# Copy prompt for reference
cp "$PROMPT_FILE" "$OUTPUT_DIR/prompt.txt"

# Run the agent
LOG_FILE="$OUTPUT_DIR/agent-output.json"
cd "$OUTPUT_DIR"

echo "Running agent with naive prompt..."
echo "Command: $AGENT_CLI $AGENT_PROMPT_FLAG \"<prompt>\" $AGENT_OUTPUT_FORMAT $AGENT_MAX_TURNS_FLAG $MAX_TURNS"
echo ""

# Build the command
# Note: Adjust this section for agents with different CLI patterns
CMD="$AGENT_CLI $AGENT_PROMPT_FLAG"

# Execute with timeout
# The actual command structure may need adjustment per agent
timeout 300 $AGENT_CLI $AGENT_PROMPT_FLAG "$PROMPT" \
    $AGENT_OUTPUT_FORMAT \
    $AGENT_MAX_TURNS_FLAG "$MAX_TURNS" \
    $AGENT_EXTRA_FLAGS \
    > "$LOG_FILE" 2>&1 || true

echo ""
echo "=== Results ==="

# Check if skill was triggered
# This detection logic works for stream-json output format
# Adapt the patterns for your agent's output format

# Pattern: Look for skill invocation in various formats
# - Claude: '"name":"Skill"' with '"skill":"skillname"'
# - Generic: skill name appears in tool/skill invocation context

SKILL_PATTERN='"skill":"([^"]*:)?'"${SKILL_NAME}"'"'
TRIGGERED=false

# Try Claude-style detection first
if grep -q '"name":"Skill"' "$LOG_FILE" 2>/dev/null && grep -qE "$SKILL_PATTERN" "$LOG_FILE" 2>/dev/null; then
    TRIGGERED=true
fi

# Try generic skill reference detection (backup)
if [ "$TRIGGERED" = "false" ]; then
    # Look for skill name in various contexts
    if grep -qi "loading skill.*${SKILL_NAME}" "$LOG_FILE" 2>/dev/null || \
       grep -qi "using skill.*${SKILL_NAME}" "$LOG_FILE" 2>/dev/null || \
       grep -qi "skill: ${SKILL_NAME}" "$LOG_FILE" 2>/dev/null; then
        TRIGGERED=true
    fi
fi

if [ "$TRIGGERED" = "true" ]; then
    echo "PASS: Skill '$SKILL_NAME' was triggered"
else
    echo "FAIL: Skill '$SKILL_NAME' was NOT triggered"
fi

# Show what skills WERE triggered (Claude format)
echo ""
echo "Skills detected in output:"
grep -o '"skill":"[^"]*"' "$LOG_FILE" 2>/dev/null | sort -u || echo "  (none detected - check log manually)"

# Show first response (truncated)
echo ""
echo "First response (truncated):"
if command -v jq &> /dev/null; then
    grep '"type":"assistant"' "$LOG_FILE" 2>/dev/null | head -1 | \
        jq -r '.message.content[0].text // .message.content' 2>/dev/null | \
        head -c 500 || head -c 500 "$LOG_FILE"
else
    head -c 500 "$LOG_FILE"
fi

echo ""
echo ""
echo "Full log: $LOG_FILE"
echo "Timestamp: $TIMESTAMP"

if [ "$TRIGGERED" = "true" ]; then
    exit 0
else
    exit 1
fi
