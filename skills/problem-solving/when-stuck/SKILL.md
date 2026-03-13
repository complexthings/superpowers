---
name: when-stuck
description: Dispatch to the right problem-solving technique based on how you're stuck. Use this skill whenever you hit a wall — code behaving wrong, complexity spiraling, can't find a good approach, assumptions feel forced, unclear how it will scale, or you need to pick the right debugging technique before diving in. Use it proactively before major architecture decisions or when a solution feels like it's fighting you.
metadata:
  version: "2.0.0"
---

# When Stuck — Problem-Solving Dispatch

## Core Principle

Different stuck-types need different techniques. Picking the wrong technique wastes time. This skill helps you identify the right one in under a minute.

**Match symptom → technique, then load and follow that skill.**

## Stuck-Type → Technique

| How You're Stuck | Technique to Use |
|------------------|-----------------|
| **Complexity spiraling** — Same thing implemented 5+ ways, growing special cases, each fix reveals a new problem | `simplification-cascades` |
| **Need innovation** — Conventional solutions feel inadequate, stuck inside one way of thinking, need breakthrough | `collision-zone-thinking` |
| **Recurring patterns** — Same issue across different domains, reinventing wheels, déjà vu in problem-solving | `meta-pattern-recognition` |
| **Forced by assumptions** — "Must be done this way," solution fights the system, can't question the premise | `inversion-exercise` |
| **Scale uncertainty** — Unsure it'll hold at production, edge cases unclear, architecture decisions without load data | `scale-game` |
| **Code broken** — Wrong behavior, test failing, unexpected output, bug with unknown root cause | `systematic-debugging` |
| **Symptom clear, cause hidden** — Error is deep in the call chain, fix locations but not the origin | `root-cause-tracing` |
| **Multiple independent problems** — Separate failing tests, parallel research questions, independent subsystems | `dispatching-parallel-agents` |
| **Starting fresh, scope unclear** — New feature, unclear requirements, don't know what to build | `brainstorming` |
| **Have a plan, need execution** — Know what to build, complex multi-step implementation ahead | `writing-plans` |

## How to Identify Your Stuck-Type

If the symptom isn't obvious, ask these questions:

1. **Is something broken?** → `systematic-debugging` (always start here for bugs)
2. **Is there too much code doing similar things?** → `simplification-cascades`
3. **Does the solution feel forced or fight the codebase?** → `inversion-exercise`
4. **Does nothing in this domain work?** → `collision-zone-thinking` (leave the domain)
5. **Have I seen this shape before in other contexts?** → `meta-pattern-recognition`
6. **Do I not know if it'll hold under load?** → `scale-game`
7. **Is the problem actually several independent things?** → `dispatching-parallel-agents`

## Proactive Use (Not Just When Stuck)

Some techniques should be used *before* you're stuck:

- **Before major architecture decisions** → `inversion-exercise` (pre-mortem: "how would this fail?")
- **Before implementing a complex feature** → `brainstorming` then `writing-plans`
- **Before committing to a design at scale** → `scale-game`
- **When a config file or handler list keeps growing** → `simplification-cascades`

## Combining Techniques

Some problems need more than one:

| Combination | When to Use |
|-------------|-------------|
| `systematic-debugging` → `root-cause-tracing` | Bug found, but fix location is far from origin |
| `simplification-cascades` + `meta-pattern-recognition` | Find the recurring pattern, then collapse all instances |
| `collision-zone-thinking` + `inversion-exercise` | Force a new metaphor, then stress-test its assumptions |
| `scale-game` + `simplification-cascades` | Extremes reveal what to eliminate |
| `inversion-exercise` + `scale-game` | "How does this fail?" × "At what scale?" |

## If Still Stuck After First Technique

1. Try a different technique from the table — wrong diagnosis is common
2. Combine two techniques (see above)
3. If 3+ fixes have failed for a bug → this is an architectural problem, not a debugging problem. Use `inversion-exercise` to question the design.
4. Step back: is the problem statement itself wrong? → `brainstorming`
