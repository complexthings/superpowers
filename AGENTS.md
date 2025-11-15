# AGENTS.md

## CRITICAL FOR ALL AGENTS:

REMEMBER WHAT YOU ARE INTEGRATED WITH, MOST OF THE TIME YOU ARE INTEGRATED WITH AN IDE DIRECTLY THERE IS NEVER A NEED TO ECHO OR CAT INTO A FILE WITH A HEREDOC OR SIMILAR METHOD UNLESS SPECIFICALLY INSTRUCTED TO DO SO IN THE USER INSTRUCTIONS FOR A TASK. OR AS PART OF A PLATFORM BEST PRACTICE.

<important>NEVER EVER CAT A HEREDOC TO A FILE IN TERMINAL, YOU MUST USE THE IDE'S FILE WRITING CAPABILITIES INSTEAD.</important>

## 🎯 CRITICAL: SKILLS (READ THIS FIRST)

<IMPORTANT>
**YOU ARE REQUIRED TO USE THESE SKILLS TO ACCOMPLISH YOUR TASKS. FAILING TO DO SO WILL RESULT IN WASTED TIME AND CYCLES.**
</IMPORTANT>

### HOW SKILLS WORK

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


0. **Install Superpowers**: If you don't have superpowers installed, run: `~/.agents/superpowers/.agents/superpowers-agent bootstrap`. This will install superpowers and all the skills you need to get started.
1. **Discovery of Skills**: When a new conversation starts, discover available skills by running: `~/.agents/superpowers/.agents/superpowers-agent find-skills`. This will show you all available skills with their names, paths, and descriptions without loading everything into context.
2. **Check for relevant Skills**: If a relevant skill exists for your tasks, even if there are more than one, you must read it using your available tools with the full path shown in the results. 
3. **Selection of Skills**: Use each skill based on its name and description when it feels appropriate to do so.  Think carefully about all the skills available to you and choose the best ones to use.  Note that some skills may reference other skills, so you may need to apply more than one skill to get things done. Some tasks or instructions may also reference skills and require you to use them. 
4. **Execute the Skill**: When you need to use a skill:
  - Use `~/.agents/superpowers/.agents/superpowers-agent use-skill {Skill Name}` 
  - Announce you are using the skill by stating: "Using Skill: {Skill Name} to {Purpose}"
  - Follow the fkill's instructions exactly as written.
  - Read any referenced resources or scripts as needed, execute scripts and tools as needed.
  - Complete all stapes in the skill before moving to the next task.  Do not rationalize or adapt away the discipline.
</CRITICAL_STEPS>

**Location of Skills System:** `./skills/{skill-name}/SKILL.md`
