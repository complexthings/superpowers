# Superpowers Agent — Retired

**This project is retired.** It receives no further updates, fixes, or support.

Use **[`npx skills`](https://skills.sh)** instead. It is the maintained way to find, install, and
manage agent skills, and it works across Claude Code, GitHub Copilot, OpenCode, Codex, and Pi.

```bash
npx skills
```

v11.0.0 is the final release. It installs nothing. Every command it still exposes exists to take
Superpowers back off your machine.

---

## What v11.0.0 removes automatically

Running either command performs the same cleanup pass:

```bash
superpowers-agent bootstrap
# or
superpowers-agent update
```

The pass removes:

1. The Superpowers `SessionStart` hook entry in `~/.claude/settings.json` (every other hook is preserved).
2. The Copilot session hook at `~/.copilot/hooks/superpowers.json`.
3. The OpenCode plugin at `~/.config/opencode/plugins/superpowers-agent.js`.
4. Every package-owned skill symlink under `~/.agents/skills`, `~/.claude/skills`, `~/.copilot/skills`,
   `~/.config/opencode/skill`, and the project-local `.claude/skills`, `.copilot/skills`, `.opencode/skill`.
5. The `~/.local/bin/superpowers` and `~/.local/bin/superpowers-agent` shims, and the managed region of
   `~/.agents/AGENTS.md`, which is rewritten to a short retirement note.

Symlinks are deleted outright. Real files are moved to the backup directory first. A failure on one
artifact is reported and skipped — the pass never aborts halfway.

### Retirement Backup Directory

```
~/.agents/retirement-backup-<YYYY-MM-DD>/
```

`<YYYY-MM-DD>` is the date the cleanup ran. `~/.claude/settings.json` is the one exception: it is
edited in place, and its copy is written beside it as `~/.claude/settings.json.backup-<YYYY-MM-DD>`.

## How to restore from the backup

The cleanup summary prints an exact `cp` line for every file it backed up. Run those lines to undo it.
The general form:

```bash
cp ~/.agents/retirement-backup-2026-09-05/<filename> <original path>
cp ~/.claude/settings.json.backup-2026-09-05 ~/.claude/settings.json
```

Skill symlinks are not backed up — they are recreated by whatever tool you use next, or by hand.

## Removing everything by hand

Use this if the automated pass fails or you never want to run the CLI again.

```bash
# 1. Claude session hook — edit the file and delete the hooks.SessionStart entry
#    whose command contains "superpowers-agent session-context".
$EDITOR ~/.claude/settings.json

# 2. Copilot session hook
rm -f ~/.copilot/hooks/superpowers.json

# 3. OpenCode plugin
rm -f ~/.config/opencode/plugins/superpowers-agent.js

# 4. Skill symlinks — remove only links pointing into a superpowers checkout
for d in ~/.agents/skills ~/.claude/skills ~/.copilot/skills ~/.config/opencode/skill \
         ./.claude/skills ./.copilot/skills ./.opencode/skill; do
  [ -d "$d" ] || continue
  for l in "$d"/*; do
    [ -L "$l" ] && case "$(readlink "$l")" in *superpowers*) rm -f "$l";; esac
  done
done

# 5. Shims
rm -f ~/.local/bin/superpowers ~/.local/bin/superpowers-agent

# 6. Managed instructions in ~/.agents/AGENTS.md — delete the block between
#    <!-- SUPERPOWERS_SKILLS_START --> and <!-- SUPERPOWERS_SKILLS_END -->
$EDITOR ~/.agents/AGENTS.md
```

### The Copilot instructions block cleanup does not touch

Cleanup deliberately leaves your project's `.github/copilot-instructions.md` alone, because that file
is checked into your repository and is yours to edit. Remove the block yourself, including both
markers:

```
<!-- SUPERPOWERS_-_INSTRUCTIONS_START -->
...
<!-- SUPERPOWERS_-_INSTRUCTIONS_END -->
```

## Uninstalling the package

Run the cleanup first, then remove the global package with the manager you installed it with:

```bash
npm uninstall -g @complexthings/superpowers-agent
pnpm remove -g @complexthings/superpowers-agent
yarn global remove @complexthings/superpowers-agent
bun remove -g @complexthings/superpowers-agent
deno uninstall -g superpowers-agent
```

## Credits

Superpowers began as [Jesse Vincent's Superpowers for Claude Code](https://github.com/obra/superpowers),
introduced in [this blog post](https://blog.fsck.com/2025/10/09/superpowers/). This fork extended that
idea to other agent harnesses. Thanks to everyone who used it, filed issues, and sent patches.

Skills live on at **[https://skills.sh](https://skills.sh)**.
