---
name: leveraging-cli-tools
description: Use when performing code searches, JSON parsing, file viewing, or file finding tasks - ensures agents verify and use high-performance CLI tools (rg, jq, fd, bat, ast-grep) instead of slower standard tools, reducing token costs and latency by 5-50x
---

# Leveraging CLI Tools

## Core Principle

**High-performance CLI tools reduce costs, latency, and cognitive load by 5-50x.**

Modern tools have massive RL optimization in frontier models - use them.

## Tool Availability Protocol

**Session start (silent check, cache result):**

```bash
command -v rg jq fd bat gh >/dev/null 2>&1 && echo "ready" || echo "missing"
```

**If tools missing:** Offer installation when relevant task appears.
**If tools ready:** Use optimal workflows throughout session.

## Tool Selection

| Task | Use | Instead of | Speedup |
|------|-----|-----------|---------|
| Search code | **rg** | grep | 10-50x |
| Parse JSON | **jq** | awk/sed | 5-20x |
| Find files | **fd** | find | 5-10x |
| View code | **bat** | cat | Better UX |
| Transform code | **ast-grep** | sed | 3-10x |
| GitHub ops | **gh** | curl+API | 2-5x |
| Interactive select | **fzf** | manual | 10-100x |

## Quick Reference

### Code Search: rg
```bash
rg "AuthError" --type typescript  # 10-50x faster than grep, respects .gitignore
```

### JSON Parse: jq
```bash
jq '.results[] | select(.status=="error") | .error.code' api.json | sort -u
```

### Find Files: fd
```bash
fd "\.test\.ts$"  # 5-10x faster than find, parallel traversal
```

### View Code: bat
```bash
bat src/auth.ts  # Syntax highlighting, Git integration, line numbers
```

### Code Transform: ast-grep
```bash
sg --pattern 'console.log($$$ARGS)' --rewrite 'logger.debug($$$ARGS)'
```

## Installation Protocol

**If tool missing when needed:**

1. Explain impact: "Using rg is 10-50x faster, reducing token costs"
2. Install automatically for core tools (rg, jq, fd, bat, gh): `brew install ripgrep jq fd bat gh` (macOS) or equivalent
3. Ask before installing: ast-grep, httpie, fzf

**No exceptions:** If tool unavailable and user declines install, explain performance cost but use fallback.

## Key Workflows

### Filter Before Reading
```bash
# DON'T: Read all files blindly
# DO: Filter first, read matches only
rg "password.*hash" src/auth/ --type ts -l | xargs bat
```

Under fatigue: filtering first reduces cognitive load.

### Compose Tools
```bash
rg "error.code" logs/ -o | jq -r . | sort -u  # Search + parse + dedup
```

## Performance Impact

| Task | grep/find/cat | rg/fd/bat | Savings |
|------|---------------|-----------|---------|
| Search 50k files | 45s | 0.8s | 56x, ~40k tokens |
| Parse 10MB JSON | 12s (awk) | 2s (jq) | 6x, ~15k tokens |
| Find in monorepo | 8s | 1s | 8x, ~10k tokens |

## Red Flags

- Manually parsing JSON with awk/sed/grep (use jq)
- Reading files without filtering first (use rg to filter)
- Not checking tool availability at session start
- Using bash grep when Grep tool exists (use Grep tool)

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "grep works fine" | 50x slower, burns 40k tokens on 50k files |
| "I don't know if they have jq" | Check once, install takes 30s, saves hours |
| "Not worth setup overhead" | One install = 10-100x speedup on ALL future tasks |
| "User didn't ask for optimization" | Faster task completion IS better completion |

## When NOT to Use

**Skip when:**
- Small dataset (< 100 files, < 1MB) AND one-off task
- User explicitly declines install
- Teaching context where standard tools are the goal

**Use when:**
- Codebase search (always)
- JSON operations (always)
- Time pressure, large datasets, repeated operations

## Summary

**Protocol: Check → Use → Combine**

Session start: Silent availability check. Task appears: Use optimal tool or install. Complex tasks: Compose tools.

**Not using available tools burns resources.**
