# AGENTS.md

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

**Bootstrapped Version**: ^^SAV:6.2.0^^

Your superpowers-agent may have updates available. If you see a different version
in command output (e.g., `^^SAV:5.5.0^^`) than shown above, run:

```bash
superpowers-agent update && superpowers-agent bootstrap && superpowers-agent setup-skills
```

This will update your Superpowers installation and refresh your project configuration.

**How Agents Should Use This Information:**

When you (the agent) start a conversation or run superpowers-agent commands:

1. **Note the bootstrapped version** shown above (`^^SAV:6.2.0^^`)
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
- `TodoWrite` → `manage_todo_list` (create and manage task lists with status tracking: not-started, in-progress, completed)
- `TodoRead` → Check todo list via `manage_todo_list` with `read` operation (view current task states)
- `Task` tool with subagents → `runSubagent` (dispatch autonomous agents for complex multi-step tasks; agent returns single final message)
- `Skill` tool → `superpowers-agent execute` command (load and execute skills via CLI)
- `Read` → `read_file` (read file contents with optional offset/limit for large files; max 2000 lines per call)
- `Write` → `create_file` (create new files with content; automatically creates parent directories)
- `Edit` → `replace_string_in_file` or `multi_replace_string_in_file` (exact string replacements; include 3-5 lines context before/after)
- `Bash` → `run_in_terminal` (execute zsh commands; supports background processes with isBackground flag)
- `List` → `list_dir` (list directory contents; returns names with trailing / for folders)
- `Grep` → `grep_search` (search file contents with text or regex patterns; supports includePattern for file filtering)
- `Glob` → `file_search` (find files by glob pattern; returns matching file paths)
- `WebFetch` → `fetch_webpage` (fetch and extract main content from web pages for summarization)
- `CodebaseSearch` → `semantic_search` (natural language search for relevant code in workspace; fallback to `grep_search` for exact matches)
- `NotebookEdit` → `edit_notebook_file` (edit Jupyter notebooks: insert, edit, or delete cells by cellId)
- `ReadLints` → `get_errors` (retrieve compile/lint errors for specific files or entire workspace)
- `DeleteFile` → `run_in_terminal` with `rm` command (no dedicated delete tool; use shell command)
- `GetTerminalOutput` → `get_terminal_output` (retrieve output from background terminal processes)
- `Git` → `get_changed_files` (get git diffs of staged/unstaged changes; fallback to `run_in_terminal` for other git operations)
- `NotebookSummary` → `copilot_getNotebookSummary` (get cell metadata: ids, types, languages, execution info, outputs)
- `NotebookRun` → `run_notebook_cell` (execute code cells in Jupyter notebooks by cellId)
**Tool Mapping for Cursor:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `todo_write` (manage task lists with status tracking: pending, in_progress, completed, cancelled)
- `TodoRead` → Check todo list via system context (automatically tracked)
- `Task` tool with subagents → Execute the work yourself, as subagent dispatch isn't available
- `Skill` tool → `superpowers-agent execute` command (already available)
- `Read` → `read_file` (read file contents with optional offset/limit for large files; supports images)
- `Write` → `write` (create/overwrite files; requires prior read_file for existing files)
- `Edit` → `search_replace` (exact string replacements; supports replace_all for renaming across file)
- `Bash` → `run_terminal_cmd` (execute terminal commands; supports background execution and permission requests)
- `List` → `list_dir` (list directory contents with optional ignore globs)
- `Grep` → `grep` (ripgrep-based search with regex, supports -A/-B/-C context, multiple output modes)
- `Glob` → `glob_file_search` (find files by glob pattern, sorted by modification time)
- `CodebaseSearch` → `codebase_search` (semantic search to find code by meaning, not exact text)
- `WebFetch` → `web_search` (search the web for real-time information)
- `NotebookEdit` → `edit_notebook` (edit Jupyter notebook cells: create, edit, or clear cell content)
- `ReadLints` → `read_lints` (read linter/diagnostic errors from workspace files)
- `DeleteFile` → `delete_file` (delete files at specified path)
- MCP Tools → Various MCP server tools available (Playwright browser automation, Context7 docs, etc.)
**Tool Mapping for OpenCode:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `todowrite` (manage todo lists with status tracking)
- `TodoRead` → `todoread` (read current todo list state)
- `Task` → `task` (dispatch specialized subagents for complex multi-step tasks)
- `Skill` → `superpowers-agent execute` command (already available)
- `Read` → `read` (read file contents with line numbers, supports offset/limit)
- `Write` → `write` (create/overwrite files, requires prior read for existing files)
- `Edit` → `edit` (make exact string replacements in files)
- `Bash` → `bash` (execute shell commands with timeout support)
- `List` → `list` (list directory contents with optional ignore patterns)
- `Grep` → `grep` (search file contents using regex, supports file patterns)
- `Glob` → `glob` (find files by glob pattern, sorted by modification time)
- `WebFetch` → `webfetch` (fetch web content in text, markdown, or html format)
**Tool Mapping for Codex:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `update_plan` (simple step tracker; no full todo manager)
- `Task` tool with subagents → Execute the work yourself (no subagent tool)
- `Skill` tool → `superpowers-agent execute` command (already available)
- `Read` → `shell_command` with `cat`/`sed` (no dedicated read tool)
- `Write` → `apply_patch` (create/edit files) or `shell_command` with redirection for new files
- `Edit` → `apply_patch` (targeted edits)
- `Bash` → `shell_command` (execute shell commands)
- `List` → `shell_command` (`ls`, `find`)
- `Grep` → `shell_command` (`rg`)
- `Glob` → `shell_command` (`rg --files`, `find`)
- `WebFetch` → `features.web_search_request, web_search_request` (fetch web content)

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

---

*Generated/Updated by Superpowers on 2025-12-16*

<!-- SUPERPOWERS_SKILLS_END -->

