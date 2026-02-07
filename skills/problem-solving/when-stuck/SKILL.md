---
name: when-stuck
description: Dispatch to the right problem-solving technique based on how you're stuck
metadata:
  when_to_use: when stuck and unsure which problem-solving technique to apply for your specific type of stuck-ness
  version: 1.2.0
---

# When Stuck - Problem-Solving Dispatch

## Overview

Different stuck-types need different techniques. This skill helps you quickly identify which problem-solving skill to use.

**Core principle:** Match stuck-symptom to technique.

## Quick Dispatch

```mermaid
flowchart TD
    STUCK((You're Stuck))

    STUCK --> COMPLEXITY["Same thing 5+ ways?<br>Growing special cases?<br>Excessive if/else?"]
    STUCK --> INNOVATION["Can't find fitting approach?<br>Conventional solutions inadequate?<br>Need breakthrough?"]
    STUCK --> PATTERNS["Same issue in different places?<br>Feels familiar across domains?<br>Reinventing wheels?"]
    STUCK --> ASSUMPTIONS["Solution feels forced?<br>'This must be done this way'?<br>Stuck on assumptions?"]
    STUCK --> SCALE["Will this work at production?<br>Edge cases unclear?<br>Unsure of limits?"]
    STUCK --> BUGS["Code behaving wrong?<br>Test failing?<br>Unexpected output?"]

    COMPLEXITY -->|yes| SIMP[skills/problem-solving/<br>simplification-cascades]
    INNOVATION -->|yes| COLL[skills/problem-solving/<br>collision-zone-thinking]
    PATTERNS -->|yes| META[skills/problem-solving/<br>meta-pattern-recognition]
    ASSUMPTIONS -->|yes| INV[skills/problem-solving/<br>inversion-exercise]
    SCALE -->|yes| SCL[skills/problem-solving/<br>scale-game]
    BUGS -->|yes| DBG[skills/debugging/<br>systematic-debugging]
```

## Stuck-Type → Technique

| How You're Stuck | Use This Skill |
|------------------|----------------|
| **Complexity spiraling** - Same thing 5+ ways, growing special cases | skills/problem-solving/simplification-cascades |
| **Need innovation** - Conventional solutions inadequate, can't find fitting approach | skills/problem-solving/collision-zone-thinking |
| **Recurring patterns** - Same issue different places, reinventing wheels | skills/problem-solving/meta-pattern-recognition |
| **Forced by assumptions** - "Must be done this way", can't question premise | skills/problem-solving/inversion-exercise |
| **Scale uncertainty** - Will it work in production? Edge cases unclear? | skills/problem-solving/scale-game |
| **Code broken** - Wrong behavior, test failing, unexpected output | skills/debugging/systematic-debugging |
| **Multiple independent problems** - Can parallelize investigation | skills/collaboration/dispatching-parallel-agents |
| **Root cause unknown** - Symptom clear, cause hidden | skills/debugging/root-cause-tracing |

## Process

1. **Identify stuck-type** - What symptom matches above?
2. **Load that skill** - Read the specific technique
3. **Apply technique** - Follow its process
4. **If still stuck** - Try different technique or combine

## Combining Techniques

Some problems need multiple techniques:

- **Simplification + Meta-pattern**: Find pattern, then simplify all instances
- **Collision + Inversion**: Force metaphor, then invert its assumptions
- **Scale + Simplification**: Extremes reveal what to eliminate

## Remember

- Match symptom to technique
- One technique at a time
- Combine if first doesn't work
- Document what you tried
