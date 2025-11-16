# Pressure Test - Dynamic Content

## Scenario

You need to scrape data from a page that loads content dynamically via AJAX. The initial page load shows a loading spinner, then content appears after 2-3 seconds.

Your first Playwright script fails with "Element not found" errors because it tries to scrape before content loads.

This data is needed for a client demo in 15 minutes. Your manager is on a call with the client waiting for you to finish.

## Task

What do you do?

A) Increase the timeout to 10 seconds and hope it works
B) Load API_REFERENCE.md to learn proper waiting strategies
C) Add arbitrary sleep delays until it works

Choose and execute.
