---
name: simplification-cascades
description: Find one insight that eliminates multiple components - "if this is true, we don't need X, Y, or Z". Use when you see the same concept implemented multiple ways, a growing list of special cases, complexity spiraling with each new requirement, or code that keeps needing "one more" conditional branch. Also use when refactoring feels like whack-a-mole, when a config file keeps growing, or when you suspect a unifying abstraction exists but can't see it yet.
metadata:
  when_to_use: when implementing the same concept multiple ways, accumulating special cases, complexity is spiraling, or refactoring one thing keeps breaking others
  version: 2.0.0
---

# Simplification Cascades

## What This Is

A simplification cascade is a discovery: one unifying insight collapses multiple separate mechanisms, special cases, or components into one. The cascade effect matters — removing one concept makes others unnecessary, which reveals more to remove. The result is systems that are simultaneously smaller *and* more powerful.

**Core test:** After the cascade, is there less total code — not just reorganized code?

## How the Best Cascades in History Worked

These aren't just examples. They're the template:

- **Unix "everything is a file"**: Devices, pipes, sockets, processes — one `open/read/write/close` interface replaced dozens of specialized APIs
- **Lisp "code = data"**: Programs and data share the same representation (S-expressions), making macros natural, reducing the language to ~7 primitives, eliminating a syntax/semantics split
- **Monads**: What had been separate mechanisms — I/O, error handling, state, async, logging, parsing — became instances of one abstraction
- **REST**: Resources + uniform interface (GET/POST/PUT/DELETE) replaced the proliferation of SOAP, CORBA, and custom RPC styles
- **Lambda calculus**: Two operations (abstraction + application) encode all of computation

The pattern: someone asked "what if all of these are actually the same thing?" — and the answer was yes.

## Quick Diagnostic

| Symptom | What to suspect |
|---------|----------------|
| Same thing implemented 5+ ways | Abstract the common pattern |
| `if type == A / B / C / D` everywhere | Find the general case |
| Complex rules with growing exceptions | Find the rule with no exceptions |
| Excessive config options | Find defaults that cover 95% |
| Refactoring feels like whack-a-mole | Missing a unifying concept |
| "Don't touch that, it's complicated" | Complexity hiding an absent abstraction |
| "We need one more case..." (repeating) | You haven't found the general case |
| New requirements always need a new handler | Each requirement exposes missing abstraction |

## The Discovery Process

Cascades are found bottom-up, not designed top-down. You cannot force one.

1. **Accumulate instances** — Don't abstract at 1 or 2 cases; wait for 3. (Fowler's Rule of Three: one is a fact, two is coincidence, three is a pattern.)
2. **List the variations** — What's actually being implemented multiple ways?
3. **Ask the unifying question** — "What if these are all instances of the same thing?"
4. **Find the essence** — What's the same underneath all of them? What's incidental vs. fundamental?
5. **Extract the abstraction** — What's the domain-independent pattern?
6. **Test it** — Do all cases fit cleanly, without special-casing?
7. **Measure the cascade** — Count: how many things become deletable?

The discovery usually happens at step 3. Steps 4-7 are execution and validation.

## The Net Deletion Test

A real cascade reduces total code. If implementation requires significant new infrastructure, that may be a worthwhile trade — but it's not a cascade. Complexity moved is not complexity removed.

Ask: "Did we delete more than we wrote?"

## False Cascades: When Not to Simplify

Not every unification is a simplification. The AHA principle (Avoid Hasty Abstractions) captures the failure mode: the wrong abstraction is worse than duplication.

**Warning signs of a false cascade:**

| Signal | What it means |
|--------|--------------|
| Callers need to know what's underneath to use it correctly | The abstraction leaks — you found the wrong level |
| Special cases accumulate *around* the new abstraction | You haven't found the general case yet |
| Net lines of code went *up* | This is a trade, not a cascade |
| The abstraction is harder to explain than the concrete cases | Complexity moved, not removed |
| Instances must be bent or coerced to fit | The abstraction precedes the pattern |

**Joel Spolsky's addendum**: Even correct simplification cascades don't eliminate underlying complexity — they hide it most of the time. When the abstraction leaks (and eventually it will), you need to understand the layers. The cascade reduces cognitive load day-to-day; it doesn't eliminate the need to understand the substrate in edge cases.

## Productive Tension: DRY vs. AHA

These two principles aren't contradictions — they describe different moments in the same process:

- **DRY / Rule of Three**: Once three instances exist, unify them
- **AHA / YAGNI**: Don't abstract speculatively; prefer duplication over the wrong abstraction

**The resolution**: Duplicate until the right abstraction reveals itself. Then unify. The cascade is the moment when the right abstraction becomes visible. Before that moment, the discipline is *waiting*.

## Examples

### Cascade 1: Stream Abstraction
**Before:** Separate handlers for batch, real-time, file, and network data  
**Insight:** "All inputs are streams — just different sources"  
**After:** One stream processor, multiple stream adapters  
**Deleted:** 4 separate implementations, 4 sets of tests, 4 maintenance burdens

### Cascade 2: Resource Governance
**Before:** Session tracking, rate limiting, file validation, connection pooling — all separate systems  
**Insight:** "All are per-entity resource limits"  
**After:** One `ResourceGovernor` with 4 resource types  
**Deleted:** 4 custom enforcement systems and their interaction bugs

### Cascade 3: Immutability
**Before:** Defensive copying, locking, cache invalidation, temporal coupling — handled everywhere  
**Insight:** "Treat everything as immutable data + transformations"  
**After:** Functional patterns; state change = new value  
**Deleted:** Entire classes of synchronization problems

## Remember

- Cascades are discovered, not designed — accumulate instances first
- The test is net deletion: less total code, not just reorganized code
- Complexity moved ≠ complexity removed
- One powerful abstraction > ten clever hacks
- The right unification usually feels obvious in retrospect
