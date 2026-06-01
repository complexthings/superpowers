/**
 * Tests for agent platform registry (platforms.js)
 *
 * Covers:
 *   - getSupportedPlatforms() membership (github, opencode, claude)
 *   - getAgentPlatform() returns correct platform config or null for unknown
 *   - getAgentSourcePath() resolves to <repo>/<sourceDir>/<name><sourceExt>
 *   - getAgentDestPath() resolves to <destDir>/<name><destExt>
 *   - Unknown platform key returns null from getAgentPlatform/getAgentSourcePath/getAgentDestPath
 *
 * Tests are pure path-resolution assertions — no fs calls.
 * Expected paths are built portably via os.homedir() and path.join.
 */

import { describe, test, expect } from "bun:test";
import { join } from "path";
import { homedir } from "os";
import {
  getSupportedPlatforms,
  getAgentPlatform,
  getAgentSourcePath,
  getAgentDestPath,
  getAgentDestPaths,
} from "../src/agents/platforms.js";

// ─── getSupportedPlatforms ───────────────────────────────────────────────────

describe("getSupportedPlatforms", () => {
  test("includes github", () => {
    expect(getSupportedPlatforms()).toContain("github");
  });

  test("includes opencode", () => {
    expect(getSupportedPlatforms()).toContain("opencode");
  });

  test("includes claude", () => {
    expect(getSupportedPlatforms()).toContain("claude");
  });
});

// ─── getAgentPlatform ────────────────────────────────────────────────────────

describe("getAgentPlatform", () => {
  test("returns null for unknown platform key", () => {
    expect(getAgentPlatform("nonexistent-platform")).toBeNull();
  });

  test("returns claude platform config", () => {
    const plat = getAgentPlatform("claude");
    expect(plat).not.toBeNull();
    expect(plat.name).toBe("claude");
    expect(plat.sourceDir).toBe(".claude/agents");
    expect(plat.sourceExt).toBe(".md");
    expect(plat.destExt).toBe(".md");
  });

  test("claude getDestDir returns ~/.claude/agents", () => {
    const plat = getAgentPlatform("claude");
    const expected = join(homedir(), ".claude", "agents");
    expect(plat.getDestDir()).toBe(expected);
  });

  test("returns github platform config", () => {
    const plat = getAgentPlatform("github");
    expect(plat).not.toBeNull();
    expect(plat.name).toBe("github");
  });

  test("returns opencode platform config", () => {
    const plat = getAgentPlatform("opencode");
    expect(plat).not.toBeNull();
    expect(plat.name).toBe("opencode");
  });
});

// ─── getAgentSourcePath ──────────────────────────────────────────────────────

describe("getAgentSourcePath", () => {
  const repoRoot = "/some/repo";

  test("returns null for unknown platform", () => {
    expect(getAgentSourcePath(repoRoot, "nonexistent-platform", "my-agent")).toBeNull();
  });

  test("claude source path resolves to <repo>/.claude/agents/<name>.md", () => {
    const expected = join(repoRoot, ".claude", "agents", "my-agent.md");
    expect(getAgentSourcePath(repoRoot, "claude", "my-agent")).toBe(expected);
  });

  test("github source path resolves correctly", () => {
    const expected = join(repoRoot, ".github", "agents", "my-agent.agent.md");
    expect(getAgentSourcePath(repoRoot, "github", "my-agent")).toBe(expected);
  });

  test("opencode source path resolves correctly", () => {
    const expected = join(repoRoot, ".opencode", "agents", "my-agent.md");
    expect(getAgentSourcePath(repoRoot, "opencode", "my-agent")).toBe(expected);
  });
});

// ─── getAgentDestPath ────────────────────────────────────────────────────────

describe("getAgentDestPath", () => {
  test("returns null for unknown platform", () => {
    expect(getAgentDestPath("nonexistent-platform", "my-agent")).toBeNull();
  });

  test("claude dest path resolves to ~/.claude/agents/<name>.md", () => {
    const expected = join(homedir(), ".claude", "agents", "my-agent.md");
    expect(getAgentDestPath("claude", "my-agent")).toBe(expected);
  });

  test("opencode dest path resolves to ~/.config/opencode/agents/<name>.md", () => {
    const expected = join(homedir(), ".config", "opencode", "agents", "my-agent.md");
    expect(getAgentDestPath("opencode", "my-agent")).toBe(expected);
  });
});

// ─── getAgentDestPaths ───────────────────────────────────────────────────────

describe("getAgentDestPaths", () => {
  test("returns [] for unknown platform", () => {
    expect(getAgentDestPaths("nonexistent-platform", "my-agent")).toEqual([]);
  });

  test("github resolves to both the VS Code prompts dir and ~/.copilot/agents", () => {
    const plat = getAgentPlatform("github");
    const vscodePath = join(plat.getDestDir(), "my-agent.agent.md");
    const copilotPath = join(homedir(), ".copilot", "agents", "my-agent.agent.md");
    expect(getAgentDestPaths("github", "my-agent")).toEqual([vscodePath, copilotPath]);
  });

  test("github primary destination matches getAgentDestPath", () => {
    expect(getAgentDestPaths("github", "my-agent")[0]).toBe(
      getAgentDestPath("github", "my-agent")
    );
  });

  test("claude resolves to a single ~/.claude/agents path", () => {
    const expected = join(homedir(), ".claude", "agents", "my-agent.md");
    expect(getAgentDestPaths("claude", "my-agent")).toEqual([expected]);
  });

  test("opencode resolves to a single ~/.config/opencode/agents path", () => {
    const expected = join(homedir(), ".config", "opencode", "agents", "my-agent.md");
    expect(getAgentDestPaths("opencode", "my-agent")).toEqual([expected]);
  });
});
