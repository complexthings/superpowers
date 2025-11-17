# Installation Guide

This guide covers installation options for Superpowers.

## Prerequisites

- **Git** - For cloning the repository
- **Node.js** (v16 or higher) - For running the superpowers-agent
- **An AI coding assistant** - GitHub Copilot, Cursor, Claude Desktop, Windsurf, Gemini, etc.

## Quick Installation (Recommended)

Install Superpowers globally with one command:

```bash
curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash
```

**Security Note:** Always review scripts before running:
```bash
curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh -o install.sh
cat install.sh
bash install.sh
```

### What the Installer Does

1. **Checks Requirements**: Verifies git, node, and npm are installed
2. **Installs Globally**: Clones to `~/.agents/superpowers`
3. **Runs Bootstrap**: Sets up aliases, slash commands, and directories
4. **Optional Project Integration**: Asks to update AGENTS.md, CLAUDE.md, GEMINI.md if found in current directory

### After Installation

You can use Superpowers from anywhere:

```bash
superpowers --help
superpowers find-skills
superpowers use-skill systematic-debugging
```

**Slash commands available in GitHub Copilot, Cursor, Windsurf:**
- `/brainstorm` or `/brainstorm-with-superpowers`
- `/write-skill` or `/write-a-skill`
- `/skills` - Discover available skills
- `/use-skill` - Load and apply a specific skill
- `/write-plan` - Create implementation plans
- `/execute-plan` - Execute plans in batches

## Manual Installation

If you prefer manual installation or need project-specific setup:

### Global Installation (Recommended)

```bash
# 1. Clone to global location
mkdir -p ~/.agents
git clone https://github.com/complexthings/superpowers.git ~/.agents/superpowers

# 2. Run bootstrap
~/.agents/superpowers/.agents/superpowers-agent bootstrap
```

### Project-Specific Installation

```bash
# 1. Clone to project directory
mkdir -p .agents
git clone https://github.com/complexthings/superpowers.git .agents/superpowers

# 2. Run bootstrap
.agents/superpowers/.agents/superpowers-agent bootstrap
```

### What Bootstrap Does

The bootstrap process:
1. **Installs Aliases**: Creates `superpowers` and `superpowers-agent` commands
2. **Sets up Slash Commands**: Installs GitHub Copilot commands to VS Code user profile
3. **Creates Instruction Files**: Generates AGENTS.md, CLAUDE.md, GEMINI.md (if not present)
4. **Lists Skills**: Shows all available skills with descriptions

## Updating Superpowers

If installed globally, run:

```bash
cd ~/.agents/superpowers
git pull origin main
superpowers-agent bootstrap
```

Or use the one-liner installer again - it will detect existing installation and update:

```bash
curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash
```

## Troubleshooting

### Command Not Found: superpowers

If you see "command not found" after installation:

1. **Reload your shell:**
   ```bash
   source ~/.zshrc    # or ~/.bashrc, ~/.bash_profile depending on your shell
   ```

2. **Or restart your terminal**

3. **Check if aliases were installed:**
   ```bash
   cat ~/.zshrc | grep superpowers    # or ~/.bashrc
   ```

### Missing Dependencies

If the installer reports missing dependencies:

**macOS:**
```bash
brew install git node
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install git nodejs npm
```

**Windows:**
- Install Git: https://git-scm.com/download/win
- Install Node.js: https://nodejs.org/

### Slash Commands Not Working

Slash commands require:
- **VS Code** with GitHub Copilot extension installed
- Or **Cursor** (built-in Copilot support)
- Or **Windsurf** (Cascade AI)

If slash commands aren't working:
1. Check that commands were installed: `ls ~/.github/copilot-instructions.d/`
2. Restart VS Code/Cursor/Windsurf
3. Try the full command name: `/brainstorm-with-superpowers`

### Permission Denied

If you get permission errors during installation:

```bash
# Ensure ~/.agents directory is writable
mkdir -p ~/.agents
chmod 755 ~/.agents

# Run installer again
curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash
```

## Uninstalling

To remove Superpowers:

```bash
# Remove installation
rm -rf ~/.agents/superpowers

# Remove aliases (edit your shell config)
# Remove lines containing "superpowers" from ~/.zshrc or ~/.bashrc

# Remove slash commands
rm -rf ~/.github/copilot-instructions.d/superpowers-*.md
```

## Alternative: Claude Code Plugin

For Claude Code users, Jesse Vincent's original implementation is available via plugin:

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Claude Code commands:
- `/superpowers:brainstorm`
- `/superpowers:write-plan`
- `/superpowers:execute-plan`

**Learn more:** [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/) by Jesse Vincent

## Getting Help

- **Documentation**: https://github.com/complexthings/superpowers
- **Issues**: https://github.com/complexthings/superpowers/issues
- **Original Project**: https://github.com/obra/superpowers (Claude Code plugin)
