---
name: condition-based-waiting
description: Replace arbitrary timeouts with condition polling for reliable async tests. Use this skill whenever you see setTimeout/sleep/time.sleep in tests, tests are flaky or inconsistent across machines or CI, tests timeout under parallel load, or you're waiting for async operations like events, state changes, DOM updates, file writes, or API responses. Also use when debugging race conditions, investigating "why does this test sometimes fail", or looking for test speed improvements by removing unnecessary waits.
metadata:
  version: 2.1.0
  languages: all
---

# Condition-Based Waiting

## Overview

Flaky tests often guess at timing with arbitrary delays. This creates race conditions where tests pass on a fast dev machine but fail under load or in CI.

**Core principle:** Wait for the actual condition you care about, not a guess about how long it takes.

## When to Use

```
Test uses setTimeout/sleep?
  └─ Testing actual timing behavior? (debounce, throttle, tick intervals)
       ├─ YES → Document WHY the timeout is needed (see "When Arbitrary Timeout IS Correct")
       └─ NO  → Replace with condition-based waiting
                  └─ System emits events? → Prefer event-based waiting (fastest, no polling)
                     Otherwise           → Use condition polling
```

**Use when:**
- Tests have arbitrary delays (`setTimeout`, `sleep`, `time.sleep()`)
- Tests are flaky (pass sometimes, fail under load or in CI)
- Tests timeout when run in parallel
- Waiting for: async operations, DOM updates, state changes, file writes, queue drains

**Don't use when:**
- Testing actual timing behavior (debounce delay, throttle interval, tick frequency)
- Your test framework already has built-in auto-waiting (Playwright, Cypress) — use those instead
- Always document WHY when keeping an arbitrary timeout

## Decision: Poll vs Event

| Approach | Use when | Latency | CPU |
|----------|----------|---------|-----|
| Event listener | System emits events/promises | ~0ms | Zero |
| Framework built-ins | Playwright, Cypress, Testing Library | ~0ms | Zero |
| Polling | System has no observable events | 0–50ms | Low |

**Event-based (zero latency, preferred when possible):**
```typescript
// ✅ If system emits events, listen instead of polling
async function waitForEvent<T>(emitter: EventEmitter, event: string, timeoutMs = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      emitter.removeListener(event, resolve);
      reject(new Error(`Timeout waiting for "${event}" event after ${timeoutMs}ms`));
    }, timeoutMs);
    emitter.once(event, (data: T) => { clearTimeout(timer); resolve(data); });
  });
}
```

**Polling (when no events available):**
```typescript
// ✅ Poll at 50ms — responsive without hammering the CPU
await waitFor(() => system.isReady(), 'system to be ready');
```

## Core Pattern

```typescript
// ❌ BEFORE: Guessing at timing
await new Promise(r => setTimeout(r, 300));
const result = getResult();
expect(result).toBeDefined();

// ✅ AFTER: Waiting for condition
await waitFor(() => getResult() !== undefined, 'result to be defined');
const result = getResult();
expect(result).toBeDefined();
```

## Quick Patterns

| Scenario | Pattern |
|----------|---------|
| Wait for event | `waitFor(() => events.find(e => e.type === 'DONE'), 'DONE event')` |
| Wait for state | `waitFor(() => machine.state === 'ready' && machine.state, 'ready state')` |
| Wait for count | `waitFor(() => items.length >= 5 && items, '5+ items')` |
| Wait for file | `waitFor(() => fs.existsSync(path) && path, 'file to exist')` |
| Wait for disappearance | `waitFor(() => !getElement() || true, 'element removed')` |
| Complex condition | `waitFor(() => obj.ready && obj.value > 10 && obj, 'obj ready')` |

> **Note:** The condition must return a truthy value to resolve — returning `false`, `null`, `undefined`, or `0` triggers another poll.

## Generic Implementation (TypeScript)

```typescript
async function waitFor<T>(
  condition: () => T | undefined | null | false,
  description: string,
  timeoutMs = 5000,
  intervalMs = 50  // 50ms matches Testing Library's default — fast enough, CPU-friendly
): Promise<T> {
  const startTime = Date.now();

  while (true) {
    const result = condition();
    if (result) return result as T;

    const elapsed = Date.now() - startTime;
    if (elapsed > timeoutMs) {
      // Include current state in error — saves a debugging round-trip
      const current = (() => { try { return condition(); } catch { return 'error evaluating'; } })();
      throw new Error(
        `Timeout waiting for "${description}" after ${timeoutMs}ms. Current value: ${JSON.stringify(current)}`
      );
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }
}
```

See `example.ts` for domain-specific helper implementations (`waitForEvent`, `waitForEventCount`, `waitForEventMatch`).

## Throw-Based vs Falsy-Return Retry

Two valid retry styles — choose based on context:

**Falsy-return** (above implementation — simple boolean conditions):
```typescript
// Retries while condition returns falsy
await waitFor(() => queue.length > 0 && queue, 'queue to have items');
```

**Throw-based** (Testing Library style — assertions as conditions):
```typescript
// Retries while callback throws; stops when it doesn't throw
await waitFor(() => {
  expect(getItems()).toHaveLength(3); // throws until length === 3
});
```

Use throw-based when wrapping `expect()` assertions. Use falsy-return for plain boolean/value conditions. Don't mix the two styles in the same `waitFor` call.

## ⚠️ Fake Timer Incompatibility (Critical Pitfall)

The `setTimeout(r, interval)` inside `waitFor` **never fires** when Jest/Vitest fake timers are active:

```typescript
// ❌ This hangs forever — fake timers swallow the setTimeout inside waitFor
vi.useFakeTimers();
await waitFor(() => store.isReady(), 'store ready'); // deadlock
```

**Fix option 1 — Flush pending timers before restoring real timers (recommended):**
```typescript
afterEach(() => {
  jest.runOnlyPendingTimers(); // flush 3rd-party timers before switching
  jest.useRealTimers();
});
```

**Fix option 2 — Advance fake timers to cover polling intervals:**
```typescript
vi.useFakeTimers();
const waiting = waitFor(() => store.isReady(), 'store ready');
vi.advanceTimersByTime(5000); // advance past all polling intervals
await waiting;
```

**Fix option 3 — Switch to real timers for the wait:**
```typescript
vi.useFakeTimers();
// ... trigger work with fake timers ...
vi.useRealTimers();
await waitFor(() => store.isReady(), 'store ready');
vi.useFakeTimers(); // restore if needed
```

**Fix option 4 — Skip `waitFor` entirely (when feasible):**
```typescript
// If condition can be checked synchronously after advancing timers:
vi.useFakeTimers();
vi.runAllTimers(); // flush all pending fake timers
expect(store.isReady()).toBe(true); // direct check, no waitFor needed
```

**Rule:** If your test uses fake timers, you cannot use `setTimeout`-based polling without explicitly advancing time.

## Framework Built-Ins (Use These First)

If you're already using one of these frameworks, use their built-in waiting — don't reinvent the wheel:

### Testing Library (`@testing-library/react`, etc.)

```typescript
import { waitFor, waitForElementToBeRemoved, screen } from '@testing-library/react';

// waitFor: poll until assertion passes (retries when callback THROWS)
await waitFor(() => expect(screen.getByText('Done')).toBeVisible());
// Defaults: timeout=1000ms, interval=50ms

// findBy* = getBy* + waitFor (most common pattern)
const button = await screen.findByRole('button', { name: 'Submit' });
await screen.findByText('Loaded', {}, { timeout: 2000 });

// waitForElementToBeRemoved: wait for disappearance
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
```

**Critical:** Testing Library's `waitFor` retries when the callback **throws** — not when it returns falsy. Always use `expect(...)` assertions inside, not boolean returns.

### Playwright (auto-waits on every action)

```typescript
// ✅ Actions auto-wait (visible + stable + enabled + receives events):
await page.click('button#submit');
await page.fill('input[name=email]', 'test@example.com');

// ✅ Assertions auto-retry until timeout:
await expect(page.locator('.status')).toHaveText('Ready');
await expect(page.locator('.spinner')).toBeHidden();
await expect(page).toHaveURL('/dashboard');

// ✅ Explicit element state wait:
await page.locator('.spinner').waitFor({ state: 'hidden' });

// ✅ Custom condition evaluated in browser JS:
await page.waitForFunction(() => window.__appReady === true);
```

Manual polling is rarely needed in Playwright — auto-wait handles the common cases.

### Cypress (retry-ability built into query chains)

```javascript
// ✅ .get() + .should() retries the chain automatically
cy.get('.status').should('have.text', 'Ready');
cy.get('@mySpy').should('have.been.calledOnce');

// ✅ For explicit polling:
cy.waitUntil(() => cy.window().then(w => w.store?.initialized));
```

## Cross-Language Patterns

### Python (pytest-asyncio)

```python
import asyncio

async def wait_for_condition(condition_fn, description, timeout=5.0, interval=0.05):
    """Poll until condition_fn() returns truthy or timeout expires."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        if condition_fn():
            return
        await asyncio.sleep(interval)
    current = condition_fn()
    raise TimeoutError(
        f'Timeout waiting for "{description}" after {timeout}s. Current: {current!r}'
    )

@pytest.mark.asyncio
async def test_queue_drains():
    items = list(range(10))
    asyncio.get_event_loop().call_later(0.1, items.clear)
    await wait_for_condition(lambda: len(items) == 0, 'queue to drain')
    assert items == []
```

> **Pitfall:** Call the getter *inside* the loop — never cache state before entering the loop or you'll check a stale snapshot.

### Go

```go
// stdlib — good for goroutine synchronization
func TestWorkerFinishes(t *testing.T) {
    done := make(chan struct{})
    go func() { time.Sleep(50 * time.Millisecond); close(done) }()

    select {
    case <-done:
        // success
    case <-time.After(2 * time.Second):
        t.Fatal("worker did not finish within 2s")
    }
}

// testify — good for polling arbitrary conditions
require.Eventually(t,
    func() bool { return cache.Has("users") },
    2*time.Second,       // total timeout
    10*time.Millisecond, // poll interval
    "cache never populated 'users' key",
)
```

> **Pitfall (gomega/testify):** Pass a *getter function* — not a value. `Eventually(cache.Has("users"), ...)` snapshots once; `Eventually(func() bool { return cache.Has("users") }, ...)` re-evaluates live.

### Rust (tokio)

```rust
use std::sync::{Arc, Mutex};
use tokio::time::{sleep, timeout, Duration};

#[tokio::test]
async fn test_flag_set_by_background_task() {
    let flag = Arc::new(Mutex::new(false));
    let flag_clone = Arc::clone(&flag);
    tokio::spawn(async move {
        sleep(Duration::from_millis(100)).await;
        *flag_clone.lock().unwrap() = true;
    });

    timeout(Duration::from_secs(2), async {
        loop {
            if *flag.lock().unwrap() { break; }
            sleep(Duration::from_millis(50)).await; // use sleep, not yield_now
        }
    }).await.expect("flag was never set within 2s");
}
```

> **Pitfall:** Use `sleep()`, not `yield_now()`, in test polling loops — `yield_now` starves other tasks on the single-threaded test runtime.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `setTimeout(check, 1)` — polls too fast | Use 50ms; sub-10ms wastes CPU with no benefit |
| No timeout — loops forever | Always include timeout with descriptive error |
| Check stale data — cached before loop | Call getter *inside* loop for fresh data |
| Vague timeout error — "condition not met" | Include current state: `Current value: ${JSON.stringify(val)}` |
| Returning falsy from Testing Library `waitFor` | Throw inside `waitFor` — use `expect()` assertions |
| `waitFor` under fake timers — hangs | See [Fake Timer Incompatibility] above |

## When Arbitrary Timeout IS Correct

Some behavior is inherently time-based. The pattern: wait for condition first, then wait for timed behavior:

```typescript
// Tool ticks every 100ms — need 2 ticks to verify partial output
await waitForEvent('TOOL_STARTED');            // 1. Wait for triggering condition
await new Promise(r => setTimeout(r, 200));    // 2. Wait for known timing behavior
// 200ms = 2 ticks at 100ms intervals — documented and justified
```

**Requirements for a legitimate arbitrary timeout:**
1. First wait for the triggering condition (don't skip this)
2. Duration based on known timing (e.g., "this runs every 100ms") — not a guess
3. Comment explains WHY the specific duration was chosen

## Real-World Impact

From a debugging session replacing 15 arbitrary timeouts across 3 test files:
- Pass rate: **60% → 100%** (eliminated race conditions)
- Execution time: **40% faster** (no more waiting out unnecessary delays)
- Zero flaky failures in CI after the change
