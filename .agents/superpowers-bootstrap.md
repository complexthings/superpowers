# Superpowers Bootstrap for Agents

<EXTREMELY_IMPORTANT>
You have superpowers. Superpowers teach you new skills and capabilities.

**Tool for running skills:**
- `superpowers-agent execute <skill-name>`

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

**Skills naming:**
- Project skills: `skill-name` (from .agents/skills/ - highest priority)
- Claude skills: `claude:skill-name` (from .claude/skills/)
- Personal skills: `skill-name` (from ~/.agents/skills/)
- Superpowers skills: `superpowers:skill-name` (from ~/.agents/superpowers/skills/)

**Skills priority:**
Project skills override Claude skills, which override personal skills, which override superpowers skills when names match.

**Critical Rules:**
- Before ANY task, review the skills list (shown at bootstrap)
- If a relevant skill exists, you MUST use `superpowers-agent execute` to load it and follow instructions.
  - YOU MUST USE YOUR `Read` TOOL TO READ THE SKILL FILE FROM THE PATH SHOWN. YOU MUST NOT `cat` the file or `print` it to yourself.
- Announce: "I've read the [Skill Name] skill and I'm using it to [purpose]"
- Skills with checklists require `manage_todo_list` todos for each item (or manual tracking if unavailable)
- NEVER skip mandatory workflows (brainstorming before coding, TDD, systematic debugging)

**Skills location:**
- Project skills: .agents/skills/ (project-specific, highest priority)
- Claude skills: .claude/skills/ (project's existing skill system)
- Personal skills: ~/.agents/skills/ (your personal cross-project skills)
- Superpowers skills: ~/.agents/superpowers/skills/ (shared community skills)

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.
</EXTREMELY_IMPORTANT>
