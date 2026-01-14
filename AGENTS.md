# AGENTS.md

<!-- SUPERPOWERS_SKILLS_START -->
## 🎯 SKILLS

Skills extend your capabilities with proven workflows. You discover skills via metadata, then load instructions **just-in-time** before use.

**Key principle:** Don't read skill files upfront. Load them only when you're about to execute them.

### Installation Check

If `superpowers-agent` is not available, install it:

```bash
curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash
```

### Updates Monitoring

**Bootstrapped Version**: ^^SAV:6.3.3^^

Your superpowers-agent may have updates available. If you see a different version
in command output (e.g., `^^SAV:5.5.0^^`) than shown above, run:

```bash
superpowers-agent update && superpowers-agent bootstrap && superpowers-agent setup-skills
```

This will update your Superpowers installation and refresh your project configuration.

**How Agents Should Use This Information:**

When you (the agent) start a conversation or run superpowers-agent commands:

1. **Note the bootstrapped version** shown above (`^^SAV:6.3.3^^`)
2. **Check command output** - Most `superpowers-agent` commands display `^^SAV:X.Y.Z^^` at the start
3. **Compare versions** - If the command version differs from bootstrapped version:
   
   Inform the user: "Your superpowers-agent may have updates available, run 
   `superpowers-agent update && superpowers-agent bootstrap && superpowers-agent setup-skills` 
   to update your Superpowers and Project!"

4. **When to check**:
   - At the start of new conversations
   - When commands behave unexpectedly  
   - When user asks about updates or capabilities

**Version Detection Examples:**

```
# Outdated - needs update
Bootstrapped: ^^SAV:5.4.0^^
Command output: ^^SAV:5.5.0^^
→ Notify user to update

# Up to date
Bootstrapped: ^^SAV:5.4.0^^
Command output: ^^SAV:5.4.0^^
→ No action needed
```

### HOW TO USE SKILLS

<CRITICAL>
**Load skills just-in-time — only when you're about to use them, not upfront.**
</CRITICAL>

#### Step 1: Discover Skills

| If you have... | Then... |
|----------------|---------|
| Native skill tool (see table below) | Skills in your platform directories are auto-discovered |
| No native tool OR need superpowers skills | Run `superpowers-agent find-skills [PATTERN]` |

#### Step 2: Load & Execute

| Skill Location | How to Load |
|----------------|-------------|
| Your platform's directory (`.claude/`, `.cursor/`, etc.) | Use your native skill tool |
| `.agents/skills/` or `superpowers:` prefixed | Use `superpowers-agent execute {name}` then Read |
| Native tool fails or skill not found | Fall back to `superpowers-agent execute` |

#### Native Skill Tools

| Agent | Native Tool | Skill Locations |
|-------|-------------|-----------------|
| GitHub Copilot | `Skill` tool | `.github/skills/`, `~/.copilot/skills/` |
| Claude Code | `Skill` tool | `.claude/skills/`, `~/.claude/skills/` |
| OpenCode | `skill` tool | `.opencode/skill/`, `~/.config/opencode/skill/` |
| Cursor | Automatic discovery | `.cursor/skills/`, `~/.cursor/skills/` |
| Gemini | `activate_skill` tool | `.gemini/skills/`, `~/.gemini/skills/` |
| Codex | $skill-name | `.codex/skills/`, `~/.codex/skills/` |

#### JIT Rules

- Load skills only when you're about to use them, not before
- If given a sequence of skills, load each one immediately before that step
- If you already loaded a skill earlier in this session and it's in context, don't re-load

#### When to Look for Skills

- Before starting any task
- When unsure how to approach something
- When the task matches a skill description you've seen

### WHY THIS MATTERS

Skills document **proven techniques** that save time and prevent mistakes. Not using available skills means:

- ❌ Repeating already-solved problems
- ❌ Making known errors
- ❌ Skipping critical workflows (TDD, debugging, verification)
- ❌ Wasting context by loading skills you won't use

**If a skill exists for your task, you MUST use it.**

### COMMON MISTAKES

Reject these rationalizations:

- ❌ "I'll read all the skills upfront to understand them" → Load JIT only
- ❌ "This is too simple for a skill" → Simple tasks benefit most from proven process
- ❌ "I already know how to do this" → Skills encode edge cases you'll miss
- ❌ "I'll just skim the skill" → Follow instructions exactly as written

### REFERENCE

**Tool Mappings:**

#### Tool Mapping for GitHub Copilot

When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `#todos` (track implementation and progress of a chat request with a todo list)
- `TodoRead` → Check todo list via `#todos` output (no dedicated read tool)
- `Task` tool with subagents → `#runSubagent` (run a task in an isolated subagent context; helps improve context management)
- `Skill` → `Skill` tool (native) or `superpowers-agent execute` command (for .agents/ skills)
- `Read` → `#readFile` (read the content of a file in the workspace)
- `Write` → `#createFile` (create a new file in the workspace)
- `Edit` → `#editFiles` (apply edits to files in the workspace)
- `Bash` → `#runInTerminal` (run a shell command in the integrated terminal)
- `List` → `#listDirectory` (list files in a directory in the workspace)
- `Grep` → `#textSearch` (find text in files)
- `Glob` → `#fileSearch` (search for files in the workspace by using glob patterns)
- `WebFetch` → `#fetch` (fetch the content from a given web page)
- `CodebaseSearch` → `#codebase` (perform a code search in the current workspace to find relevant context)
- `NotebookEdit` → `#editNotebook` (make edits to a notebook)
- `NotebookSummary` → `#getNotebookSummary` (get the list of notebook cells and their details)
- `NotebookRun` → `#runCell` (run a notebook cell)
- `ReadNotebookOutput` → `#readNotebookCellOutput` (read the output from a notebook cell execution)
- `GetTerminalOutput` → `#getTerminalOutput` (get the output from running a terminal command)
- `TerminalLastCommand` → `#terminalLastCommand` (get the last run terminal command and its output)
- `TerminalSelection` → `#terminalSelection` (get the current terminal selection)
- `Selection` → `#selection` (get the current editor selection)
- `Changes` → `#changes` (list of source control changes)
- `Problems` → `#problems` (add workspace issues from the Problems panel as context)
- `TestFailure` → `#testFailure` (get unit test failure information)
- `RunTests` → `#runTests` (run unit tests in the workspace)
- `CreateDirectory` → `#createDirectory` (create a new directory in the workspace)
- `RunTask` → `#runTask` (run an existing task in the workspace)
- `CreateAndRunTask` → `#createAndRunTask` (create and run a new task in the workspace)
- `GetTaskOutput` → `#getTaskOutput` (get the output from running a task)
- `Usages` → `#usages` (combination of Find All References, Find Implementation, and Go to Definition)
- `SearchResults` → `#searchResults` (get the search results from the Search view)
- `Extensions` → `#extensions` (search for and ask about VS Code extensions)
- `InstallExtension` → `#installExtension` (install a VS Code extension)
- `RunVscodeCommand` → `#runVscodeCommand` (run a VS Code command)
- `VSCodeAPI` → `#VSCodeAPI` (ask about VS Code functionality and extension development)
- `GitHubRepo` → `#githubRepo` (perform a code search in a GitHub repo)
- `OpenSimpleBrowser` → `#openSimpleBrowser` (open the Simple Browser and preview a locally-deployed web app)
- `New` → `#new` (scaffold a new VS Code workspace, preconfigured with debug and run configurations)
- `NewWorkspace` → `#newWorkspace` (create a new workspace)
- `NewJupyterNotebook` → `#newJupyterNotebook` (scaffold a new Jupyter notebook given a description)
- `GetProjectSetupInfo` → `#getProjectSetupInfo` (provide instructions and configuration for scaffolding projects)

##### Native Skill Tool

You have a `Skill` tool for loading skills. **Use it by default** for skills in your platform directories:
- Project: `.github/skills/`
- Personal: `~/.copilot/skills/`

Skills are symlinked across platforms, so superpowers skills are accessible at `~/.copilot/skills/superpowers/`.
#### Tool Mapping for Cursor

When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `todo_write` (manage task lists with status tracking: pending, in_progress, completed, cancelled)
- `TodoRead` → Check todo list via system context (automatically tracked)
- `Task` tool with subagents → Execute the work yourself, as subagent dispatch isn't available
- `Skill` → Automatic discovery (native) or `superpowers-agent execute` command (for .agents/ skills)
- `Read` → `read_file` (read file contents with optional offset/limit for large files; supports images)
- `Write` → `write` (create/overwrite files; requires prior read_file for existing files)
- `Edit` → `search_replace` (exact string replacements; supports replace_all for renaming across file)
- `Bash` → `run_terminal_cmd` (execute terminal commands; supports background execution and permission requests)
- `List` → `list_dir` (list directory contents with optional ignore globs)
- `Grep` → `grep` (ripgrep-based search with regex, supports -A/-B/-C context, multiple output modes)
- `Glob` → `glob_file_search` (find files by glob pattern, sorted by modification time)
- `CodebaseSearch` → `codebase_search` (semantic search to find code by meaning, not exact text)
- `WebFetch` → `web_search` (search the web for real-time information)
- `FetchRules` → `fetch_rules` (retrieve specific rules based on type and description)
- `Browser` → `browser` (control browser for screenshots, testing, and visual verification)
- `NotebookEdit` → `edit_notebook` (edit Jupyter notebook cells: create, edit, or clear cell content)
- `ReadLints` → `read_lints` (read linter/diagnostic errors from workspace files)
- `DeleteFile` → `delete_file` (delete files at specified path)
- MCP Tools → Various MCP server tools available (Playwright browser automation, Context7 docs, etc.)

##### Native Skill Tool

Cursor has automatic skill discovery for skills in your platform directories:
- Project: `.cursor/skills/`
- Personal: `~/.cursor/skills/`

Skills are symlinked across platforms, so superpowers skills are accessible at `~/.cursor/skills/superpowers/`.
#### Tool Mapping for OpenCode

When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `todowrite` (manage todo lists with status tracking: pending, in_progress, completed, cancelled)
- `TodoRead` → `todoread` (read current todo list state)
- `Task` → `task` (dispatch specialized subagents: general, explore, or custom agents for complex multi-step tasks)
- `Skill` → `skill` tool (native) or `superpowers-agent execute` command (for .agents/ skills)
- `Read` → `read` (read file contents with line numbers; supports offset/limit for large files)
- `Write` → `write` (create new files or overwrite existing ones)
- `Edit` → `edit` (modify existing files using exact string replacements)
- `Patch` → `patch` (apply patches/diffs to files)
- `Bash` → `bash` (execute shell commands in project environment)
- `List` → `list` (list files and directories; accepts glob patterns to filter)
- `Grep` → `grep` (search file contents using regex; supports file pattern filtering)
- `Glob` → `glob` (find files by glob pattern like `**/*.js`; sorted by modification time)
- `WebFetch` → `webfetch` (fetch web content in text, markdown, or html format)
- `AskUserQuestion` → `question` (ask user questions during execution with multiple choice options)
- `LSP` → `lsp` (experimental: goToDefinition, findReferences, hover, documentSymbol, workspaceSymbol, goToImplementation, prepareCallHierarchy, incomingCalls, outgoingCalls)

##### Native Skill Tool

You have a `skill` tool for loading skills. **Use it by default** for skills in your platform directories:
- Project: `.opencode/skill/`
- Personal: `~/.config/opencode/skill/`
- Claude-compatible: `.claude/skills/` and `~/.claude/skills/`

Skills are symlinked across platforms, so superpowers skills are accessible at `~/.config/opencode/skill/superpowers/`.
#### Tool Mapping for Codex

When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `update_plan` (simple step tracker; no full todo manager)
- `TodoRead` → Check plan via `update_plan` output (no dedicated read tool)
- `Task` tool with subagents → Execute the work yourself (no subagent tool)
- `Skill` → `$skill-name` prefix (native) or `superpowers-agent execute` command (for .agents/ skills)
- `Read` → `shell_command` with `cat`/`head`/`tail` (no dedicated read tool)
- `Write` → `apply_patch` (create/edit files) or `shell_command` with redirection for new files
- `Edit` → `apply_patch` (targeted edits using unified diff format)
- `Bash` → `shell_command` (execute shell commands)
- `List` → `shell_command` with `ls` or `find` commands
- `Grep` → `shell_command` with `rg` (ripgrep) or `grep` commands
- `Glob` → `shell_command` with `rg --files` or `find` commands
- `WebFetch` → `web_search_request` (fetch web content and search results)

##### Native Skill Tool

Codex has native skill support using the `$skill-name` prefix or `/skills` slash command. **Use it by default** for skills in your platform directories:
- Project: `.codex/skills/` (current working directory)
- Personal: `~/.codex/skills/` (user home directory)
- System: `/etc/codex/skills/` (admin-deployed skills)

Skills are symlinked across platforms, so superpowers skills are accessible at `~/.codex/skills/superpowers/`.

#### Skill Locations

- Project: `.agents/skills/` > `.claude/skills/` > `.copilot/skills/` > `.opencode/skill/` > `.cursor/skills/` > `.gemini/skills/` > `.codex/skills/`
- Personal: `~/.agents/skills/` > `~/.claude/skills/` > `~/.copilot/skills/` > `~/.config/opencode/skill/` > `~/.cursor/skills/` > `~/.gemini/skills/` > `~/.codex/skills/`
- Superpowers: `~/.agents/superpowers/skills/`

Priority: Project > Personal > Superpowers (when names match)

#### Skill Naming

- Project skills: `skill-name`
- Claude skills: `claude:skill-name`
- Copilot skills: `copilot:skill-name`
- OpenCode skills: `opencode:skill-name`
- Cursor skills: `cursor:skill-name`
- Gemini skills: `gemini:skill-name`
- Codex skills: `codex:skill-name`
- Personal skills: `skill-name`
- Superpowers skills: `superpowers:skill-name`

#### Skills with Checklists

If a skill has a checklist, create todos for EACH item. Mental tracking = steps get skipped.

#### Creating New Skills

Use the `writing-skills` skill. Brainstorm first with `brainstorming`, then test with `testing-skills-with-subagents`.

---

<IMPORTANT>
**IF A SKILL APPLIES TO YOUR TASK, YOU MUST USE IT.**

Announce when using a skill: "Using Skill: {Name} to {Purpose}"
</IMPORTANT>

---

*Generated/Updated by Superpowers on 2026-01-14*

<!-- SUPERPOWERS_SKILLS_END -->

