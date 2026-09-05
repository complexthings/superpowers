# Run Order: `retirement-cleanup`

## Goal

Ship `@complexthings/superpowers-agent` v11.0.0 as a retirement release: it removes every artifact
earlier versions installed on a user's machine, points users at `https://skills.sh` and `npx skills`,
and stops shipping bundled skills, harness hooks, and the skill-management command surface.

Target branch: `main`.

## Phases

### Phase 1

| Prompt | Issue | Status |
| --- | --- | --- |
| `01-cleanup-routine.prompt.md` | — | Merged |

### Phase 2

| Prompt | Issue | Status |
| --- | --- | --- |
| `02-cli-surface.prompt.md` | — | Merged |

### Phase 3

| Prompt | Issue | Status |
| --- | --- | --- |
| `03-remove-bundled-assets.prompt.md` | — | Merged |
| `04-readme-retirement.prompt.md` | — | Merged |

### Phase 4

| Prompt | Issue | Status |
| --- | --- | --- |
| `05-adr-context-deps-version.prompt.md` | — | Merged |

## Status vocabulary

`Not started` → `Dispatched` → `PR open` → `Merged`.

Completed prompt files move into `_completed/`.
