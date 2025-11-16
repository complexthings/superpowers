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
