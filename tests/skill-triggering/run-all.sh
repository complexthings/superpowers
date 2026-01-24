#!/bin/bash
# Run all skill triggering tests
# Usage: ./run-all.sh
#
# AGENT-AGNOSTIC: Configure via environment variables (see README.md)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPTS_DIR="$SCRIPT_DIR/prompts"

# List of skills to test
# Add new skills here as you create prompt files for them
SKILLS=(
    "systematic-debugging"
    "test-driven-development"
    "writing-plans"
)

echo "=== Running Skill Triggering Tests ==="
echo "Agent: ${AGENT_CLI:-claude}"
echo ""

PASSED=0
FAILED=0
SKIPPED=0
RESULTS=()

for skill in "${SKILLS[@]}"; do
    prompt_file="$PROMPTS_DIR/${skill}.txt"

    if [ ! -f "$prompt_file" ]; then
        echo "SKIP: No prompt file for $skill"
        SKIPPED=$((SKIPPED + 1))
        RESULTS+=("-- $skill (no prompt file)")
        continue
    fi

    echo "Testing: $skill"

    if "$SCRIPT_DIR/run-test.sh" "$skill" "$prompt_file" 3 2>&1 | tee /tmp/skill-test-$skill.log; then
        PASSED=$((PASSED + 1))
        RESULTS+=("PASS $skill")
    else
        FAILED=$((FAILED + 1))
        RESULTS+=("FAIL $skill")
    fi

    echo ""
    echo "---"
    echo ""
done

echo ""
echo "=== Summary ==="
for result in "${RESULTS[@]}"; do
    echo "  $result"
done
echo ""
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Skipped: $SKIPPED"

# Also list available skills from superpowers-agent
echo ""
echo "=== Available Skills (via superpowers-agent) ==="
if command -v superpowers-agent &> /dev/null; then
    superpowers-agent find-skills 2>/dev/null | head -20 || echo "  (run 'superpowers-agent find-skills' to see all)"
else
    echo "  superpowers-agent not found in PATH"
fi

if [ $FAILED -gt 0 ]; then
    exit 1
fi
