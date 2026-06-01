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

## How to Discover and Invoke Skills

Skills appear in your context as an available-skills list — scan it at the start of every task. That list is the same workflow library no matter which agent platform you run on (Claude Code, Copilot, OpenCode, Pi, or anything else); only the tools around it differ.

To load a skill's full instructions:

- **If your platform has a native skill-loading tool**, call it with the skill's name.
- **If it doesn't**, load the skill the way you'd open any file: read its SKILL.md directly with your file-read tool. Find the path in the skills list, or via the CLI fallback below.

Either path has the same result — the skill's content enters your context and you follow it directly. Don't assume a native tool exists; if you can't find one, read the file. The point is to get the skill's content in front of you, not to use any particular mechanism.

**CLI fallback** (use when the skills list isn't already in your context):

```bash
superpowers-agent find-skills              # list all skills
superpowers-agent find-skills | grep test  # filter by topic
superpowers-agent execute <skill-name>     # print a skill to load and follow
```

**Announce when using a skill:**
> "Using Skill: [name] to [purpose]"

This keeps the conversation clear and lets the user know which workflow you're following.

## Skill Priority

When several skills could apply, load them in order of how much each reframes the problem — broadest understanding first, narrowest execution last. Loading a skill is cheap (you are only reading); committing to the wrong workflow is expensive.

1. **Domain / context skills first.** A skill about the specific technology or domain you are working in teaches you the territory — and often tells you which approach fits, or that a generic workflow does not. Read it before you commit to a process, and before you brainstorm or plan: knowing the territory makes the brainstorm sharper and can rule a planning skill in or out. A domain skill outranks even an intent-gathering skill like brainstorming.
2. **Process / approach skills next.** brainstorming, planning, systematic-debugging, test-driven-development — chosen *informed by* what the domain skill told you.
3. **Implementation skills last.** Step-by-step execution guides, once the approach is set.

Why this order: if you lock into a planning or process workflow before reading the domain skill, you may follow steps that do not fit the problem — and by the time you read the domain skill you are already mid-workflow and cannot switch cleanly. Read first, the domain skill can still redirect you to the right process, or tell you to skip one.

**Worked example** — "Let's build a subscription checkout on Stripe," with a Stripe domain skill, a payment-flow planning skill, and a Stripe-checkout implementation skill available:

→ `stripe-payments-domain` (learn the territory; it may change how you plan) → `planning-payment-flows` (map states and failure modes) → `implementing-stripe-checkout` (execute).

When no domain skill applies, the leading process skill comes first: "Fix this bug" → `systematic-debugging`, then any domain or implementation skill it points you to.

The first skill you load may change the rest of the plan — reassess after each one rather than committing to the whole sequence up front.

## Mapping Skill Instructions to Your Tools

A skill may name a tool using one platform's vocabulary — a todo tracker, a subagent dispatcher, a file editor, a shell, a search tool, a web fetcher. Map each to the closest equivalent your environment provides and use it. If your platform has no equivalent for something a skill calls for, perform the action inline yourself. The skill's intent is what matters, not the specific tool name it happens to use.

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

At conversation start (periodically thereafter, e.g. once per day), check your version:
1. **CURRENT_VERSION** — run a `superpowers-agent version` command and extract `X.Y.Z` from the `X.Y.Z` string in its output.
2. **NPM_LATEST_VERSION** — run `npm view @complexthings/superpowers-agent version`.
3. Compare by **semver precedence, not string comparison** (e.g. `9.2.1` > `9.0.1`). If NPM_LATEST_VERSION is newer, tell the user — do not run these yourself:
   > Your superpowers-agent has updates (`CURRENT_VERSION` → `NPM_LATEST_VERSION`). Run:
   > ```sh
   > npm install -g @complexthings/superpowers-agent
   > superpowers-agent update && superpowers-agent bootstrap && superpowers-agent setup-skills
   > ```
   If versions match, or either lookup fails (e.g. no network), continue silently.
