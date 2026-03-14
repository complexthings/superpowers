---
name: using-superpowers
description: "Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions. CRITICAL: this skill is already loaded in your context — do NOT invoke it again. It defines the foundational rule: if a skill might apply, you must invoke it first."
---

# Using Superpowers

Superpowers is a skills system that gives you access to proven workflows, encoded as SKILL.md files. Skills prevent you from reinventing solved problems and repeating known mistakes. This skill establishes the foundational rule for how to use the entire system.

## The Core Rule

**Before any response or action, check whether a skill applies — then invoke it.**

This means BEFORE writing code, BEFORE asking clarifying questions, BEFORE exploring files. Even a 1% chance a skill might apply means you invoke it to check. If the invoked skill turns out not to fit the situation, you don't need to follow it — but you must check.

Why this matters: skills encode hard-won workflows for tasks like debugging, TDD, and brainstorming. Skipping the check means you may skip a workflow that would have prevented a costly mistake.

## How to Invoke Skills

Your platform's skill tool is the primary way to load a skill. Available skills are listed in your system context — scan this list before starting any task.

To load a skill, use your platform's native skill tool with the skill name:

```
skill("brainstorming")
skill("systematic-debugging")
skill("test-driven-development")
```

When a skill is invoked, its full content is loaded into context. Follow it directly.

**Announce when using a skill:**
> "Using Skill: [name] to [purpose]"

This keeps the conversation clear and lets the user know which workflow you're following.

## How to Discover Skills

**Primary method:** Scan the `available_skills` list in your system context. It's always there — review it at the start of every conversation.

**CLI fallback:**
```bash
superpowers-agent find-skills              # list all skills
superpowers-agent find-skills | grep test  # filter by topic
superpowers-agent execute <skill-name>     # load and follow a skill
```

## Skill Priority

When multiple skills could apply, invoke in this order:

1. **Process skills first** (brainstorming, systematic-debugging, test-driven-development) — these determine HOW to approach the task
2. **Implementation skills second** (domain-specific guides) — these guide execution

Examples:
- "Let's build X" → invoke `brainstorming` first, then domain implementation skills
- "Fix this bug" → invoke `systematic-debugging` first, then domain-specific skills

## Tool Mapping

Skills may reference tools by names used in a specific platform. Map them to whatever equivalent tools your agent environment provides:

| Skill instruction | What it means |
|-------------------|---------------|
| `TodoWrite` / task list | Your platform's todo or task-tracking tool |
| `Task` / subagent dispatch | Your subagent or agent-spawning tool |
| `Skill` tool | Your platform's native skill-loading tool |
| File read/write/edit | Your file read, write, and edit tools |
| Terminal / shell commands | Your bash or shell execution tool |
| Search | Your grep, glob, or search tools |
| Web fetching | Your web fetch or browser tool |

If your platform doesn't have an exact equivalent, use the closest available tool or perform the action inline.

## Red Flags — You're Rationalizing

These thoughts mean STOP and check for a skill first:

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

## Skill Types

**Rigid skills** (TDD, systematic-debugging): Follow exactly. The structure is the value — adapting away the discipline defeats the purpose.

**Flexible skills** (patterns, guides): Adapt principles to context. The skill itself will indicate when flexibility is appropriate.

## Checklists

If a skill contains a checklist, create a task or todo entry for each item using your platform's task-tracking tool. Mental tracking causes steps to get skipped. Every time.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows. A specific instruction is when skill discipline matters most.

## Version Monitoring

Superpowers version in AGENTS.md: `^^SAV:7.1.2^^`

If `superpowers-agent` commands display a different version, notify the user:
```
superpowers-agent update && superpowers-agent bootstrap && superpowers-agent setup-skills
```

## Related Skills

- **finding-skills** — Detailed guide for discovering and filtering available skills
- **using-a-skill** — How to load and apply a specific skill by name
- **brainstorming** — Required before any creative work or feature implementation
- **writing-skills** — How to create new skills using TDD
