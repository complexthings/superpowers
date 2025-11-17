---
name: context-7
description: Use when you need to find library documentation or code examples - searches Context-7 API for relevant documentation with minimal context overhead, replacing MCP integration
---

# Context-7 Documentation Search

## Overview

Context-7 provides library documentation search without loading full MCP context. Uses local Node.js scripts to search for libraries and fetch documentation, reducing context usage by ~98%.

**When to use:** Finding library documentation, code examples, or API references during development or debugging.

## Setup

1. Get API key from https://context7.com
2. Set environment variable:

```bash
export CONTEXT7_API_KEY="your-api-key"
```

Or create `.env` file in project root:
```
CONTEXT7_API_KEY=your-api-key
```

## Quick Reference

| Operation | Command | Use When |
|-----------|---------|----------|
| Search libraries | `node skills/context-7/scripts/search.js "query"` | Finding which library to use |
| Get documentation | `node skills/context-7/scripts/get-docs.js /library/path` | Getting specific docs |
| Get docs with topic | `node skills/context-7/scripts/get-docs.js /library --topic=feature` | Filtering to specific feature |
| Limit tokens | `node skills/context-7/scripts/get-docs.js /library --tokens=3000` | Reducing response size |

## Usage Pattern

**Two-step workflow:**

1. **Search** - Find the library you need
2. **Get docs** - Fetch specific documentation

**Example:**

```bash
# Step 1: Search for React Hook Form
node skills/context-7/scripts/search.js "react hook form"

# Output shows library ID: /react-hook-form/documentation

# Step 2: Get documentation about validation
node skills/context-7/scripts/get-docs.js /react-hook-form/documentation --topic=validation --tokens=5000
```

## Common Mistakes

**Missing API key**
- Error: "CONTEXT7_API_KEY environment variable not set"
- Fix: Set environment variable or create .env file

**Rate limiting**
- Error: "Rate limit exceeded"
- Fix: Wait before retrying, reduce token limits

**Library not found**
- Error: "Library not found"
- Fix: Use search.js first to find correct library ID

**Malformed library path**
- Issue: Library path must start with /
- Example: `/react-hook-form/documentation` not `react-hook-form`

## When NOT to Use

- **General web search** - Use browser or web search instead
- **Non-library documentation** - Use official docs directly
- **Custom/private code** - No documentation available via Context-7

## Red Flags - STOP

If you find yourself thinking:
- "API key setup will take too long" → Setup takes 30 seconds, worth it
- "Skip docs and guess to save time" → Guessing wastes more time on wrong solution
- "Rate limit means I can't use this" → Wait 60 seconds, tool is designed for this
- "This is an emergency, skip the tool" → Emergencies need CORRECT fixes, not fast wrong fixes

**All of these mean: Follow the tool workflow anyway.**

## Error Recovery

| Error | Wrong Response | Right Response |
|-------|----------------|----------------|
| Missing API key | Skip tool | Ask user, 30 second setup |
| Rate limit | Give up | Wait 60s, retry with backoff |
| Library not found | Assume docs don't exist | Try different search query |
| Network error | Assume API is down | Retry with exponential backoff |
