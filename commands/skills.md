---
description: Discover and search available skills across all locations
---

# Skills

Let me show you all available skills.

```bash
superpowers-agent find-skills
```

**Skill locations searched:**
- Project skills: `.agents/skills/` and `.claude/skills/` (highest priority)
- Personal skills: `~/.agents/skills/`
- System skills: `~/.agents/superpowers/skills/`

**To filter or search**, you can pipe the output:
```bash
superpowers-agent find-skills | grep -i <search-term>
```

**Examples:**
- `| grep -i test` - Find testing-related skills
- `| grep -i debug` - Find debugging skills
- `| grep -i plan` - Find planning skills

Use `/use-skill` to load any skill you find.
