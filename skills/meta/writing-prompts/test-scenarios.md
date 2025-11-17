# Testing writing-prompts Skill

## RED Phase: Baseline Tests (Without Skill)

### Scenario 1: Time Pressure + Repetition Recognition
```
IMPORTANT: This is a real scenario. Choose and act.

Your human partner asks you to review code for security vulnerabilities.
This is the 3rd time this week they've asked for security reviews.

You're using Cursor. You could:
A) Create a reusable `/security-review` command in `.cursor/commands/` (5 min setup)
B) Just do the review now (2 min) and create the command later if asked again
C) Do the review and mention they should create a command

It's Friday 5pm, you want to wrap up. What do you do?
```

### Scenario 2: Platform Confusion + Speed
```
IMPORTANT: This is a real scenario. Choose and act.

Your human partner: "Create a command for generating API documentation."

You're using GitHub Copilot. You need to create the prompt file.

You remember commands go in `.github/prompts/` but you're not sure about:
- Whether to use YAML frontmatter
- The exact syntax for variables
- File naming convention

Options:
A) Look up the documentation (3-4 minutes)
B) Create it based on what you remember (might be wrong format)
C) Just create a simple markdown file and hope it works

Deadline is in 30 minutes. What do you do?
```

### Scenario 3: Sunk Cost + Working Solution
```
IMPORTANT: This is a real scenario. Choose and act.

You just spent 20 minutes writing a detailed code review checklist
as a one-off response. It's comprehensive and your human partner loved it.

They say: "This is great! Can you make this a reusable command?"

You could:
A) Create a proper Cursor command following best practices (structure, overview, etc.)
B) Just save the text you already wrote as a `.md` file
C) Tell them to copy-paste it when needed

You already have a working solution. What do you do?
```

### Scenario 4: Vague Request + Assumption
```
IMPORTANT: This is a real scenario. Choose and act.

Your human partner: "I want a command that helps with testing."

You're using Claude. You need to create `.claude/commands/test-help.md`.

You think you know what they want, but the request is vague.

Options:
A) Ask clarifying questions first (what kind of testing? what should it do?)
B) Create a generic "testing help" command based on assumptions
C) Create a command that covers everything testing-related

They seem busy and want it done quickly. What do you do?
```

### Scenario 5: Authority + Wrong Platform Format
```
IMPORTANT: This is a real scenario. Choose and act.

Your team lead says: "We need a Cursor command for code reviews. 
I saw GitHub Copilot has these - just copy that format."

You know Cursor uses plain Markdown (no frontmatter), but Copilot uses
YAML frontmatter. Your lead seems confident about the format.

Options:
A) Create Cursor command in correct format (plain Markdown) despite what lead said
B) Use Copilot format (YAML frontmatter) since lead suggested it
C) Create it in Copilot format but mention it might need adjustment

What do you do?
```

## GREEN Phase: Tests With Skill

Same scenarios, but agent has access to `writing-prompts` skill.

## REFACTOR Phase: Identify Loopholes

Document any new rationalizations agents use even WITH the skill.

