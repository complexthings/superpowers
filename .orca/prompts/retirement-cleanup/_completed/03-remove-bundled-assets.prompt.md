# Work Item 3: `03-remove-bundled-assets`: Delete bundled skills, templates and docs

Closes no linked issue. Phase 3. Blocked by Phase 2.

## Done looks like

The work below is on a branch off `main`, this prompt file has moved into `_completed/`, a PR is open linking no linked issue, and one `worker_done` carries that PR link.

That is the stop condition. Merging the PR, closing the issue and removing the worktree belong to the Main Orchestrator — stop once `worker_done` is sent, and do not pick up further work.

## Branch

Branch off `main`. All work happens in your own worktree.

## The work

Delete the repository's `skills/` directory, `.agents/templates/`, and `.agents/docs/`.

Trim `package.json`'s `files[]` to what actually ships after this workstream: `.agents/superpowers-agent`,
`.agents/superpowers-bootstrap.md`, `.github`, `AGENTS.md`, `README.md`, `LICENSE`. The entries
`.agents/skills`, `.agents/prompts` and `.agents/plans` name directories that do not exist and go too,
along with `skills`, `.agents/templates` and `.agents/docs`.

Delete `.agents/tests/bundled-skills.test.js`, which asserts the presence of bundled skill directories
this item removes, and any other test that reads `skills/`. Keep `bun test` green.

Skills required: none.

## Hard constraints

- You are an Orchestration Worker: never run `orca orchestration worker-start`. Dispatch is the Main Orchestrator's alone; a second dispatcher spends concurrency it is not tracking.
- When you are blocked, use `orca orchestration ask` rather than guessing or stopping. A guess costs a rework cycle, and a silent stop leaves the orchestrator waiting on a report that never arrives.

## Orchestration Rules

Use the Claude Code rules for this prompt, plus the Global Rules.

### Claude Code

- **Main Orchestrator**: `claude-opus-5` (medium reasoning)
- **Orchestrator**: Inherit or `claude-opus-5` (medium reasoning)
- **Subagent Model**: `claude-opus-5` (low reasoning)
- **Subagent Model, Simple Tasks**: `claude-haiku-4-5` (medium reasoning)
- **Maximum Concurrency**: 4, counting Orchestrator, Subagents and Nested Subagents

### Global Rules

- **Nested Subagents**: Subagents may spawn their own subagents through the Agent Harness's native mechanism — Claude Code's Agent tool or the equivalent — up to 3 layers below the main conversation and within Maximum Concurrency. Two gates: the assigning subagent owns the result, and the deepest layer does its own work and returns one summary. Where an Agent Harness blocks nested spawning, a subagent may ask the orchestrator to spawn on its behalf under the same limits. Orca dispatch is the Main Orchestrator's alone unless Orca's nested worker depth setting is raised above `1`; an Orchestration Worker that needs a **Nested Worker** asks the Main Orchestrator to start it.
- **Worktree Nesting**: An Orchestration Worker's worktree is created as a child of the Main Orchestrator's worktree — `orca orchestration worker-start --worktree new-child` — so Orca records the parent relationship and the workstream's worktrees stay together. Use `--worktree new-top-level` only when the work is genuinely independent of the orchestrator's.
- **Git & Branching**: Writing agents work in isolated worktrees. Subagents write files locally and leave commit, push and `gh` writes to the agent that owns the worktree — concurrent writers on one branch lose each other's work. The orchestrator alone merges into `main` and opens PRs, and merges its own PRs without waiting for the user's review.
- **Permissions**: Orchestrator and subagents run in auto mode with full read/write in the repo.
- **Asking Questions**: Use `askUserQuestion`, `askQuestions`, `ask_user`, `question`, `ask_user_question` or the Agent Harness equivalent, and label your recommended answer **(Recommended)**. Subagents route questions through the orchestrator. The orchestrator asks through its question tool rather than in prose, because prose questions scroll past unanswered and the run stalls.
- **Progress**: Keep a live todo list via `TaskCreate`/`TaskList`/`TaskUpdate`/`TaskGet`, `todo`, `task`, `todowrite` or the Agent Harness equivalent, so the user can watch the work land.
- **Execution**: Read the actual files before writing, and reason from what they say rather than from what the plan implies. Read what the change touches, not the whole repo — an unread file that the change touches is the expensive miss, not an unread one it does not.
- **CLI**: Where `rtk` is installed (`which rtk`), orchestrator and subagents use it for CLI commands — `rtk python` for `python3`, plus `grep`, `rg`, `ls`, `tree`, `read`, `git`, `gh`, `pnpm`, `json`. Where it is not installed, use the plain command.
  - **rtk gotcha**: `rtk ls` and `rtk gh issue list` **silently truncate long output**. Confirm absence with `rtk proxy find <path> -maxdepth N` or `rtk proxy gh issue list --json` before concluding a directory or issue does not exist. A previous session burned most of its budget regenerating work that was already on disk.
- **Parallelism**: Spawn parallel subagents whenever subtasks are independent. Keep work serial where subtasks depend on each other or edit the same files, and stay within Maximum Concurrency — parallel writers on one file cost more to reconcile than they save.
- **Codegraph**: Use Codegraph where a `.codegraph/` directory exists at the repo root.

## Completion

1. Move this prompt file into `.orca/prompts/retirement-cleanup/_completed`.
2. Open a PR into `main`, linking the issue it closes in the description.
3. Send `worker_done` exactly once, from your own terminal, using the `taskId`, `dispatchId` and capability in the preamble Orca injected — `--outcome succeeded` when the work is done, `--outcome failed` when it is not. Never encode failure only in prose: the orchestrator routes on the outcome flag, not on the body. Put the PR link in the body.
