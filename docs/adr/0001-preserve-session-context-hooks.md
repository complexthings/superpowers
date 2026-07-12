# Preserve session-context hooks with the CLI-tool nudge

## Context

Session-context hooks currently depend on the deleted `using-superpowers` skill while also delivering the `leveraging-cli-tools` nudge.

## Decision

Preserve session-context hooks, remove their dependency on `using-superpowers`, and retain only the `leveraging-cli-tools` nudge.

## Consequences

Supported platforms keep receiving the CLI-tool guidance at session start. The hooks no longer inject or depend on the deleted skill.
