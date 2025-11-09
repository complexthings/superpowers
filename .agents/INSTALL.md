# Installing Superpowers for agents

Quick setup to enable superpowers skills in generic agents.

## Installation

1. **Clone superpowers repository**:
   ```bash
   mkdir -p ~/.agents/superpowers
   cd ~/.agents/superpowers
   git clone https://github.com/obra/superpowers.git .
   ```

2. **Create personal skills directory**:
   ```bash
   mkdir -p ~/.agents/skills
   ```

3. **Update ~/.agents/AGENTS.md** to include this superpowers section:
   ```markdown
   ## Superpowers System

   <EXTREMELY_IMPORTANT>
   You have superpowers. Superpowers teach you new skills and capabilities. RIGHT NOW run: `~/.agents/superpowers/.agents/superpowers-agents bootstrap` and follow the instructions it returns.
   </EXTREMELY_IMPORTANT>
   ```

## Verification

Test the installation:
```bash
~/.agents/superpowers/.agents/superpowers-agents bootstrap
```

You should see skill listings and bootstrap instructions. The system is now ready for use.