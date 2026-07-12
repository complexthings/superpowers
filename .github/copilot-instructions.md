<!-- SUPERPOWERS_-_INSTRUCTIONS_START -->
# Superpowers Skills

[superpowers-agent Docs](../.agents/docs/SUPERPOWERS.md)

Use your platform's native skill tool to discover and load installed skills relevant to the task. If no native tool is available, inspect the configured skill directories and read the needed `SKILL.md` file.
<!-- SUPERPOWERS_-_INSTRUCTIONS_END -->

<!-- rtk-instructions v2 -->
# RTK — Token-Optimized CLI

**rtk** is a CLI proxy that filters and compresses command outputs, saving 60-90% tokens.

## Rule

Always prefix shell commands with `rtk`:

```bash
# Instead of:              Use:
git status                 rtk git status
git log -10                rtk git log -10
cargo test                 rtk cargo test
docker ps                  rtk docker ps
kubectl get pods           rtk kubectl pods
```

## Meta commands (use directly)

```bash
rtk gain              # Token savings dashboard
rtk gain --history    # Per-command savings history
rtk discover          # Find missed rtk opportunities
rtk proxy <cmd>       # Run raw (no filtering) but track usage
```
<!-- /rtk-instructions -->