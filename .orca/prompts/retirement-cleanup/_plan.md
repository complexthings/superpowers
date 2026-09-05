# retirement-cleanup

## Goal

Ship `@complexthings/superpowers-agent` v11.0.0 as a retirement release: it removes every artifact
earlier versions installed on a user's machine, points users at `https://skills.sh` and `npx skills`,
and stops shipping bundled skills, harness hooks, and the skill-management command surface.

## Scope of Work

Superpowers Agent is being pseudo-retired. `npx skills` replaces it for skill installation. The last
release must leave a user's machine clean rather than littered with symlinks and session-start hooks
pointing at code that no longer exists.

### Command surface

Ten commands are removed from `superpowers-agent`: `setup-skills`, `config-get`, `config-set`,
`session-context`, `add`, `add-repository`, `list-repositories`, `pull`, `rm`, and `install-aliases`.
`install-aliases` joins the list because Retirement Cleanup deletes the `~/.local/bin` shims it
creates; keeping an installer for something the same binary removes is incoherent.

The surviving surface is `bootstrap`, `update`, `check-updates`, `version`, and the default help
output. Every invocation prints a short retirement banner naming `https://skills.sh` before doing its
work.

### Retirement Cleanup

`bootstrap` becomes a pure cleanup command: it installs nothing, runs Retirement Cleanup, prints the
retirement notice, and exits. `update` runs the same Retirement Cleanup routine and then prints its
existing "an update is available" output. One shared routine, two callers.

Retirement Cleanup removes, from the user's machine:

- The `superpowers-agent session-context` SessionStart entry in `~/.claude/settings.json`, matched by
  the existing `HOOK_COMMAND_MARKER` substring so unrelated hooks survive.
- The Copilot `sessionStart` hook under `~/.copilot/hooks` (honouring `COPILOT_HOME`).
- The OpenCode plugin symlink at `~/.config/opencode/plugins/superpowers-agent.js`.
- Package-owned skill symlinks in `~/.agents/skills`, `~/.claude/skills`, `~/.copilot/skills`,
  `~/.config/opencode/skill`, and the project-level `.claude/skills`, `.copilot/skills`,
  `.opencode/skill` directories. Ownership is proven from the raw symlink target, the same test the
  existing stale-skill-symlink cleaner uses; a link the user made themselves is never touched.
- The `~/.local/bin/superpowers` and `~/.local/bin/superpowers-agent` shims. This is safe for npm
  installs, which already prune those links so npm's own shim wins.

Retirement Cleanup rewrites the Superpowers-managed region of `~/.agents/AGENTS.md` into a two-line
retirement note. Content the user added outside that region stays.

It does not touch a project's `.github/copilot-instructions.md`. The marker-delimited block there is
documented for manual removal in the README instead.

### Reversibility

Every deleted real file is moved into a Retirement Backup Directory, `~/.agents/retirement-backup-<date>/`,
rather than unlinked. Symlinks are not backed up, since recreating one is trivial and their targets
are being deleted anyway. Cleanup prints the backup path and a one-line restore command. A failure on
any single artifact is non-fatal: it is reported and the routine continues, so a partial failure never
leaves the run half-aborted.

### Repository removals

The bundled `skills/` directory is deleted, along with `.agents/templates/` and `.agents/docs/`, which
only existed to feed the platform-file generation `bootstrap` no longer does. Every module orphaned by
the command removals goes with them: `src/skills/` (installer, finder, locator, parser, executor),
`src/agents/`, `src/core/config.js`, `src/commands/simple-commands.js`,
`src/integrations/session-context.js`, and the tests covering them. `package.json`'s `files[]` is
trimmed to what actually ships.

### Documentation and release

The README is rewritten as a retirement notice: the project is retired and will receive no further
updates or support, `npx skills` and `https://skills.sh` are the replacement, here is what the last
release removes automatically, here is how to remove each artifact by hand if the automated pass
fails, and here is how to uninstall the package itself.

ADR 0008 records the retirement and supersedes ADR 0001, which decided to preserve the session-context
hooks. `CONTEXT.md` retires the terms **session-context hook**, **CLI-tool nudge**, and **repo-managed
skill symlink**, and introduces **Retirement Cleanup** and **Retirement Backup Directory**; `AGENTS.md`
and `CLAUDE.md` are updated to match.

Both `package.json` files move to `11.0.0` — a major bump, because ten commands disappear. `husky` is
bumped within `^9`, `npm audit` is run, and the `engines` range is confirmed. The committed
`.agents/superpowers-agent` bundle is rebuilt.

`npm deprecate` is run by hand by the maintainer after publish; it needs npm credentials an agent
cannot verify. Item 05 documents the exact command rather than running it.

## Assumed, not asked

Nothing. Every decision in this plan was put to the user and answered.

## Orchestration Rules

<!-- rendered by scripts/render_rules.py -->

## Work Items

### 01-cleanup-routine: Shared Retirement Cleanup routine

Add one module that performs Retirement Cleanup, plus its tests. Nothing calls it yet — item 02 wires
it into `bootstrap` and `update`.

The routine moves real files into the Retirement Backup Directory `~/.agents/retirement-backup-<date>/`
before deleting them, removes symlinks outright, and reports each artifact it handled. Any single
failure is logged and skipped, never fatal. It returns a structured summary the callers print.

Artifacts it handles: the `superpowers-agent session-context` SessionStart entry in
`~/.claude/settings.json` (matched by `HOOK_COMMAND_MARKER`, other hooks preserved, the existing
settings backup behavior reused); the Copilot `sessionStart` hook under `~/.copilot/hooks`, honouring
`COPILOT_HOME`; the OpenCode plugin symlink `~/.config/opencode/plugins/superpowers-agent.js`;
package-owned skill symlinks in `~/.agents/skills`, `~/.claude/skills`, `~/.copilot/skills`,
`~/.config/opencode/skill` and the project-level `.claude/skills`, `.copilot/skills`, `.opencode/skill`,
ownership proven from the raw target exactly as the current stale-skill-symlink cleaner does; the
`~/.local/bin/superpowers` and `~/.local/bin/superpowers-agent` shims; and the Superpowers-managed
region of `~/.agents/AGENTS.md`, rewritten to a two-line retirement note pointing at
`https://skills.sh`, with the user's own content left intact.

It must not touch any `.github/copilot-instructions.md`, and must never remove a symlink whose target
does not prove package ownership.

Tests cover, against temp directories: a settings file keeping unrelated hooks, a user-authored
symlink surviving, a package-owned symlink removed, a real file landing in the backup directory, and
one failing artifact not aborting the run.

**Phase**: 1

### 02-cli-surface: Trim the command surface and wire cleanup in

Remove ten commands from `.agents/src/cli.js` and its help output: `setup-skills`, `config-get`,
`config-set`, `session-context`, `add`, `add-repository`, `list-repositories`, `pull`, `rm`,
`install-aliases`. The surviving commands are `bootstrap`, `update`, `check-updates`, `version`, and
the default help.

Rewrite `runBootstrap` as a pure cleanup command: print the retirement banner, run item 01's
Retirement Cleanup, print its summary and the backup path with the restore command, print the
`npx skills` pointer, exit. It installs nothing — no aliases, no hooks, no skill symlinks, no platform
file generation, no auto-update check block.

Make `runUpdate` call the same Retirement Cleanup routine before its existing update-availability
output, and drop the `superpowers-agent setup-skills` suggestion from that output.

Add the retirement banner to every command invocation: one short line naming the retirement and
`https://skills.sh`.

Delete every module the removals orphan: `src/skills/` (installer, finder, locator, parser, executor),
`src/agents/` (installer, platforms), `src/core/config.js`, `src/commands/simple-commands.js`,
`src/integrations/session-context.js`, and any now-unused helper in `src/utils/` or
`src/integrations/`. Verify each has no remaining importer before deleting it. Delete the tests that
covered them.

Extend `.agents/tests/retired-cli-commands.test.js` to assert all ten removed commands are absent from
the built CLI, and keep `bun test` green.

**Phase**: 2

### 03-remove-bundled-assets: Delete bundled skills, templates and docs

Delete the repository's `skills/` directory, `.agents/templates/`, and `.agents/docs/`.

Trim `package.json`'s `files[]` to what actually ships after this workstream: `.agents/superpowers-agent`,
`.agents/superpowers-bootstrap.md`, `.github`, `AGENTS.md`, `README.md`, `LICENSE`. The entries
`.agents/skills`, `.agents/prompts` and `.agents/plans` name directories that do not exist and go too,
along with `skills`, `.agents/templates` and `.agents/docs`.

Delete `.agents/tests/bundled-skills.test.js`, which asserts the presence of bundled skill directories
this item removes, and any other test that reads `skills/`. Keep `bun test` green.

**Phase**: 3

### 04-readme-retirement: Rewrite README.md as a retirement notice

Rewrite `README.md` top to bottom. Remove every reference to the removed commands, bundled skills, and
harness integrations.

Lead with the retirement notice: this project is retired, it will receive no further updates or
support, and `npx skills` with `https://skills.sh` is the replacement for managing skills.

Document, in order: what v11.0.0 removes automatically when `superpowers-agent bootstrap` or
`superpowers-agent update` runs, and where the Retirement Backup Directory is written; how to restore
from that backup; how to remove each artifact by hand if the automated pass fails, naming exact paths —
the `~/.claude/settings.json` SessionStart entry, `~/.copilot/hooks`,
`~/.config/opencode/plugins/superpowers-agent.js`, the skill symlinks in `~/.agents/skills`,
`~/.claude/skills`, `~/.copilot/skills`, `~/.config/opencode/skill`, the `~/.local/bin` shims,
`~/.agents/AGENTS.md`, and the `<!-- SUPERPOWERS_-_INSTRUCTIONS_START -->` to
`<!-- SUPERPOWERS_-_INSTRUCTIONS_END -->` block in a project's `.github/copilot-instructions.md`, which
cleanup deliberately does not touch; and how to uninstall the package itself for npm, pnpm, yarn, bun
and deno, mirroring the `PM_INSTALL` map in `src/commands/update.js`.

**Phase**: 3

### 05-adr-context-deps-version: ADR, glossary, dependencies and version

Write `docs/adr/0008-retire-superpowers-agent.md` recording the retirement: the move to `npx skills`,
the removal of the harness hooks and bundled skills, and cleanup running from `bootstrap` and `update`.
Mark `docs/adr/0001-preserve-session-context-hooks.md` as superseded by 0008.

Update `CONTEXT.md`: mark **session-context hook**, **CLI-tool nudge**, and **repo-managed skill
symlink** as retired, and add **Retirement Cleanup** (the removal routine `bootstrap` and `update`
share) and **Retirement Backup Directory**. Update `AGENTS.md` and `CLAUDE.md` so their terminology
rule and architecture notes match the post-removal codebase.

Set both `package.json` and `.agents/package.json` to `11.0.0`. Bump `husky` to the latest `^9`, run
`npm audit`, and confirm the `engines` range `^22 || ^24 || ^26` is still correct. Rebuild the
committed CLI with `bun run build` from `.agents/`.

Document the maintainer's post-publish step in the README release notes rather than running it:
`npm deprecate @complexthings/superpowers-agent "Retired — use npx skills instead: https://skills.sh"`.

**Phase**: 4
