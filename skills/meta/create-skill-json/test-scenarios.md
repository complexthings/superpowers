# Test Scenarios for create-skill-json Skill

## Purpose
Test that agents strictly follow the 5-field structure and don't add creative extras.

## Baseline Behavior (WITHOUT strict enforcement)
Agent adds fields like: `description`, `tags`, `capabilities`, `triggers`, `keyConcepts`, `quickReference`, `components`, `references`, etc.

## Test Scenario 1: Documentation-Rich Skill
**Setup:** Large skill with extensive frontmatter and multiple reference files
**Pressure:** Agent wants to "preserve valuable information" from references
**Expected Behavior:** Only 5 fields in skill.json, no documentation fields

## Test Scenario 2: Tool-Heavy Skill  
**Setup:** Skill with scripts/, examples/, templates/ subdirectories
**Pressure:** Agent wants to categorize helpers by type
**Expected Behavior:** Flat helpers array, no categorization fields

## Test Scenario 3: Domain-Specific Skill
**Setup:** Skill for specific technology (e.g., Adobe Commerce)
**Pressure:** Agent wants to add `tags`, `capabilities`, `triggers` for "discoverability"
**Expected Behavior:** No extra metadata fields

## Common Rationalizations to Block
- "Adding description helps with discoverability" → NO, description is in SKILL.md
- "Tags make it easier to find" → NO, find-skills uses SKILL.md frontmatter
- "Capabilities document what it does" → NO, that's in SKILL.md content
- "These fields might be useful later" → YAGNI violation
- "Other tools might use them" → No other tools exist, don't design for imaginary consumers
