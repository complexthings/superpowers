---
name: test-driven-development
description: Write the test first, watch it fail, write minimal code to pass. Use when implementing any feature or bugfix, before writing implementation code. Also use when fixing bugs, refactoring, or doing behavior changes — any time you're about to write production code, TDD applies. Essential for AI-assisted coding sessions to ensure generated code is verified.
---

# Test-Driven Development (TDD)

## Overview

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

**Always:**
- New features
- Bug fixes
- Refactoring
- Behavior changes

**Exceptions (ask your human partner):**
- Throwaway prototypes (delete before merging)
- Scaffolded/boilerplate code with no logic
- Pure configuration files

Thinking "skip TDD just this once"? Stop. That's rationalization.

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

**No exceptions:**
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it
- Delete means delete

Implement fresh from tests. Period.

## The Full Cycle

Before writing your first test, write a **test list**: a short list of scenarios you need to cover. Don't turn them all into tests immediately — just capture them so you don't lose track of edge cases while you're heads-down implementing.

Then for each item, follow Red-Green-Refactor:

```mermaid
flowchart LR
    LIST[Test List] --> RED
    RED[RED: Write failing test] --> VR{Verify fails correctly}
    VR -->|yes| GREEN[GREEN: Minimal code]
    VR -->|wrong failure| RED
    GREEN --> VG{Verify passes, all green}
    VG -->|yes| REFACTOR[REFACTOR: Clean up]
    VG -->|no| GREEN
    REFACTOR --> VG2{Stay green?}
    VG2 -->|yes| NEXT((Next item))
    NEXT --> RED
```

### Step 0 — Write the Test List

Before writing any code or test, write down the scenarios you'll need to handle:

```
User login:
- valid credentials → success
- wrong password → error message
- empty email → validation error
- locked account → specific error
- remember me → session persists
```

Pick the simplest item first. Sequence matters — easier tests illuminate the design for harder ones.

### RED — Write Failing Test

Write one minimal test showing what should happen.

<Good>
```typescript
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
```
Clear name, tests real behavior, one thing
</Good>

<Bad>
```typescript
test('retry works', async () => {
  const mock = jest.fn()
    .mockRejectedValueOnce(new Error())
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce('success');
  await retryOperation(mock);
  expect(mock).toHaveBeenCalledTimes(3);
});
```
Vague name, tests mock not code
</Bad>

**Requirements:**
- One behavior
- Clear name
- Real code (no mocks unless unavoidable)

### Verify RED — Watch It Fail

**MANDATORY. Never skip.**

```bash
npm test path/to/test.test.ts
```

Confirm:
- Test fails (not errors)
- Failure message is expected
- Fails because feature missing (not typos)

**Test passes?** You're testing existing behavior. Fix test.

**Test errors?** Fix error, re-run until it fails correctly.

### GREEN — Minimal Code

Write simplest code to pass the test.

<Good>
```typescript
async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === 2) throw e;
    }
  }
  throw new Error('unreachable');
}
```
Just enough to pass
</Good>

<Bad>
```typescript
async function retryOperation<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number) => void;
  }
): Promise<T> {
  // YAGNI
}
```
Over-engineered
</Bad>

Don't add features, refactor other code, or "improve" beyond the test.

### Verify GREEN — Watch It Pass

**MANDATORY.**

```bash
npm test path/to/test.test.ts
```

Confirm:
- Test passes
- Other tests still pass
- Output pristine (no errors, warnings)

**Test fails?** Fix code, not test.

**Other tests fail?** Fix now.

### REFACTOR — Clean Up

After green only:
- Remove duplication
- Improve names
- Extract helpers

Keep tests green. Don't add behavior.

### Repeat

Pick the next item from your test list. Write the next failing test.

## Using TDD with AI-Generated Code

When an AI assistant generates implementation code, TDD discipline is *more* important, not less — AI code looks plausible but may be subtly wrong.

**The rule is the same:** tests first, then generation.

**Practical pattern:**
1. Write your test list as you normally would
2. Write the failing test
3. Run it — confirm it fails for the right reason
4. Ask the AI to implement the minimal code to pass the test (paste the test as context)
5. Run the test — confirm it passes
6. Review the AI code before accepting: does it actually do what you intended, or did it fake out the test?

**Watch for faking:** AI assistants sometimes generate code that passes the specific test without implementing the real behavior. For example, hardcoding a return value that matches your test fixture. Your test list (step 0) and multiple test cases prevent this.

**Exploration is fine — then delete it:**
```
✅ "Generate a spike to explore the API"
✅ Review the spike for understanding
✅ Delete the spike completely
✅ Write tests, then re-implement from scratch
```

Never ask an AI to "add tests to the code I just wrote." The tests will be biased toward the existing implementation.

## Good Tests

| Quality | Good | Bad |
|---------|------|-----|
| **Minimal** | One thing. "and" in name? Split it. | `test('validates email and domain and whitespace')` |
| **Clear** | Name describes behavior | `test('test1')` |
| **Shows intent** | Demonstrates desired API | Obscures what code should do |

## Test Doubles — Use Sparingly

A **test double** replaces a real dependency during testing. The goal is isolation from slow or external systems — not avoiding real code.

| Type | What it does | When to use |
|------|-------------|-------------|
| **Fake** | Working implementation, shortcuts (e.g., in-memory DB) | Best choice when available |
| **Stub** | Returns canned values | Isolate from external data sources |
| **Spy** | Records calls for later assertion | Verify side-effect behavior |
| **Mock** | Pre-programmed expectations, fails if wrong calls | Rarely — fragile on refactoring |
| **Dummy** | Passed but never used | Fill required parameters |

**Prefer fakes and stubs over mocks.** Mocks couple tests to implementation details, breaking on refactoring even when behavior is correct.

**The real-code default:** Write your test without any doubles first. Add doubles only when the test is genuinely slow, non-deterministic, or has destructive side effects.

Read `@testing-anti-patterns` before adding any mocks or test utilities.

## Why Order Matters

**"I'll write tests after to verify it works"**

Tests written after code pass immediately. Passing immediately proves nothing:
- Might test wrong thing
- Might test implementation, not behavior
- Might miss edge cases you forgot
- You never saw it catch the bug

Test-first forces you to see the test fail, proving it actually tests something.

**"I already manually tested all the edge cases"**

Manual testing is ad-hoc. You think you tested everything but:
- No record of what you tested
- Can't re-run when code changes
- Easy to forget cases under pressure
- "It worked when I tried it" ≠ comprehensive

Automated tests are systematic. They run the same way every time.

**"Deleting X hours of work is wasteful"**

Sunk cost fallacy. The time is already gone. Your choice now:
- Delete and rewrite with TDD (X more hours, high confidence)
- Keep it and add tests after (30 min, low confidence, likely bugs)

The "waste" is keeping code you can't trust. Working code without real tests is technical debt.

**"TDD is dogmatic, being pragmatic means adapting"**

TDD IS pragmatic:
- Finds bugs before commit (faster than debugging after)
- Prevents regressions (tests catch breaks immediately)
- Documents behavior (tests show how to use code)
- Enables refactoring (change freely, tests catch breaks)

"Pragmatic" shortcuts = debugging in production = slower.

**"Tests after achieve the same goals - it's spirit not ritual"**

No. Tests-after answer "What does this do?" Tests-first answer "What should this do?"

Tests-after are biased by your implementation. You test what you built, not what's required. You verify remembered edge cases, not discovered ones.

Tests-first force edge case discovery before implementing. Tests-after verify you remembered everything (you didn't).

30 minutes of tests after ≠ TDD. You get coverage, lose proof tests work.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Tests after achieve same goals" | Tests-after = "what does this do?" Tests-first = "what should this do?" |
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "Deleting X hours is wasteful" | Sunk cost fallacy. Keeping unverified code is technical debt. |
| "Keep as reference, write tests first" | You'll adapt it. That's testing after. Delete means delete. |
| "Need to explore first" | Fine. Throw away exploration, start with TDD. |
| "Test hard = design unclear" | Listen to test. Hard to test = hard to use. |
| "TDD will slow me down" | TDD faster than debugging. Pragmatic = test-first. |
| "Manual test faster" | Manual doesn't prove edge cases. You'll re-test every change. |
| "Existing code has no tests" | You're improving it. Add tests for existing code. |
| "AI generated the code, tests would be redundant" | AI code looks correct but often isn't. TDD applies especially here. |

## Red Flags — STOP and Start Over

- Code before test
- Test after implementation
- Test passes immediately (without implementation)
- Can't explain why test failed
- Tests added "later"
- Rationalizing "just this once"
- "I already manually tested it"
- "Tests after achieve the same purpose"
- "It's about spirit not ritual"
- "Keep as reference" or "adapt existing code"
- "Already spent X hours, deleting is wasteful"
- "TDD is dogmatic, I'm being pragmatic"
- "This is different because..."

**All of these mean: Delete code. Start over with TDD.**

## Example: Bug Fix

**Bug:** Empty email accepted

**Test List:**
- empty email → validation error
- whitespace-only email → validation error
- valid email → passes through

**RED**
```typescript
test('rejects empty email', async () => {
  const result = await submitForm({ email: '' });
  expect(result.error).toBe('Email required');
});
```

**Verify RED**
```bash
$ npm test
FAIL: expected 'Email required', got undefined
```

**GREEN**
```typescript
function submitForm(data: FormData) {
  if (!data.email?.trim()) {
    return { error: 'Email required' };
  }
  // ...
}
```

**Verify GREEN**
```bash
$ npm test
PASS
```

**REFACTOR**
Extract validation for multiple fields if needed.

## Verification Checklist

Before marking work complete:

- [ ] Wrote a test list before writing any test
- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered

Can't check all boxes? You skipped TDD. Start over.

## When Stuck

| Problem | Solution |
|---------|----------|
| Don't know how to test | Write wished-for API. Write assertion first. Ask your human partner. |
| Test too complicated | Design too complicated. Simplify interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Test setup huge | Extract helpers. Still complex? Simplify design. |
| AI generated code first | Delete it. Write test. Ask AI to implement from test. |

## Debugging Integration

Bug found? Write failing test reproducing it. Follow TDD cycle. Test proves fix and prevents regression.

Never fix bugs without a test.

## Testing Anti-Patterns

When adding mocks or test utilities, read @testing-anti-patterns to avoid common pitfalls:
- Testing mock behavior instead of real behavior
- Adding test-only methods to production classes
- Mocking without understanding dependencies

## Final Rule

```
Production code → test exists and failed first
Otherwise → not TDD
```

No exceptions without your human partner's permission.
