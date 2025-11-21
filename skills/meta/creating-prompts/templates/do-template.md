---
number: {NUMBER}
topic: {TOPIC}
purpose: do
dependencies: []
created: {DATE}
---

# {TOPIC} - Do

<objective>
{What to build/create/fix}

Purpose: {Why this matters, what it enables}
Output: {What artifact(s) will be produced}
</objective>

<context>
{Referenced files if chained}
@.agents/prompts/{folder}/{file}.md

{Project context}
@relevant-files
</context>

<requirements>
{Specific functional requirements}
{Quality requirements}
{Constraints and boundaries}
</requirements>

<implementation>
{Specific approaches or patterns to follow}
{What to avoid and WHY}
{Integration points}
</implementation>

<output>
Create/modify files:
- `./path/to/file.ext` - {description}

{For complex outputs, specify structure}
</output>

<verification>
Before declaring complete:
- {Specific test or check}
- {How to confirm it works}
- {Edge cases to verify}
</verification>

<summary_requirements>
Create `SUMMARY.md` in same directory with:
- One-liner: Substantive description of outcome
- Key Findings: Actionable takeaways
- Decisions Needed: What requires user input
- Blockers: External impediments or "None"
- Next Step: Concrete forward action
</summary_requirements>
