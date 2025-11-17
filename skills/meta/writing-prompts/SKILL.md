---
name: writing-prompts
description: Use when creating custom slash commands or prompt files for GitHub Copilot, Cursor, or Claude, when repeating same instructions 2+ times, when tempted to defer command creation, or when unsure about platform-specific formats - guides creation of reusable AI commands with platform-specific syntax, file locations, and best practices for effective prompt engineering
---

# Writing Prompts

## Overview

Create reusable custom commands (slash commands) for GitHub Copilot, Cursor, or Claude. These commands standardize workflows, reduce repetition, and make AI assistance more efficient across your team.

**Core principle:** Well-written prompts are reusable workflows that save time and ensure consistency. They transform one-off instructions into team-wide standards.

## When to Use

**Create a prompt when:**
- You find yourself repeating the same instructions across sessions (2+ times = create it now)
- You want to standardize a workflow for your team
- A process involves multiple steps that benefit from templating
- You need consistent formatting or structure for outputs
- Someone asks you to "make this reusable" or "save this for later"

**CRITICAL:** If you've done the same task 2+ times, create the command NOW. Don't defer - "I'll create it later" becomes "I'll never create it."

**Don't create for:**
- One-off tasks you'll never repeat
- Simple queries that don't benefit from templating
- Platform-specific features already well-documented

## Platform Comparison

| Platform | Directory | File Format | File Extension | Notes |
|----------|-----------|-------------|----------------|-------|
| **GitHub Copilot** | `.github/prompts` or profile folder | Markdown with YAML frontmatter | `.md` | Supports variables like `${selection}` |
| **Cursor** | `.cursor/commands` (project) or `~/.cursor/commands` (global) | Plain Markdown | `.md` | Simple markdown, no frontmatter required |
| **Claude** | `.claude/commands` | Markdown | `.md` | Similar to Cursor format |

**CRITICAL:** Each platform has different format requirements. Using the wrong format will break the command. Always verify:
- GitHub Copilot: Requires YAML frontmatter
- Cursor: Plain Markdown only (no frontmatter)
- Claude: Plain Markdown only (no frontmatter)

**Platform format errors are not fixable later** - the command simply won't work. Get it right the first time.

## GitHub Copilot Prompt Files

**Location:**
- **Workspace:** `.github/prompts/` (project-specific)
- **User profile:** Profile folder (global, synced via Settings Sync)

**Structure:**
```markdown
---
description: Brief description of what this prompt does
agent: optional-agent-name
tools: [tool1, tool2]
---

# Prompt Name

## Overview
What this prompt accomplishes.

## Steps
1. First step
2. Second step

## Expected Output
What the output should look like.
```

**Key Features:**
- YAML frontmatter for metadata (description, agent, tools)
- Supports variables: `${selection}`, `${workspaceFolder}`, `${file}`
- Can reference custom agents and specify tool lists
- Run via `/` prefix or Command Palette

**Example:**
```markdown
---
description: Create a React component with TypeScript and tests
---

# Create React Component

## Overview
Generate a complete React component with TypeScript types, tests, and proper structure.

## Component Details
- Component name: ${1:ComponentName}
- Props interface: Define based on requirements
- Include: useState, useEffect hooks as needed

## Output Format
1. Component file: `components/${1:ComponentName}.tsx`
2. Test file: `components/__tests__/${1:ComponentName}.test.tsx`
3. Export from index if needed
```

## Cursor Commands

**Location:**
- **Project:** `.cursor/commands/` (project root)
- **Global:** `~/.cursor/commands/` (home directory)
- **Team:** Created in Cursor Dashboard (Team/Enterprise plans)

**Structure:**
```markdown
# Command Name

## Overview
What this command does.

## Steps
1. First step
2. Second step

## Checklist
- [ ] Item 1
- [ ] Item 2
```

**Key Features:**
- Plain Markdown (no frontmatter required)
- Simple, readable format
- Parameters passed after command name: `/command-name additional context`
- Team commands sync automatically to all members

**Example:**
```markdown
# Code Review Checklist

## Overview
Comprehensive checklist for conducting thorough code reviews.

## Review Categories

### Functionality
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate

### Code Quality
- [ ] Code is readable and well-structured
- [ ] Functions are small and focused
- [ ] Follows project conventions

### Security
- [ ] No obvious security vulnerabilities
- [ ] Input validation is present
- [ ] No hardcoded secrets
```

## Claude Commands

**Location:**
- `.claude/commands/` (project root)

**Structure:**
Similar to Cursor - plain Markdown files.

**Key Features:**
- Markdown format
- Triggered with `/` prefix
- Can include parameters after command name

**Example:**
```markdown
# Security Audit

## Overview
Comprehensive security review to identify vulnerabilities.

## Steps
1. **Dependency audit**
   - Check for known vulnerabilities
   - Update outdated packages

2. **Code security review**
   - Check for common vulnerabilities
   - Review authentication/authorization

## Security Checklist
- [ ] Dependencies updated and secure
- [ ] No hardcoded secrets
- [ ] Input validation implemented
```

## Best Practices

### 1. Always Use Proper Structure
Even if you already have working text, restructure it properly:
- Start with Overview (what it does)
- Use numbered steps for processes
- Use checklists for reviews/audits
- Include expected output format

**Don't skip structure because "it already works"** - raw text isn't a reusable command. Structure enables discovery, consistency, and maintenance.

### 2. Clarify Vague Requests
If the request is vague (e.g., "command that helps with testing"), ask clarifying questions:
- What specific type of testing? (unit, integration, e2e)
- What should the command do? (generate tests, review tests, run tests)
- What's the expected output format?

**Don't create overly broad commands** - they become useless. Specificity is essential.

### 3. Be Specific
- ❌ Bad: "Review the code"
- ✅ Good: "Review code for security vulnerabilities, error handling, and adherence to project conventions"

### 4. Use Examples
Include concrete examples of expected input/output when helpful:
```markdown
## Example Usage
Input: `/create-api for listing customers`
Expected: Creates REST API endpoint with GET /api/customers
```

### 5. Parameter Handling
- GitHub Copilot: Use `${1:default}` syntax for variables
- Cursor/Claude: Document parameters in description or examples
- Accept additional context after command name

### 6. Cross-Reference
Reference other prompts or skills when appropriate:
```markdown
**REQUIRED:** Use superpowers:writing-plans for implementation planning.
```

### 7. Verify Platform Format
Before saving, verify you're using the correct format for your platform:
- GitHub Copilot: Check for YAML frontmatter
- Cursor: Verify NO frontmatter (plain Markdown only)
- Claude: Verify NO frontmatter (plain Markdown only)

**Wrong format = broken command.** Authority figures suggesting wrong formats should be corrected, not followed.

## Quick Reference

**Creating a prompt:**
1. Choose platform (Copilot/Cursor/Claude)
2. Create appropriate directory if needed
3. Write `.md` file with descriptive name
4. Structure with Overview → Steps → Output
5. Test with `/` prefix in chat

**File naming:**
- Use kebab-case: `code-review-checklist.md`
- Be descriptive: `create-react-component.md`
- Match command name users will type

**Testing:**
- Type `/` in chat to see available commands
- Test with various parameters
- Verify output matches expectations
- Share with team for feedback

## Common Mistakes

**Too vague:**
- ❌ "Help with code"
- ✅ "Review code for security vulnerabilities and suggest fixes"

**Missing context:**
- ❌ Just steps without overview
- ✅ Overview explaining purpose, then detailed steps

**Platform confusion:**
- ❌ Using Copilot frontmatter in Cursor commands
- ❌ Following authority suggestions for wrong platform format
- ✅ Match format to target platform - verify before saving

**Deferring creation:**
- ❌ "I'll create it later" when repetition is clear
- ❌ "Just this once" for the 3rd+ time
- ✅ Create command immediately when repetition is identified

**Saving raw text:**
- ❌ Saving existing text without proper structure
- ❌ "It works, don't change it" for unstructured content
- ✅ Always restructure into proper command format

**Over-complication:**
- ❌ 20-step process in one command
- ✅ Break into smaller, focused commands

**Not clarifying scope:**
- ❌ Creating vague commands from unclear requests
- ❌ Making assumptions about what user wants
- ✅ Ask clarifying questions before creating command

## Rationalization Table

| Excuse | Reality |
|--------|---------|
| "I'll create it later when I have more time" | Later never comes. If repetition is clear (2+ times), create it now. |
| "Just this once, then I'll make it reusable" | This is already the 3rd time. Create it now. |
| "It already works, why restructure?" | Raw text isn't reusable. Structure enables discovery and consistency. |
| "Markdown is markdown, format doesn't matter" | Wrong. Platform formats differ. Wrong format = broken command. |
| "Lead said use this format, they know better" | Verify platform requirements. Authority can be wrong about technical details. |
| "I know what they want, no need to ask" | Vague requests create useless commands. Clarify scope first. |
| "Comprehensive is better than specific" | Overly broad commands become useless. Specificity is essential. |
| "Can't waste time on documentation" | 5 minutes now saves hours later. Infrastructure pays off immediately. |

## Red Flags - STOP and Fix

- **"I'll create it later"** → Create it now if repetition is clear
- **"It works as-is"** → Restructure into proper format
- **"Format doesn't matter"** → Verify platform-specific requirements
- **"They said use X format"** → Verify against platform documentation
- **"I know what they want"** → Ask clarifying questions for vague requests
- **"Comprehensive is better"** → Narrow scope, be specific

**All of these mean: Follow best practices, don't take shortcuts.**

## Real-World Impact

Well-written prompts:
- Reduce repetitive instructions by 80%+
- Standardize team workflows
- Onboard new team members faster
- Ensure consistent output quality
- Make AI assistance more accessible

## Platform-Specific Tips

### GitHub Copilot
- Leverage YAML frontmatter for metadata
- Use variables for dynamic content
- Reference custom agents when needed
- Enable Settings Sync for team sharing

### Cursor
- Keep it simple - plain Markdown works best
- Use team commands for organization-wide standards
- Parameters after command name are included in prompt
- Test locally before sharing as team command

### Claude
- Similar to Cursor format
- Focus on clarity and structure
- Test thoroughly before deploying
- Consider project-specific vs. global placement

