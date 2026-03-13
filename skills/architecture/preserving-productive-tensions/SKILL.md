---
name: preserving-productive-tensions
description: Recognizes when tensions between valid approaches are features rather than bugs, and preserves multiple valid approaches instead of forcing premature consensus. Invoke when oscillating between two approaches across messages, when stakeholders have conflicting but equally valid concerns, when someone says "just pick one" without a clear reason, when implementation approaches optimize for different legitimate priorities, or when forcing a choice would destroy flexibility that different contexts legitimately need. Helps agents avoid arbitrarily resolving disagreements just to "move forward" — premature consensus destroys context-dependent flexibility.
metadata:
  version: 1.2.0
---

# Preserving Productive Tensions

## Overview

Some tensions aren't problems to solve — they're valuable information to preserve. When multiple approaches are genuinely valid in different contexts, forcing a choice destroys flexibility that different deployments or users need.

**Core principle:** Preserve tensions that reveal context-dependence. Force resolution only when necessary.

## Recognizing Productive Tensions

**A tension is productive when:**
- Both approaches optimize for different valid priorities (cost vs latency, simplicity vs features)
- The "better" choice depends on deployment context, not technical superiority
- Different users/deployments would legitimately choose differently
- The trade-off is real and won't disappear with clever engineering
- Stakeholders have conflicting but equally valid concerns

**A tension needs resolution when:**
- Implementation cost of preserving both is prohibitive
- The approaches fundamentally conflict (can't coexist)
- There's clear technical superiority for this specific use case
- It's a one-way door (choice locks architecture)
- Preserving both adds complexity without value

## Symptom Check — Are You Forcing Resolution?

Watch for these in your own reasoning:

- "We need to pick one" — without stating why both can't be preserved
- "I'll just go with X" — choosing based on your preference, not user/deployment context
- Oscillating between A and B on consecutive messages — you're sensing a real tension, not making a mistake
- Resolving a disagreement to "move forward" — consensus for consensus's sake destroys information
- "Which is best?" — when the real answer is "it depends on your context"

**All of these are STOP signals. Consider preserving the tension instead.**

## Preservation Patterns

### Pattern 1: Configuration
Make the choice configurable rather than baked in:

```python
class Config:
    mode: Literal["optimize_cost", "optimize_latency"]
    # Each mode gets a clean, simple implementation
```

**When to use:** Both approaches are architecturally compatible; switching is a runtime decision.

### Pattern 2: Parallel Implementations
Maintain both as separate, clean modules with a shared contract:

```python
# processor/batch.py    — optimizes for cost
# processor/stream.py   — optimizes for latency
# Both implement: def process(data) -> Result
```

**When to use:** Approaches diverge significantly but share the same interface.

### Pattern 3: Documented Trade-off
Capture the tension explicitly in documentation or an ADR:

```markdown
## Unresolved Tension: Authentication Strategy

**Option A: JWT** — Stateless, scales easily, but token revocation is hard
**Option B: Sessions** — Easy revocation, but requires shared state

**Why unresolved:** Different deployments need different trade-offs
**Decision deferred to:** Deployment configuration
**Review trigger:** If 80% of deployments choose one option
```

**When to use:** Can't preserve both in code, but want to document the choice was deliberate and reversible.

## When to Force Resolution

Force resolution when one of these is true:

1. **Implementation cost is prohibitive** — building and maintaining both would meaningfully slow development or the team lacks bandwidth
2. **Fundamental conflict** — approaches make contradictory architectural assumptions and can't cleanly coexist
3. **Clear technical superiority** — one approach objectively solves the constraints; not "I prefer X" but "X meets our requirements, Y doesn't"
4. **One-way door** — the choice locks architecture; migrating between options would be expensive
5. **Simplicity requires choice** — preserving both genuinely adds complexity and YAGNI applies

When forcing resolution, state which of the above applies. "We need to pick one" is not a reason — it's a symptom of wanting to avoid the tension.

**Ask explicitly:** "Should I pick one, or preserve both as options for different contexts?"

## Documentation Format

When preserving a tension, document it clearly:

```markdown
## Tension: [Name]

**Context:** [Why this tension exists]

**Option A:** [Approach]
- Optimizes for: [Priority]
- Trade-off: [Cost]
- Best when: [Context]

**Option B:** [Approach]
- Optimizes for: [Different priority]
- Trade-off: [Different cost]
- Best when: [Different context]

**Preservation strategy:** [Configuration / Parallel / Documented]

**Resolution trigger:** [Conditions that would justify forcing a choice]
```

## Examples

### Preserve — Context-dependent trade-off
"Should we optimize for cost or latency in the inference pipeline?"
- **Preserve:** Make it configurable — interactive use cases need latency, batch jobs need cost. Different deployments will choose differently.

### Resolve — Technical constraint settles it
"Should we use SSE or WebSockets for real-time updates?"
- **Resolve:** SSE — we only need server-to-client communication; WebSockets adds bidirectional complexity without value for this use case.

### Defer — Business decision, not technical
"Should we support offline mode?"
- **Defer to stakeholder:** Don't preserve both in code speculatively — ask who the users are and whether offline is part of the product promise.

### Preserve — Stakeholder disagreement reveals context
A stakeholder wants strict input validation upfront; another wants lenient parsing that handles messy real-world data.
- **Preserve:** Both are valid for different integration contexts. Offer a `strict` vs `lenient` mode rather than overruling either.

## Core Reminders

- Oscillating between A and B is often a signal that both are right — for different contexts
- Premature consensus destroys the flexibility that reveals context-dependence
- Configuration beats forced choice (when the implementation overhead is low)
- Document trade-offs so future engineers can revisit with better information
- Forcing resolution is always valid — but state the reason explicitly
