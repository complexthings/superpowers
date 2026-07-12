/**
 * Guard tests: cursor and gemini must NOT appear in any supported-platform
 * registry — they were removed in issue #6 and remain fully unsupported.
 *
 * Pi and Codex are supported harnesses (formalized in #36): they're detected
 * via `toolDetection`/`detectProjectPlatforms` and routed to `AGENTS.md` via
 * `AGENTS_MD_TARGET_PLATFORMS`. They're deliberately absent from the
 * skill-symlink registries below (`SKILL_PLATFORMS`, `paths` `*Skills`
 * getters) — that's by design, not lack of support: both harnesses read
 * `.agents/skills/` directly and need no per-platform symlink.
 *
 * Checks:
 *   - toolDetection keys exclude cursor/gemini (unsupported); include
 *     opencode/claude/copilot/pi/codex (supported)
 *   - AGENTS_MD_TARGET_PLATFORMS includes pi/codex (AGENTS.md routing)
 *   - SKILL_PLATFORMS names exclude cursor/gemini (unsupported) and
 *     codex/pi (supported, but symlink-excluded by design)
 *   - paths object has no cursor/gemini skill path getters (unsupported)
 *     and no codex/pi skill path getters (supported, but symlink-excluded
 *     by design)
 *
 * Kept platforms (must still be present):
 *   - toolDetection: opencode, claude, copilot, pi, codex
 *   - AGENTS_MD_TARGET_PLATFORMS: github-copilot, opencode, pi, codex
 *   - SKILL_PLATFORMS: claude, copilot, opencode
 *   - paths: projectClaudeSkills, homeClaudeSkills, projectCopilotSkills,
 *             homeCopilotSkills, projectOpencodeSkills, homeOpencodeSkills
 */

import { describe, test, expect } from "bun:test";
import { toolDetection, AGENTS_MD_TARGET_PLATFORMS } from "../src/core/platform-detection.js";
import { SKILL_PLATFORMS } from "../src/utils/symlinks.js";
import { paths } from "../src/core/paths.js";

// ─── toolDetection ───────────────────────────────────────────────────────────

describe("toolDetection — unsupported platforms absent (cursor, gemini)", () => {
  test("does not contain cursor", () => {
    expect(Object.keys(toolDetection)).not.toContain("cursor");
  });

  test("does not contain gemini", () => {
    expect(Object.keys(toolDetection)).not.toContain("gemini");
  });
});

describe("toolDetection — supported platforms present", () => {
  test("contains opencode", () => {
    expect(Object.keys(toolDetection)).toContain("opencode");
  });

  test("contains claude", () => {
    expect(Object.keys(toolDetection)).toContain("claude");
  });

  test("contains copilot", () => {
    expect(Object.keys(toolDetection)).toContain("copilot");
  });

  test("contains pi", () => {
    expect(Object.keys(toolDetection)).toContain("pi");
  });

  test("contains codex", () => {
    expect(Object.keys(toolDetection)).toContain("codex");
  });
});

// ─── AGENTS_MD_TARGET_PLATFORMS ──────────────────────────────────────────────

describe("AGENTS_MD_TARGET_PLATFORMS — pi & codex routed to AGENTS.md", () => {
  test("contains pi", () => {
    expect(AGENTS_MD_TARGET_PLATFORMS).toContain("pi");
  });

  test("contains codex", () => {
    expect(AGENTS_MD_TARGET_PLATFORMS).toContain("codex");
  });

  test("does not contain cursor", () => {
    expect(AGENTS_MD_TARGET_PLATFORMS).not.toContain("cursor");
  });

  test("does not contain gemini", () => {
    expect(AGENTS_MD_TARGET_PLATFORMS).not.toContain("gemini");
  });
});

// ─── SKILL_PLATFORMS ─────────────────────────────────────────────────────────
// codex/pi are supported harnesses but intentionally excluded here — they
// read .agents/skills/ directly and need no per-platform symlink.

describe("SKILL_PLATFORMS — unsupported platforms absent (cursor, gemini)", () => {
  const names = SKILL_PLATFORMS.map((p) => p.name);

  test("does not contain cursor", () => {
    expect(names).not.toContain("cursor");
  });

  test("does not contain gemini", () => {
    expect(names).not.toContain("gemini");
  });
});

describe("SKILL_PLATFORMS — codex/pi absent by design (direct .agents/skills read)", () => {
  const names = SKILL_PLATFORMS.map((p) => p.name);

  test("does not contain codex", () => {
    expect(names).not.toContain("codex");
  });

  test("does not contain pi", () => {
    expect(names).not.toContain("pi");
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

// ─── paths — no cursor/codex/gemini/pi skill path getters ───────────────────
// codex/pi getters are absent by design (direct .agents/skills read), not
// because they're unsupported — see file header.

describe("paths — unsupported platforms have no skill path getters (cursor, gemini)", () => {
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
});

describe("paths — codex/pi have no skill path getters by design", () => {
  test("has no projectCodexSkills", () => {
    expect(paths.projectCodexSkills).toBeUndefined();
  });

  test("has no homeCodexSkills", () => {
    expect(paths.homeCodexSkills).toBeUndefined();
  });

  test("has no projectPiSkills", () => {
    expect(paths.projectPiSkills).toBeUndefined();
  });

  test("has no homePiSkills", () => {
    expect(paths.homePiSkills).toBeUndefined();
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
