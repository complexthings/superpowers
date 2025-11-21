#!/bin/bash
# Get the next prompt number based on existing prompts

# Get configured prompts directory
PROMPTS_DIR=$(.agents/superpowers-agent get-config prompts_dir 2>/dev/null || echo ".agents/prompts")

# If prompts directory doesn't exist, start at 001
if [ ! -d "$PROMPTS_DIR" ]; then
    echo "001"
    exit 0
fi

# Find highest number from existing prompt directories
HIGHEST=$(find "$PROMPTS_DIR" -maxdepth 1 -type d -name '[0-9][0-9][0-9]-*' 2>/dev/null | \
    sed 's/.*\/\([0-9][0-9][0-9]\)-.*/\1/' | \
    sort -n | \
    tail -1)

# If no prompts exist yet, start at 001
if [ -z "$HIGHEST" ]; then
    echo "001"
    exit 0
fi

# Increment and format with leading zeros
NEXT=$((10#$HIGHEST + 1))
printf "%03d\n" $NEXT
