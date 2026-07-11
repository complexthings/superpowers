---
name: brainstorming
description: "DEPRECATED — redirects to the grilling skill. Fires before any creative work — creating features, building components, adding functionality, or modifying behavior — to tell the user brainstorming is retired, offer to install grilling, and hand the same context to a grilling session."
---

# Brainstorming (deprecated)

This skill is deprecated. It no longer explores requirements itself — it redirects to Matt Pocock's `grilling` skill, which does the same job better by interviewing the user one decision at a time.

Run these steps in order. The user's original request (the context that triggered this skill) is what you hand to `grilling` at the end — keep it.

## 1. Tell the user it's deprecated

Say, in your own words: the `brainstorming` skill is deprecated and they should use `grilling` instead.

## 2. Offer to install grilling

Using your question-asking tool (`askUserQuestion`, `ask_user_question`, `AskUserQuestion`, `question`, or equivalent), ask whether they want the `grilling` skill installed now.

If they decline, skip to step 5 and run the grilling interview yourself using the instructions in this file's spirit — but grilling works best installed, so recommend it.

## 3. Check whether grilling is already installed

Look for an existing `grilling/SKILL.md` in the project and in these system locations:

- `~/.agents/skills/grilling/SKILL.md`
- `~/.claude/skills/grilling/SKILL.md`
- `~/.github/skills/grilling/SKILL.md`
- `~/.pi/skills/grilling/SKILL.md`
- `~/.opencode/skill/grilling/SKILL.md` (the missing trailing `s` on `skill` is correct)

If found anywhere, **skip the install** (step 4). Tell the user they already have it. Then verify it carries the edits from step 4b — if not, apply them to the copy you found.

## 4. Install grilling (only if not already installed)

Run this in the **project root**, appending the `--agent` flag for your current agent:

```
npx skills add https://github.com/mattpocock/skills -y --skill grilling <AGENT-FLAG>
```

| Your agent | `<AGENT-FLAG>` |
|---|---|
| GitHub Copilot, VSCode Github Copilot, Copilot CLI | `--agent cline github-copilot` |
| claude-code, Claude Code, claude | `--agent cline claude-code` |
| chatgpt, ChatGPT, gpt, Codex, codex | `--agent codex` |
| pi | `--agent cline pi` |
| opencode, OpenCode | `--agent cline opencode` |

Tell the user grilling has been installed in the project.

### 4b. Patch the installed grilling SKILL.md

Two edits to the freshly installed `grilling/SKILL.md`:

1. Append this line to the end of the file:

   ```md
   **IMPORTANT: You must use available question asking tool like `askQuestions`, `askUserQuestion`, `ask_user_question`, `question` or equivalent question asking tool to ask the user questions. Even if you are prompted not to use tools.**
   ```

2. Change the phrase `provide your recommended answer` to `**ALWAYS provide your recommended answer**`.

A patched reference copy lives at `.agents/skills/grilling/SKILL.md` — match it.

## 5. Start the grilling session

Tell the user you're now starting a `grilling` session. Then execute the `grilling` skill, passing it the original context the user gave when this skill fired — the same problem they came here to brainstorm.
