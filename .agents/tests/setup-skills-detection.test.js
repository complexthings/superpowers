/**
 * Tests for detectProjectPlatforms() and the AGENTS_MD_TARGET_PLATFORMS seam
 * used by runSetupSkills() (#29).
 *
 * Covers:
 *   - each of the 5 harnesses is detected when its dot-folder exists in projectRoot
 *   - Copilot's folder-signal is false when no .github/ exists (the tightening —
 *     binary presence depends on the host, so we assert the deterministic
 *     folder-only seam rather than the CLI-dependent full function)
 *   - Pi and Codex land in the AGENTS.md target set when detected
 *
 * Uses real temp directories (created/torn down per test) — no fs mocks.
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  detectProjectPlatforms,
  hasPlatformFolder,
  AGENTS_MD_TARGET_PLATFORMS,
} from "../src/core/platform-detection.js";

const tempDirs = [];

const makeTempDir = () => {
  const d = mkdtempSync(join(tmpdir(), "superpowers-setup-skills-test-"));
  tempDirs.push(d);
  return d;
};

afterEach(() => {
  while (tempDirs.length) {
    const d = tempDirs.pop();
    try { rmSync(d, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

// ─── per-harness folder detection ────────────────────────────────────────────

describe("detectProjectPlatforms — dot-folder detection", () => {
  test("detects Claude Code via .claude/", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".claude"));
    expect(detectProjectPlatforms(projectRoot)).toContain("claude-code");
  });

  test("detects GitHub Copilot via .github/", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".github"));
    expect(detectProjectPlatforms(projectRoot)).toContain("github-copilot");
  });

  test("detects OpenCode via .opencode/", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".opencode"));
    expect(detectProjectPlatforms(projectRoot)).toContain("opencode");
  });

  test("detects Pi via .pi/", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".pi"));
    expect(detectProjectPlatforms(projectRoot)).toContain("pi");
  });

  test("detects Codex via .codex/", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".codex"));
    expect(detectProjectPlatforms(projectRoot)).toContain("codex");
  });
});

// ─── Copilot tightening (folder-or-binary, not always-on) ───────────────────

describe("hasPlatformFolder — Copilot folder signal", () => {
  test("is false for an empty project root (no .github/)", () => {
    const projectRoot = makeTempDir();
    expect(hasPlatformFolder(projectRoot, "github-copilot")).toBe(false);
  });

  test("is true once .github/ exists", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".github"));
    expect(hasPlatformFolder(projectRoot, "github-copilot")).toBe(true);
  });
});

// ─── AGENTS.md routing ────────────────────────────────────────────────────────

describe("AGENTS_MD_TARGET_PLATFORMS — Pi and Codex routing", () => {
  test("includes pi", () => {
    expect(AGENTS_MD_TARGET_PLATFORMS).toContain("pi");
  });

  test("includes codex", () => {
    expect(AGENTS_MD_TARGET_PLATFORMS).toContain("codex");
  });

  test("detected Pi/Codex survive the AGENTS.md filter", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".pi"));
    mkdirSync(join(projectRoot, ".codex"));
    const detected = detectProjectPlatforms(projectRoot);
    const agentsPlatforms = detected.filter(p => AGENTS_MD_TARGET_PLATFORMS.includes(p));
    expect(agentsPlatforms).toContain("pi");
    expect(agentsPlatforms).toContain("codex");
  });
});
