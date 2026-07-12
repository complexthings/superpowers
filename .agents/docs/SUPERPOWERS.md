# SUPERPOWERS Reference Guide

You are an autonomous agent with access to the `superpowers-agent` system.

> Loaded at conversation start. `AGENTS.md` is the primary reference; this guide is the detailed supplement.

---

## Installation

If `superpowers-agent` is not available, install it: `npm install -g @complexthings/superpowers-agent`

---

## Version Check

Periodically, e.g. once per day check the version of superpowers-agent:
1. **CURRENT_VERSION** — run a `superpowers-agent version` command and extract `X.Y.Z` from the `X.Y.Z` string in its output.
2. **NPM_LATEST_VERSION** — run `npm view @complexthings/superpowers-agent version`.
3. Compare by **semver precedence, not string comparison** (e.g. `9.10.0` > `9.9.0`). If NPM_LATEST_VERSION is newer, tell the user — do not run these yourself:
   > Your superpowers-agent has updates (`CURRENT_VERSION` → `NPM_LATEST_VERSION`). Run:
   > ```sh
   > npm install -g @complexthings/superpowers-agent
   > superpowers-agent bootstrap && superpowers-agent setup-skills
   > ```
   If versions match, or either lookup fails (e.g. no network), continue silently.

---

## Skill Loading Rules

- Load skills **JIT only** — never preload to "understand" them.
- Follow skill instructions **exactly as written** — no skimming, no shortcuts.
- If a skill has a checklist, create a todo for **each item** — no mental tracking.
- Simple tasks benefit from skills as much as complex ones.

**Skill priority (highest to lowest):** Project → Personal → Superpowers