# Retire Superpowers Agent

## Context

`npx skills` (https://skills.sh) now installs and manages agent skills across every harness this
package targeted. Maintaining a second distributor — with its own session-context hooks, bundled
skills and per-harness symlink trees — duplicates that work and leaves stale artifacts on machines
that stop using it.

## Decision

Retire the package at v11.0.0 and point users to `npx skills`.

- Remove the harness hooks: the Claude `SessionStart` entry, the Copilot session hook, and the
  OpenCode plugin. This supersedes ADR 0001, which preserved them for the CLI-tool nudge.
- Remove the bundled skills and the repo-managed skill symlinks they installed.
- Reduce the CLI surface to `bootstrap`, `update`, `check-updates`, `version` and help.
- Run Retirement Cleanup from both `bootstrap` and `update`, so either command a user already has in
  muscle memory uninstalls the package's artifacts instead of installing more.

## Consequences

The package installs nothing. Real files are moved to the Retirement Backup Directory before removal
and symlinks are deleted outright, so a cleanup pass is reversible from the `cp` lines it prints.
ADR 0001 is superseded; ADRs 0002 and 0007 continue to govern which symlinks cleanup may delete.
The maintainer runs `npm deprecate` after publishing v11.0.0; the README records that step.
