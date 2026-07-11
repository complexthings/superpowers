# Superpowers Bootstrap for Agents

<EXTREMELY_IMPORTANT>
You have superpowers. Superpowers teach you new skills and capabilities.

**Tool for running skills:**
- Use your platform's native skill tool, or read the skill's `SKILL.md` directly.

**Platform-specific tool mappings:**
Tool mappings for your detected platforms are automatically included in your platform-specific configuration files:
- GitHub Copilot: `~/.github/copilot-instructions.md`
- Cursor: Included in `AGENTS.md`
- Claude Code: `~/.claude/CLAUDE.md`
- Gemini: `~/.gemini/GEMINI.md`
- OpenCode: `~/.config/opencode/AGENTS.md`
- Codex: `~/.codex/AGENTS.md`

**Skills naming:**
- Project skills: `skill-name` (from .agents/skills/ - highest priority)
- Claude skills: `claude:skill-name` (from .claude/skills/)
- Personal skills: `skill-name` (from ~/.agents/skills/)
- Superpowers skills: `superpowers:skill-name` (from ~/.agents/superpowers/skills/)

**Skills priority:**
Project skills override Claude skills, which override personal skills, which override superpowers skills when names match.

**Critical Rules:**
- Before ANY task, review the skills list (shown at bootstrap)
- If a relevant skill exists, you MUST load it with your platform's native skill tool and follow its instructions.
  - YOU MUST USE YOUR `Read` TOOL TO READ THE SKILL FILE. YOU MUST NOT `cat` or print it to yourself.
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
