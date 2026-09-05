# AGENTS.md

## Project

Superpowers Agent is an npm-published CLI for installing reusable agent skills and integrations. Its CLI source is in `.agents/src/`; bundled skills are in `skills/`.

## Development

Run these from `.agents/`:

```bash
bun test
bun run build
bun run dev
```

`bun run build` writes the distributable CLI to `.agents/superpowers-agent`. The project is ESM and has no runtime dependencies; Bun is the development toolchain.

## Change boundaries

- Keep `package.json` and `.agents/package.json` versions aligned. The pre-commit hook reconciles a mismatch, refreshes lockfiles, rebuilds the CLI, and stages the affected files.
- Use terms from `CONTEXT.md`: **session-context hook**, **CLI-tool nudge**, and **repo-managed skill symlink**.

## Conditional guidance

- For issue work, read `docs/agents/issue-tracker.md`; it governs the GitHub issue workflow and excludes external PRs from triage.
- Before applying triage labels, read `docs/agents/triage-labels.md`; it maps canonical roles to this repository’s labels and identifies labels that may need creating.
- Before work that depends on domain decisions, read `docs/agents/domain.md`; it governs the lazy `CONTEXT.md`/ADR layout and conflict handling.
