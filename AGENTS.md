# AGENTS.md

## CRITICAL FOR ALL AGENTS:

REMEMBER WHAT YOU ARE INTEGRATED WITH, MOST OF THE TIME YOU ARE INTEGRATED WITH AN IDE DIRECTLY THERE IS NEVER A NEED TO ECHO OR CAT INTO A FILE WITH A HEREDOC OR SIMILAR METHOD UNLESS SPECIFICALLY INSTRUCTED TO DO SO IN THE USER INSTRUCTIONS FOR A TASK. OR AS PART OF A PLATFORM BEST PRACTICE.

<IMPORTANT>All agents and tools (GitHub Copilot, Codex, Gemini, Claude, etc.) must edit files directly with their IDE or file tools instead of piping heredocs via terminal (`cat <<'EOF' > file`, `node -e ... > file`, etc.), especially in VS Code or other Electron-based IDEs where terminal injection can break the environment.</IMPORTANT>

<important>NEVER EVER CAT A HEREDOC TO A FILE IN TERMINAL, YOU MUST USE THE IDE'S FILE WRITING CAPABILITIES INSTEAD.</important>

<!-- SUPERPOWERS_SKILLS_START -->
## 🎯 CRITICAL: SKILLS (READ THIS FIRST)

<IMPORTANT>
**YOU ARE REQUIRED TO USE THESE SKILLS TO ACCOMPLISH YOUR TASKS. FAILING TO DO SO WILL RESULT IN INCREASED COSTS, WASTED TIME, AND CYCLES.**
</IMPORTANT>

### Installation Check

**If the superpowers-agent is not available on the user's system**, run the following to install:

```bash
curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash
```

Read and follow all instructions in the installation guide to set up the superpowers-agent and universal agent-agnostic skills system.

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

1. **Discovery of Skills**: When a new conversation starts, discover available skills by running: `superpowers-agent find-skills`. This will show you all available skills with their names, paths, and descriptions without loading everything into context.
2. **Check for relevant Skills**: If a relevant skill exists for your tasks, even if there are more than one, you must read it using your available tools with the full path shown in the results. 
3. **Selection of Skills**: Use each skill based on its name and description when it feels appropriate to do so. Think carefully about all the skills available to you and choose the best ones to use. Note that some skills may reference other skills, so you may need to apply more than one skill to get things done. Some tasks or instructions may also reference skills and require you to use them. 
4. **Execute the Skill**: When you need to use a skill:
  - Use `superpowers-agent use-skill {Skill Name}` 
  - Announce you are using the skill by stating: "Using Skill: {Skill Name} to {Purpose}"
  - Follow the skill's instructions exactly as written.
  - Read any referenced resources or scripts as needed, execute scripts and tools as needed.
  - Complete all steps in the skill before moving to the next task. Do not rationalize or adapt away the discipline.
</CRITICAL_STEPS>

**Location of Skills System:**
- Skills are stored in the `.agents/skills/` directory of the project.
- Skills may also be found in agent-specific directories like `.claude/skills/` or `.gemini/skills/`.
- System level skills may also exist in `~/.agents/skills/`.

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
superpowers-agent find-skills [PATTERN]

# Examples
superpowers-agent find-skills test
superpowers-agent find-skills debug
superpowers-agent find-skills brainstorm
```

**Then use the Read tool** on the skill path shown in results (e.g., `superpowers-agent use-skill test-driven-development`)

### Skills with Checklists

If a skill has a checklist, you MUST create `manage_todo_list` todos for EACH item. Mental tracking = steps get skipped. Every time.

### Creating New Skills

Create New Skills by using the skill `writing-skills`, it's recommended users use the skill `brainstorming` first to plan out the skill before having `writing-skills` create it. Skills can be further improved with `testing-skills-with-subagents`. These should be added to `.agents/skills/` in the project or to `~/.agents/superpowers/skills/` for system-wide skills.

### Available Skills

Skills will be added to `.agents/skills/` as needed for this project. Check `superpowers-agent find-skills` for the current list of available skills.

### Slash Commands

Help users understand they can also use the following slash commands to interact with skills depending on the agent tool the user is using such as `/skills` to list skills, and `/use-skill {Skill Name}` to use a skill.

---

*Generated/Updated by Superpowers on 2025-11-18*
<!-- SUPERPOWERS_SKILLS_END -->### HOW SKILLS WORK

Each Skill is a directory in `./skills/{skill-name}` that contains a `SKILL.md` file with detailed instructions. (sometimes they're in `.claude/skills`, or other agent-specific or skill directories as well). And have pretty standard stuctures:

```
./skills/{skill-name}/
└── SKILL.md                # Main instructions (REQUIRED)
└── scripts/                # Optional scripts to support the skill
└── resources/              # Optional resources (data files, templates, etc.) to support the skill
```

The SKILL.md file contains detailed instructions that you must follow exactly as written. Skills are designed to:

- Provide specialized workflows for common tasks
- Ensure consistency with project standards and best practices
- Reduce errors by codifying expert knowledge
- Chain together when tasks require multiple skill applications

<CRITICAL_STEPS>
**BEFORE STARTING ANY TASK, YOU MUST:**


0. **Install Superpowers**: If you don't have superpowers installed, run: `superpowers-agent bootstrap`. This will install superpowers and all the skills you need to get started.
1. **Discovery of Skills**: When a new conversation starts, discover available skills by running: `superpowers-agent find-skills`. This will show you all available skills with their names, paths, and descriptions without loading everything into context.
2. **Check for relevant Skills**: If a relevant skill exists for your tasks, even if there are more than one, you must read it using your available tools with the full path shown in the results. 
3. **Selection of Skills**: Use each skill based on its name and description when it feels appropriate to do so.  Think carefully about all the skills available to you and choose the best ones to use.  Note that some skills may reference other skills, so you may need to apply more than one skill to get things done. Some tasks or instructions may also reference skills and require you to use them. 
4. **Execute the Skill**: When you need to use a skill:
  - Use `superpowers-agent use-skill {Skill Name}` 
  - Announce you are using the skill by stating: "Using Skill: {Skill Name} to {Purpose}"
  - Follow the fkill's instructions exactly as written.
  - Read any referenced resources or scripts as needed, execute scripts and tools as needed.
  - Complete all stapes in the skill before moving to the next task.  Do not rationalize or adapt away the discipline.
</CRITICAL_STEPS>

**Location of Skills System:** `./skills/{skill-name}/SKILL.md`
