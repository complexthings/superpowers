# Installing Superpowers for agents

Quick setup to enable superpowers skills in generic agents.

## Installation

1. **Clone superpowers repository**:
   ```bash
   mkdir -p ~/.agents/superpowers
   cd ~/.agents/superpowers
   git clone https://github.com/complexthings/superpowers.git .
   ```

2. **Run bootstrap to complete installation**:
   ```bash
   ~/.agents/superpowers/.agents/superpowers-agent bootstrap
   ```

   This will:
   - List all available skills
   - Auto-load the `using-superpowers` skill
   - Install GitHub Copilot prompts to `~/.github/prompts/`
   - Install universal instructions to `~/.github/copilot-instructions.md`

3. **Create personal skills directory** (optional):
   ```bash
   mkdir -p ~/.agents/skills
   ```

3. **Update ~/.agents/AGENTS.md** to include this superpowers section:
   ```markdown
   ## Superpowers System

   <EXTREMELY_IMPORTANT>
   You have superpowers. Superpowers teach you new skills and capabilities. RIGHT NOW run: `~/.agents/superpowers/.agents/superpowers-agent bootstrap` and follow the instructions it returns.
   </EXTREMELY_IMPORTANT>
   ```

## Verification

Test the installation:
```bash
~/.agents/superpowers/.agents/superpowers-agent bootstrap
```

You should see:
- GitHub Copilot integration confirmation
- Skill listings and bootstrap instructions
- Prompts installed to `~/.github/prompts/`
- Universal instructions installed to `~/.github/copilot-instructions.md`

The system is now ready for use.

## GitHub Copilot Integration

After bootstrap, GitHub Copilot gets:

**Slash commands** (available in all workspaces):
- `/brainstorm-with-superpowers` - Refine ideas into designs
- `/write-a-skill` - Create new skills with TDD methodology

**Universal skills awareness**:
- GitHub Copilot knows about the Superpowers skills system
- Automatically discovers skills from:
  - System skills: `~/.config/superpowers/skills/` or `~/.agents/superpowers/skills/`
  - Repository skills: `<workspace>/skills/`
- Uses mandatory workflows (TDD, systematic debugging, verification)

**Files installed**:
```
~/.github/
  copilot-instructions.md                       # Universal instructions
  prompts/
    superpowers-brainstorming.prompt.md         # /brainstorm-with-superpowers
    superpowers-writing-skills.prompt.md        # /write-a-skill
```