# Superpowers Release Notes

Release history for the agent-agnostic fork of Superpowers.

**About This Fork:** This project extends [Jesse Vincent's Superpowers for Claude Code](https://github.com/obra/superpowers) to support universal AI coding assistants including GitHub Copilot, Cursor, Gemini, Codex, OpenCode, and Windsurf. Jesse's [groundbreaking work](https://blog.fsck.com/2025/10/09/superpowers/) introduced systematic, reusable skills for AI agents—this fork makes those workflows accessible across all major AI development tools.

---

## v5.3.0 (November 24, 2025)

### 🔄 Command Refactoring

**Renamed: `use-skill` → `execute`**
- More intuitive command name for loading and running skills
- Updated all documentation, examples, and slash commands
- Backward compatibility note: Old `use-skill` command still works but is deprecated

**Command Updates Across All Platforms:**
- OpenCode: `/execute` (was `/use-skill`)
- Claude Code: Updated commands/using-a-skill.md
- GitHub Copilot: `/execute` via superpowers-execute.prompt.md
- Cursor: `/execute` command
- Gemini: `/execute` via execute.toml
- Codex: `/execute` prompt file

### 🆕 New Commands

**`path` Command**
- Returns the file system path to a skill's SKILL.md file
- Supports aliases and smart matching
- Enables programmatic access to skill content
- Usage: `superpowers-agent path <skill-name-or-alias>`

**Examples:**
```bash
superpowers-agent path brainstorming
# Output: /Users/username/.agents/superpowers/skills/collaboration/brainstorming/SKILL.md

superpowers-agent path superpowers:collaboration/brainstorming
superpowers-agent path block-collection  # Using alias
```

**Complementary Commands:**
- `dir` - Returns skill directory path
- `path` - Returns SKILL.md file path
- `get-helpers` - Returns specific helper file path
- `execute` - Loads and executes a skill

### 🛠️ Enhanced create-skill-json Skill

**Strict 5-Field Enforcement**
- Added CRITICAL note that skill.json must have EXACTLY 5 fields
- Comprehensive FORBIDDEN FIELDS section with 40+ banned fields organized by category
- Rationalization Table with 10 common excuses and counters
- Updated verification checklist with field count requirement (`jq 'keys | length'` must equal 5)
- Created test-scenarios.md for testing with subagents

**Forbidden Field Categories:**
- Documentation fields (description, keyConcepts, overview) → Use SKILL.md
- Discovery fields (tags, keywords, triggers) → Use find-skills
- Capability fields (capabilities, features, functions) → Document in SKILL.md
- Reference fields (references, resources, links) → Use helper files
- Structure fields (components, modules, apis) → Use SKILL.md or helpers
- Metadata fields (author, contributors, license) → Track in git
- Usage fields (examples, userLevels, quickStart) → Use helpers
- Statistics fields (stats, metrics, counts) → Not used by tooling
- Update fields (updateInstructions, changelog) → Track in git
- Configuration fields (config, settings, options) → Use helper files

**The Only 5 Allowed Fields:**
1. `version` - Version tracking
2. `name` - Skill path identifier
3. `title` - Human-readable name
4. `helpers` - Array of helper file paths
5. `aliases` - Array of alternative names

### 📚 Documentation Updates

**Updated Files:**
- README.md - All `use-skill` references changed to `execute`, added `path` command documentation
- INSTALL.md - Updated command reference
- RELEASE-NOTES.md - This section
- All slash command files updated for command rename
- .github/copilot-instructions.md - Updated with `execute` command

**Command Comparison:**
| Old Command | New Command | Purpose |
|-------------|-------------|---------|
| `use-skill <name>` | `execute <name>` | Load and run a skill |
| N/A | `path <name>` | Get SKILL.md file path |
| `dir <name>` | `dir <name>` | Get skill directory (unchanged) |

### 🔧 Breaking Changes

**None - Backward Compatible**
- Old `use-skill` command still works (deprecated but functional)
- Existing scripts and workflows continue to function
- Gradual migration recommended but not required

### 💡 Migration Guide

**For Users:**
- Replace `superpowers-agent use-skill` with `superpowers-agent execute` in scripts
- Update slash command usage from `/use-skill` to `/execute`
- No immediate action required - both commands work

**For Skill Authors:**
- When creating new skill.json files, strictly follow the 5-field structure
- Use enhanced create-skill-json skill to prevent field bloat
- Verify with `jq 'keys | length' skill.json` (must output 5)

---

## v5.2.3 (November 23, 2025)

### 🐛 Bug Fixes

**Symlink Support for Nested Skills**
- Fixed `find-skills` to discover skills in symlinked directories
- Fixed `execute` to load skills from symlinked nested directories
- Both functions now detect and follow symlinks using `statSync()`
- Gracefully handles broken symlinks with try/catch
- Enables personal skill organization with symlinked category directories

**Technical Details:**
- Node.js `readdirSync()` with `withFileTypes` returns `isDirectory()=false` for symlinks
- Solution: Check `entry.isSymbolicLink()` and use `statSync()` to verify target is directory
- Applied to both `findSkillsInDir()` and `findMatchingSkills()` functions

**Example Use Case:**
```bash
# Personal skills organized with symlinks
~/.agents/skills/
  aem/ -> /Users/username/sites/ai/skills/aem/  # Symlinked directory
    authoring-analysis/SKILL.md
    block-collection-and-party/SKILL.md
    # ... 14+ more AEM skills

# Now discovered correctly by find-skills
superpowers-agent find-skills | grep aem
superpowers-agent execute aem/authoring-analysis  # Works!
superpowers-agent execute authoring-analysis       # Smart matching works too!
```

---

## v5.2.2 (November 23, 2025)

### 🎯 New Skills

**create-skill-json Skill** (meta/create-skill-json)
- Generate skill.json metadata files from SKILL.md frontmatter and directory structure
- Ensures consistent metadata across repositories
- Automatically extracts version, title, and helpers from existing files
- Generates standard aliases (full path + skill name)
- Validates JSON syntax with jq (if available)
- TDD-tested with baseline and pressure scenarios

**verification-before-completion Skill** (testing/verification-before-completion)
- Ported from Jesse Vincent's original Superpowers repository
- Enforces evidence-based completion claims
- Prevents "should work" or "looks correct" without verification
- Requires running verification commands before success claims
- Comprehensive rationalization prevention
- Critical for maintaining trust and quality

### 🔧 Infrastructure Updates

**Hook Modernization**
- Updated `hooks/session-start.sh` to use `superpowers-agent` CLI
- Updated `hooks/cursor/inject-bootstrap.sh` for superpowers-agent detection
- Removed direct filesystem references in favor of CLI commands
- Better error handling when superpowers-agent not installed
- Installation instructions displayed when CLI tool missing

### 📚 Documentation

**Skill Documentation**
- create-skill-json includes complete process with validation steps
- verification-before-completion maintains original iron law philosophy
- Both skills include frontmatter for proper metadata extraction

### 💡 Usage Examples

**Generate skill.json:**
```bash
# Load the skill (if superpowers-agent indexed)
superpowers-agent use-skill create-skill-json

# Follow the process to generate skill.json
# Input: path to SKILL.md or directory containing SKILL.md
# Output: skill.json in same directory as SKILL.md
```

**Verification before completion:**
```bash
# Automatically activates when claiming work is complete
# Enforces: Evidence before claims, always
# Prevents premature success declarations
```

### 🎓 Credits

- **create-skill-json**: Created using writing-skills and testing-skills-with-subagents methodology
- **verification-before-completion**: Ported from [@obra/superpowers](https://github.com/obra/superpowers) with gratitude to Jesse Vincent

---

## v5.2.1 (November 23, 2025)

### 📋 Metadata Management

**Complete skill.json Coverage**
- Added skill.json files for all 35 skills in the repository
- Automated extraction of metadata from SKILL.md frontmatter
- Version tracking synced with individual skill versions (1.0.0 to 5.1.0)
- Helper file discovery for all skills with scripts and resources

**Version Distribution**
- **v5.1.0** (2 skills): creating-prompts, writing-skills - Most mature skills
- **v3.1.0** (1 skill): test-driven-development
- **v2.2.0** (2 skills): brainstorming, executing-plans
- **v2.1.0** (3 skills): sharing-skills, writing-plans, systematic-debugging
- **v1.1.0** (20 skills): Most collaboration, debugging, and problem-solving skills
- **v1.0.0** (6 skills): Skills without explicit versions in frontmatter

**skill.json Structure**
- **version**: Extracted from SKILL.md frontmatter or defaults to 1.0.0
- **name**: Full skill path with `superpowers:` prefix (e.g., `superpowers:collaboration/brainstorming`)
- **title**: Human-readable name from SKILL.md frontmatter
- **helpers**: Auto-detected scripts, examples, templates, and resources
- **aliases**: Short names and full paths for flexible skill loading

**Helper File Detection**
- Automatically scans: scripts, tools, resources, references, examples, helpers, utils, utilities, templates
- Includes root-level helper files (excluding SKILL.md and skill.json)
- 9 skills with helper files identified and cataloged

### 🎯 Skills with Helper Files

- **creating-prompts** (v5.1.0): 9 helpers including scripts, examples, templates
- **gardening-skills-wiki** (v1.1.0): 7 analysis and maintenance scripts
- **playwright-skill** (v1.0.0): 3 helpers including scripts and API reference
- **context-7** (v1.0.0): 3 helpers including search and docs scripts
- **writing-skills** (v5.1.0): 2 helpers (graphviz conventions, persuasion principles)
- **root-cause-tracing** (v1.1.0): find-polluter.sh script
- **testing-skills-with-subagents** (v1.1.0): example test file
- **requesting-code-review** (v1.1.0): code-reviewer agent definition
- **condition-based-waiting** (v1.1.0): TypeScript example

### 📚 Documentation Updates

**README.md**
- Added note about complete skill.json coverage across all 35 skills
- Documented version tracking and distribution
- Added examples of using skill.json features
- Listed most mature skills and their versions

**Benefits**
- Helper file discovery via `superpowers-agent get-helpers`
- Skill alias support for convenient loading
- Version tracking for skill evolution monitoring
- Foundation for future skill marketplace and sharing features

### 💡 Usage Examples

```bash
# Use skill with aliases
superpowers-agent use-skill brainstorming
superpowers-agent use-skill tdd  # Works with test-driven-development

# Find helper files
superpowers-agent get-helpers creating-prompts template
superpowers-agent get-helpers root-cause-tracing polluter

# Get skill directory for direct file access
SKILL_DIR=$(superpowers-agent dir writing-skills)
ls -la "$SKILL_DIR"
```

---

## v5.2.0 (November 23, 2025)

### 🎯 Major New Features

**Skill Installation System**
- **`add` command** - Install skills from Git repositories, local directories, or repository aliases
  - Supports GitHub repositories (including tree URLs with branches)
  - Supports local file system paths
  - Automatic multi-skill detection from `skill.json`
  - Global (`~/.agents/skills/`) or project (`.agents/skills/`) installation
  - Smart directory structure creation based on skill `name` field
  - Example: `superpowers-agent add https://github.com/example/skills.git`

- **`add-repository` command** - Create shortcuts for frequently used skill repositories
  - Automatic alias detection from repository's `skill.json`
  - Custom aliases with `--as=@alias` flag
  - Stores aliases in config files for easy reuse
  - Project or global alias registration
  - Example: `superpowers-agent add-repository https://github.com/example/skills.git --as=@myskills`

- **Repository alias support** - Install skills using short, memorable aliases
  - Configure aliases in `config.json` under `repositories` object
  - Use aliases with paths: `superpowers-agent add @myskills path/to/skill`
  - Install entire repositories: `superpowers-agent add @myskills`
  - Priority resolution: project repositories > global repositories
  - Lists available aliases when unknown alias is used

**Skill Metadata with skill.json**
- **`helpers` field** - Define helper scripts for easy discovery
  - Smart substring matching for finding helpers
  - Used by `get-helpers` command
  - Example: `"helpers": ["scripts/search.js", "scripts/parse.js"]`

- **`aliases` field** - Define short names for skills
  - Multiple aliases per skill supported
  - Used by `use-skill` and `get-helpers` commands
  - Example: `"aliases": ["block-party", "block-collection"]`

- **`repository` field** - Set default repository alias
  - Automatic detection during `add-repository`
  - Example: `"repository": "@myskills"`

- **`skills` array** - Define multi-skill repositories
  - Lists all skills in the repository
  - Each skill has its own `skill.json`
  - Example: `"skills": ["skill-one", "skill-two"]`

- **`name` field** - Control installation paths
  - Determines directory structure when installing
  - Supports nested paths like `category/skill-name`
  - Example: `"name": "aem/building-blocks"`

- **`title` field** - Human-readable skill name
  - Used in installation success messages
  - Example: `"title": "Building Blocks for AEM"`

**Helper File Discovery**
- **`get-helpers` command** - Find helper files within skills
  - Reads `helpers` array from skill's `skill.json`
  - Smart substring matching to find best match
  - Supports skill aliases for convenience
  - Returns full path to helper file
  - Example: `superpowers-agent get-helpers block-collection search`

**Skill Directory Navigation**
- **`dir` command** - Get the directory path of any skill
  - Supports all skill name formats (short names, aliases, full paths)
  - Useful for scripting and automation
  - Works with skill aliases
  - Example: `superpowers-agent dir brainstorming`

### 🔧 Configuration Enhancements

**Repository Management**
- New `repositories` object in `config.json` for repository aliases
- Global configuration: `~/.agents/config.json`
- Project configuration: `.agents/config.json`
- Repository URLs can be Git URLs or local paths
- Example configuration:
  ```json
  {
    "installLocation": "global",
    "repositories": {
      "@myskills": "https://github.com/example/skills.git",
      "@internal": "/path/to/local/skills"
    }
  }
  ```

**Installation Location Control**
- New `installLocation` config option ("global" or "project")
- Controls default behavior for `add` and `add-repository` commands
- Can be overridden with `--global` or `--project` flags
- Project config takes precedence over global config

### 📚 Documentation Updates

**README.md**
- Added comprehensive skill.json documentation
  - Single skill configuration
  - Multi-skill repository configuration
  - Field descriptions and usage examples
- Added CLI commands section
  - Skill discovery commands
  - Skill installation commands
  - Configuration commands
  - Project setup commands
- Enhanced repository aliases section
  - Configuration format examples
  - Usage examples with aliases
  - Benefits of using repository aliases
- Added detailed examples for new commands

**Command Reference**
- `add <url-or-path|@alias> [path] [options]` - Install skills
- `add-repository <git-url> [--as=@alias] [options]` - Add repository alias
- `dir <skill-name>` - Get skill directory path
- `get-helpers <skill> <search-term>` - Find helper files

### 🚀 Improvements

**Skill Installation**
- Automatic cleanup of temporary directories
- Detailed success/error reporting
- Support for nested directory structures
- Handles both single skills and multi-skill repositories
- Validates skill.json presence and format

**Error Handling**
- Clear error messages when skills not found
- Lists available aliases when unknown alias used
- Validates repository URLs and local paths
- Helpful suggestions for fixing errors

**User Experience**
- Progressive output during installation
- Clear indication of install location
- Lists all installed skills with paths and titles
- Confirms repository alias registration

### 🐛 Bug Fixes

- Fixed skill installation from local paths
- Corrected handling of tree URLs with branches
- Improved directory creation for nested skill paths
- Fixed config file creation when directories don't exist

### 💡 Usage Examples

**Install skills from Git repository:**
```bash
superpowers-agent add https://github.com/example/skills.git
```

**Add repository alias and use it:**
```bash
superpowers-agent add-repository https://github.com/example/skills.git --as=@myskills
superpowers-agent add @myskills path/to/skill
```

**Find helper files:**
```bash
superpowers-agent get-helpers block-collection search-block
```

**Get skill directory:**
```bash
SKILL_DIR=$(superpowers-agent dir brainstorming)
ls -la "$SKILL_DIR"
```

---

## v5.1.1 (November 21, 2025)

### New Features

**Meta-Prompt Slash Command**
- Added `/meta-prompt` (or `/create-meta-prompt`) command to all supported platforms
- Provides quick access to the creating-prompts skill for structured prompt creation
- Consistent command syntax across OpenCode, Claude Code, GitHub Copilot, Cursor, Gemini, and Codex
- Commands automatically installed via bootstrap/update processes
- Makes the creating-prompts skill more discoverable and easy to invoke

### Improvements

**Command Discoverability**
- All platform command tables in README.md now include `/meta-prompt` command
- Clear descriptions help users understand when to use the command
- Platform-specific naming follows existing conventions (e.g., `/meta-prompt` for OpenCode, `/create-meta-prompt` for others)

### Documentation

**README Updates**
- Added `/meta-prompt` to all platform command tables
- Updated documentation for OpenCode, Claude Code, GitHub Copilot, Cursor, Gemini, and Codex
- Consistent command descriptions across all platforms

**RELEASE-NOTES Updates**
- Added v5.1.1 release section with comprehensive changelog
- Documented all new command files and their locations

---

## v5.1.0 (November 21, 2025)

### New Features

**Creating Prompts Skill** (adapted from TÂCHES)
- Agent-agnostic prompt creation workflow for Do/Plan/Research/Refine patterns
- Structured templates with examples for each prompt type
- Dependency detection via file references for chaining prompts
- Integration with brainstorming, writing-plans, and testing-skills-with-subagents
- Checklist-driven workflow ensures completeness
- SUMMARY.md template for executive summaries
- Credit to TÂCHES for pioneering meta-prompt patterns

**Configuration System**
- New `.agents/config.json` for project and global settings
- Configure output directories: `prompts_dir`, `plans_dir`, `skills_dir`
- Priority resolution: project config > global config > defaults
- CLI command: `superpowers-agent get-config <key>`
- Enables customization without modifying core skills

### Improvements

**Writing Plans Skill Update**
- Now uses `.agents/plans/` directory (configurable via config.json)
- Respects `.agents/config.json` settings for output location
- Consistent with new configuration system
- Added documentation comparing prompts vs plans

### Documentation

**README Updates**
- Added creating-prompts to Meta skills section
- New Configuration section explaining config system
- Examples of global and project-level configuration

**RELEASE-NOTES Updates**
- Comprehensive changelog for v5.1.0 features
- Attribution to TÂCHES for create-meta-prompts inspiration

### Credits

Special thanks to TÂCHES ([@glittercowboy](https://github.com/glittercowboy)) for the innovative [`create-meta-prompts` skill](https://github.com/glittercowboy/taches-cc-resources/tree/main/skills/create-meta-prompts) that inspired our `creating-prompts` skill. TÂCHES pioneered structured prompt-to-prompt workflows with dependency management—this adaptation makes those patterns work across all AI coding assistants.

---

## v5.0.0 (November 19, 2025)

### New Features

**One-Liner Global Installer**
- Homebrew-style installation script for quick setup
- Install globally with: `curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash`
- Automatically installs to `~/.agents/superpowers` (works from anywhere)
- Sets up universal CLI aliases during installation
- Optional project file integration with interactive prompts
- Cross-platform support (macOS, Linux, Windows via Git Bash)

**Universal CLI Aliases**
- `superpowers` and `superpowers-agent` commands available globally after installation
- No need to type full paths or remember installation location
- Shell integration for zsh, bash, and Windows PowerShell
- Aliases persist across terminal sessions

**Smart Skill Matching**
- Suffix-based skill lookup for easier access
- Type `superpowers use-skill brainstorming` instead of full path `superpowers:collaboration/brainstorming`
- Multi-level suffix matching: both `brainstorming` and `collaboration/brainstorming` work
- Priority resolution: project skills → home skills → global superpowers skills
- Helpful error messages with descriptions when multiple skills match at same priority level
- Full paths still supported for explicit selection

### Improvements

**Enhanced Setup Skills Command**
- `/setup-skills` now properly initializes AGENTS.md, CLAUDE.md, and GEMINI.md in projects
- Template-based generation ensures consistent instruction files
- Fixed context detection when adding skills to existing projects
- Improved project root detection for accurate file placement

**Installation Documentation**
- New comprehensive INSTALL.md with step-by-step instructions
- Troubleshooting section for common issues
- Manual installation options for users preferring project-specific setup
- Platform-specific guidance for macOS, Linux, and Windows

**README Updates**
- Added "What's New" section highlighting November 2025 improvements
- Updated Quick Start section with smart skill matching examples
- Documented priority order for skill resolution
- Enhanced installation instructions with security notes

### Breaking Changes

**Global Installation Model**
- Default installation location changed from project-specific `.agents/superpowers` to global `~/.agents/superpowers`
- Enables "install once, use everywhere" workflow
- Manual installations can still use project-specific locations if preferred
- Existing installations continue to work; global installation is optional

### Bug Fixes

- Fixed setup-skills command incorrectly referencing skill usage in generated files
- Resolved context detection issues when adding skills to projects
- Fixed CLAUDE.md and GEMINI.md update inconsistencies during setup
- Corrected template generation to avoid duplicate skill listings

---

## v4.0.0 (October-November 2025)

This release marks the fork of Jesse Vincent's Superpowers for Claude Code, extending it to support agent-agnostic workflows across GitHub Copilot, Cursor, Gemini, Codex, OpenCode, and other AI coding assistants.

### New Features

**Multi-Platform Support**
- Added slash commands and prompts for GitHub Copilot (.github/prompts/)
- Added slash commands for Cursor (.cursor/commands/)
- Added slash commands for Gemini (.gemini/commands/)
- Added prompts for Codex (.codex/prompts/)
- Added commands for OpenCode (.opencode/command/)
- Added commands for Claude Code (.claude/commands/)
- All platforms use same skill definitions via unified `superpowers-agent` CLI
- Consistent command syntax across all tools: `/brainstorm`, `/write-plan`, `/execute-plan`, `/skills`, `/use-skill`, `/setup-skills`

**MCP Replacement Skills**
- Added `context-7` skill for library documentation search via Context-7 API
- Added `playwright-skill` for browser automation without MCP overhead
- Achieves ~98% context reduction compared to MCP integrations
- Progressive disclosure: load full API references only when needed
- Node.js-based scripts for cross-platform compatibility
- In-environment filtering processes data before hitting model context

**Setup Skills Command**
- New `/setup-skills` command initializes projects with instruction files
- Automatically creates AGENTS.md, CLAUDE.md, and GEMINI.md
- Template-based generation ensures consistency
- Available across all supported platforms

**Leveraging CLI Tools Skill**
- New skill teaching agents to use high-performance CLI tools
- Covers rg (ripgrep), jq, fd, bat, ast-grep
- Provides 5-50x speedups over standard tools
- Includes verification patterns and fallback strategies

**Writing Prompts Skill**
- Guides creation of custom slash commands for GitHub Copilot, Cursor, and Claude
- Platform-specific syntax and file location guidance
- Best practices for effective prompt engineering
- Covers when to create commands vs when to use existing skills

**Testing Skills with Subagents**
- RED-GREEN-REFACTOR methodology for testing process documentation
- Baseline testing without skill, then iterate to close loopholes
- Verify skills work under pressure and resist rationalization
- Systematic validation before deployment

### Improvements

**Skill Reorganization**
- Restructured skills directory with clearer categories
- Categories: collaboration, testing, debugging, meta, mcp-replacement, problem-solving, research, architecture
- Improved discoverability with consistent naming conventions
- Better separation of concerns between skill types

**Auto-Update System**
- Bootstrap process checks for updates intelligently
- Only reinstalls integrations that have changed
- Respects local modifications and branch state
- Clear status messages about update success or pending changes

**Conditional Tool Detection**
- Bootstrap detects available platforms automatically
- Installs only relevant slash commands for detected tools
- Reduces clutter and setup time
- Smart detection for VS Code, Cursor, Gemini CLI, etc.

### Breaking Changes

**Agent-Agnostic Architecture**
- Moved from Claude Code-specific plugin to universal CLI tool
- obra's original Claude Code plugin still available separately at github.com/obra/superpowers
- New architecture supports any AI assistant that can run shell commands
- Slash commands now thin wrappers around `superpowers-agent` CLI

**Skill Priority System**
- New resolution order: project skills → home skills → global superpowers skills
- Project-specific skills (.agents/skills/) have highest priority
- Personal skills (~/.agents/skills/) override global superpowers skills
- Enables local customization without modifying core installation

### Documentation

**Installation Guides**
- Created platform-specific installation documentation
- Added troubleshooting sections for common issues
- Documented manual installation options
- Clear explanations of global vs project-specific installation

**README Overhaul**
- Added "What You Get" section summarizing features
- Updated installation instructions for multi-platform support
- Documented slash commands for each platform
- Added skill library overview with categories

---

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/complexthings/superpowers/issues).

Want to contribute? See our skills in `skills/` and follow the patterns in `skills/meta/writing-skills/`.

## Original Project

This is a fork of [obra/superpowers](https://github.com/obra/superpowers). For Claude Code-specific features, see Jesse Vincent's original implementation and [blog post](https://blog.fsck.com/2025/10/09/superpowers/).
