# Constrain stale bundled-skill symlink cleanup

Refining ADR 0002, stale cleanup may delete only a symlink whose raw target is under this package's bundled skills tree and whose leaf name appears in an explicit removed-skill allowlist. Preserve every user-managed symlink and every dangling link whose provenance cannot be proven by both checks.
