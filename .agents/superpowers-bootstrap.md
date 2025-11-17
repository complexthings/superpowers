# Superpowers Bootstrap for Agents

<EXTREMELY_IMPORTANT>
You have superpowers. Superpowers teach you new skills and capabilities.

**Tool for running skills:**
- `superpowers-agent use-skill <skill-name>`

**Tool Mapping for GitHub Copilot:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `manage_todo_list` (your planning/task tracking tool)
- `Task` tool with subagents → Execute the work yourself, as subagent dispatch isn't available
- `Skill` tool → `superpowers-agent use-skill` command (already available)
- `Read`, `Write`, `Edit`, `Bash` → Use your native file and terminal tools

**Tool Mapping for Cursor:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `manage_todo_list` or manual tracking (your planning/task tracking tool)
- `Task` tool with subagents → Execute the work yourself, as subagent dispatch isn't available
- `Skill` tool → `superpowers-agent use-skill` command (already available)
- `Read`, `Write`, `Edit`, `Bash` → Use your native file and terminal tools

**Tool Mapping for Claude Desktop/API:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `manage_todo_list` or manual tracking
- `Task` tool with subagents → Execute the work yourself
- `Skill` tool → `superpowers-agent use-skill` command (already available)
- `Read`, `Write`, `Edit`, `Bash` → Use your native file and terminal tools

**Skills naming:**
- Project skills: `skill-name` (from .agents/skills/ - highest priority)
- Claude skills: `claude:skill-name` (from .claude/skills/)
- Personal skills: `skill-name` (from ~/.agents/skills/)
- Superpowers skills: `superpowers:skill-name` (from ~/.agents/superpowers/skills/)

**Skills priority:**
Project skills override Claude skills, which override personal skills, which override superpowers skills when names match.

**Critical Rules:**
- Before ANY task, review the skills list (shown at bootstrap)
- If a relevant skill exists, you MUST use `superpowers-agent use-skill` to load it
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
