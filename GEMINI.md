# Project Overview

<!-- SUPERPOWERS_SKILLS_START -->
## 🎯 SKILLS

Skills extend your capabilities with proven workflows. You discover skills via metadata, then load instructions **just-in-time** before use.

**Key principle:** Don't read skill files upfront. Load them only when you're about to execute them.

### Installation Check

If `superpowers-agent` is not available, install it:

```bash
curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash
```

### Updates Monitoring

**Bootstrapped Version**: ^^SAV:6.3.2^^

Your superpowers-agent may have updates available. If you see a different version
in command output (e.g., `^^SAV:5.5.0^^`) than shown above, run:

```bash
superpowers-agent update && superpowers-agent bootstrap && superpowers-agent setup-skills
```

This will update your Superpowers installation and refresh your project configuration.

**How Agents Should Use This Information:**

When you (the agent) start a conversation or run superpowers-agent commands:

1. **Note the bootstrapped version** shown above (`^^SAV:6.3.2^^`)
2. **Check command output** - Most `superpowers-agent` commands display `^^SAV:X.Y.Z^^` at the start
3. **Compare versions** - If the command version differs from bootstrapped version:
   
   Inform the user: "Your superpowers-agent may have updates available, run 
   `superpowers-agent update && superpowers-agent bootstrap && superpowers-agent setup-skills` 
   to update your Superpowers and Project!"

4. **When to check**:
   - At the start of new conversations
   - When commands behave unexpectedly  
   - When user asks about updates or capabilities

**Version Detection Examples:**

```
# Outdated - needs update
Bootstrapped: ^^SAV:5.4.0^^
Command output: ^^SAV:5.5.0^^
→ Notify user to update

# Up to date
Bootstrapped: ^^SAV:5.4.0^^
Command output: ^^SAV:5.4.0^^
→ No action needed
```

### REQUIRED WORKFLOW

<CRITICAL>
**Do not read skill files upfront. Load them just-in-time when you're about to use them.**
</CRITICAL>

**Discover available skills:**
```bash
superpowers-agent find-skills [PATTERN]
```
This shows skill names and descriptions. Use descriptions to decide which skill applies.

**When ready to use a skill:**
```bash
superpowers-agent execute {Skill Name}
```
This shows the skill path and tells you to read it. Use your `Read` tool (or `cat` if `Read` doesn't work for external paths), then follow the instructions exactly.

---

**JIT Rules:**
- Only run `execute` + `Read` when you're about to use a skill, not before
- If given a sequence of skills, load each one immediately before that step
- If you already read a skill earlier in this session and it's in context, don't re-read

**When to look for skills:**
- Before starting any non-trivial task
- When unsure how to approach something
- When the task matches a skill description you saw in `find-skills`

### NATIVE SKILL TOOLS

Many AI agents have built-in skill tools that provide better integration than CLI commands. **Always attempt to use your native tool first:**

| Agent | Native Tool | Skill Locations |
|-------|-------------|-----------------|
| GitHub Copilot | `Skill` tool | `.github/skills/`, `~/.copilot/skills/` |
| Claude Code | `Skill` tool | `.claude/skills/`, `~/.claude/skills/` |
| OpenCode | `skill` tool | `.opencode/skill/`, `~/.config/opencode/skill/` |
| Cursor | Automatic discovery | `.cursor/skills/`, `~/.cursor/skills/` |
| Gemini | `activate_skill` tool | `.gemini/skills/`, `~/.gemini/skills/` |

**Tool Selection:**
1. **First**: Attempt your native skill tool if available
2. **Fallback**: If native tool fails or skill not found, use `superpowers-agent execute`

Native tools provide automatic discovery, progressive disclosure, and better context management. Skills are symlinked across platforms for universal access.

### WHY THIS MATTERS

Skills document **proven techniques** that save time and prevent mistakes. Not using available skills means:

- ❌ Repeating already-solved problems
- ❌ Making known errors
- ❌ Skipping critical workflows (TDD, debugging, verification)
- ❌ Wasting context by loading skills you won't use

**If a skill exists for your task, you MUST use it.**

### COMMON MISTAKES

Reject these rationalizations:

- ❌ "I'll read all the skills upfront to understand them" → Load JIT only
- ❌ "This is too simple for a skill" → Simple tasks benefit most from proven process
- ❌ "I already know how to do this" → Skills encode edge cases you'll miss
- ❌ "I'll just skim the skill" → Follow instructions exactly as written

### REFERENCE

**Tool Mappings:**

**Tool Mapping for Gemini:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `write_todos` (create and manage task lists)
- `Task` tool with subagents → Execute the work yourself, as subagent dispatch isn't available
- `Skill` tool → `superpowers-agent execute` command (already available)
- `Read` → `read_file` (read file contents)
- `Write` → `write_file` (create/overwrite files)
- `Edit` → `replace` (make targeted edits to files)
- `Bash` → `run_shell_command` (execute shell commands)
- `List` → `list_directory` (read directory structure)
- `Grep` → `search_file_content` (search file contents)
- `Glob` → `glob` (find files by pattern)
- `WebFetch` → `web_fetch` (fetch web content)

**Skill Locations:**
- Project: `.agents/skills/` > `.claude/skills/` > `.copilot/skills/` > `.opencode/skill/` > `.cursor/skills/` > `.gemini/skills/`
- Personal: `~/.agents/skills/` > `~/.claude/skills/` > `~/.copilot/skills/` > `~/.config/opencode/skill/` > `~/.cursor/skills/` > `~/.gemini/skills/`
- Superpowers: `~/.agents/superpowers/skills/`

Priority: Project > Personal > Superpowers (when names match)

**Skill Naming:**
- Project skills: `skill-name`
- Claude skills: `claude:skill-name`
- Copilot skills: `copilot:skill-name`
- OpenCode skills: `opencode:skill-name`
- Cursor skills: `cursor:skill-name`
- Gemini skills: `gemini:skill-name`
- Personal skills: `skill-name`
- Superpowers skills: `superpowers:skill-name`

**Skills with Checklists:**
If a skill has a checklist, create todos for EACH item. Mental tracking = steps get skipped.

**Creating New Skills:**
Use the `writing-skills` skill. Brainstorm first with `brainstorming`, then test with `testing-skills-with-subagents`.

---

<IMPORTANT>
**IF A SKILL APPLIES TO YOUR TASK, YOU MUST USE IT.**

Announce when using a skill: "Using Skill: {Name} to {Purpose}"
</IMPORTANT>

---

*Generated/Updated by Superpowers on 2026-01-14*

<!-- SUPERPOWERS_SKILLS_END -->



This is the Gemini CLI, a comprehensive skills library of proven techniques, patterns, and workflows for AI coding assistants. This is a fork and extension of Jesse Vincent's incredible Superpowers for Claude Code. Jesse's groundbreaking work and his amazing blog post introduced the concept of systematic, reusable skills for AI agents. This fork extends that vision to support agent-agnostic workflows across GitHub Copilot, Cursor, and other AI coding assistants.

<IMPORTANT>All agents and tools (GitHub Copilot, Codex, Gemini, Claude, etc.) must edit files directly with their IDE or file tools instead of piping heredocs via terminal (`cat <<'EOF' > file`, `node -e ... > file`, etc.), especially in VS Code or other Electron-based IDEs where terminal injection can break the environment.</IMPORTANT>

The project is a structured collection of "skills" defined in Markdown files. These skills provide a systematic approach to common engineering tasks like testing, debugging, collaboration, and more. The project includes a command-line agent (`superpowers-agent`) that allows users to discover, use, and manage these skills.

## Key Files

*   `README.md`: Provides a comprehensive overview of the project, including installation instructions, usage examples, and a high-level description of the available skills.
*   `skills/`: This directory contains the core of the project: the skills themselves. Each skill is a directory containing a `SKILL.md` file and any supporting files.
*   `skills/writing-skills/SKILL.md`: A crucial file that explains how to create new skills using a Test-Driven Development (TDD) methodology. It serves as a guide for contributors.
*   `.agents/superpowers-agent`: A Node.js script that acts as the engine for the project. It handles skill discovery, usage, and integration with various AI coding assistants.

## Development Conventions

The project follows a strict set of conventions for creating and testing skills, as outlined in `skills/writing-skills/SKILL.md`. The key principles are:

*   **Test-Driven Development (TDD):** New skills are developed by first writing a "failing test" in the form of a pressure scenario for a sub-agent.
*   **Systematic over ad-hoc:** The project emphasizes using well-defined processes over guesswork.
*   **Complexity Reduction:** The primary goal is to simplify complex tasks.
*   **Evidence over claims:** All claims must be verified before they are declared successful.

## Usage

The primary way to interact with this project is through the `.agents/superpowers-agent` script. The available commands are:

*   `bootstrap`: Run the complete bootstrap with all skills.
*   `use-skill <skill-name>`: Load a specific skill.
*   `find-skills`: List all available skills.
*   `install-copilot-prompts`: Install GitHub Copilot prompts only.
*   `install-copilot-instructions`: Install universal instructions only.
*   `install-cursor-commands`: Install Cursor commands only.
*   `install-cursor-hooks`: Install Cursor hooks only.
*   `install-codex-prompts`: Install OpenAI Codex prompts only.
