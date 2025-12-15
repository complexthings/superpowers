# AGENTS.md

## 🎯 SKILLS

Skills extend your capabilities with proven workflows. You discover skills via metadata, then load instructions **just-in-time** before use.

**Key principle:** Don't read skill files upfront. Load them only when you're about to execute them.

### Installation Check

If `superpowers-agent` is not available, install it:

```bash
curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash
```

### Updates Monitoring

**Bootstrapped Version**: ^^SAV:6.1.0^^

Your superpowers-agent may have updates available. If you see a different version
in command output (e.g., `^^SAV:5.5.0^^`) than shown above, run:

```bash
superpowers-agent update && superpowers-agent bootstrap && superpowers-agent setup-skills
```

This will update your Superpowers installation and refresh your project configuration.

**How Agents Should Use This Information:**

When you (the agent) start a conversation or run superpowers-agent commands:

1. **Note the bootstrapped version** shown above (`^^SAV:6.1.0^^`)
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

**Tool Mapping for GitHub Copilot:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `manage_todo_list` (your planning/task tracking tool)
- `Task` tool with subagents → Execute the work yourself, as subagent dispatch isn't available
- `Skill` tool → `superpowers-agent execute` command (already available)
- `Read` → `Read File` tool (read file contents)
- `Write` → `WriteFile` tool (create/overwrite files)
- `Edit` → `Edit & Reapply` tool (suggest edits to files)
- `Bash` → `Terminal` tool (execute terminal commands)
- `List` → `List Directory` tool (read directory structure)
- `Grep` → `SearchText` tool (search file contents)
- `Glob` → `FindFiles` tool (find files by pattern)
- `WebFetch` → `Web` tool (fetch and search web content)

**Tool Mapping for Cursor:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → Manual tracking or your own task management approach
- `Task` tool with subagents → Execute the work yourself, as subagent dispatch isn't available
- `Skill` tool → `superpowers-agent execute` command (already available)
- `Read` → `Read File` tool (read file contents)
- `Write` → `Write File` tool (create/overwrite files)
- `Edit` → `Edit & Reapply` tool (suggest edits to files)
- `Bash` → `Terminal` tool (execute terminal commands)
- `List` → `List Directory` tool (read directory structure)
- `Grep` → `Grep` tool (search file contents)
- `Glob` → `Search Files` tool (find files by pattern)
- `WebFetch` → `Web` tool (fetch and search web content)

**Tool Mapping for Claude Code:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `TodoWrite` (built-in task management)
- `Task` → `Task` (built-in subagent dispatch)
- `Skill` → `Skill` tool or `superpowers-agent execute` command (both available)
- `Read` → `Read` tool (read file contents)
- `Write` → `Write` tool (create/overwrite files)
- `Edit` → `Edit` tool (make targeted edits to files)
- `Bash` → `Bash` tool (execute shell commands)
- `List` → Use `Read` tool with directory path
- `Grep` → `Grep` tool (search file contents)
- `Glob` → `Glob` tool (find files by pattern)
- `WebFetch` → `WebFetch` tool (fetch web content)

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

**Tool Mapping for OpenCode:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `todowrite` (manage todo lists)
- `Task` tool with subagents → Execute the work yourself, as subagent dispatch isn't available
- `Skill` tool → `superpowers-agent execute` command (already available)
- `Read` → `read` tool (read file contents)
- `Write` → `write` tool (create/overwrite files)
- `Edit` → `edit` tool (make exact string replacements)
- `Bash` → `bash` tool (execute shell commands)
- `List` → `list` tool (list directory contents)
- `Grep` → `grep` tool (search file contents)
- `Glob` → `glob` tool (find files by pattern)
- `WebFetch` → `webfetch` tool (fetch web content)

**Skill Locations:**
- Project: `.agents/skills/` (highest priority)
- Claude: `.claude/skills/`
- Personal: `~/.agents/skills/`
- Superpowers: `~/.agents/superpowers/skills/`

Priority: Project > Claude > Personal > Superpowers (when names match)

**Skill Naming:**
- Project skills: `skill-name`
- Claude skills: `claude:skill-name`
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
