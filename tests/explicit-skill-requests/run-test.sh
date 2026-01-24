#!/bin/bash
# Test explicit skill requests (user names a skill directly)
# Usage: ./run-test.sh <skill-name> <prompt-file> [max-turns]
#
# Tests whether an AI agent invokes a skill when the user explicitly requests it
#
# AGENT-AGNOSTIC: Configure via environment variables (see README.md)

set -e

SKILL_NAME="$1"
PROMPT_FILE="$2"
MAX_TURNS="${3:-3}"

if [ -z "$SKILL_NAME" ] || [ -z "$PROMPT_FILE" ]; then
    echo "Usage: $0 <skill-name> <prompt-file> [max-turns]"
    echo "Example: $0 brainstorming ./prompts/use-brainstorming.txt"
    exit 1
fi

# Agent configuration with sensible defaults
AGENT_CLI="${AGENT_CLI:-claude}"
AGENT_PROMPT_FLAG="${AGENT_PROMPT_FLAG:--p}"
AGENT_OUTPUT_FORMAT="${AGENT_OUTPUT_FORMAT:---output-format stream-json}"
AGENT_MAX_TURNS_FLAG="${AGENT_MAX_TURNS_FLAG:---max-turns}"
AGENT_EXTRA_FLAGS="${AGENT_EXTRA_FLAGS:---dangerously-skip-permissions}"

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

TIMESTAMP=$(date +%s)
OUTPUT_DIR="/tmp/superpowers-agent-tests/${TIMESTAMP}/explicit-skill-requests/${SKILL_NAME}"
mkdir -p "$OUTPUT_DIR"

# Read prompt from file
PROMPT=$(cat "$PROMPT_FILE")

echo "=== Explicit Skill Request Test ==="
echo "Skill: $SKILL_NAME"
echo "Prompt file: $PROMPT_FILE"
echo "Max turns: $MAX_TURNS"
echo "Agent CLI: $AGENT_CLI"
echo "Output dir: $OUTPUT_DIR"
echo ""

# Copy prompt for reference
cp "$PROMPT_FILE" "$OUTPUT_DIR/prompt.txt"

# Create a minimal project directory for the test
PROJECT_DIR="$OUTPUT_DIR/project"
mkdir -p "$PROJECT_DIR/docs/plans"

# Create sample files that skills might reference
cat > "$PROJECT_DIR/docs/plans/sample-plan.md" << 'EOF'
# Sample Feature Plan

## Task 1: Setup
Create initial project structure.

## Task 2: Implementation
Build the core functionality.

## Task 3: Testing
Add tests for the feature.
EOF

# Run the agent
LOG_FILE="$OUTPUT_DIR/agent-output.json"
cd "$PROJECT_DIR"

echo "Running agent with explicit skill request..."
echo "Prompt: $PROMPT"
echo ""

timeout 300 $AGENT_CLI $AGENT_PROMPT_FLAG "$PROMPT" \
    $AGENT_OUTPUT_FORMAT \
    $AGENT_MAX_TURNS_FLAG "$MAX_TURNS" \
    $AGENT_EXTRA_FLAGS \
    > "$LOG_FILE" 2>&1 || true

echo ""
echo "=== Results ==="

# Check if skill was triggered
SKILL_PATTERN='"skill":"([^"]*:)?'"${SKILL_NAME}"'"'
TRIGGERED=false

# Try Claude-style detection first
if grep -q '"name":"Skill"' "$LOG_FILE" 2>/dev/null && grep -qE "$SKILL_PATTERN" "$LOG_FILE" 2>/dev/null; then
    TRIGGERED=true
fi

# Try generic skill reference detection
if [ "$TRIGGERED" = "false" ]; then
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

# Show what skills WERE triggered
echo ""
echo "Skills detected in output:"
grep -o '"skill":"[^"]*"' "$LOG_FILE" 2>/dev/null | sort -u || echo "  (none detected - check log manually)"

# Check for premature action (agent started work before loading skill)
echo ""
echo "Checking for premature action..."

FIRST_SKILL_LINE=$(grep -n '"name":"Skill"' "$LOG_FILE" 2>/dev/null | head -1 | cut -d: -f1)
if [ -n "$FIRST_SKILL_LINE" ]; then
    # Check if non-planning tools were invoked before the first Skill invocation
    PREMATURE_TOOLS=$(head -n "$FIRST_SKILL_LINE" "$LOG_FILE" 2>/dev/null | \
        grep '"type":"tool_use"' | \
        grep -v '"name":"Skill"' | \
        grep -v '"name":"TodoWrite"' | \
        grep -v '"name":"TodoRead"' || true)
    if [ -n "$PREMATURE_TOOLS" ]; then
        echo "WARNING: Tools invoked BEFORE Skill tool:"
        echo "$PREMATURE_TOOLS" | head -5
        echo ""
        echo "This indicates the agent started work before loading the requested skill."
    else
        echo "OK: No premature tool invocations detected"
    fi
else
    echo "WARNING: No Skill invocation found at all"
fi

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
