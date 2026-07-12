/**
 * Tests for the SUPERPOWERS.md link injected into generated AGENTS.md/CLAUDE.md
 * (via updatePlatformFile + AGENTS.md.template) and .github/copilot-instructions.md
 * (via updateCopilotInstructions). (#30)
 *
 * Both links live inside the marker-delimited block, so marker replacement
 * on repeated runs keeps them single (idempotent) automatically.
 *
 * Uses real temp directories (created/torn down per test) — no fs mocks.
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdtempSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { updatePlatformFile, updateCopilotInstructions } from "../src/commands/bootstrap.js";
import { paths } from "../src/core/paths.js";

const tempDirs = [];

const makeTempDir = () => {
  const d = mkdtempSync(join(tmpdir(), "superpowers-link-test-"));
  tempDirs.push(d);
  return d;
};

afterEach(() => {
  while (tempDirs.length) {
    const d = tempDirs.pop();
    try { rmSync(d, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

const countOccurrences = (haystack, needle) => haystack.split(needle).length - 1;

// ─── AGENTS.md / CLAUDE.md (via updatePlatformFile) ──────────────────────────

describe("AGENTS.md/CLAUDE.md — SUPERPOWERS.md link", () => {
  const templatePath = join(paths.superpowersRepo, ".agents", "templates", "AGENTS.md.template");
  const template = readFileSync(templatePath, "utf8");

  test("generated file contains the SUPERPOWERS.md link exactly once", () => {
    const projectRoot = makeTempDir();
    const agentsMdPath = join(projectRoot, "AGENTS.md");
    updatePlatformFile(agentsMdPath, template, ["claude-code"], true);

    const content = readFileSync(agentsMdPath, "utf8");
    expect(countOccurrences(content, "[superpowers-agent Docs](.agents/docs/SUPERPOWERS.md)")).toBe(1);
  });

  test("running the update twice does not duplicate the link", () => {
    const projectRoot = makeTempDir();
    const agentsMdPath = join(projectRoot, "AGENTS.md");
    updatePlatformFile(agentsMdPath, template, ["claude-code"], true);
    updatePlatformFile(agentsMdPath, template, ["claude-code"], true);

    const content = readFileSync(agentsMdPath, "utf8");
    expect(countOccurrences(content, "[superpowers-agent Docs](.agents/docs/SUPERPOWERS.md)")).toBe(1);
  });
});

// ─── .github/copilot-instructions.md (via updateCopilotInstructions) ─────────

describe(".github/copilot-instructions.md — SUPERPOWERS.md link", () => {
  test("generated file contains the SUPERPOWERS.md link exactly once", () => {
    const projectRoot = makeTempDir();
    updateCopilotInstructions(projectRoot);

    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    const content = readFileSync(dest, "utf8");
    expect(countOccurrences(content, "[superpowers-agent Docs](../.agents/docs/SUPERPOWERS.md)")).toBe(1);
  });

  test("running the update twice does not duplicate the link", () => {
    const projectRoot = makeTempDir();
    updateCopilotInstructions(projectRoot);
    updateCopilotInstructions(projectRoot);

    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    const content = readFileSync(dest, "utf8");
    expect(countOccurrences(content, "[superpowers-agent Docs](../.agents/docs/SUPERPOWERS.md)")).toBe(1);
  });
});
