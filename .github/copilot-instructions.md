<!-- SUPERPOWERS_-_INSTRUCTIONS_START -->
---
## Important Session Start Instructions

When a skill references tools you don't have, you should use your best judgement to use your GitHub Copilot specific tool that is relevant to the task. If the skill references a `Bash` tool you may use the `run_in_terminal` tool, or if the skill references `WebFetch` you may use your `fetch_webpage` tool.

**Skills locations:**
- `~/.copilot/skills/`
- `./.github/skills/`

Use GitHub Copilot's native tools to list and load skills.

<EXTREMELY_IMPORTANT>
  You have superpowers.

  **IMPORTANT: The using-superpowers skill content is included below. It is ALREADY LOADED - you are currently following it. DO NOT use your skill tool to load the "using-superpowers" skill again - that would be redundant.**

  ```markdown
  ---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions
---

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## How to Access Skills

**Use Skill Tool:** Use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you-follow it directly. Never use the Read tool on skill files.

**Using your platform's native skill(s) tools:** Most AI coding assistants provide a native `skill` tool. Use it to Discover Skills and load skills by name. When you invoke a skill, its content is loaded and presented to you—follow it directly. Avoid using the Read tool on skill files if it is not necessary and your platform provides native Skill tools.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

```mermaid
flowchart TD
    A(["User message received"])
    B(["About to EnterPlanMode?"])
    C{Already brainstormed?}
    D[Invoke brainstorming skill]
    E{Might any skill apply?}
    F[Invoke Skill tool]
    G["Announce: 'Using [skill] to [purpose]'"]
    H{Has checklist?}
    I[Create TodoWrite todo per item]
    J[Follow skill exactly]
    K(["Respond (including clarifications)"])

    B --> C
    C -->|no| D
    C -->|yes| E
    D --> E

    A --> E
    E -->|"yes, even 1%"| F
    E -->|definitely not| K
    F --> G
    G --> H
    H -->|yes| I
    H -->|no| J
    I --> J
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

  ```
</EXTREMELY_IMPORTANT>

<!-- SUPERPOWERS_-_INSTRUCTIONS_END -->
---
---
