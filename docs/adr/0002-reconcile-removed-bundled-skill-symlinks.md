# Reconcile removed bundled skill symlinks during upgrades

## Context

Bundled skills can be removed while their repo-managed symlinks remain in `~/.agents/skills`, leaving removed skills exposed after an upgrade.

## Decision

`bootstrap` and `update` will actively delete obsolete repo-managed skill symlinks when their bundled skills are removed.

## Consequences

Upgrades immediately stop exposing removed bundled skills. These commands take responsibility for reconciling the repo-managed symlinks they created.
