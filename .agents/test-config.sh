#!/bin/bash
set -e

echo "Testing configuration system..."

# Test defaults
result=$(.agents/superpowers-agent get-config prompts_dir)
[ "$result" = ".agents/prompts" ] || { echo "FAIL: default prompts_dir"; exit 1; }
echo "✓ Default prompts_dir"

result=$(.agents/superpowers-agent get-config plans_dir)
[ "$result" = ".agents/plans" ] || { echo "FAIL: default plans_dir"; exit 1; }
echo "✓ Default plans_dir"

# Test global config
mkdir -p ~/.agents
echo '{"prompts_dir": "custom-prompts"}' > ~/.agents/config.json
result=$(.agents/superpowers-agent get-config prompts_dir)
[ "$result" = "custom-prompts" ] || { echo "FAIL: global config"; exit 1; }
echo "✓ Global config override"

# Test project config (higher priority)
echo '{"prompts_dir": "project-prompts"}' > .agents/config.json
result=$(.agents/superpowers-agent get-config prompts_dir)
[ "$result" = "project-prompts" ] || { echo "FAIL: project config"; exit 1; }
echo "✓ Project config override"

# Cleanup
rm -f ~/.agents/config.json .agents/config.json

echo "All configuration tests passed!"
