# Project Overview

This is the Gemini CLI, a comprehensive skills library of proven techniques, patterns, and workflows for AI coding assistants. This is a fork and extension of Jesse Vincent's incredible Superpowers for Claude Code. Jesse's groundbreaking work and his amazing blog post introduced the concept of systematic, reusable skills for AI agents. This fork extends that vision to support agent-agnostic workflows across GitHub Copilot, Cursor, and other AI coding assistants.

<IMPORTANT>All agents and tools (GitHub Copilot, Codex, Gemini, Claude, etc.) must edit files directly with their IDE or file tools instead of piping heredocs via terminal (`cat <<'EOF' > file`, `node -e ... > file`, etc.), especially in VS Code or other Electron-based IDEs where terminal injection can break the environment.</IMPORTANT>

The project is a structured collection of "skills" defined in Markdown files. These skills provide a systematic approach to common engineering tasks like testing, debugging, collaboration, and more. The project includes a command-line agent (`superpowers-agent`) that allows users to discover, use, and manage these skills.

## Key Files

*   `README.md`: Provides a comprehensive overview of the project, including installation instructions, usage examples, and a high-level description of the available skills.
*   `skills/`: This directory contains the core of the project: the skills themselves. Each skill is a directory containing a `SKILL.md` file and any supporting files.
*   `skills/writing-skills/SKILL.md`: A crucial file that explains how to create new skills using a Test-Driven Development (TDD) methodology. It serves as a guide for contributors.
*   `.agents/superpowers-agent`: A Node.js script that acts as the engine for the project. It handles skill discovery, usage, and integration with various AI coding assistants.

## Development Conventions

The project follows a strict set of conventions for creating and testing skills, as outlined in `skills/writing-skills/SKILL.md`. The key principles are:

*   **Test-Driven Development (TDD):** New skills are developed by first writing a "failing test" in the form of a pressure scenario for a sub-agent.
*   **Systematic over ad-hoc:** The project emphasizes using well-defined processes over guesswork.
*   **Complexity Reduction:** The primary goal is to simplify complex tasks.
*   **Evidence over claims:** All claims must be verified before they are declared successful.

## Usage

The primary way to interact with this project is through the `.agents/superpowers-agent` script. The available commands are:

*   `bootstrap`: Run the complete bootstrap with all skills.
*   `use-skill <skill-name>`: Load a specific skill.
*   `find-skills`: List all available skills.
*   `install-copilot-prompts`: Install GitHub Copilot prompts only.
*   `install-copilot-instructions`: Install universal instructions only.
*   `install-cursor-commands`: Install Cursor commands only.
*   `install-cursor-hooks`: Install Cursor hooks only.
*   `install-codex-prompts`: Install OpenAI Codex prompts only.
