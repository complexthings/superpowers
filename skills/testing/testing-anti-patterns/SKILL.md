---
name: testing-anti-patterns
description: Identifies and corrects dangerous testing anti-patterns including testing mock behavior instead of real behavior, adding test-only methods to production classes, mocking without understanding dependencies, writing brittle implementation-coupled tests, and sharing mutable state across tests. Use when writing or changing tests, adding mocks, designing test fixtures, debugging flaky tests, or tempted to add test-only methods to production code.
metadata:
  version: 1.2.0
---

# Testing Anti-Patterns

## Overview

Tests must verify real behavior, not mock behavior. Mocks isolate; they are not the thing being tested.

**Core principle:** Test what the code *does*, not how it *does it* or what the mocks *do*.

**Following strict TDD prevents most of these anti-patterns.**

## The Iron Laws

1. NEVER test mock behavior
2. NEVER add test-only methods to production classes
3. NEVER mock without understanding dependencies
4. NEVER couple tests to implementation details — test contracts, not internals

## Anti-Pattern 1: Testing Mock Behavior

**The violation:**
```typescript
// ❌ BAD: Testing that the mock exists, not real behavior
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

**Why this is wrong:**
- Verifies the mock is present, not that the component works
- Passes when mock exists, fails when mock changes — irrelevant to behavior
- `getByTestId` is an implementation artifact; prefer semantic queries

**The fix:**
```typescript
// ✅ GOOD: Test real behavior; query by role, not by test ID
test('renders sidebar', () => {
  render(<Page />);  // Don't mock sidebar if avoidable
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});

// If sidebar must be mocked for isolation:
// Assert Page's behavior, not the mock's presence
```

**When you see an assertion on a `*-mock` testId:** Ask "Am I testing real component behavior or just mock existence?" If the latter, delete the assertion.

## Anti-Pattern 2: Test-Only Methods in Production

**The violation:**
```typescript
// ❌ BAD: destroy() only called from tests
class Session {
  async destroy() {  // Looks like a production API!
    await this._workspaceManager?.destroyWorkspace(this.id);
  }
}
afterEach(() => session.destroy());
```

**Why this is wrong:**
- Pollutes production API with test concerns
- Dangerous if called accidentally in production
- Violates YAGNI and separation of concerns

**The fix:**
```typescript
// ✅ GOOD: Cleanup lives in test utilities
// Session has no destroy() in production

// In test-utils/session-helpers.ts
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}
afterEach(() => cleanupSession(session));
```

**Before adding any method to a production class:** Ask "Is this only used by tests?" If yes, put it in test utilities.

## Anti-Pattern 3: Mocking Without Understanding

**The violation:**
```typescript
// ❌ BAD: Mock kills the side effect this test actually depends on
test('detects duplicate server', () => {
  vi.mock('ToolCatalog', () => ({
    discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
  }));
  await addServer(config);
  await addServer(config);  // Should throw — but won't, mock prevented config write
});
```

**Why this is wrong:**
- Mocked method had a side effect the test depended on
- Over-mocking "to be safe" hides the real behavior
- Test passes for the wrong reason or fails mysteriously

**The fix:**
```typescript
// ✅ GOOD: Mock at the correct level — the slow/external part only
test('detects duplicate server', () => {
  vi.mock('MCPServerManager'); // Mock slow startup, not config logic
  await addServer(config);    // Config written ✓
  await addServer(config);    // Duplicate detected ✓
});
```

**Before mocking any method:**
1. Ask "What side effects does the real method have?"
2. Ask "Does this test depend on any of those side effects?"
3. Run the test with the real implementation first; observe what it needs
4. THEN add minimal mocking at the lowest appropriate level

**Red flags:** "I'll mock this to be safe" · "This might be slow, better mock it" · Mocking a high-level method without reading its source

## Anti-Pattern 4: Incomplete Mocks

**The violation:**
```typescript
// ❌ BAD: Only mock the fields you think you need
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' }
  // Missing: metadata.requestId that downstream code reads
};
// Breaks silently when code accesses response.metadata.requestId
```

**Why this is wrong:**
- Partial mocks hide structural assumptions
- Silent failures when downstream code accesses unmocked fields
- Tests pass in isolation; integration fails against the real API

**The fix:**
```typescript
// ✅ GOOD: Mirror the complete real API structure
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
  // All fields the real API returns
};
```

**Before creating a mock response:** Examine the actual API docs or real response. Include ALL fields downstream code might access. If uncertain, include all documented fields.

## Anti-Pattern 5: Brittle Implementation-Coupled Tests

**The violation:**
```typescript
// ❌ BAD: Tests internal method call order, not the outcome
test('calculates total', () => {
  const spy = vi.spyOn(calculator, '_applyDiscount');
  calculator.total(items);
  expect(spy).toHaveBeenCalledWith(items, 0.1);  // Tests HOW, not WHAT
});
```

**Why this is wrong:**
- Tests lock in implementation details, not behavioral contracts
- A valid refactor (same output, different internals) breaks the test
- *"Coupling to the implementation also interferes with refactoring"* — Fowler
- Discourages clean code evolution

**The fix:**
```typescript
// ✅ GOOD: Test the observable outcome/state
test('applies 10% discount to qualifying items', () => {
  const result = calculator.total(qualifyingItems);
  expect(result).toBe(expectedDiscountedTotal);
  // Don't care HOW the discount was applied
});
```

**Rule of thumb:** A test should survive any refactor that preserves the public contract. If renaming a private method breaks a test, the test is wrong.

## Anti-Pattern 6: Shared Mutable State Between Tests

**The violation:**
```typescript
// ❌ BAD: State leaks between tests; order-dependent results
let store: AppStore;
beforeAll(() => {
  store = createStore();  // Shared across all tests
});

test('adds item', () => {
  store.add({ id: 1 });
  expect(store.count()).toBe(1);
});

test('removes item', () => {
  store.remove(1);  // Assumes 'adds item' ran first — flaky!
  expect(store.count()).toBe(0);
});
```

**Why this is wrong:**
- Tests become order-dependent — pass in one order, fail in another
- Debugging requires running the full suite to reproduce
- Violates test isolation; each test should be a self-contained unit

**The fix:**
```typescript
// ✅ GOOD: Fresh state for each test
let store: AppStore;
beforeEach(() => {
  store = createStore();  // Reset before each test
});

test('adds item', () => {
  store.add({ id: 1 });
  expect(store.count()).toBe(1);
});

test('removes item', () => {
  store.add({ id: 1 });   // Set up own preconditions
  store.remove(1);
  expect(store.count()).toBe(0);
});
```

**Red flags:** `beforeAll` modifying state that tests mutate · Tests that only pass when run in a specific order · Cleanup logic in `afterAll` that tests depend on

## Anti-Pattern 7: Tests as Afterthought

**The violation:**
```
✅ Implementation complete
❌ No tests written
"Ready for testing"
```

Testing is part of implementation, not optional follow-up. Claiming "complete" without tests is incomplete.

**The fix:** TDD cycle — write failing test → implement to pass → refactor → then claim complete.

## When Mocks Become Too Complex

**Warning signs:**
- Mock setup is longer than test logic
- Mocking everything just to make the test compile
- Mocks missing methods that real components have
- Test breaks when mock internals change, not when behavior changes

**Consider:** Integration tests with real components are often simpler than maintaining complex mocks.

## TDD Prevents These Anti-Patterns

1. **Write test first** → Forces clarity on what you're actually testing
2. **Watch it fail** → Confirms the test verifies real behavior, not mock presence
3. **Minimal implementation** → No test-only methods added speculatively
4. **Real dependencies visible** → You see what the test needs before mocking anything

**If you're testing mock behavior, you violated TDD** — mocks were added without watching the test fail against real code first.

## Quick Reference

| Anti-Pattern | Harm | Fix |
|---|---|---|
| Assert on mock elements | Tests mock, not behavior | Test real component or unmock it |
| Test-only methods in production | Pollutes production API | Move to test utilities |
| Mock without understanding | Hides bugs, wrong behavior | Understand first, mock minimally |
| Incomplete mocks | Silent failures downstream | Mirror full real API structure |
| Implementation-coupled tests | Break on valid refactors | Test contracts, not internals |
| Shared mutable state | Flaky, order-dependent | Fresh state per test (`beforeEach`) |
| Tests as afterthought | False completeness | TDD — tests first |

## Red Flags Checklist

- [ ] Assertion checks for `*-mock` testIds
- [ ] Methods only called in test files exist on production classes
- [ ] Mock setup is >50% of the test
- [ ] Test fails when you remove the mock (but not the real behavior)
- [ ] Can't explain why a mock is needed
- [ ] Mocking "just to be safe"
- [ ] Test breaks when implementation changes but output is the same
- [ ] Tests only pass when run in a specific order
- [ ] `beforeAll` modifies state that individual tests mutate

## The Bottom Line

**Mocks isolate; they are not the thing being tested.**

Test the *contract* (observable outputs and state), not the *mechanism* (how it's implemented internally).

If TDD reveals you're testing mock behavior or internal details, you've gone wrong. Fix: test real behavior or question whether you need the mock at all.
