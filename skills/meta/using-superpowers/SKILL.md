---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions
metadata:
  when_to_use: when starting any task, before responding, before clarifying questions - skills tell you HOW to approach work
  version: 1.1.0
  languages: all
---

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## Instruction Priority

Superpowers skills override default system prompt behavior, but **user instructions always take precedence**:

1. **User's explicit instructions** (CLAUDE.md or AGENTS.md, direct requests) — highest priority
2. **Superpowers skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

If CLAUDE.md/AGENTS.md or the user says "don't use TDD" and a skill says "always use TDD," follow CLAUDE.md/AGENTS.md. The user is in control.

## How to Access Skills

**Using your platform's native skill tool:** Most AI coding assistants provide a native `skill` tool. Use it to Discover Skills and load skills by name. When you invoke a skill, its content is loaded and presented to you—follow it directly.

**Fallback with superpowers-agent CLI:**
```bash
# Execute a skill (loads content and provides guidance)
superpowers-agent execute <skill-name>

# Find available skills
superpowers-agent find-skills [pattern]
```

**Check your platform's native skill tool first.** Check your platform's documentation or procedures for how skills are loaded and access. The above CLI is a fallback if your environment doesn't have native skill support.  You want to avoid using the Read tool on skill files if that is not how your environment is designed to load them, as you may miss important context or instructions included in the skill content. Always use the intended method for accessing skills in your environment.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

```mermaid
flowchart TD
    START(((User message received))) --> CHECK{Might any skill apply?}
    CHECK -->|yes, even 1%| INVOKE[Invoke Skill tool]
    CHECK -->|definitely not| RESPOND(((Respond, including clarifications)))
    INVOKE --> ANNOUNCE["Announce: 'Using [skill] to [purpose]'"]
    ANNOUNCE --> HAS{Has checklist?}
    HAS -->|yes| TODO[Create TodoWrite todo per item]
    HAS -->|no| FOLLOW[Follow skill exactly]
    TODO --> FOLLOW
```

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |
| "I should use EnterPlanMode / plan mode" | If a loaded skill specifies the next step, follow the skill. EnterPlanMode is a platform default — skills override defaults. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, debugging) - these determine HOW to approach the task
2. **Implementation skills second** (frontend-design, mcp-builder) - these guide execution

"Let's build X" → brainstorming first, then implementation skills.
"Fix this bug" → debugging first, then domain-specific skills.

## Skill Types

**Rigid** (TDD, debugging): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.
