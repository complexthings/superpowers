---
name: create-skill-json
description: Generate a skill.json metadata file for a skill from its SKILL.md and directory structure. Use when adding a new skill to a repository, updating an existing skill's metadata, or standardizing skill.json files. Triggers whenever someone mentions generating, creating, or updating skill.json files.
metadata:
  version: 1.1.0
---

# Create skill.json

## Overview

Generate a `skill.json` metadata file for a skill based on its `SKILL.md` frontmatter and directory structure. This ensures consistent skill metadata across repositories.

**Core principle:** skill.json is generated from existing information (frontmatter, file structure), not created from scratch with assumptions.

**CRITICAL:** skill.json contains **EXACTLY 5 FIELDS** - no more, no less. Any additional fields are forbidden.

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
name: human-readable-name
description: One-line summary of what the skill does and when to use it.
metadata:
  version: 1.0.0  # Optional, defaults to 1.0.0
---
```

**Required fields from frontmatter:**
- `name` → becomes `title` in skill.json
- `metadata.version` (or top-level `version`) → use if present, otherwise default to "1.0.0"

### 3. Determine Skill Name (with Namespace)

The skill `name` in skill.json includes a **namespace prefix** based on where the skill lives:

| Location | Namespace | Example name |
|----------|-----------|--------------|
| `~/.agents/superpowers/skills/` | `superpowers:` | `superpowers:debugging/memory-profiling` |
| `.agents/skills/` (project) | none | `debugging/memory-profiling` |
| `~/.agents/skills/` (personal) | none | `debugging/memory-profiling` |

The path component after the namespace is the **relative path from the skills root directory**.

**Examples:**
- Superpowers skill at `~/.agents/superpowers/skills/debugging/memory-profiling/` → name: `superpowers:debugging/memory-profiling`
- Project skill at `./skills/meta/create-skill-json/` → name: `meta/create-skill-json`
- Personal skill at `~/.agents/skills/collaboration/brainstorming/` → name: `collaboration/brainstorming`

**When context is ambiguous** (can't determine location), ask the user or default to no prefix.

### 4. Identify Helper Files

Helper files are files in the skill directory (excluding SKILL.md itself) that the skill **references or uses**. Focus on files that support agents executing the skill.

**Include in helpers array:**
- `scripts/` — executable scripts referenced in the skill
- `examples/` — example code or files used in the skill
- `templates/` — reusable templates the skill instructs agents to use
- `references/` — reference documents the skill tells agents to read
- `assets/` — static resources the skill uses
- Root-level support files (e.g., `package.json`, `*.sh`, `*.py` that aren't test files)

**Path format:** Relative to the skill directory (where skill.json will live)

```json
"helpers": [
  "scripts/profile-heap.js",
  "scripts/analyze-snapshots.py",
  "examples/node-example.js",
  "package.json"
]
```

**Exclude from helpers:**
- `SKILL.md` itself
- `skill.json` (if it already exists)
- Hidden files (starting with `.`)
- Test/evaluation files (`test-*.md`, `evals/`, `*-workspace/`)
- Documentation not used by the skill: `README.md`, `CHANGELOG.md`, `LICENSE.txt`
- `node_modules/`, build artifacts

**If helpers array is empty**, omit the field entirely (don't include `"helpers": []`).

### 5. Generate Aliases

Aliases allow users to reference the skill with shorter names.

**Standard aliases (in this order):**
1. Just the skill name (shortest): `skill-name`
2. The full path: `category/skill-name`

**Example:**
```json
"aliases": [
  "memory-profiling",
  "debugging/memory-profiling"
]
```

**Optional:** Add a well-known abbreviation as a third alias if one exists (e.g., `"tdd"` for test-driven-development, `"sdd"` for subagent-driven-development). Only add an abbreviation if it's clearly recognized — don't invent aliases.

**Do NOT add random synonyms** — stick to the standard two aliases unless an obvious abbreviation exists.

### 6. Create skill.json

Assemble the complete skill.json with **EXACTLY these 5 fields** (or 4 if helpers is empty):

```json
{
  "version": "1.0.0",
  "name": "superpowers:category/skill-name",
  "title": "Human-Readable Title",
  "helpers": [
    "scripts/helper1.js"
  ],
  "aliases": [
    "skill-name",
    "category/skill-name"
  ]
}
```

When helpers is empty, omit it:

```json
{
  "version": "1.0.0",
  "name": "superpowers:category/skill-name",
  "title": "Human-Readable Title",
  "aliases": [
    "skill-name",
    "category/skill-name"
  ]
}
```

**FORBIDDEN:** Do NOT add any other fields. No `description`, `tags`, `capabilities`, `triggers`, `keyConcepts`, `components`, `references`, `quickReference`, `resources`, `stats`, `when_to_use`, or any other creative fields.

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

Also run `skills-ref validate` if the tool is available:

```bash
if command -v skills-ref &> /dev/null; then
    skills-ref validate "$skill_dir" && echo "Skill validation passed"
fi
```

## Complete Example

**Input:** `~/.agents/superpowers/skills/debugging/memory-profiling/`

**Directory structure:**
```
~/.agents/superpowers/skills/debugging/memory-profiling/
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
name: memory-profiling
metadata:
  version: 2.1.0
---
```

**Generated skill.json:**
```json
{
  "version": "2.1.0",
  "name": "superpowers:debugging/memory-profiling",
  "title": "memory-profiling",
  "helpers": [
    "scripts/profile-heap.js",
    "scripts/analyze-snapshots.py",
    "scripts/compare-profiles.sh",
    "examples/node-example.js"
  ],
  "aliases": [
    "memory-profiling",
    "debugging/memory-profiling"
  ]
}
```

## FORBIDDEN FIELDS

**skill.json must contain EXACTLY 4-5 fields** (version, name, title, helpers [optional], aliases). The following fields are explicitly FORBIDDEN:

### Documentation Fields (belongs in SKILL.md)
- ❌ `description` - Use SKILL.md frontmatter `description` field
- ❌ `when_to_use` - Use SKILL.md frontmatter or content
- ❌ `keyConcepts` - Document in SKILL.md content
- ❌ `overview` - Document in SKILL.md content

### Discovery Fields (handled by find-skills)
- ❌ `tags` - Use SKILL.md frontmatter fields for search
- ❌ `keywords` - Use SKILL.md content for search
- ❌ `triggers` - Use SKILL.md `description` field
- ❌ `categories` - Path already indicates category

### Capability Fields (documented in SKILL.md)
- ❌ `capabilities` - Document in SKILL.md content
- ❌ `features` - Document in SKILL.md content
- ❌ `commands` - Document in SKILL.md content

### Reference Fields (use helper files)
- ❌ `references` - Link to helper files in SKILL.md
- ❌ `resources` - Add to `helpers` array if needed
- ❌ `links` - Add to SKILL.md content

### Structure Fields (use helper files)
- ❌ `components` - Document in SKILL.md or helper files
- ❌ `quickReference` - Create as helper file if needed

### Metadata Fields (not used by tooling)
- ❌ `author` - Track in git history
- ❌ `license` - Inherited from repository

### Statistics/Config Fields (unnecessary)
- ❌ `stats` - Not used by any tooling
- ❌ `config` - Create as helper file if needed

## Rationalization Table

| Rationalization | Counter |
|-----------------|---------|
| "Adding `description` helps with discoverability" | NO. Description is in SKILL.md frontmatter. find-skills reads that. |
| "`tags` make it easier to categorize and search" | NO. find-skills uses SKILL.md content and frontmatter. Path already indicates category. |
| "`capabilities` document what the skill does" | NO. That's what SKILL.md content is for. skill.json is for tooling, not documentation. |
| "`triggers` help agents know when to use this" | NO. SKILL.md `description` field serves this purpose. Don't duplicate. |
| "These fields might be useful for future features" | YAGNI violation. No imaginary consumers. Only add fields when tooling actually needs them. |
| "`helpers: []` is cleaner than omitting the field" | NO. Omit empty arrays — real skill.json files do not include `helpers` when empty. |
| "Other skill systems use these fields" | Irrelevant. superpowers-agent uses 4-5 fields. Period. |
| "Extra metadata is harmless" | NO. Bloats files, creates maintenance burden, misleads about what tooling uses. |

## Common Mistakes

### ❌ Missing namespace prefix for superpowers skills
```json
"name": "debugging/memory-profiling"  // WRONG for superpowers skills
```

**Fix:** Add the `superpowers:` prefix for skills in `~/.agents/superpowers/skills/`:
```json
"name": "superpowers:debugging/memory-profiling"  // CORRECT
```

### ❌ Wrong alias order
```json
"aliases": ["debugging/memory-profiling", "memory-profiling"]  // WRONG - long path first
```

**Fix:** Short name first, full path second:
```json
"aliases": ["memory-profiling", "debugging/memory-profiling"]  // CORRECT
```

### ❌ Including empty helpers array
```json
"helpers": []  // WRONG - omit if empty
```

**Fix:** Omit the field entirely when there are no helpers:
```json
// Just leave out "helpers" when there's nothing to list
```

### ❌ Including test/eval files in helpers
```json
"helpers": ["test-scenarios.md", "evals/evals.json"]  // WRONG - test files aren't helpers
```

**Fix:** Only include files that agents use when executing the skill.

### ❌ Adding creative aliases
```json
"aliases": ["memory-profiling", "heap-profiling", "memory-analysis"]  // WRONG
```

**Fix:** Standard two aliases unless a well-known abbreviation exists:
```json
"aliases": ["memory-profiling", "debugging/memory-profiling"]  // CORRECT
```

## Fields Reference

| Field | Source | Required | Default |
|-------|--------|----------|---------|
| `version` | Frontmatter `metadata.version` | No | `"1.0.0"` |
| `name` | Namespace + skill directory path | Yes | N/A |
| `title` | Frontmatter `name` field | Yes | N/A |
| `helpers` | Referenced support files | No | Omit if empty |
| `aliases` | Generated from path | Yes | `["skill-name", "category/skill-name"]` |

## Verification

After creating skill.json, verify:

- [ ] JSON is valid syntax (use `jq` if available)
- [ ] **File contains exactly 4 or 5 top-level fields** (version, name, title, [helpers], aliases)
- [ ] No forbidden fields present
- [ ] `version` matches SKILL.md frontmatter (or is "1.0.0")
- [ ] `name` includes correct namespace prefix (`superpowers:` for superpowers repo, none for project/personal)
- [ ] `title` matches `name` field from SKILL.md frontmatter
- [ ] `helpers` array lists only referenced support files (omitted if empty)
- [ ] `aliases` has short name first, full path second
- [ ] File saved to same directory as SKILL.md
- [ ] `skills-ref validate` passes (if tool available)

**Field count check:**
```bash
jq 'keys | length' skill.json  # Must output: 4 or 5
```

## Related Skills

- **superpowers:writing-skills** - Create new skills following TDD methodology
- **superpowers:gardening-skills-wiki** - Maintain and organize skill collections
