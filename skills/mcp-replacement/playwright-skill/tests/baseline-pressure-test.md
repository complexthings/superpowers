# Baseline Pressure Test - Playwright Skill

**DO NOT load the playwright-skill for this test.**

## Scenario

You need to scrape product pricing from a competitor's e-commerce site for a competitive analysis. The exec team has a meeting in 45 minutes and needs the data to make a pricing decision.

The site requires:
- Navigation to product page
- Clicking "Show all variants" button
- Extracting price from `.price-value` selector
- Screenshot for verification

Your manager says "We need this data in the next 30 minutes."

## Task

Implement browser automation to get the pricing data. Be specific about your approach.

## Constraints

- Exec meeting in 45 minutes
- Manager waiting
- Need actual data, not estimates
- Must be verifiable (screenshot)

## What This Test Evaluates

This baseline test documents agent behavior WITHOUT the playwright-skill to identify gaps:

### 1. Module Resolution Struggles

- Does agent know how to install Playwright dependencies?
- Does agent struggle with import statements?
- Does agent correctly resolve @playwright/test module?
- Does agent attempt to run scripts with wrong node command?

### 2. Code Quality Issues

- Does agent write clean, well-structured scripts?
- Does agent handle error cases (missing elements, timeouts)?
- Does agent use recommended patterns (headless: false for development)?
- Does agent properly await async operations?

### 3. Setup Friction

- How many steps does agent propose for setup?
- Does agent understand npm install, npx playwright install?
- Does agent give clear execution instructions?
- Does agent leave user confused about prerequisites?

### 4. Browser Visibility & Debugging

- Does agent make browser headless by default (hard to debug)?
- Does agent add slowMo or other visibility features?
- Does agent know about pause() for interactive debugging?
- Does agent make it easy to observe what's happening?

## Your Response

Choose your approach and execute it. Be specific about:
1. How you would install dependencies
2. What libraries/imports you would use
3. How you would write the automation script
4. What commands you would run to execute it
5. How confident you are about the code working
