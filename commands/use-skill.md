---
description: Load and apply a specific skill by name
---

# Use Skill

I'll load the skill you want to use.

**Which skill would you like to load?**

If you haven't specified a skill name yet, you can:
- Provide it now (e.g., "superpowers:test-driven-development")
- Run `/skills` first to see all available skills

**Skill naming:**
- `superpowers:skill-name` - System skill from `~/.agents/superpowers/skills/`
- `claude:skill-name` - Claude skill from `.claude/skills/`
- `skill-name` - Auto-resolves with priority: project > claude > personal > system

**Priority resolution:**
1. Project skills (`.agents/skills/`) - highest priority
2. Claude skills (`.claude/skills/`)
3. Personal skills (`~/.agents/skills/`)
4. System skills (`~/.agents/superpowers/skills/`)

**Common skills:**
- `superpowers:brainstorming` - Refine ideas into designs
- `superpowers:test-driven-development` - TDD workflow
- `superpowers:systematic-debugging` - Debug systematically
- `superpowers:writing-skills` - Create new skills
- `superpowers:leveraging-cli-tools` - Use high-performance CLI tools

Once you tell me which skill, I'll run:
```bash
superpowers-agent execute <skill-name>
```
