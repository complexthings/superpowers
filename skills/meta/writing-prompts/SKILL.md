---
name: writing-prompts
description: Use when creating a reusable AI command, slash command, prompt file, or skill for Claude Code, GitHub Copilot, or Cursor, when you catch yourself repeating the same instructions 2+ times, or when a prompt keeps producing unreliable results. Guides prompt-engineering craft — leading with the goal, defining verifiable success criteria, keeping the prompt minimal — plus current platform formats (all three platforms now converge on SKILL.md). Use even when the user just says "make this reusable," "save this as a command," or "why does this prompt keep failing."
---

# Writing Prompts

A reusable command is a prompt you've decided to keep. Its quality is the quality of the prompt inside it — so most of this skill is about writing a prompt that works, and a smaller part is about where each platform wants the file to live.

**Core principle:** A good prompt reads like a brief to a sharp new colleague who lacks your context. State the goal, give the context they're missing, and define how they'll know they're done. If a teammate would be confused by it, the model will be too.

## When to turn a prompt into a command

Create a reusable command when you've run the same instructions 2+ times, when you want a workflow to be consistent across a team, or when a multi-step process keeps drifting. The second time you paste the same prompt is the signal — capture it then, while you still remember the edge cases, rather than "later."

Skip it for genuine one-offs and for trivial queries that don't benefit from a saved template. A command that's too broad ("help with testing") is worse than none — it can't give the model enough to act on.

## How to write the prompt

This is the part that determines whether the command is worth keeping. The ordering below roughly tracks impact.

### 1. Lead with the goal

Open with one sentence stating what success looks like. The model orients everything else around it. "Generate a React component with typed props and a passing test" beats a prompt that buries the objective under setup.

### 2. Give the context the model is missing

The model is capable but has no memory of your situation. Supply the specifics it can't infer — file paths, the framework in use, conventions, constraints — and say *why* when the reason isn't obvious. Explaining motivation ("we exclude test accounts because they skew the metrics") lets the model generalize to cases your instructions didn't anticipate, instead of following a rule blindly.

Reason from facts you actually have. Don't invent paths, ticket IDs, or constraints to fill a gap — name the gap instead.

When the command will run repeatedly, wire in the inputs it needs rather than expecting them pasted each time — have it read the file, run the diff, or fetch the data itself (platforms.md covers the per-platform syntax for this). A command that gathers its own context is the difference between a saved note and a tool.

### 3. Define verifiable success criteria

This is the highest-leverage habit. Translate vague asks into outcomes the model can check itself:

- "Add validation" → "Write tests for the invalid inputs, then make them pass"
- "Fix the bug" → "Write a failing test that reproduces it, then make it pass"
- "Refactor X" → "Tests pass before and after; behavior unchanged"

For multi-step work, attach a check to each step and state an explicit stop condition, so the command can loop on its own instead of pausing for clarification:

```
1. <step> → verify: <check>
2. <step> → verify: <check>
```

Weak criteria ("make it work") force the model to come back and ask. Strong, checkable criteria let it run to completion. Default to strong.

### 4. Keep it minimal

Write the shortest prompt that gets the job done. Every extra instruction competes for attention and invites the model to overbuild. Cut speculative sections, preemptive caveats for failures that can't happen, and "flexibility" nobody asked for. If a draft is 30 lines and could be 10, rewrite it. The senior-engineer test: "Is this overcomplicated?" If yes, cut.

Trust the model with what it already knows. You don't need to explain what a PDF is or how a for-loop works — only what's specific to your task.

### 5. Show an example when format matters

When output shape, tone, or structure matters, one or two concrete input→output examples steer the result more reliably than describing it in prose. Make examples relevant and varied; if you wrap them in clear delimiters the model won't mistake them for instructions to follow literally.

### 6. Structure for the model to parse

- Put long reference material (documents, data, logs) near the **top**, and the actual instruction or question near the **bottom**. Trailing instructions measurably improve responses on long inputs.
- Separate distinct kinds of content with delimiters or tags (e.g. `<context>`, `<task>`, `<example>`) so the model can tell the brief from the data. Use the same tag names consistently.
- Reach for explicit sections (context / task / constraints / success criteria) only when the prompt is big enough to need them. On a short prompt, sections are padding — prose is fine.

### 7. Write direct, positive instructions

Tell the model what to do, not what to avoid: "Respond in flowing prose paragraphs" works better than "Don't use bullet points." Be explicit about scope, because current models read prompts literally and won't widen scope on their own — "apply this to every section, not just the first" leaves nothing to guess.

Resist the urge to shout. Modern models over-react to `CRITICAL:` / `YOU MUST` / `NEVER` and aggressive capitals — it makes them rigid and anxious, not more careful. "Use this tool when handling PDFs" lands better than "CRITICAL: You MUST ALWAYS use this tool." Save emphasis for the rare instruction that genuinely overrides a strong default, and explain *why* it matters rather than how loudly.

### 8. Keep edits surgical

When refining an existing prompt, change only what isn't working. Don't reword lines that already do their job or reorder sections for the sake of it. Match the author's voice — if they'd phrase something differently than you would, theirs wins. Every change should trace to a concrete gain in clarity, completeness, or executability; if it doesn't, revert it.

## Worked example

A raw, repeated instruction:

> "make me a command that reviews code for security stuff"

Refined into a prompt worth saving:

```markdown
Review the staged diff for security vulnerabilities.

Focus on the OWASP categories most relevant to this stack: injection,
broken access control, secrets in code, and unsafe deserialization.

For each finding, report: file:line, the risk, and a concrete fix.
End with a one-line verdict: SAFE TO MERGE or CHANGES REQUESTED.

If there are no findings, say so explicitly — don't invent issues to seem thorough.
```

What changed: a single clear goal, the missing context (which risks to weight), an explicit output shape, and a stop condition that prevents the model from padding the report. No CAPS, no nagging — just a brief a colleague could act on.

## Platform formats

The three major platforms have converged: **a reusable command is increasingly just a `SKILL.md` file.** Claude Code merged custom commands into skills; Cursor (2.4+) promotes Skills as the successor to commands; GitHub Copilot uses prompt files alongside `AGENTS.md`. Older formats still work, but new work should prefer skills where the platform supports them.

Pick the file location and frontmatter for your target platform from **[references/platforms.md](references/platforms.md)** — it has the exact directories, extensions, frontmatter fields, and argument syntax for Claude Code, GitHub Copilot, and Cursor, with the legacy formats noted. Read it when you're ready to save the file; using the wrong directory or argument token is the one mistake the model can't reason its way out of after the fact.

## Before you ship it

Read the draft once more as if you didn't write it, through three quick lenses:

- **What's sloppy?** Redundant lines, assumptions stated as fact, speculative sections.
- **What's missing?** Anything that would make it fail on the first run — an undefined success criterion, missing context, an ambiguous scope.
- **What am I hiding behind structure?** Headings and ceremony that dress up a thin prompt. Cut to the prompt that actually does the work.

Then confirm the goal is in the first sentence, success is checkable, and the file is in the right place for its platform.

## Common pitfalls

- **Vague scope** — "review the code" gives the model nothing to optimize. Name what to look for and what "done" means.
- **No success criterion** — without a checkable outcome the command can't finish on its own; it stalls and asks.
- **Over-prompting** — CAPS, `MUST`, and stacked caveats make models rigid. Explain why instead of shouting.
- **Padding** — speculative sections and impossible-failure handling. Ship the minimum that works.
- **Wrong platform format** — frontmatter or argument tokens from the wrong tool silently break the command. Verify against references/platforms.md.
- **Deferring** — "I'll make it reusable later" after the 2nd repeat. Capture it now, while the edge cases are fresh.
