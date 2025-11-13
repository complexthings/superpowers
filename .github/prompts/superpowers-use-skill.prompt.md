---
name: use-skill
description: Load and apply a specific skill by name
argument-hint: <skill-name>
---

I'll load the skill you specified.

```bash
~/.agents/superpowers/.agents/superpowers-agent use-skill {skill-name}
```

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

Use `/skills` to see all available skills.
