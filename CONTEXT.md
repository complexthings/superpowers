# Superpowers Agent

Superpowers Agent distributes reusable skills and supplies guidance to supported AI-agent platforms.

## Language

**Session-context hook**:
A platform session-start hook that supplies Superpowers guidance to an agent session.
_Avoid_: startup prompt, session hook

**CLI-tool nudge**:
The session-context guidance that directs agents to load the `leveraging-cli-tools` skill before relevant command-line work.

**Repo-managed skill symlink**:
A symlink in `~/.agents/skills` that Superpowers Agent creates for a bundled skill; it becomes obsolete when that bundled skill is removed.
_Avoid_: user-managed skill symlink
