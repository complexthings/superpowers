---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session
metadata:
  when_to_use: when executing implementation plans with independent tasks in the current session, using fresh subagents with review gates
  version: 2.1.0
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## When to Use

```mermaid
flowchart TD
    A{Have implementation plan?} -->|yes| B{Tasks mostly independent?}
    A -->|no| C[Manual execution or brainstorm first]
    B -->|yes| D{Stay in this session?}
    B -->|no - tightly coupled| C
    D -->|yes| E[subagent-driven-development]
    D -->|no - parallel session| F[executing-plans]
```

**vs. Executing Plans (parallel session):**
- Same session (no context switch)
- Fresh subagent per task (no context pollution)
- Two-stage review after each task: spec compliance first, then code quality
- Faster iteration (no human-in-loop between tasks)

## The Process

```mermaid
flowchart TD
    PLAN[Read plan, extract tasks, create TodoWrite] --> IMPL[Dispatch implementer subagent]

    subgraph PER_TASK [Per Task]
        IMPL --> QUESTIONS{Implementer asks questions?}
        QUESTIONS -->|yes| ANSWER[Answer questions, provide context]
        ANSWER --> IMPL
        QUESTIONS -->|no| WORK[Implementer implements, tests, commits, self-reviews]
        WORK --> SPEC[Dispatch spec reviewer subagent]
        SPEC --> SPEC_OK{Code matches spec?}
        SPEC_OK -->|no| SPEC_FIX[Implementer fixes spec gaps]
        SPEC_FIX -->|re-review| SPEC
        SPEC_OK -->|yes| QUALITY[Dispatch code quality reviewer subagent]
        QUALITY --> QUAL_OK{Quality reviewer approves?}
        QUAL_OK -->|no| QUAL_FIX[Implementer fixes quality issues]
        QUAL_FIX -->|re-review| QUALITY
        QUAL_OK -->|yes| DONE_TASK[Mark task complete in TodoWrite]
    end

    DONE_TASK --> MORE{More tasks remain?}
    MORE -->|yes| IMPL
    MORE -->|no| FINAL[Dispatch final code reviewer for entire implementation]
    FINAL --> FINISH[Use finishing-a-development-branch skill]
```

## Prompt Templates

Use these templates when dispatching subagents:

- `./implementer-prompt.md` - Dispatch implementer subagent with self-review checklist
- `./spec-reviewer-prompt.md` - Dispatch spec compliance reviewer subagent (Stage 1)
- `./code-quality-reviewer-prompt.md` - Dispatch code quality reviewer subagent (Stage 2)

## Two-Stage Review Explained

### Stage 1: Spec Compliance Review

**Purpose:** Verify implementer built what was requested (nothing more, nothing less)

**Catches:**
- Missing requirements
- Extra/unneeded features
- Misunderstandings of requirements

**Key behavior:** Don't trust the implementer's report - read the actual code and compare to spec.

### Stage 2: Code Quality Review

**Purpose:** Verify implementation is well-built (clean, tested, maintainable)

**Only runs after spec compliance passes.**

**Catches:**
- Missing tests
- Poor code structure
- Technical debt
- Maintainability issues

### Why Two Stages?

**Problem with single-stage review:**
- Reviewer might approve clean code that doesn't match spec
- Or reject spec-compliant code for style issues
- Different concerns get conflated

**Two-stage solution:**
1. First ensure it does the right thing
2. Then ensure it's built well

## Example Workflow

```
You: I'm using Subagent-Driven Development to execute this plan.

[Read plan file once: docs/plans/feature-plan.md]
[Extract all 5 tasks with full text and context]
[Create TodoWrite with all tasks]

Task 1: Hook installation script

[Get Task 1 text and context (already extracted)]
[Dispatch implementation subagent with full task text + context]

Implementer: "Before I begin - should the hook be installed at user or system level?"

You: "User level (~/.config/superpowers/hooks/)"

Implementer: "Got it. Implementing now..."
[Later] Implementer:
  - Implemented install-hook command
  - Added tests, 5/5 passing
  - Self-review: Found I missed --force flag, added it
  - Committed

[Dispatch spec compliance reviewer]
Spec reviewer: ✅ Spec compliant - all requirements met, nothing extra

[Get git SHAs, dispatch code quality reviewer]
Code reviewer: Strengths: Good test coverage, clean. Issues: None. Approved.

[Mark Task 1 complete]

Task 2: Recovery modes

[Get Task 2 text and context (already extracted)]
[Dispatch implementation subagent with full task text + context]

Implementer: [No questions, proceeds]
Implementer:
  - Added verify/repair modes
  - 8/8 tests passing
  - Self-review: All good
  - Committed

[Dispatch spec compliance reviewer]
Spec reviewer: ❌ Issues:
  - Missing: Progress reporting (spec says "report every 100 items")
  - Extra: Added --json flag (not requested)

[Implementer fixes issues]
Implementer: Removed --json flag, added progress reporting

[Spec reviewer reviews again]
Spec reviewer: ✅ Spec compliant now

[Dispatch code quality reviewer]
Code reviewer: Strengths: Solid. Issues (Important): Magic number (100)

[Implementer fixes]
Implementer: Extracted PROGRESS_INTERVAL constant

[Code reviewer reviews again]
Code reviewer: ✅ Approved

[Mark Task 2 complete]

...

[After all tasks]
[Dispatch final code-reviewer]
Final reviewer: All requirements met, ready to merge

Done!
```

## Advantages

**vs. Manual execution:**
- Subagents follow TDD naturally
- Fresh context per task (no confusion)
- Parallel-safe (subagents don't interfere)
- Subagent can ask questions (before AND during work)

**vs. Executing Plans:**
- Same session (no handoff)
- Continuous progress (no waiting)
- Review checkpoints automatic

**Efficiency gains:**
- No file reading overhead (controller provides full text)
- Controller curates exactly what context is needed
- Subagent gets complete information upfront
- Questions surfaced before work begins (not after)

**Quality gates:**
- Self-review catches issues before handoff
- Two-stage review: spec compliance, then code quality
- Review loops ensure fixes actually work
- Spec compliance prevents over/under-building
- Code quality ensures implementation is well-built

**Cost:**
- More subagent invocations (implementer + 2 reviewers per task)
- Controller does more prep work (extracting all tasks upfront)
- Review loops add iterations
- But catches issues early (cheaper than debugging later)

## Red Flags

**Never:**
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Make subagent read plan file (provide full text instead)
- Skip scene-setting context (subagent needs to understand where task fits)
- Ignore subagent questions (answer before letting them proceed)
- Accept "close enough" on spec compliance (spec reviewer found issues = not done)
- Skip review loops (reviewer found issues = implementer fixes = review again)
- Let implementer self-review replace actual review (both are needed)
- **Start code quality review before spec compliance is ✅** (wrong order)
- Move to next task while either review has open issues

**If subagent asks questions:**
- Answer clearly and completely
- Provide additional context if needed
- Don't rush them into implementation

**If reviewer finds issues:**
- Implementer (same subagent) fixes them
- Reviewer reviews again
- Repeat until approved
- Don't skip the re-review

**If subagent fails task:**
- Dispatch fix subagent with specific instructions
- Don't try to fix manually (context pollution)

## Integration

**Required workflow skills:**
- **writing-plans** - Creates the plan this skill executes
- **requesting-code-review** - Code review template for reviewer subagents
- **finishing-a-development-branch** - Complete development after all tasks

**Subagents should use:**
- **test-driven-development** - Subagents follow TDD for each task

**Alternative workflow:**
- **executing-plans** - Use for parallel session instead of same-session execution
