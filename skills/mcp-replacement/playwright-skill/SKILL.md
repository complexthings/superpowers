---
name: playwright-skill
description: Use when you need browser automation, web scraping, or end-to-end testing - write custom Playwright code executed via run.js, with full API reference available for complex scenarios
---

# Playwright Browser Automation

## Overview

Playwright skill enables browser automation without MCP overhead. Write custom Playwright code for your specific task, execute via `run.js` which handles module resolution.

**When to use:** Browser automation, web scraping, end-to-end testing, screenshot capture.

## Setup

Install Playwright dependencies (one-time):

```bash
cd skills/playwright-skill/scripts
npm install
npx playwright install
```

This installs Playwright and browser binaries (Chromium, Firefox, WebKit).

## Quick Reference

| Operation | Code Pattern |
|-----------|--------------|
| Navigate | `await page.goto('url')` |
| Click element | `await page.click('selector')` |
| Type text | `await page.fill('selector', 'text')` |
| Get text | `await page.textContent('selector')` |
| Screenshot | `await page.screenshot({ path: 'file.png' })` |
| Wait for element | `await page.waitForSelector('selector')` |
| Execute JS | `await page.evaluate(() => {...})` |

## Usage Pattern

**Three-step workflow:**

1. **Write** custom Playwright script for your task
2. **Execute** via run.js
3. **Review** console output and screenshots

**Example script:**

```javascript
// scrape-price.js
import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({
    headless: false,  // Visible browser for debugging
    slowMo: 100       // Slow motion for observation
  });

  const page = await browser.newPage();

  await page.goto('https://example.com/product');
  await page.click('button:has-text("Show variants")');

  const price = await page.textContent('.price-value');
  console.log('Price:', price);

  await page.screenshot({ path: 'product.png' });

  await browser.close();
})();
```

**Execute:**

```bash
node skills/playwright-skill/scripts/run.js ./scrape-price.js
```

## When to Load Full API Reference

Load `@skills/playwright-skill/references/API_REFERENCE.md` when you need:
- Complex selectors (XPath, text matching, chaining)
- Advanced interactions (drag-drop, keyboard, mouse)
- Network interception or request mocking
- Multiple contexts or browser instances
- Video recording or trace collection
- Authentication flows

For simple automation (navigate, click, type, screenshot), this SKILL.md is sufficient.

## Common Mistakes

**Module resolution errors**
- Error: "Cannot find module '@playwright/test'"
- Fix: Use run.js executor, don't run scripts directly with `node`
- Correct: `node skills/playwright-skill/scripts/run.js ./script.js`
- Wrong: `node ./script.js`

**Timeout issues**
- Error: "Timeout waiting for selector"
- Fix: Increase timeout or wait for network idle
- Example: `await page.waitForSelector('.element', { timeout: 10000 })`

**Selector not found**
- Error: "Selector resolved to null"
- Fix: Inspect page, verify selector is correct
- Tip: Use `await page.pause()` to debug interactively

**Headless failures**
- Issue: Script works in visible browser but fails headless
- Fix: Remove `headless: false` only when automation is stable
- Debug: Always develop with `headless: false` first

## Defaults for Development

**Recommended browser config:**

```javascript
const browser = await chromium.launch({
  headless: false,  // Watch automation run
  slowMo: 100       // Slow enough to observe
});
```

Remove `slowMo` and set `headless: true` only when automation is proven stable.

## Red Flags - STOP

If you find yourself thinking:
- "Selectors are too hard, copy manually" → API_REFERENCE.md has advanced selectors
- "Authentication is too complex" → API_REFERENCE.md has auth patterns
- "No time to load reference docs" → 30 seconds to load saves 20 minutes of guessing
- "Trial and error is faster" → Systematic approach with docs is always faster

**All of these mean: Load API_REFERENCE.md and follow proven patterns.**

## When You're Stuck

| Problem | Wrong Response | Right Response |
|---------|----------------|----------------|
| Selector not working | Guess random selectors | Load API_REFERENCE.md, use text/XPath |
| Auth required | Try to bypass | Load API_REFERENCE.md, implement login flow |
| Dynamic content | Give up on automation | Use `waitForSelector` with proper timeout |
| Script fails headless | Assume it's impossible | Debug with `headless: false` first |

## When NOT to Use

- **Simple HTTP requests** - Use fetch/axios instead
- **API testing** - Use HTTP client, not browser
- **Static page scraping** - Use fetch + cheerio for better performance
- **Already have Playwright scripts** - Just use them, no need for this skill
