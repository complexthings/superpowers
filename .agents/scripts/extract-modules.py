#!/usr/bin/env python3
"""
Script to help extract functions from the monolithic superpowers-agent
into modular files based on function names and their dependencies.
"""

import re
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple


def read_source_file(filepath: Path) -> str:
    """Read the source file"""
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


def extract_functions(content: str) -> Dict[str, str]:
    """Extract all function definitions and their bodies"""
    functions = {}

    # Pattern to match function definitions
    # Matches: const functionName = () => { ... }
    # Matches: const functionName = (param1, param2) => { ... }
    # Matches: function functionName() { ... }

    # Find all const/function declarations
    pattern = r"(?:const|function)\s+(\w+)\s*=?\s*(?:\([^)]*\))?\s*(?:=>)?\s*\{"

    matches = list(re.finditer(pattern, content))

    for i, match in enumerate(matches):
        func_name = match.group(1)
        start = match.start()

        # Find the end of this function (next function start or end of file)
        if i < len(matches) - 1:
            end = matches[i + 1].start()
        else:
            end = len(content)

        # Extract function body
        func_body = content[start:end].strip()

        # Remove trailing whitespace and ensure it ends properly
        functions[func_name] = func_body

    return functions


def categorize_functions() -> Dict[str, List[str]]:
    """Define which functions belong to which modules"""
    return {
        "core/config.js": [
            "getDefaultConfig",
            "readConfig",
            "writeConfig",
            "getRepositories",
            "readConfigFile",
            "writeConfigFile",
            "addRepositoryToConfig",
        ],
        "core/paths.js": ["getVSCodeUserDir", "findProjectRoot"],
        "core/git.js": [
            "isRepoClean",
            "isOnMainBranch",
            "checkForUpdates",
            "determineReinstalls",
        ],
        "core/platform-detection.js": ["detectPlatforms"],
        "utils/frontmatter.js": ["extractFrontmatter", "extractSkillContent"],
        "utils/file-ops.js": ["detectTool"],
        "utils/output.js": [
            "getLocalVersion",
            "getRemoteVersion",
            "isNewerVersion",
            "printVersion",
        ],
        "skills/finder.js": [
            "findSkillsInDir",
            "findSkillFile",
            "findMatchingSkills",
            "printSkill",
        ],
        "skills/locator.js": [
            "locateSkill",
            "locateSkillByNameOrAlias",
            "throwAmbiguousError",
        ],
        "skills/executor.js": [],
        "skills/parser.js": [
            "parseSkillName",
            "readSkillJson",
            "readSkillJsonFromPath",
            "findHelperInSkill",
        ],
        "skills/installer.js": [
            "parseGitUrl",
            "getInstallLocation",
            "cloneRepository",
            "installSingleSkill",
        ],
        "integrations/copilot.js": [
            "installCopilotPrompts",
            "installCopilotInstructions",
        ],
        "integrations/cursor.js": ["installCursorCommands", "installCursorHooks"],
        "integrations/claude.js": ["installClaudeCommands"],
        "integrations/gemini.js": ["installGeminiCommands"],
        "integrations/codex.js": ["installCodexPrompts"],
        "integrations/opencode.js": ["installOpencodeCommands"],
        "commands/bootstrap.js": [
            "runBootstrap",
            "installAliases",
            "installUnixAliases",
            "installWindowsAliases",
            "detectShellProfile",
            "installViaRCFile",
        ],
        "commands/setup-skills.js": [
            "runSetupSkills",
            "updatePlatformFile",
            "updateAgentFile",
            "findSkillsSection",
            "findSectionEnd",
            "extractSkillsSection",
            "loadToolMappingTemplate",
            "generateToolMappings",
        ],
        "commands/update.js": [
            "runUpdate",
            "reinstallIntegration",
            "updateReadmeWithAutoUpdateDocs",
        ],
        "commands/simple-commands.js": [
            "runFindSkills",
            "runExecute",
            "runUseSkill",
            "runPath",
            "runDir",
            "runGetHelpers",
            "runAdd",
            "runAddRepository",
            "runGetConfig",
            "runConfigGet",
            "runConfigSet",
            "getConfig",
        ],
    }


def main():
    # Get the path to the original superpowers-agent file
    script_dir = Path(__file__).parent
    agent_file = script_dir.parent / "superpowers-agent"

    if not agent_file.exists():
        print(f"Error: Could not find {agent_file}")
        sys.exit(1)

    print(f"Reading {agent_file}...")
    content = read_source_file(agent_file)

    print("Extracting functions...")
    functions = extract_functions(content)

    print(f"Found {len(functions)} functions")
    print("\nFunction names:")
    for name in sorted(functions.keys()):
        print(f"  - {name}")

    # Show categorization
    categories = categorize_functions()
    print("\nCategorization:")
    for module, funcs in categories.items():
        print(f"\n{module}:")
        for func in funcs:
            if func in functions:
                print(f"  ✓ {func}")
            else:
                print(f"  ✗ {func} (not found)")

    # Find uncategorized functions
    all_categorized = set()
    for funcs in categories.values():
        all_categorized.update(funcs)

    uncategorized = set(functions.keys()) - all_categorized
    if uncategorized:
        print("\nUncategorized functions:")
        for func in sorted(uncategorized):
            print(f"  - {func}")


if __name__ == "__main__":
    main()
