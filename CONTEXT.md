# Superpowers Agent

Superpowers Agent is retired. It distributed reusable skills and supplied guidance to supported
AI-agent platforms; it now only removes what earlier versions installed. See
[ADR 0008](docs/adr/0008-retire-superpowers-agent.md).

## Language

**Session-context hook** (retired):
A platform session-start hook that supplied Superpowers guidance to an agent session. Retirement
Cleanup removes it; no version installs one.
_Avoid_: startup prompt, session hook

**CLI-tool nudge** (retired):
The session-context guidance that directed agents to load the `leveraging-cli-tools` skill before
relevant command-line work. Retired with the session-context hook that carried it.

**Repo-managed skill symlink** (retired):
A symlink in `~/.agents/skills` that Superpowers Agent created for a bundled skill. No skills are
bundled; Retirement Cleanup removes every remaining link.
_Avoid_: user-managed skill symlink

**Retirement Cleanup**:
The single removal routine that `bootstrap` and `update` both run. It removes every artifact this
package ever installed, backing real files up first and reporting-and-skipping any artifact it
cannot remove.
_Avoid_: uninstall, teardown

**Retirement Backup Directory**:
`~/.agents/retirement-backup-<YYYY-MM-DD>/`, where Retirement Cleanup moves real files before they
leave their install site. `~/.claude/settings.json` is the exception: it is edited in place and
copied beside itself as `settings.json.backup-<YYYY-MM-DD>`.
_Avoid_: backup folder
