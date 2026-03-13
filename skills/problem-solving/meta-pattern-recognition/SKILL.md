---
name: meta-pattern-recognition
description: Spot patterns appearing in 3+ domains to find universal principles. Use when you notice the same problem recurring across different contexts, when teams independently discover "identical" solutions, when experiencing déjà vu in problem-solving, or when you want to actively extract transferable principles. Triggers on phrases like "this feels familiar," "haven't we solved this before?", "same thing keeps happening," or "why do all these systems look the same?"
metadata:
  version: 1.2.0
---

# Meta-Pattern Recognition

## Overview

When the same shape appears in 3+ genuinely different domains, you've found something universal. Name it, and you unlock it everywhere.

**Core principle:** Find patterns in how patterns emerge — then apply them where nobody has looked yet.

Two modes: **passive** (recognize a pattern already recurring) and **active** (force patterns to surface through deliberate techniques).

## Quick Reference

| Pattern | Abstract Form | Seen In |
|---------|--------------|---------|
| CPU/DB/HTTP caching | Store frequently-accessed data closer to consumer | LLM prompt caching, CDN, memoization |
| Layering (network/OS/storage) | Separate concerns into abstraction levels | Architecture, org structure, compiler stages |
| Queuing (message/task/request) | Decouple producer from consumer via buffer | Event systems, async I/O, print spoolers |
| Pooling (connection/thread/object) | Reuse expensive resources rather than recreate | Memory allocators, worker pools, license servers |
| Rate limiting / circuit breakers | Bound consumption to prevent exhaustion | Token budgets, backpressure, admission control |
| Retry with exponential backoff | Respect the system you depend on | HTTP clients, DB reconnect, social negotiation |

## Passive Mode: Recognize a Recurring Pattern

1. **Spot repetition** — Same shape appears in 3+ distinct domains (not just 3 modules in one system)
2. **Extract abstract form** — State the pattern using zero domain-specific vocabulary
3. **Map variation points** — Where does it *have to* vary, and why? (reveals the true structure)
4. **Hunt new applications** — Where does this pattern apply that nobody has tried yet?

**Example:**

Pattern spotted: Rate limiting (APIs), traffic shaping (networks), circuit breakers (microservices), admission control (OSes)

Abstract form: *Bound resource consumption to prevent exhaustion*

Variation points: what resource, what measurement window, what happens when exceeded (reject / queue / degrade)

New application: LLM token budgets — same pattern prevents context-window exhaustion; variant is "soft limit + graceful degradation" rather than hard rejection.

## Active Mode: Force Patterns to Emerge

Use when you want to *generate* insights, not just spot them.

**Collision Zone Thinking** — Force two unrelated concepts together:
> "What if rate limiting applied to human attention, not API calls?"
The collision reveals a third concept neither domain had.

**The Medium Swap** — Apply a solution from one domain directly to another:
> TCP backpressure → LLM token streaming; biological immune memory → anomaly detection

**The Inversion Exercise** — Flip the core assumption:
> "What if caching *slowed* things down?" → reveals cache invalidation cost, stale data risk

**The Scale Game** — Test at 1000x bigger, 1000x smaller, instant, or year-long:
> Patterns that hold at extremes are truly universal; those that break reveal hidden assumptions.

**The 2+2=5 Framework** — Find synergistic combinations:
> Caching + streaming = speculative prefetch (a third concept neither had alone)

## Emergence Types

Watch for these when patterns arise unexpectedly:

- **Divergence** — Two concepts collide → third option neither implied ("creates" + "removes" = "transforms")
- **Tension** — Sustained contradiction generates insight rather than resolving (consistency vs. availability → eventually-consistent as a new idea, not a compromise)
- **Cascade** — One pattern recognition triggers a chain ("buffer" = RAM, Git staging, async queues, human short-term memory — all one pattern)
- **Void** — What's *not* connected reveals what's missing ("Why is there no pattern here?" often signals unsolved problems)
- **Meta** — Patterns in how patterns form ("Why do resource-management patterns always have the same 3 variation points?")

## Quality Check

Before claiming you've found a universal pattern:

- [ ] Does it appear in 3+ **genuinely different domains**? (not 3 places in one codebase)
- [ ] Can you state it with **zero domain-specific vocabulary**?
- [ ] Have you identified at least **2 variation points** explaining why it looks different per domain?
- [ ] Does applying it somewhere **new produce a useful result**?
- [ ] Can you name **what it replaces** — what separate mental models collapse into one?

## Simplification Cascades

The best meta-patterns eliminate complexity. When you find a universal principle, ask: **"If this is true, what do we no longer need?"**

> If all resource limits are "bound consumption to prevent exhaustion" → rate limiting, circuit breakers, and admission control no longer need separate mental models.

A good cascade eliminates 3+ previously separate concepts.

## Productive Tensions

Don't resolve contradictions too quickly — they generate patterns.

When two things seem to conflict, ask: What third concept does this tension reveal? Does this tension appear in other domains?

**Preserve failed pattern-matches.** They reveal where the abstraction breaks and what the true variation points are.

## Red Flags You're Missing Meta-Patterns

- "This problem is unique" — probably not; look harder
- Multiple teams solving "different" problems with identical solutions
- Reinventing wheels across domains without cross-pollination
- "Haven't we done something like this before?"
- Resolving contradictions too fast (destroying a pattern generator)
- Discarding failed pattern-attempts (they contain the variation data)

## Remember

- 3+ domains = likely universal; 5+ = probably foundational
- Abstract form (no jargon) reveals new applications — the vocabulary you choose shapes what you find next
- Variation points explain *why* it looks different, not just *how*
- Productive tensions and failures are data, not dead ends
