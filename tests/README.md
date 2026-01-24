# Superpowers Agent Tests

This directory contains tests for validating that AI agents correctly discover and use superpowers-agent skills.

## Test Categories

### skill-triggering/

Tests whether an agent **implicitly** triggers a skill based on a natural prompt, without the user explicitly naming the skill.

**Example:** User says "The tests are failing, can you debug this?" and the agent should recognize this as a debugging task and load the `systematic-debugging` skill.

### explicit-skill-requests/

Tests whether an agent correctly invokes a skill when the user **explicitly** requests it by name.

**Example:** User says "Please use the brainstorming skill to help me design this feature."

## Running Tests

### Prerequisites

1. Ensure superpowers-agent is installed and bootstrapped:
   ```bash
   superpowers-agent bootstrap
   superpowers-agent setup-skills
   ```

2. Configure your agent's CLI tool (see Agent Configuration below)

### Running Individual Tests

```bash
# Skill triggering test
./tests/skill-triggering/run-test.sh <skill-name> <prompt-file> [max-turns]

# Example
./tests/skill-triggering/run-test.sh systematic-debugging ./tests/skill-triggering/prompts/systematic-debugging.txt
```

```bash
# Explicit skill request test
./tests/explicit-skill-requests/run-test.sh <skill-name> <prompt-file> [max-turns]

# Example
./tests/explicit-skill-requests/run-test.sh brainstorming ./tests/explicit-skill-requests/prompts/use-brainstorming.txt
```

### Running All Tests

```bash
# Run all skill triggering tests
./tests/skill-triggering/run-all.sh

# Run all explicit skill request tests
./tests/explicit-skill-requests/run-all.sh
```

## Agent Configuration

These tests are designed to be agent-agnostic. To adapt for your specific agent:

### Environment Variables

Set these before running tests:

| Variable | Description | Example |
|----------|-------------|---------|
| `AGENT_CLI` | The CLI command to invoke your agent | `claude`, `opencode`, `cursor` |
| `AGENT_PROMPT_FLAG` | Flag for passing prompts | `-p`, `--prompt` |
| `AGENT_OUTPUT_FORMAT` | Output format flag (if supported) | `--output-format stream-json` |
| `AGENT_MAX_TURNS_FLAG` | Flag for limiting conversation turns | `--max-turns` |

### Example Configurations

**Claude Code:**
```bash
export AGENT_CLI="claude"
export AGENT_PROMPT_FLAG="-p"
export AGENT_OUTPUT_FORMAT="--output-format stream-json"
export AGENT_MAX_TURNS_FLAG="--max-turns"
```

**OpenCode:**
```bash
export AGENT_CLI="opencode"
export AGENT_PROMPT_FLAG="--prompt"
export AGENT_OUTPUT_FORMAT=""
export AGENT_MAX_TURNS_FLAG="--max-turns"
```

## Adding New Tests

### Adding a Skill Triggering Test

1. Create a prompt file in `skill-triggering/prompts/<skill-name>.txt`
2. The prompt should describe a task that would naturally require the skill
3. Do NOT mention the skill name in the prompt

### Adding an Explicit Skill Request Test

1. Create a prompt file in `explicit-skill-requests/prompts/<skill-name>.txt`
2. The prompt should explicitly request the skill by name
3. Include context for when/why someone would request it

## Test Output

Test results are written to `/tmp/superpowers-agent-tests/<timestamp>/`:
- `prompt.txt` - The prompt used
- `agent-output.json` - Raw agent output (if JSON format supported)
- `agent-output.log` - Agent output log

## Success Criteria

### Skill Triggering Tests
- **PASS**: Agent loads the expected skill within the configured max turns
- **FAIL**: Agent does not load the skill, or loads a different skill

### Explicit Skill Request Tests
- **PASS**: Agent loads the requested skill
- **FAIL**: Agent does not load the skill
- **WARNING**: Agent starts work before loading the skill (premature action)
