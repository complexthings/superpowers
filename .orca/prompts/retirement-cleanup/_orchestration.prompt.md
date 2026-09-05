# Main Orchestrator: `retirement-cleanup`

You are the Main Orchestrator for the `retirement-cleanup` workstream. You dispatch work item prompts to Orchestration Workers, merge what they produce, and own the worktree lifecycle. The work itself lives in the prompt files; this file carries orchestration only.

## Done looks like

All 5 PRs merged into `main`, all 5 issues closed, all 5 prompt files in `_completed/`, and `_run-order.md` showing every row `Merged` and pushed.

That is the stop condition: keep waiting and dispatching until all four hold, and stop as soon as they do.

## Tool routing

Before dispatching anything, load Orca's bundled orchestration skill — `orca skills get orchestration --full` — and dispatch by what it says, not by a copy of it kept in this repo. Use `orca skills get orca-cli` for worktree operations. Target branch: `main`.

Choose the Orca CLI executable once for this session: use the value of `ORCA_CLI_COMMAND` when that environment variable is set (Orca exports it for managed WSL sessions); otherwise `orca-dev` in a dev checkout whose session exposes `ORCA_DEV_REPO_ROOT`; otherwise `orca-ide` on Linux outside an Orca-managed terminal, where bare `orca` is the GNOME screen reader; otherwise `orca`. Every command below writes `orca` as a placeholder — substitute the executable you chose.

## Dispatch

Read `_run-order.md`. Work through it in order, one phase at a time: Phase 1, Phase 2, Phase 3, Phase 4.

Create or bind one Run for this workstream, once, before any dispatch:

```
orca orchestration run-create --objective "retirement-cleanup" --json
```

Then, for each prompt file in the phase, create one Task and start one Orchestration Worker on it:

```
orca orchestration task-create --spec "Execute .orca/prompts/retirement-cleanup/<work item id>.prompt.md" --json
orca orchestration worker-start --task <taskId> --worktree new-child --name <work item id> --agent claude --model claude-opus-5 --effort medium --setup run --json
```

Pick the `worker-start` line for the Agent Harness you routed that work item to.

`--worktree new-child` makes the worker's worktree a child of yours, so Orca records the nesting. Use `--worktree new-top-level` only for work genuinely independent of this workstream. Dispatch every prompt in a phase at once; move to the next phase only when every PR from the current one has merged.

## Waiting

Wait with the orchestration skill's `orca orchestration check --wait --types worker_done,escalation,question --timeout-ms <n> --json` loop rather than a sleep/poll loop; follow its ack rule exactly — process every message in the returned Delivery, reply to any `question`, decide each settled worker's next owner, and only then acknowledge with `--ack <deliveryId>` and wait again until every Dispatch has settled.

## Per completed worker

Run these in order.

1. **Release the worker** at report time: `orca orchestration worker-release --dispatch <dispatchId> --json`. Every settled worker is reused (`worker-start --task <next> --terminal <handle>`), retained (`worker-retain`, only when the user asked to keep it live), or released — decide before you acknowledge the Delivery and wait again. The `dispatchId` looks like `ctx_62066a4ef024`; it is in the `worker_done` payload, or from `orca orchestration task-list --json`. Read a released worker's output with `orca orchestration worker-read`; do not keep its terminal open just to re-read it.
2. **Merge the PR** into `main`. Use `gh`; fall back to plain `git` if `gh` fails.
3. **Verify the worktree is drained.** Both must print nothing:
   ```
   cd <worktree> && git status --porcelain
   cd <worktree> && git log origin/main..HEAD
   ```
4. **Remove the worktree**: `orca worktree rm --worktree "/abs/path/to/worktree"`.
5. **Close** any GitHub Issues the merge left open.
6. **Update `_run-order.md`** locally, moving the prompt's status along. Push it to `main` once all work is done.
7. **Check the PR** with `gh` for description comments and review comments. If any need action: run `grill-with-docs` to align on the fix, use `to-spec` / `to-tickets` for new tickets, update the work item prompts, `_run-order.md`, decisions and ADRs with `writing-for-agents`, and `_orchestration.prompt.md`. Commit and push that immediately.

## Timing gotchas worth the ink

- Release when the worker reports; remove the worktree only after the merge. At report time the PR is still open and the worktree must stay.
- `worker-release` returning `state: retained, reason: user_takeover` just means Orca kept a terminal you opened yourself. Still run `orca worktree rm`.
- A dirty tree means step 3's checks failed for a reason. Fix the cause instead of reaching for `--force`.

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
