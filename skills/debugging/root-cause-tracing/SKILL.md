---
name: root-cause-tracing
description: Systematically trace bugs backward through the call chain to find the original trigger — not just where the error appears. Use this skill when an error surfaces deep in execution, a symptom keeps recurring after fixes, invalid data arrives at a function from an unknown source, or a test fails but the failure point isn't the true cause. Covers synchronous and async traces, cross-process tracing, bisecting regressions, and identifying far-from-origin bug patterns.
---

# Root Cause Tracing

## Core Principle

Bugs manifest where they surface, not where they're born. Fixing the symptom is fast but fragile — the same root cause will produce a different symptom tomorrow.

**Trace backward through the call chain until you find the original trigger, then fix at the source.**

## The Tracing Process

### Step 1 — Observe the Symptom

Write down exactly what failed and where:

```
Error: ENOENT: no such file or directory, open '/tmp/undefined/output.json'
  at Object.openSync (node:fs:600:3)
  at writeFileSync (src/reporter.ts:42)
```

### Step 2 — Find the Immediate Cause

What code directly triggers this? Don't fix it yet — just identify it.

```typescript
// reporter.ts:42 — writes to outputDir which is somehow 'undefined'
fs.writeFileSync(path.join(outputDir, 'output.json'), content);
```

### Step 3 — Ask "What Called This?" (trace up one level)

Follow the call chain backward. Use your IDE's "Find Usages", grep, or add a stack trace:

```typescript
// Temporary instrumentation — add before the problem line
console.error('DEBUG reporter:', { outputDir, stack: new Error().stack });
```

```
→ reporter.writeOutput(outputDir)
→ Runner.finish(outputDir)
→ CLI.run(config.outputDir)
→ config loaded from parseArgs()
```

### Step 4 — Keep Tracing Until You Find the Source

At each level, ask: **"Could this function be correct if all its inputs were valid?"**

If yes, the bug is upstream — keep tracing. If no, you've found a broken invariant.

```typescript
// CLI.run receives config.outputDir — where does that come from?
const config = parseArgs(process.argv);
// parseArgs returns outputDir as undefined when --output flag is missing —
// no default value is set, so any downstream use of outputDir becomes 'undefined'
```

### Step 5 — Confirm You've Found the Root

A true root cause meets all of these:
- [ ] Removing or fixing this code eliminates **all** instances of the symptom
- [ ] The code is doing "wrong thing" — not just receiving wrong input
- [ ] A unit test of just this component would expose the bug
- [ ] There's no caller upstream that's causing this code to behave badly

**Root cause found:** `parseArgs()` returns `undefined` for missing optional flags with no defaults.

**Fix at the source:** Set a default in `parseArgs()`, not a guard in `reporter.ts`.

## When You Can't Trace Manually — Add Instrumentation

When the call chain isn't obvious from reading code, add temporary debug logging:

```typescript
// TypeScript/JavaScript — capture full call chain
async function riskyOperation(directory: string) {
  console.error('DEBUG riskyOperation:', {
    directory,
    cwd: process.cwd(),
    stack: new Error().stack,  // shows who called this
  });
  // ... rest of function
}
```

```python
# Python — capture locals at each stack frame
import traceback

try:
    result = process_data(user_input)
except Exception as e:
    tb = traceback.TracebackException.from_exception(e, capture_locals=True)
    print(''.join(tb.format()))
    # Shows local variable values at each frame in the traceback
```

**Key instrumentation rules:**
- Log **before** the dangerous operation, not after it fails (you won't get there)
- In tests, use `console.error()` or `stderr` — test runners often suppress `stdout`
- Include: the value being used, `process.cwd()` or equivalent, and the full stack
- Remove all instrumentation once the root cause is found

## Tracing Async Bugs

Async bugs are harder because the call stack at throw-time shows the event loop, not who scheduled the work.

### Node.js

Node 12+ has async stack traces enabled by default. If stacks are truncated:

```bash
node --stack-trace-limit=50 your-script.js
```

Capture context *before* the await — this is when you have the scheduling context:

```typescript
async function fetchUser(id: string) {
  console.error('DEBUG fetchUser scheduled by:', {
    id,
    stack: new Error().stack,  // who called fetchUser — this is your trace
  });
  return await db.query('SELECT * FROM users WHERE id = ?', [id]);
}
```

Watch for **fire-and-forget** as a common root cause — errors disappear silently:

```typescript
// BUG: errors from processItem() are swallowed
items.forEach(item => {
  processItem(item);  // not awaited!
});

// FIX: await all promises, surface errors
await Promise.all(items.map(item => processItem(item)));
```

### Python asyncio

```bash
PYTHONASYNCIODEBUG=1 python your_script.py
```

Debug mode catches: never-awaited coroutines (with traceback of where they were created), silently-failed tasks, and event loop blocking callbacks.

```python
import asyncio
asyncio.run(main(), debug=True)  # equivalent in code
```

## Tracing Across Process Boundaries

When a bug originates in Service A but manifests in Service B, you need trace IDs to correlate logs across services.

**Lightweight approach for debugging sessions:**

```typescript
// Service A — inject a trace ID on outbound calls
const traceId = crypto.randomUUID();
console.error('DEBUG outbound:', { traceId, payload, stack: new Error().stack });

const response = await fetch('https://service-b/api', {
  method: 'POST',
  headers: { 'X-Trace-Id': traceId },
  body: JSON.stringify(payload),
});
```

```typescript
// Service B — extract and log the trace ID
app.use((req, res, next) => {
  const traceId = req.headers['x-trace-id'] ?? crypto.randomUUID();
  console.error('DEBUG inbound:', { traceId, path: req.path });
  req.traceId = traceId;
  next();
});
```

Now you can grep both services' logs for the same `traceId` to reconstruct the full chain.

For production distributed tracing, use OpenTelemetry — it propagates trace context automatically via the `traceparent` header and lets you reconstruct full call trees across services.

## Finding Which Commit Introduced a Bug

When you know something broke between two commits but not which one, use `git bisect`:

```bash
git bisect start
git bisect bad                 # current state is broken
git bisect good v2.3.0         # last known good state

# Git checks out the midpoint. Run your test, then:
git bisect good   # or: git bisect bad
# Repeat until Git identifies the culprit commit (log2(N) steps)
git bisect reset  # restore HEAD when done
```

**Fully automated bisect** — pass any script that exits 0 for good, non-zero for bad:

```bash
git bisect start
git bisect bad HEAD
git bisect good v2.3.0
# For Jest: use --testNamePattern; for Pytest: use -k; adapt to your test runner
git bisect run npm test -- --testNamePattern="the failing test"
git bisect reset
```

Skip untestable commits (e.g., broken build mid-refactor):

```bash
git bisect skip
```

## Finding Which Test Pollutes State

When tests pass in isolation but fail in suite, shared mutable state is the cause. To find which test contaminates the environment, run them one-by-one and stop at the first failure:

```bash
# Run each test file in isolation until one fails (adapt glob for your project)
for f in $(npx jest --listTests); do
  npx jest "$f" --silent && continue
  echo "POLLUTER: $f"
  break
done
```

Or use binary search — halve the test list and narrow down:

```bash
# Get all test files, run the first half, then the second half
ALL=$(npx jest --listTests)
HALF=$(echo "$ALL" | head -n $(( $(echo "$ALL" | wc -l) / 2 )))
echo "$HALF" | xargs npx jest
```

## Common Far-From-Origin Patterns

These patterns cause bugs to manifest far from where they were introduced:

### Initialization Order / Top-Level Access

```typescript
// BUG: context.tempDir is '' at module load time, populated only in beforeEach
const context = setupCoreTest();
const project = Project.create('test', context.tempDir); // '' — runs at define time!

// FIX: access inside the test body, after beforeEach has run
it('creates project', () => {
  const project = Project.create('test', context.tempDir); // populated by now
});
```

**Signal:** Value is empty/undefined even though setup exists — check *when* the setup runs vs. when the value is read.

### Closure Over Mutable State

```javascript
// BUG: all callbacks capture the same `i` (var is function-scoped)
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // prints 3, 3, 3
}

// FIX: use let (block-scoped) so each iteration captures its own i
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // prints 0, 1, 2
}
```

**Signal:** Callbacks or async handlers all see the same (final) value — check `var` vs `let`, or whether a reference is being mutated after being captured.

### Exhausted Generator / Iterator

```python
# BUG: generator is exhausted after first iteration
items = (x * 2 for x in range(10))  # generator expression
print(list(items))   # [0, 2, 4, ...] works once
print(list(items))   # [] — exhausted!

# FIX: materialize to a list if you need to iterate more than once
items = list(x * 2 for x in range(10))
```

**Signal:** Works the first time, empty/wrong on second use — check generators, iterators, lazy sequences.

### Shared Mutable Default Arguments (Python)

```python
# BUG: the default list [] is created once and shared across ALL calls
def append_to(item, lst=[]):
    lst.append(item)
    return lst

append_to(1)  # [1]
append_to(2)  # [1, 2] — not a fresh list!

# FIX: use None as sentinel, create fresh default inside the function
def append_to(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

**Signal:** State persists unexpectedly between calls with default arguments — check for mutable defaults.

### Object Reference Mutation

```typescript
// BUG: config mutated after being shared with multiple consumers
const config = { timeout: 5000 };
serviceA.init(config);
serviceB.init(config);
config.timeout = 1000;  // retroactively affects both services

// FIX: freeze or clone at handoff
serviceA.init(Object.freeze({ ...config }));
serviceB.init(Object.freeze({ ...config }));
```

**Signal:** Value changes unexpectedly mid-execution — check whether objects are passed by reference and mutated downstream.

## Symptom vs. Root Cause Quick Reference

| What you see | Likely root cause |
|---|---|
| `TypeError: Cannot read property 'x' of undefined` | Caller passed `undefined` — trace who called with bad args |
| Database query returns wrong results | Filter/sort applied in wrong order, or data corrupted at write time |
| Test passes alone, fails in suite | Shared mutable state — find the polluting test |
| Intermittent `ECONNRESET` | Connection pool exhausted upstream; someone not releasing connections |
| UI component renders blank | Data fetcher returned `null` — trace the fetch, not the render |
| `ENOENT` on path containing `undefined` | String interpolation of an `undefined` variable — trace the variable |

## After Finding the Root Cause

Fix at the source, then add defense-in-depth to make the bug impossible at multiple layers:

```typescript
// Root cause fix: set a safe default at the point of origin
function parseArgs(argv: string[]): Config {
  const args = minimist(argv.slice(2));
  const outputDir = args['output'] ?? './output'; // default instead of undefined
  return { outputDir };
}

// Defense-in-depth: guard at each consumption layer
function writeOutput(outputDir: string, content: string) {
  if (!outputDir) throw new Error('writeOutput: outputDir is required');
  fs.writeFileSync(path.join(outputDir, 'output.json'), content);
}
```

See the `defense-in-depth` skill for a full layered validation approach.
