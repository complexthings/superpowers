/**
 * Guard tests: cursor, codex, and gemini must NOT appear in any supported-platform
 * registry after issue #6.
 *
 * Checks:
 *   - toolDetection keys exclude cursor/codex/gemini
 *   - SKILL_PLATFORMS names exclude cursor/codex/gemini
 *   - PROJECT_SKILL_PLATFORMS names exclude cursor/codex/gemini (via symlinks.js)
 *   - paths object has no cursor/codex/gemini skill path getters
 *
 * Kept platforms (must still be present):
 *   - toolDetection: opencode, claude, copilot
 *   - SKILL_PLATFORMS: claude, copilot, opencode
 *   - paths: projectClaudeSkills, homeClaudeSkills, projectCopilotSkills,
 *             homeCopilotSkills, projectOpencodeSkills, homeOpencodeSkills
 */

import { describe, test, expect } from "bun:test";
import { toolDetection } from "../src/core/platform-detection.js";
import { SKILL_PLATFORMS } from "../src/utils/symlinks.js";
import { paths } from "../src/core/paths.js";

// ─── toolDetection ───────────────────────────────────────────────────────────

describe("toolDetection — removed platforms absent", () => {
  test("does not contain cursor", () => {
    expect(Object.keys(toolDetection)).not.toContain("cursor");
  });

  test("does not contain codex", () => {
    expect(Object.keys(toolDetection)).not.toContain("codex");
  });

  test("does not contain gemini", () => {
    expect(Object.keys(toolDetection)).not.toContain("gemini");
  });
});

describe("toolDetection — kept platforms present", () => {
  test("contains opencode", () => {
    expect(Object.keys(toolDetection)).toContain("opencode");
  });

  test("contains claude", () => {
    expect(Object.keys(toolDetection)).toContain("claude");
  });

  test("contains copilot", () => {
    expect(Object.keys(toolDetection)).toContain("copilot");
  });
});

// ─── SKILL_PLATFORMS ─────────────────────────────────────────────────────────

describe("SKILL_PLATFORMS — removed platforms absent", () => {
  const names = SKILL_PLATFORMS.map((p) => p.name);

  test("does not contain cursor", () => {
    expect(names).not.toContain("cursor");
  });

  test("does not contain codex", () => {
    expect(names).not.toContain("codex");
  });

  test("does not contain gemini", () => {
    expect(names).not.toContain("gemini");
  });
});

describe("SKILL_PLATFORMS — kept platforms present", () => {
  const names = SKILL_PLATFORMS.map((p) => p.name);

  test("contains claude", () => {
    expect(names).toContain("claude");
  });

  test("contains copilot", () => {
    expect(names).toContain("copilot");
  });

  test("contains opencode", () => {
    expect(names).toContain("opencode");
  });
});

// ─── paths — no cursor/codex/gemini getters ──────────────────────────────────

describe("paths — removed skill path getters absent", () => {
  test("has no projectCursorSkills", () => {
    expect(paths.projectCursorSkills).toBeUndefined();
  });

  test("has no homeCursorSkills", () => {
    expect(paths.homeCursorSkills).toBeUndefined();
  });

  test("has no projectGeminiSkills", () => {
    expect(paths.projectGeminiSkills).toBeUndefined();
  });

  test("has no homeGeminiSkills", () => {
    expect(paths.homeGeminiSkills).toBeUndefined();
  });

  test("has no projectCodexSkills", () => {
    expect(paths.projectCodexSkills).toBeUndefined();
  });

  test("has no homeCodexSkills", () => {
    expect(paths.homeCodexSkills).toBeUndefined();
  });
});

describe("paths — kept skill path getters present", () => {
  test("has projectClaudeSkills", () => {
    expect(paths.projectClaudeSkills).toBeDefined();
    expect(typeof paths.projectClaudeSkills).toBe("string");
  });

  test("has homeClaudeSkills", () => {
    expect(paths.homeClaudeSkills).toBeDefined();
  });

  test("has projectCopilotSkills", () => {
    expect(paths.projectCopilotSkills).toBeDefined();
  });

  test("has homeCopilotSkills", () => {
    expect(paths.homeCopilotSkills).toBeDefined();
  });

  test("has projectOpencodeSkills", () => {
    expect(paths.projectOpencodeSkills).toBeDefined();
  });

  test("has homeOpencodeSkills", () => {
    expect(paths.homeOpencodeSkills).toBeDefined();
  });
});
