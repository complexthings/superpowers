---
name: creating-prompts
description: Create structured prompts for Do/Plan/Research/Refine workflows with dependency management
metadata:
  when_to_use: when you need to create focused, reusable prompts for specific tasks, research, planning, or refinement workflows
  version: 5.1.0
  languages: all
---

# Creating Prompts

## Overview

Create structured, reusable prompts for agent workflows. Prompts are focused instructions for specific tasks (Do), strategic planning (Plan), information gathering (Research), or iterative improvement (Refine).

**Core principle:** Prompts are lightweight, self-contained instructions that can be chained together through dependencies.

**Announce at start:** "I'm using the Creating Prompts skill to create a {purpose} prompt."

## When to Use

**Use this skill when:**
- Creating focused task instructions for agents
- Building multi-stage workflows (research → plan → implement)
- Need reusable prompts that can be executed independently
- Want to chain prompts with explicit dependencies

**When NOT to use:**
- For comprehensive implementation plans (use `writing-plans` skill instead)
- For features >100 LOC (use `writing-plans` for full roadmaps)
- One-off instructions (just give the instruction directly)

**Decision flowchart:**

```
Need instructions for agent?
├─ One-time task → Give instruction directly
├─ <100 LOC, focused → Create Prompt (this skill)
└─ >100 LOC, comprehensive → Use writing-plans skill
```

## Integration with Other Skills

**Before creating prompts:**
- For complex features → Use `brainstorming` skill to refine requirements first
- Unsure of approach → Start with Research prompt, then Plan, then Do

**After creating prompts:**
- Validate clarity → Use `testing-skills-with-subagents` to verify prompt works
- Execute prompts → Follow execution guidance (see below)

**Prompts vs Plans:**
- **Prompts**: Lightweight, focused, single-purpose (this skill)
- **Plans**: Comprehensive, multi-phase, detailed implementation (`writing-plans`)

See skills/collaboration/writing-plans for full implementation plans.
See skills/collaboration/brainstorming for design refinement before prompting.

## Configuration

Prompts are saved to configured directory (default: `.agents/prompts/`).

**Read config:**
```bash
superpowers-agent get-config prompts_dir
```

**Override globally:** `~/.agents/config.json`
```json
{
  "prompts_dir": "custom/prompts"
}
```

**Override per-project:** `.agents/config.json`
```json
{
  "prompts_dir": ".my-prompts"
}
```

Priority: Project config > Global config > Default (`.agents/prompts/`)

## Prompt Types

### 1. DO Prompts - Execute and Produce

**When:** Implement feature, fix bug, create document, build component

**Output:** Code files, documentation, configurations, designs

**Template:** `skills/meta/creating-prompts/templates/do-template.md`

**Example:** `skills/meta/creating-prompts/examples/do-example.md`

### 2. PLAN Prompts - Strategy and Roadmap

**When:** Design architecture, plan refactoring, decide approach

**Output:** Structured plans with phases, dependencies, decisions

**Template:** `skills/meta/creating-prompts/templates/plan-template.md`

**Example:** `skills/meta/creating-prompts/examples/plan-example.md`

### 3. RESEARCH Prompts - Gather Information

**When:** Understand library, explore patterns, analyze options

**Output:** Findings with confidence levels, recommendations, open questions

**Template:** `skills/meta/creating-prompts/templates/research-template.md`

**Example:** `skills/meta/creating-prompts/examples/research-example.md`

### 4. REFINE Prompts - Iterative Improvement

**When:** Deepen research, strengthen plan, address gaps

**Output:** Updated version with changelog, archived previous version

**Template:** `skills/meta/creating-prompts/templates/refine-template.md`

**Example:** `skills/meta/creating-prompts/examples/refine-example.md`

## Quick Reference

| Prompt Type | Purpose | Output | Common Chain |
|-------------|---------|--------|--------------|
| Research | Gather info | Findings + recommendations | Research → Plan → Do |
| Plan | Strategy | Phases + decisions | Plan → Do |
| Do | Execute | Artifacts (code/docs) | Standalone or after Plan |
| Refine | Improve | Updated version | After any type |

## Workflow Checklist

**IMPORTANT: Use TodoWrite to create todos for EACH checklist item below.**

### Phase 1: Preparation
- [ ] Determine prompt purpose (Do/Plan/Research/Refine)
- [ ] If complex feature → Consider using `/brainstorm` first
- [ ] If >100 LOC implementation → Consider `writing-plans` skill instead
- [ ] Identify topic for naming (kebab-case: auth, stripe-integration)
- [ ] Check for existing prompts to reference (creates dependencies)

### Phase 2: Creation
- [ ] Get next number: `skills/meta/creating-prompts/scripts/get-next-number.sh`
- [ ] Get prompts directory: `superpowers-agent get-config prompts_dir`
- [ ] Load appropriate template from `skills/meta/creating-prompts/templates/`
- [ ] Fill in template with specific details (no placeholders)
- [ ] Add frontmatter metadata (number, topic, purpose, dependencies)
- [ ] Reference existing outputs with `@` syntax if chained

### Phase 3: Quality Checks
- [ ] Objective is clear and specific (not vague)
- [ ] Context includes all necessary background
- [ ] Requirements are testable/verifiable
- [ ] Output specification is concrete
- [ ] Success criteria are measurable
- [ ] For Research/Plan: includes confidence/assumptions/open questions

### Phase 4: Validation (Recommended)
- [ ] Test prompt with subagent (see `testing-skills-with-subagents`)
- [ ] Verify subagent understands requirements
- [ ] Check output matches expected structure

### Phase 5: Save and Execute
- [ ] Create directory: `{prompts_dir}/{number}-{topic}-{purpose}/`
- [ ] Create `completed/` subdirectory
- [ ] Save prompt: `{number}-{topic}-{purpose}.md`
- [ ] Execute prompt (agent reads and follows instructions)
- [ ] Agent creates output: `{topic}-{purpose}-output.md`
- [ ] Agent creates `SUMMARY.md` with findings/decisions/next steps
- [ ] Move prompt to `completed/` after execution

## File Structure

```
.agents/prompts/                              # Configured location
├── 001-auth-research/
│   ├── 001-auth-research.md                  # The prompt
│   ├── completed/
│   │   └── 001-auth-research.md              # After execution
│   ├── auth-research-output.md               # Agent's output
│   └── SUMMARY.md                            # Executive summary
├── 002-auth-plan/
│   ├── 002-auth-plan.md
│   ├── completed/
│   ├── auth-plan-output.md
│   └── SUMMARY.md
└── 003-auth-do/
    ├── 003-auth-do.md
    ├── completed/
    ├── auth-do-output.md
    └── SUMMARY.md
```

## Naming Convention

**Format:** `{number}-{topic}-{purpose}.md`

**Examples:**
- `001-auth-research.md` - Research authentication options
- `002-auth-plan.md` - Plan auth implementation
- `003-stripe-integration-do.md` - Implement Stripe
- `004-auth-research-refine.md` - Deepen auth research

**Topic naming:**
- Use kebab-case
- Be specific but concise
- Examples: `auth`, `stripe-integration`, `user-profile`, `api-refactor`

## Dependency Detection

Prompts can reference other prompt outputs to create chains.

**Syntax:** `@.agents/prompts/{folder}/{file}-output.md`

**Example in prompt:**
```markdown
<context>
Based on research: @.agents/prompts/001-auth-research/auth-research-output.md
Based on plan: @.agents/prompts/002-auth-plan/auth-plan-output.md
</context>
```

**Frontmatter dependencies:**
```yaml
---
number: 003
topic: auth-do
purpose: do
dependencies: [001, 002]  # Must execute 001 and 002 first
created: 2025-11-21
---
```

## SUMMARY.md Template

Every prompt execution should create a `SUMMARY.md`:

```markdown
# {Topic} {Purpose} Summary

**One-liner:** [Substantive description of outcome, not generic]

## Key Findings
- [Actionable takeaway 1]
- [Actionable takeaway 2]
- [Actionable takeaway 3]

## Decisions Needed
- [What requires user input or approval]
- Or: "None"

## Blockers
- [External impediments preventing progress]
- Or: "None"

## Next Step
[Concrete forward action - what to do next]
```

## Execution Guidance

**How agents execute prompts:**

1. **Read the prompt** - Load `{number}-{topic}-{purpose}.md`
2. **Check dependencies** - Ensure referenced prompts completed first
3. **Follow instructions** - Execute according to prompt sections
4. **Create output** - Save to `{topic}-{purpose}-output.md`
5. **Create summary** - Save `SUMMARY.md` with findings
6. **Archive prompt** - Move to `completed/` subfolder

**For agents with Task/subagent capabilities:**
- Spawn fresh agent with prompt as instruction
- Agent produces output and summary
- Main agent reviews and archives

**For manual execution:**
- Open prompt in editor
- Follow instructions step-by-step
- Create output and summary files
- Move prompt to completed/

## Common Mistakes

### ❌ Vague objectives
```markdown
<objective>
Research authentication
</objective>
```

### ✅ Specific objectives
```markdown
<objective>
Research JWT authentication libraries for Node.js Express API to determine best option for TypeScript project with security focus
</objective>
```

### ❌ Missing context
```markdown
<context>
Current codebase
</context>
```

### ✅ Concrete context
```markdown
<context>
Express API in src/server.js, routes in src/routes/
Currently no authentication, all endpoints public
Must integrate with existing PostgreSQL user table
@src/server.js
@src/routes/api.js
</context>
```

### ❌ Generic requirements
```markdown
<requirements>
Should work well
Be secure
</requirements>
```

### ✅ Testable requirements
```markdown
<requirements>
- Verify JWT tokens in Authorization header
- Return 401 for invalid tokens
- Return 403 for expired tokens
- Extract user ID and attach to req.user
- No performance impact >10ms per request
</requirements>
```

## Credits

This skill is an agent-agnostic adaptation of TÂCHES' excellent [`create-meta-prompts` skill](https://github.com/glittercowboy/taches-cc-resources/tree/main/skills/create-meta-prompts).

TÂCHES pioneered the concept of structured prompt-to-prompt workflows with dependency management and multi-stage execution. This adaptation maintains the core concepts while making them accessible across all AI coding assistants (OpenCode, GitHub Copilot, Cursor, Gemini, Claude, etc.).

**Original author:** TÂCHES ([@glittercowboy](https://github.com/glittercowboy))

**Original repository:** https://github.com/glittercowboy/taches-cc-resources

Thank you to TÂCHES for the innovative work on meta-prompt patterns!
