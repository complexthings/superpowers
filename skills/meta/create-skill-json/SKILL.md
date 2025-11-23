---
name: Create skill.json
description: Generate a skill.json metadata file for a skill from its SKILL.md and directory structure
when_to_use: when adding or updating skill.json files for skills in a repository, ensuring proper metadata configuration for skill discovery and tooling
version: 1.0.0
dependencies: jq (optional, for JSON validation)
---

# Create skill.json

## Overview

Generate a `skill.json` metadata file for a skill based on its `SKILL.md` frontmatter and directory structure. This ensures consistent skill metadata across repositories.

**Core principle:** skill.json is generated from existing information (frontmatter, file structure), not created from scratch with assumptions.

## When to Use

Use this skill when:
- Adding a new skill that needs a skill.json file
- Updating an existing skill's metadata
- Standardizing skill.json files across a repository
- Migrating skills to use the skill.json format

## Input Requirements

You must be given:
- A path to a `SKILL.md` file, OR
- A path to a directory containing a `SKILL.md` file

## Process

### 1. Validate Input

```bash
# If given directory path
if [ -d "$input_path" ]; then
    skill_dir="$input_path"
    skill_md="${skill_dir}/SKILL.md"
else
    skill_md="$input_path"
    skill_dir="$(dirname "$input_path")"
fi

# Verify SKILL.md exists
if [ ! -f "$skill_md" ]; then
    echo "Error: SKILL.md not found at $skill_md"
    exit 1
fi
```

### 2. Extract Frontmatter Data

Read the SKILL.md file and extract frontmatter fields:

```yaml
---
name: Human-Readable Name
description: One-line summary
when_to_use: when [trigger/situation]
version: 1.0.0  # Optional, defaults to 1.0.0
---
```

**Required fields from frontmatter:**
- `name` → becomes `title` in skill.json
- `description` → for documentation (not used in skill.json directly)
- `when_to_use` → for documentation (not used in skill.json directly)

**Optional fields:**
- `version` → use if present, otherwise default to "1.0.0"

### 3. Determine Skill Name (Canonical Path)

The skill `name` in skill.json is the **relative path from the skills root directory**.

**Examples:**
- Skill at `./skills/debugging/memory-profiling/` → name: `debugging/memory-profiling`
- Skill at `./skills/meta/create-skill-json/` → name: `meta/create-skill-json`
- Skill at `~/.agents/superpowers/skills/collaboration/brainstorming/` → name: `collaboration/brainstorming`

**DO NOT add namespace prefixes** like `superpowers:` or `project:` - the name is just the path.

### 4. Identify Helper Files

Helper files are any files in the skill directory (excluding SKILL.md itself) that support the skill:

**Common helper locations:**
- `scripts/` - executable scripts
- `examples/` - example code or files
- `templates/` - reusable templates
- `helpers/`, `utilities/`, `tools/`, `docs/` - supporting files
- Root directory files (e.g., `package.json`, `*.js`, `*.py`, `*.sh`)

**Include in helpers array:**
- All files in subdirectories: `scripts/`, `examples/`, `templates/`, etc.
- All non-SKILL.md files in the root directory

**Path format:** Relative to the skill directory (where skill.json will live)

```json
"helpers": [
  "scripts/profile-heap.js",
  "scripts/analyze-snapshots.py",
  "examples/node-example.js",
  "package.json"
]
```

**Exclusions:**
- SKILL.md itself
- skill.json (if it already exists)
- Hidden files (starting with `.`)
- Common non-helper files: `README.md`, `.gitignore`, `node_modules/`, etc.

### 5. Generate Aliases

Aliases allow users to reference the skill with shorter names.

**Required aliases (in this order):**
1. The full skill path: `category/skill-name`
2. Just the skill name: `skill-name`

**Example:**
```json
"aliases": [
  "debugging/memory-profiling",
  "memory-profiling"
]
```

**Do NOT add extra aliases** unless explicitly instructed. Stick to the two standard aliases.

### 6. Create skill.json

Assemble the complete skill.json:

```json
{
  "version": "1.0.0",
  "name": "category/skill-name",
  "title": "Human-Readable Title",
  "helpers": [
    "scripts/helper1.js",
    "scripts/helper2.py"
  ],
  "aliases": [
    "category/skill-name",
    "skill-name"
  ]
}
```

### 7. Write and Validate

Write the skill.json file to the skill directory:

```bash
output_path="${skill_dir}/skill.json"
echo "$skill_json" > "$output_path"

# Optional: Validate JSON syntax
if command -v jq &> /dev/null; then
    jq empty "$output_path" 2>&1 || echo "Warning: Invalid JSON generated"
fi

echo "Created: $output_path"
```

## Complete Example

**Input:** `./skills/debugging/memory-profiling/`

**Directory structure:**
```
./skills/debugging/memory-profiling/
├── SKILL.md
├── scripts/
│   ├── profile-heap.js
│   ├── analyze-snapshots.py
│   └── compare-profiles.sh
└── examples/
    └── node-example.js
```

**SKILL.md frontmatter:**
```yaml
---
name: Memory Profiling
version: 2.1.0
---
```

**Generated skill.json:**
```json
{
  "version": "2.1.0",
  "name": "debugging/memory-profiling",
  "title": "Memory Profiling",
  "helpers": [
    "scripts/profile-heap.js",
    "scripts/analyze-snapshots.py",
    "scripts/compare-profiles.sh",
    "examples/node-example.js"
  ],
  "aliases": [
    "debugging/memory-profiling",
    "memory-profiling"
  ]
}
```

## Common Mistakes

### ❌ Adding namespace prefixes to name
```json
"name": "superpowers:debugging/memory-profiling"  // WRONG
```

**Fix:** Name is just the path, no prefix:
```json
"name": "debugging/memory-profiling"  // CORRECT
```

### ❌ Adding creative aliases
```json
"aliases": ["memory-profiling", "heap-profiling", "memory-analysis"]  // WRONG
```

**Fix:** Only use standard path-based aliases:
```json
"aliases": ["debugging/memory-profiling", "memory-profiling"]  // CORRECT
```

### ❌ Excluding example files from helpers
```json
"helpers": ["scripts/helper.js"]  // examples/ files missing
```

**Fix:** Include all supporting files:
```json
"helpers": ["scripts/helper.js", "examples/example.js"]  // CORRECT
```

### ❌ Using description for title
```json
"title": "One-line summary of what this does"  // WRONG
```

**Fix:** Use the `name` field from frontmatter:
```json
"title": "Memory Profiling"  // CORRECT
```

## Fields Reference

| Field | Source | Required | Default |
|-------|--------|----------|---------|
| `version` | Frontmatter `version` | No | `"1.0.0"` |
| `name` | Skill directory path | Yes | N/A |
| `title` | Frontmatter `name` | Yes | N/A |
| `helpers` | All files except SKILL.md, skill.json | No | `[]` |
| `aliases` | Generated from path | Yes | `[full-path, skill-name]` |

## Verification

After creating skill.json, verify:

- [ ] JSON is valid syntax (use `jq` if available)
- [ ] `version` matches SKILL.md frontmatter (or is "1.0.0")
- [ ] `name` is the relative path without namespace prefix
- [ ] `title` matches `name` field from SKILL.md frontmatter
- [ ] `helpers` array includes all support files with correct relative paths
- [ ] `aliases` contains exactly two entries: full path and skill name
- [ ] File saved to same directory as SKILL.md

## Related Skills

- **superpowers:writing-skills** - Create new skills following TDD methodology
- **superpowers:gardening-skills-wiki** - Maintain and organize skill collections
