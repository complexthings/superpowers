---
name: scale-game
description: Test at extremes (1000x bigger/smaller, instant/year-long) to expose fundamental truths hidden at normal scales. Use this skill whenever someone asks "will this scale?", "what happens at production load?", "what if 1000 users hit this simultaneously?", or when validating architecture, reviewing algorithms, designing systems, or reasoning about capacity. Also use proactively when you see O(n²) algorithms, shared mutable state, synchronous APIs, or in-memory data accumulation — any pattern whose behavior changes with scale.
metadata:
  version: 3.1.0
---

# Scale Game

## Overview

Test your approach at extreme scales to find what breaks and what surprisingly survives.

**Core principle:** Properties invisible at normal scales dominate at extreme scales. An O(n²) algorithm is fine at n=100 and catastrophic at n=1,000,000. Test at extremes to find the fundamentals before production does.

This is a thought experiment technique — most scale tests take seconds, not machines. The goal is insight, not measurement.

## Origins

This technique has deep roots across science and engineering:

- **Galileo (1638):** Dropping two cannonballs from the Leaning Tower — testing at "different weights" exposed that Aristotle's theory (heavier falls faster) was wrong. Extremes falsified conventional wisdom.
- **Einstein (1905):** "What would I see if I chased a light beam at light speed?" — an impossible-to-run experiment that led directly to special relativity. The extreme (v = c) revealed a contradiction in classical physics.
- **Fermi Estimation:** Reasoning by order of magnitude to establish bounds — "how many piano tuners in Chicago?" is the mathematical equivalent of the scale game: work from first principles to a number, then ask if the number makes sense at different scales.
- **Jeff Dean at Google:** "Numbers Everyone Should Know" established a canonical scale reference — L1 cache (0.5 ns) vs. cross-continental round trip (150 ms) is a 300,000,000× difference. Knowing these numbers lets you reason about systems at scale without building them.
- **Netflix Chaos Monkey (2011):** Institutionalized extreme failure testing. If your system can't survive random instance death, it can't survive production.

## Quick Reference

| Scale Dimension | Test At Zero/Minimum | Test At Maximum | What It Reveals |
|-----------------|---------------------|-----------------|-----------------|
| Volume | 0 items, 1 item | 1B items, unbounded | Algorithmic complexity class (O(n²) vs O(n log n)) |
| Concurrency | 1 user, sequential | 1M simultaneous users | Race conditions, lock contention, resource exhaustion |
| Speed / Latency | Instant (in-process) | 150ms cross-continent | Whether synchronous calls become blocking bottlenecks |
| Duration / Time | Milliseconds | Years of continuous runtime | Memory leaks, state accumulation, index bloat |
| Failure Rate | Never fails | Always fails | Error handling coverage, circuit breaker needs |
| Data Size | Empty payload | Terabyte payload | Buffer limits, streaming requirements |
| Cardinality | 1 tenant / 1 type | 100M tenants / 10K types | Partitioning needs, per-entity overhead |
| Depth / Nesting | Flat structure | 1000-level deep tree | Stack overflow, recursive algorithm limits |
| Network | LAN (microseconds) | Satellite link (600ms + packet loss) | Protocol choices, retry logic, idempotency |
| Cost | Free tier | $1M/month | Whether the design is economically viable at scale |
| Team Size | 1 engineer | 1000 engineers | Conway's Law — architecture mirrors team communication |
| Service Composition | 1 service | 150 chained services | Tail latency amplification (see Dynamo case study) |

## Process

1. **Pick dimension** — What could vary extremely? (Volume, concurrency, time, failure rate, data size, cost, team size)
2. **Establish baseline** — What does the system do at normal scale? What is "steady state"?
3. **Test minimum** — What if this was zero, one, or 1000× smaller/faster/fewer?
4. **Test maximum** — What if this was 1000× bigger/slower/more?
5. **Note what breaks** — Where do limits appear? What assumptions fail first?
6. **Note what survives** — What's fundamentally sound regardless of scale?
7. **Classify the failure mode** — Graceful degradation (slows down, sheds load) or catastrophic collapse (crashes, data loss, cascading failure)?

## Examples

### Example 1: Error Handling
**Normal scale:** "Handle errors when they occur" seems fine  
**At 0.001% failure rate × 1B requests/day:** = 1M errors/day. Logging each one crashes the log aggregator.  
**Reveals:** Need to make errors impossible (stronger types), batch/sample errors at scale, or design for error as the steady state (chaos engineering mindset)

### Example 2: Synchronous APIs
**Normal scale (single server):** Direct function calls work. 1ms latency is negligible.  
**At global scale (client in Sydney, server in Virginia):** 150ms network latency. Synchronous call blocks a thread for 150ms. At 1000 concurrent users, you need 1000 threads just waiting on network.  
**Reveals:** Async/messaging becomes a survival requirement, not an optimization. A shared lock that takes 1ms at 10 users takes 10 seconds at 10,000 users.

### Example 3: In-Memory State
**Normal duration (hours/days):** Works fine  
**At years of continuous runtime:** A 1KB/request memory leak at 1M requests/day = 1TB accumulated in ~3 years.  
**Reveals:** Need explicit eviction (TTL, LRU), persistence with periodic cleanup, or bounded data structures. Can't rely on "restart to fix."

### Example 4: Naive Database Counter
**Normal scale (100 writes/sec):** `SELECT count, UPDATE count WHERE id=X` works fine  
**At high write scale (100K writes/sec):** Row-level lock creates a bottleneck. All writes serialize. Throughput collapses.  
**Reveals:** Sharded counters (N rows, randomly selected, aggregated on read). Google's AppEngine Sharded Counter is the canonical solution.

### Example 5: Monolith to Microservices
**Small team (5 engineers):** Monolith is fast, simple, easy to refactor  
**At 500 engineers:** Deployment conflicts, slow builds, inability to independently release. Any commit blocks everyone.  
**Reveals:** Conway's Law — system architecture mirrors team communication structure. Scale of *team* is a dimension, not just traffic.

### Example 6: Big-O as Algorithmic Scale Game
**Bubble sort at n=10:** 100 operations, imperceptible  
**Bubble sort at n=1,000,000:** 10^12 operations — days of runtime  
**Binary search at n=1,000,000:** ~20 operations  
**Reveals:** The choice of algorithm doesn't matter at small n. It matters catastrophically at large n. Big-O notation is a formal scale game: classify behavior as n → ∞.

### Example 7: Chained Microservices Tail Latency
**1 service at 99% reliability:** 1% of requests are slow — acceptable  
**100 chained services each at 99% reliability:** `1 - 0.99^100 = 63.4%` of requests hit at least one slow service  
**Reveals:** Tail latency amplifies multiplicatively in service chains. 99% per-service reliability is broken system reliability at scale. Design for P99.9, not P50. (See Dynamo case study below.)

## Output Format

When doing a scale game analysis, structure findings as:

```
Dimension tested: [volume / concurrency / duration / failure rate / cost / ...]
Current assumption: [what the design assumes]
At minimum scale: [behavior at zero/one/negligible]
At maximum scale: [behavior at 1000× / extreme]
Breaking point: [where the assumption fails]
Failure mode: [graceful degradation or catastrophic collapse?]
Insight: [what this reveals about the fundamental design]
Action: [what to change, verify, or accept as a known limit]
```

**Example output:**
```
Dimension tested: duration
Current assumption: user session tokens cached in memory, evicted on timeout
At minimum scale: 1 active user — works perfectly
At maximum scale: 10 years of operation at 1M users/day
Breaking point: no TTL enforcement → tokens accumulate → OOM crash
Failure mode: catastrophic (OOM kills process, logs all sessions out)
Insight: in-memory session store has unbounded growth without explicit eviction
Action: add TTL + LRU eviction, or move to Redis with expiry
```

## Common Anti-Patterns

- **"It works in dev"** — Dev environments have tiny datasets, no concurrency, no memory pressure, and perfect network
- **"Should scale fine"** — This phrase without a scale test means "I haven't thought about it"
- **Only testing happy path scale** — Test failure at scale too. What happens when 10% of dependencies are down simultaneously?
- **Mistaking load test for stress test** — Load test confirms expected behavior. Stress test finds the failure mode. You need both.
- **Ignoring the cheap end** — Zero and one are often buggy (empty arrays, single-element edge cases, division by zero)
- **Forgetting duration** — A system that passes a 1-hour load test may fail after 72 hours of soak testing
- **Confusing throughput with latency** — High throughput with terrible tail latency is a broken system. Test P99 at scale, not averages.
- **Stopping at the first breaking point** — Note the breaking point, then ask: does it fail gracefully or catastrophically?

## Testing Spectrum (Related Formal Techniques)

| Technique | What Scale Is Being Tested | Purpose |
|-----------|---------------------------|---------|
| **Load testing** | Volume at expected peak | Confirm system handles projected load |
| **Stress testing** | Volume beyond expected peak | Find the breaking point and failure mode |
| **Soak testing** | Duration (hours to days at steady load) | Reveal memory leaks, slow resource accumulation |
| **Chaos engineering** | Failure rate (random instance/zone/region death) | Validate resilience when components fail |
| **Property-based testing** | Input space (random + extreme edge cases) | Find cases the developer didn't think to write |
| **Fermi estimation** | Back-of-envelope across dimensions | Sanity-check before building; identify order-of-magnitude problems |

## Non-Software Applications

The scale game applies in any domain where assumptions hold at one scale but fail at another:

- **Physics:** Newton's laws work at human scales; break at relativistic speeds (Einstein) and quantum scales
- **Economics:** "More is always better" breaks at scale — a market can have too much liquidity, creating instability
- **Organizations:** Flat communication works at 10 people; fails at 150 (Dunbar's number) — hierarchy becomes necessary
- **Security:** A password policy that annoys nobody at 10 users creates massive friction at 10M users, causing workarounds that defeat the policy
- **Business strategy:** Amazon's "Working Backwards" — writing the press release before the code forces clarity on who the customer is and what success looks like at any scale

## Real-World Case Studies

Use these as calibration for your own scale estimates — they show how scale assumptions fail in production.

---

### Pokémon GO: 50× the Expected Launch Traffic (2016)

**What they planned:** Niantic estimated 1× baseline traffic, with worst-case at 5×.

**What happened:** Within 15 minutes of the Australia/NZ launch, traffic surpassed all projections. Peak hit **50× the original target** — 10× their worst case. The Japan launch had **3× the US launch traffic**. Engineers had to expand Kubernetes clusters in-flight while millions were playing — adding 1,000+ nodes to a live system.

**Scale game lesson:** Your "worst case" estimate is rarely the actual worst case. Ask: "What happens at 10× our worst-case estimate?" Make sure the answer is "we add capacity" not "we fail."

*Source: Google Cloud blog, "Bringing Pokémon GO to life on Google Cloud," 2016.*

---

### Amazon Dynamo: Designing for P99.9, Not the Mean (2007)

**The math:** A single page render calls 150+ services. If each has 99% reliability, the probability that *at least one* is slow: `1 - 0.99^150 = 78%`. 78% of page renders hit at least one slow service — even though each service looks healthy in isolation.

**Amazon's response:** Measure SLAs at P99.9. Design failure as the **normal case**, not the exception.

> *"Many algorithms that perform reasonably well under low load and small datasets can explode in cost if either request rates increase, the dataset grows or the number of nodes in the distributed system increases."*
> — Werner Vogels

**Scale game lesson:** "What is P99.9 latency when 10 services in my call graph are each independently slow?"

*Source: Amazon Dynamo paper, SOSP 2007.*

---

### Jeff Dean's Latency Numbers: The Reference Scale Table

The canonical reference for reasoning about distributed system scale:

| Operation | Latency | Relative to L1 |
|-----------|---------|----------------|
| L1 cache reference | 0.5 ns | 1× |
| L2 cache reference | 7 ns | 14× |
| Main memory reference | 100 ns | 200× |
| Read 4K randomly from SSD | 150,000 ns (150 µs) | 300,000× |
| Round trip within same datacenter | 500,000 ns (500 µs) | 1,000,000× |
| Disk seek | 10,000,000 ns (10 ms) | 20,000,000× |
| Send packet CA → Netherlands → CA | 150,000,000 ns (150 ms) | 300,000,000× |

**Key insight:** A cross-continental round trip is **300 million times slower** than an L1 cache hit. A disk seek is 20× slower than a datacenter round trip. These numbers determine whether synchronous APIs are viable and whether an algorithm that touches disk can meet a latency SLA.

*Source: Jeff Dean / Peter Norvig; GitHub gist jboner/2841832.*

---

### Twitter: Temporal Sharding Collapse

**Original design:** Tweets from the same date range stored on the same shard — simple, predictable.

**At scale:** One shard filled completely every **3 weeks**. Old shards received no traffic (severe load imbalance). The design that was simple at launch became structurally broken at volume — required a full architecture rebuild.

**Scale game lesson:** "If our data grows at this rate, how full is each shard in 6 months? 2 years? Who handles writes once the shard is full?" Running that forward projection exposes the collapse point before you build it.

---

## Remember

- **Extremes reveal fundamentals** — The scale game is a truth-forcing function
- **Test both directions** — Bigger AND smaller (zero and one are often the most revealing)
- **The failure mode matters as much as the breaking point** — Graceful degradation vs. catastrophic collapse
- **Thought experiments are free** — Most scale analysis takes minutes, not machines
- **The dimension you don't test is the one that bites you in production**
- **Big-O is a formal scale game** — If you know the complexity class, you know the scale behavior
