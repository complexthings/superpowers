# Superpowers Skills System

## What This Is

You have access to a **skills library** - proven techniques, patterns, and workflows for systematic software development. Skills are markdown reference guides that teach you rigorous approaches to common engineering tasks.

**When Superpowers is installed, skills are available from two locations:**
1. **System skills** - Universal best practices installed at `~/.config/superpowers/skills/` (or similar)
2. **Repository skills** - Project-specific skills in the repo you're working in at `skills/`

## How Skills Work

### Finding Skills

Skills have YAML frontmatter optimized for search:
```yaml
---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code - write the test first, watch it fail, write minimal code to pass
---
```

The `description` field tells you **when to use** the skill and **what it does**. When you encounter a situation matching the "Use when..." pattern, that skill applies to your current task.

### Using Skills

**Skills are mandatory when they apply to your task.** If a skill exists for what you're doing, you must use it.

Skills reference each other by name (e.g., `superpowers:test-driven-development`). Load skills on-demand when you need them - don't force-load with `@` syntax as that wastes context.

### Skill Locations

Check both locations for skills:
- System: `~/.config/superpowers/skills/*/SKILL.md` (universal best practices)
- Repo: `<workspace>/skills/*/SKILL.md` (project-specific workflows)

## Core Disciplines You Must Follow

When skills exist for your current task, they define **mandatory workflows**. These are not suggestions - they're systematic approaches proven to prevent common failures.

### 1. Test-Driven Development (TDD)

**Use when:** Implementing any feature or bugfix, before writing implementation code

**The workflow:**
- Write the test first
- Watch it fail (RED)
- Write minimal code to pass (GREEN)  
- Refactor while keeping tests green

**Why the order matters:** Tests passing immediately prove nothing. You must see the test fail to know it tests the right thing.

**Common rationalizations the skill explicitly forbids:**
- "Too simple to test" - Test takes 30 seconds
- "I'll test after" - Tests-after = "what does this do?" Tests-first = "what should this do?"
- "Already manually tested" - Ad-hoc ≠ systematic, can't re-run
- "Keep code as reference" - Delete means delete, start fresh from tests

### 2. Systematic Debugging

**Use when:** Encountering any bug, test failure, or unexpected behavior, before proposing fixes

**The workflow:**
1. **Root Cause Investigation** - Read errors, reproduce, trace data flow, gather evidence
2. **Pattern Analysis** - Find working examples, compare, identify differences
3. **Hypothesis Testing** - Form single hypothesis, test minimally, verify before continuing
4. **Implementation** - Create failing test, implement single fix, verify

**Critical rule:** NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST

**Red flags the skill calls out:**
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"  
- Proposing solutions before tracing data flow
- After 3 failed fixes, question the architecture (don't attempt a fourth fix)

### 3. Verification Before Completion

**Use when:** About to claim work is complete, fixed, or passing, before committing or creating PRs

**The gate function:**
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim with evidence

**The iron law:** NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE

**Words that trigger this requirement:**
- ANY variation of success/completion claims
- ANY expression of satisfaction ("Great!", "Perfect!", "Done!")
- ANY positive statement about work state

### 4. Brainstorming

**Use when:** Creating or developing features/designs, before writing code or implementation plans

**The workflow:**
- Understand current project context first (files, docs, commits)
- Ask questions one at a time to refine the idea
- Explore 2-3 alternative approaches with trade-offs
- Present design in sections (200-300 words), validate each
- Write validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`

**Don't use during:** Clear mechanical processes where requirements are fully specified

## Why These Rules Exist

**These skills contain "rationalization tables"** - explicit lists of common excuses agents use to skip process discipline, with counters for each excuse.

Example from TDD skill:
- "Deleting X hours of work is wasteful" → Sunk cost fallacy. Keeping unverified code is technical debt.
- "TDD is dogmatic, being pragmatic means adapting" → TDD IS pragmatic - finds bugs before commit, prevents regressions, documents behavior.

The goal is **systematic rigor under pressure**. When you're tired, rushed, or facing sunk cost, the rationalization tables close every loophole.

## Creating Repository-Specific Skills

You can add project-specific skills to any repository at `<workspace>/skills/*/SKILL.md`.

**When to create repository skills:**
- Project-specific conventions (build commands, deployment workflows)
- Domain-specific patterns (how this codebase handles auth, data flow)
- Team workflows (code review process, branch strategies)

**When NOT to create repository skills:**
- Universal best practices (those belong in system skills)
- One-off solutions (use comments or README instead)
- Content that duplicates existing system skills

**Skill format requirements:**
```markdown
---
name: skill-name-with-hyphens-only
description: Use when [specific trigger conditions] - [what it does]
---

# Skill Name

## Overview
Core principle in 1-2 sentences.

## When to Use  
Specific situations and symptoms

## Implementation
Concrete patterns with examples

## Common Mistakes
What goes wrong + fixes
```

**For complete skill authoring guidance:** See `superpowers:writing-skills` (system skill)

## Discovering Available Skills

**Check multiple locations for skills relevant to your task:**

1. **System skills** - Universal best practices
   - Location: `~/.config/superpowers/skills/` (or equivalent for your platform)
   - Contains: TDD, debugging, brainstorming, planning, verification, etc.

2. **Repository skills** - Project-specific workflows  
   - Location: `<workspace>/skills/` directory
   - Contains: Build commands, deployment workflows, domain patterns

**To find relevant skills:**
- Read skill descriptions (YAML frontmatter) looking for "Use when..." matches
- Skills with descriptions matching your current situation are mandatory to use
- When in doubt, check `superpowers:using-superpowers` for the discovery protocol

## Key System Skills to Know

These skills define foundational workflows you'll use constantly:

- **test-driven-development** - RED-GREEN-REFACTOR cycle, the Iron Law
- **systematic-debugging** - 4-phase root cause investigation before fixes
- **verification-before-completion** - Evidence before claims, always
- **brainstorming** - Design before implementation
- **writing-plans** - Detailed implementation plans for complex work
- **executing-plans** - Batch execution with review checkpoints
- **root-cause-tracing** - Backward tracing for deep stack errors
- **condition-based-waiting** - Replace arbitrary timeouts with polling
- **defense-in-depth** - Multiple validation layers

## Cross-Referencing Skills

Skills reference other skills using patterns like:
- `**REQUIRED SUB-SKILL:** Use superpowers:skill-name`  
- `**REQUIRED BACKGROUND:** You MUST understand superpowers:skill-name`

When you see these, load and follow the referenced skill.

## Philosophy

1. **Evidence over claims** - Run verification commands, report actual output
2. **Systematic over ad-hoc** - Follow proven processes even under pressure  
3. **Test-Driven Everything** - Tests first, watch them fail, then implement
4. **Simplicity as primary goal** - YAGNI ruthlessly
5. **Close every loophole** - Rationalization tables forbid shortcuts explicitly

**The skills system exists to make you systematically rigorous, especially when tired, rushed, or facing sunk costs.**