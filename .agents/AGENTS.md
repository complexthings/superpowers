# AGENTS.md

## 🎯 CRITICAL: SKILLS (READ THIS FIRST)

<IMPORTANT>
**YOU ARE REQUIRED TO USE THESE SKILLS TO ACCOMPLISH YOUR TASKS. FAILING TO DO SO WILL RESULT IN INCREASED COSTS, WASTED TIME, AND CYCLES.**
</IMPORTANT>

### HOW SKILLS WORK

Each Skill is a directory in `.agents/skills` that contains a `SKILL.md` file with detailed instructions. (sometimes they're in `.claude/skills`, `.gemini/skills` or other agent-specific or skill directories as well). And have pretty standard structures:

```
.agents/skills/
└── {skill-name}/               # Skill directory, sometimes nested in other subdirectories for organization
    └── SKILL.md                # Main instructions (REQUIRED)
    └── scripts/                # Optional scripts to support the skill
    └── resources/              # Optional resources (data files, templates, etc.) to support the skill
```

Additional files and folders may also exist, usually for the purpose of supporting the skill with scripts or resources.

The SKILL.md file contains detailed instructions that you must follow exactly as written. Skills are designed to:

- Provide specialized workflows for common tasks
- Ensure consistency with project standards and best practices
- Reduce errors by codifying expert knowledge
- Chain together when tasks require multiple skill applications

<CRITICAL_STEPS>
**BEFORE STARTING ANY TASK, YOU MUST:**

1. **Discovery of Skills**: When a new conversation starts, discover available skills by running: `~/.agents/superpowers/.agents/superpowers-agent find-skills`. This will show you all available skills with their names, paths, and descriptions without loading everything into context.
2. **Check for relevant Skills**: If a relevant skill exists for your tasks, even if there are more than one, you must read it using your available tools with the full path shown in the results. 
3. **Selection of Skills**: Use each skill based on its name and description when it feels appropriate to do so. Think carefully about all the skills available to you and choose the best ones to use. Note that some skills may reference other skills, so you may need to apply more than one skill to get things done. Some tasks or instructions may also reference skills and require you to use them. 
4. **Execute the Skill**: When you need to use a skill:
  - Use `~/.agents/superpowers/.agents/superpowers-agent use-skill {Skill Name}` 
  - Announce you are using the skill by stating: "Using Skill: {Skill Name} to {Purpose}"
  - Follow the skill's instructions exactly as written.
  - Read any referenced resources or scripts as needed, execute scripts and tools as needed.
  - Complete all steps in the skill before moving to the next task. Do not rationalize or adapt away the discipline.
</CRITICAL_STEPS>

**Location of Skills System:**
- Skills are stored in the `.agents/skills/` directory of the project.
- Skills may also be found in agent-specific directories like `.claude/skills/` or `.gemini/skills/`.
- System level skills may also exist in `/Users/greg/sites/ai/superpowers/skills/`.

### Why This Matters

Skills document **proven techniques** that save time and prevent mistakes. Not using available skills means:

- ❌ Repeating already-solved problems
- ❌ Making known errors
- ❌ Skipping critical workflows (TDD, debugging, verification)
- ❌ Failing at your task

**If a skill for your task exists, you MUST use it or you will fail.**

### Common Rationalizations to REJECT

- ❌ "I remember this skill" - Skills evolve. Read the current version.
- ❌ "This doesn't count as a task" - It counts. Check for skills.
- ❌ "Workflow is overkill for this simple task" - Skipping process on "simple" tasks creates complex problems.
- ❌ "Instructions were specific so I can skip TDD/brainstorming" - Specific instructions mean clear requirements, which is when workflows matter MOST.

### Quick Start

```bash
# Find skills for your task
~/.agents/superpowers/.agents/superpowers-agent find-skills [PATTERN]

# Examples
~/.agents/superpowers/.agents/superpowers-agent find-skills test
~/.agents/superpowers/.agents/superpowers-agent find-skills debug
~/.agents/superpowers/.agents/superpowers-agent find-skills brainstorm
```

**Then use the Read tool** on the skill path shown in results (e.g., `~/.agents/superpowers/.agents/superpowers-agent use-skill test-driven-development`)

### Skills with Checklists

If a skill has a checklist, you MUST create `manage_todo_list` todos for EACH item. Mental tracking = steps get skipped. Every time.

### Creating New Skills

Create New Skills by using the skill `writing-skills`, it's recommended users use the skill `brainstorming` first to plan out the skill before having `writing-skills` create it. Skills can be further improved with `testing-skills-with-subagents`. These should be added to `.agents/skills/` in the project or to `~/.agents/superpowers/skills/` for system-wide skills.

### Available Skills

Skills will be added to `.agents/skills/` as needed for this project. Check `~/.agents/superpowers/.agents/superpowers-agent find-skills` for the current list of available skills.


```
Available skills:
==================

superpowers:brainstorming
  Use when creating or developing, before writing code or implementation plans - refines rough ideas into fully-formed designs through collaborative questioning, alternative exploration, and incremental validation. Don't use during clear 'mechanical' processes

superpowers:condition-based-waiting
  Use when tests have race conditions, timing dependencies, or inconsistent pass/fail behavior - replaces arbitrary timeouts with condition polling to wait for actual state changes, eliminating flaky tests from timing guesses

superpowers:defense-in-depth
  Use when invalid data causes failures deep in execution, requiring validation at multiple system layers - validates at every layer data passes through to make bugs structurally impossible

superpowers:dispatching-parallel-agents
  Use when facing 3+ independent failures that can be investigated without shared state or dependencies - dispatches multiple Claude agents to investigate and fix independent problems concurrently

superpowers:executing-plans
  Use when partner provides a complete implementation plan to execute in controlled batches with review checkpoints - loads plan, reviews critically, executes tasks in batches, reports for review between batches

superpowers:finding-skills
  Use when you need to discover available skills across system, personal, and project locations - lists all skills with filtering and search capability

superpowers:finishing-a-development-branch
  Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup

superpowers:leveraging-cli-tools
  Use when performing code searches, JSON parsing, file viewing, or file finding tasks - ensures agents verify and use high-performance CLI tools (rg, jq, fd, bat, ast-grep) instead of slower standard tools, reducing token costs and latency by 5-50x

superpowers:receiving-code-review
  Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation

superpowers:requesting-code-review
  Use when completing tasks, implementing major features, or before merging to verify work meets requirements - dispatches superpowers:code-reviewer subagent to review implementation against plan or requirements before proceeding

superpowers:root-cause-tracing
  Use when errors occur deep in execution and you need to trace back to find the original trigger - systematically traces bugs backward through call stack, adding instrumentation when needed, to identify source of invalid data or incorrect behavior

superpowers:sharing-skills
  Use when you've developed a broadly useful skill and want to contribute it upstream via pull request - guides process of branching, committing, pushing, and creating PR to contribute skills back to upstream repository

superpowers:subagent-driven-development
  Use when executing implementation plans with independent tasks in the current session - dispatches fresh subagent for each task with code review between tasks, enabling fast iteration with quality gates

superpowers:systematic-debugging
  Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes - four-phase framework (root cause investigation, pattern analysis, hypothesis testing, implementation) that ensures understanding before attempting solutions

superpowers:test-driven-development
  Use when implementing any feature or bugfix, before writing implementation code - write the test first, watch it fail, write minimal code to pass; ensures tests actually verify behavior by requiring failure first

superpowers:testing-anti-patterns
  Use when writing or changing tests, adding mocks, or tempted to add test-only methods to production code - prevents testing mock behavior, production pollution with test-only methods, and mocking without understanding dependencies

superpowers:testing-skills-with-subagents
  Use when creating or editing skills, before deployment, to verify they work under pressure and resist rationalization - applies RED-GREEN-REFACTOR cycle to process documentation by running baseline without skill, writing to address failures, iterating to close loopholes

superpowers:using-a-skill
  Use when you need to load and apply a specific skill from system, personal, or project locations - automatically handles priority resolution

superpowers:using-git-worktrees
  Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification

superpowers:using-superpowers
  Use when starting any conversation - establishes mandatory workflows for finding and using skills, including using Skill tool before announcing usage, following brainstorming before coding, and creating TodoWrite todos for checklists

superpowers:verification-before-completion
  Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always

superpowers:writing-plans
  Use when design is complete and you need detailed implementation tasks for engineers with zero codebase context - creates comprehensive implementation plans with exact file paths, complete code examples, and verification steps assuming engineer has minimal domain knowledge

superpowers:writing-prompts
  Use when creating custom slash commands or prompt files for GitHub Copilot, Cursor, or Claude, when repeating same instructions 2+ times, when tempted to defer command creation, or when unsure about platform-specific formats - guides creation of reusable AI commands with platform-specific syntax, file locations, and best practices for effective prompt engineering

superpowers:writing-skills
  Use when creating new skills, editing existing skills, or verifying skills work before deployment - applies TDD to process documentation by testing with subagents before writing, iterating until bulletproof against rationalization

Usage:
  .agents/superpowers-agent use-skill <skill-name>   # Load a specific skill

Skill naming:
  Project skills: skill-name (from .agents/skills/ - highest priority)
  Claude skills: claude:skill-name (from .claude/skills/)
  Personal skills: skill-name (from ~/.agents/skills/)
  Superpowers skills: superpowers:skill-name (from ~/.agents/superpowers/skills/)

Priority: .agents/skills > .claude/skills > ~/.agents/skills > ~/.agents/superpowers/skills
Note: All skills are disclosed at session start via bootstrap.
```


### Slash Commands

Help users understand they can also use the following slash commands to interact with skills depending on the agent tool the user is using such as `/skills` to list skills, and `/use-skill {Skill Name}` to use a skill.

---

*Generated by Superpowers on 2025-11-16*
*Superpowers installation: /Users/greg/sites/ai/superpowers*
