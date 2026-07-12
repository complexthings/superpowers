# Installing Superpowers for agents

## Installation

1. Clone the repository:
   ```bash
   mkdir -p ~/.agents/superpowers
   cd ~/.agents/superpowers
   git clone https://github.com/complexthings/superpowers.git .
   ```

2. Run bootstrap:
   ```bash
   superpowers-agent bootstrap
   ```

Bootstrap installs aliases, syncs bundled skills, refreshes global guidance, and installs session-start integrations for detected GitHub Copilot, Claude Code, and OpenCode clients. Use `--force-copilot`, `--force-claude`, or `--force-opencode` to install an undetected integration.

3. Verify the installation:
   ```bash
   superpowers-agent version
   ```

## Project setup

From a project directory, run:

```bash
superpowers-agent setup-skills
```

Use your platform's native skill tool to discover and load the installed skills. If the platform has no native skill tool, inspect the configured skill directories and read the needed `SKILL.md` file.
