---
name: defense-in-depth
description: Validate at every layer data passes through to make bugs impossible, not just fixed; apply when invalid data causes failures deep in execution or a dangerous operation must never run on bad input
metadata:
  version: 4.0.0
  languages: all
  when_to_use: when invalid data causes failures deep in execution, or a dangerous operation must never execute on bad data
---

# Defense-in-Depth Validation

## Overview

When you fix a bug caused by invalid data, adding validation at one place feels sufficient. But that single check can be bypassed by different code paths, refactoring, or mocks.

**Core principle:** Validate at EVERY layer data passes through. Make the bug structurally impossible.

Single validation: "We fixed the bug"
Multiple layers: "We made the bug impossible"

## When to Apply This Skill

Apply defense-in-depth validation when:

- A bug was caused by invalid data reaching deep into the execution path
- A value flows through multiple functions, services, or modules before use
- Mocks or test fixtures bypass application-layer validation
- Refactoring risk: a single validation point may not survive future code changes
- A dangerous operation (file deletion, git operations, external API calls) must never execute on bad data

Do NOT add defensive checks inside internal, same-trust-level function calls between modules you own. Validation at every internal call is over-engineering — it creates noise, maintenance burden, and obscures where actual trust boundaries are.

## Two Types of Invalidity

Before choosing where to validate, classify the failure:

**Syntactic invalidity** — the structure or format is wrong:
- Empty string when a value is required
- A number outside an allowed range
- A path that does not exist on disk

**Semantic invalidity** — the structure is valid but the meaning is wrong for this operation:
- A directory that exists but belongs to a different user
- An order being shipped to a restricted country
- A project being initialized inside the source repository

Syntactic checks happen at the boundary (Layer 1). Semantic checks require domain context and belong deeper in the call stack (Layer 2).

## The Six Layers

### Layer 1: Entry Point Validation

Reject syntactically invalid input at the API boundary before it travels anywhere.

```typescript
function createProject(name: string, workingDirectory: string) {
  if (!workingDirectory || workingDirectory.trim() === '') {
    throw new Error('workingDirectory cannot be empty');
  }
  if (!existsSync(workingDirectory)) {
    throw new Error(`workingDirectory does not exist: ${workingDirectory}`);
  }
  if (!statSync(workingDirectory).isDirectory()) {
    throw new Error(`workingDirectory is not a directory: ${workingDirectory}`);
  }
  // ... proceed
}
```

**Allowlist, not denylist.** Define what IS valid and reject everything else. Denylists are trivially bypassed via encoding tricks, alternate representations, and case variations. They also produce false positives — blocking `'` breaks `O'Brian`.

**Canonicalize before validating.** Especially for paths:

```typescript
// WRONG — bypassed by /etc/./passwd or /etc/../etc/passwd
if (input === '/etc/passwd') throw ...

// RIGHT — normalize first, then check
const normalized = path.resolve(input);
if (normalized.startsWith('/etc')) throw ...
```

**Important:** Valid input is not necessarily safe input. A valid email address can carry an XSS payload. A valid URL can carry a SQL injection. Validation confirms shape and structure; it does not prevent exploitation. Use parameterized queries and output encoding for that — those are orthogonal concerns.

**Regex pitfalls:** Always anchor patterns (`^` and `$`) — `/\d{4}/` matches `abc1234def`. Avoid catastrophic backtracking in complex patterns; test with adversarial inputs.

### Layer 2: Business Logic Validation

Validate semantic correctness inside the domain. Does this data make sense for THIS operation in THIS context?

```typescript
function initializeWorkspace(projectDir: string, sessionId: string) {
  if (!projectDir) {
    throw new Error('projectDir required for workspace initialization');
  }
  // Semantic check: project dir must not be inside the agent's own source tree
  if (projectDir.startsWith(SOURCE_ROOT)) {
    throw new Error(`projectDir cannot be inside source: ${projectDir}`);
  }
  // ... proceed
}
```

Domain validation belongs inside the domain object, not only at the application service layer. Putting validation only in services leaks domain knowledge upward and allows domain objects to be constructed in invalid states.

**Use the Execute/CanExecute pattern for domain operations:**

```typescript
class Delivery {
  canDeliver(): { ok: true } | { ok: false; errors: string[] } {
    const errors: string[] = [];
    if (!this.destination) errors.push('destination required');
    if (this.weight > MAX_WEIGHT) errors.push('weight exceeds limit');
    return errors.length ? { ok: false, errors } : { ok: true };
  }

  deliver(): void {
    const check = this.canDeliver();
    if (!check.ok) throw new Error(check.errors.join('; '));
    // ... perform delivery
  }
}
```

`canDeliver` is a query (safe to call, collects all errors). `deliver` enforces the contract internally. This follows Command-Query Separation — callers can check before acting without putting the object into an invalid state.

### Layer 3: Persistence Constraints

Database schema is the last line of defense when application layers fail. It is not a substitute for earlier layers — it is the backstop.

```sql
CREATE TABLE projects (
  id          UUID        PRIMARY KEY,
  name        TEXT        NOT NULL CHECK (length(name) > 0),
  directory   TEXT        NOT NULL,
  owner_id    UUID        NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX projects_directory_idx ON projects (directory);
```

If application code sends a NULL that should never be null, the database will reject it. This surfaces bugs that would otherwise produce silent data corruption.

For ORMs, define constraints at both the schema and model level:

```python
class Project(Base):
    __tablename__ = "projects"
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(Text, nullable=False)
    directory = Column(Text, nullable=False, unique=True)
    owner_id = Column(UUID, ForeignKey("users.id"), nullable=False)

    @validates("name")
    def validate_name(self, key, value):
        if not value or not value.strip():
            raise ValueError("Project name cannot be empty")
        return value
```

### Layer 4: Environment Guards

Prevent dangerous operations in specific runtime contexts — most critically, tests. Tests can bypass ALL upstream validation via mocks, fixtures, and direct instantiation. A guard inside the dangerous operation itself cannot be bypassed regardless of how the operation was invoked.

```typescript
async function gitInit(directory: string) {
  if (process.env.NODE_ENV === 'test') {
    const normalized = normalize(resolve(directory));
    const tmpDir = normalize(resolve(tmpdir()));

    if (!normalized.startsWith(tmpDir)) {
      throw new Error(
        `Refusing git init outside temp dir during tests: ${directory}`
      );
    }
  }
  // ... proceed
}
```

### Layer 5: Test Boundary Guards

Test fixtures must assert their own preconditions before the test body runs. This makes the fixture responsible for its own correctness rather than silently propagating bad state.

```typescript
function createTestProject(dir?: string): Project {
  const projectDir = dir ?? mkdtempSync(join(tmpdir(), 'test-project-'));

  // Assert preconditions before proceeding
  if (!projectDir || projectDir.trim() === '') {
    throw new Error('Test fixture: projectDir cannot be empty');
  }
  if (!projectDir.startsWith(tmpdir())) {
    throw new Error(`Test fixture: projectDir must be in tmpdir, got: ${projectDir}`);
  }

  return Project.create('test-project', projectDir);
}
```

### Layer 6: Debug Instrumentation

Capture context for forensics when other layers fail. Structured logging with the call stack allows you to trace exactly which code path produced a bad value.

```typescript
async function gitInit(directory: string) {
  logger.debug('About to git init', {
    directory,
    cwd: process.cwd(),
    stack: new Error().stack,
  });
  // ... proceed
}
```

This layer does not prevent bugs — it makes them diagnosable in production and staging where you cannot attach a debugger.

## Parse, Don't Validate

The most robust form of defense-in-depth uses the type system to make invalid states unrepresentable. Parse at the boundary; pass a typed object everywhere else.

```typescript
// Instead of passing `string` everywhere and re-validating:
class WorkingDirectory {
  private constructor(public readonly value: string) {}

  static parse(input: string): WorkingDirectory {
    if (!input || input.trim() === '') {
      throw new Error('WorkingDirectory cannot be empty');
    }
    const resolved = resolve(input);
    if (!existsSync(resolved)) {
      throw new Error(`WorkingDirectory does not exist: ${resolved}`);
    }
    if (!statSync(resolved).isDirectory()) {
      throw new Error(`WorkingDirectory is not a directory: ${resolved}`);
    }
    return new WorkingDirectory(resolved);
  }
}

// Downstream functions get Layer 1 for free — no re-checking needed
function initializeWorkspace(dir: WorkingDirectory, sessionId: string) {
  // dir.value is already known valid and canonicalized
}
```

In Python, use dataclasses with `__post_init__` or Pydantic validators:

```python
from pydantic import BaseModel, field_validator
from pathlib import Path

class WorkingDirectory(BaseModel):
    value: Path

    @field_validator("value")
    @classmethod
    def must_be_existing_directory(cls, v: Path) -> Path:
        if not v.exists():
            raise ValueError(f"Directory does not exist: {v}")
        if not v.is_dir():
            raise ValueError(f"Path is not a directory: {v}")
        return v.resolve()

# Now downstream code receives a WorkingDirectory with guaranteed invariants
```

This pattern **complements** (not replaces) the other layers — business logic, environment guards, and DB constraints still apply.

## Assertions vs Runtime Validation

Two complementary checks serve different purposes:

**Assertions** — for programmer errors (contract violations between modules you control):
```python
def calculate_discount(price: float, pct: float) -> float:
    assert price > 0, f"price must be positive: {price}"
    assert 0 <= pct <= 1, f"pct must be in [0, 1]: {pct}"
    return price * (1 - pct)
```
Assertions crash loudly in development so bugs never silently propagate. They may be disabled in production (`python -O`) — use them for invariants you own, not external inputs.

**Runtime validation** — for user/environment errors (external data you don't control):
```python
def handle_discount_request(request_body: dict) -> float:
    price = request_body.get("price")
    pct = request_body.get("discount_pct")
    if price is None or not isinstance(price, (int, float)):
        raise ValidationError("price is required and must be a number")
    if price <= 0:
        raise ValidationError(f"price must be positive, got {price}")
    # ...
```
Runtime validation surfaces actionable error messages to users. It must stay active in production and must never crash the process unexpectedly.

## Collecting vs Failing Fast

**Fail fast** — for single operations: reject and return immediately when validation fails. Do not partially process corrupt data.

```python
# Guard clause pattern: fail fast, clear intent
def process_order(order):
    if order is None:
        raise ValueError("order cannot be None")
    if order.amount <= 0:
        raise ValueError(f"amount must be positive, got {order.amount}")
    # only reach here with valid data
    _do_processing(order)
```

**Collect errors** — for user-facing forms: gather all validation failures before returning so users fix everything at once, not one error at a time.

```typescript
type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

function validateOrder(input: unknown): ValidationResult<Order> {
  const errors: string[] = [];
  if (!input.customerId) errors.push('customerId required');
  if (!input.items?.length) errors.push('order must have at least one item');
  if (input.total <= 0) errors.push('total must be positive');
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: input as Order };
}
```

Use **exceptions** for unexpected failures (programmer errors, infrastructure down).
Use **result objects** for expected validation failures (user input, external data).

## Applying the Pattern

When you find a bug caused by invalid data:

1. **Trace the data flow** — Where does the bad value originate? What is its full path through the system?
2. **Map all checkpoints** — List every function the value passes through
3. **Classify the invalidity** — Syntactic (structure) or semantic (meaning)?
4. **Add validation at each applicable layer** — Entry, business, persistence, environment, test fixture, debug logging
5. **Test each layer independently** — Intentionally bypass Layer 1 and verify Layer 2 still catches it. Verify DB constraints reject invalid rows even when application code sends them.

## Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Single-point validation | One bypass reaches all downstream code | Add checks at each applicable layer |
| IsValid method without enforcement | Requires object to enter invalid state; caller can ignore the check | Use Execute/CanExecute: command enforces its own preconditions |
| Exceptions for expected failures | User sees a generic error, not specific messages | Return result objects, collect all errors |
| Denylist validation | Trivially bypassed via encoding or alternate representations | Allowlist known-valid patterns instead |
| Client-only validation | JavaScript can be disabled or bypassed | Always re-validate on the server |
| No persistence constraints | Silent data corruption when app layers fail | Add NOT NULL, CHECK, UNIQUE constraints |
| Missing environment guards in tests | Dangerous operations run against real state | Guard in the operation itself, not just callers |
| Trusting internal sources | Internal microservices, message queues, and partner APIs also produce bad data | Treat all external data as untrusted regardless of source |
| Validating format as a security control | A valid email can carry XSS; a valid URL can carry SQLi | Use output encoding and parameterized queries for security; validation is a separate concern |
| Over-validating same-trust internal calls | Noise, maintenance burden, obscured trust boundaries | Validate at trust boundaries only — public APIs, service interfaces, and entry points |

## Real-World Example

**Bug:** Empty `projectDir` caused `git init` to run in the source code directory.

**Data flow:**
1. Test setup → empty string (missing fixture initialization)
2. `Project.create(name, '')`
3. `WorkspaceManager.createWorkspace('')`
4. `git init` runs in `process.cwd()` — the source repository

**Six layers added:**
- Layer 1: `Project.create()` validates not empty, exists, is a directory, is writable
- Layer 2: `WorkspaceManager` validates `projectDir` is not empty and not inside source root
- Layer 3: DB schema `NOT NULL` on directory column
- Layer 4: `WorktreeManager` refuses `git init` outside `tmpdir()` when `NODE_ENV=test`
- Layer 5: Test fixture asserts `projectDir` is non-empty and inside `tmpdir()` before returning
- Layer 6: Stack trace logging immediately before `git init`

**Result:** All 1847 tests passed. The bug was structurally impossible to reproduce — each layer independently prevented it.

All six layers were necessary. Different code paths bypassed entry validation. Mocks bypassed business logic checks. Edge cases on different platforms needed environment guards. Without the test fixture guard, missing initialization silently propagated.

**Don't stop at one validation point.** Add checks at every layer.
