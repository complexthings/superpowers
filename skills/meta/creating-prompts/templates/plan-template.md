---
number: {NUMBER}
topic: {TOPIC}
purpose: plan
dependencies: []
created: {DATE}
---

# {TOPIC} - Plan

<objective>
{What to plan + success criteria}
</objective>

<context>
{Referenced research outputs}
@.agents/prompts/{folder}/{file}-output.md

{Current state}
{Constraints}
</context>

<requirements>
{What plan must address}
{Decision points to resolve}
{Tradeoffs to evaluate}
</requirements>

<output_structure>
Create plan with:

## Phases
- Phase 1: {Name} - {Clear boundary/deliverable}
- Phase 2: {Name} - {Clear boundary/deliverable}

## Dependencies
- {What Phase 2 needs from Phase 1}
- {External dependencies}

## Decision Points
- {Decision}: Options A, B, C with tradeoffs
- {Decision}: Recommendation with rationale

## Risk Assessment
- {Risk}: {Mitigation strategy}

## Success Metrics
- {How to measure success}
</output_structure>

<summary_requirements>
Create `SUMMARY.md` with:
- One-liner: Key recommendation or approach
- Key Findings: Critical insights from planning
- Decisions Needed: What requires approval/input
- Blockers: What's blocking progress
- Next Step: Concrete action to move forward
</summary_requirements>
