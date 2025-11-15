---
description: Create new skills following TDD methodology with subagent testing
argument-hint: [SKILL_NAME="<new-skill-name>"]
---

# Write A Skill

I'm using the writing-skills skill to help create a new skill.

First, let me load the skill:

```bash
~/.agents/superpowers/.agents/superpowers-agent use-skill superpowers:writing-skills
```

Now I'll follow the TDD cycle for skill creation:

**RED Phase - Write Failing Test:**
- Create pressure scenarios without the skill
- Document baseline behavior and rationalizations

**GREEN Phase - Write Minimal Skill:**
- Write skill addressing those specific failures
- Test that agents now comply

**REFACTOR Phase - Close Loopholes:**
- Find new rationalizations from testing
- Add explicit counters and re-test

This ensures skills are tested and bulletproof before deployment.

What skill do you want to create? $SKILL_NAME
