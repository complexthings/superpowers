/**
 * Tests for updateCopilotInstructions()
 *
 * Covers:
 *   - create-when-absent: missing .github/copilot-instructions.md → file created, { created: true }
 *   - update-when-present: existing file with markers → content between markers replaced, surrounding preserved
 *   - no-error: source template now exists → never returns { error: true, message: 'Source template not found' }
 *
 * Uses real temp directories (created/torn down per test) — no fs mocks.
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { updateCopilotInstructions } from "../src/commands/bootstrap.js";

const START_MARKER = "<!-- SUPERPOWERS_-_INSTRUCTIONS_START -->";
const END_MARKER = "<!-- SUPERPOWERS_-_INSTRUCTIONS_END -->";

// Track temp dirs so we can clean them up after each test
const tempDirs = [];

const makeTempDir = () => {
  const d = mkdtempSync(join(tmpdir(), "superpowers-copilot-test-"));
  tempDirs.push(d);
  return d;
};

afterEach(() => {
  while (tempDirs.length) {
    const d = tempDirs.pop();
    try { rmSync(d, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

// ─── source template exists ──────────────────────────────────────────────────

describe("updateCopilotInstructions — source template", () => {
  test("does NOT return { error: true, message: 'Source template not found' }", () => {
    const projectRoot = makeTempDir();
    const result = updateCopilotInstructions(projectRoot);
    // If the source template is missing this would be { error: true, message: 'Source template not found' }
    expect(result?.error).not.toBe(true);
    expect(result?.message).not.toBe("Source template not found");
  });
});

// ─── create-when-absent ──────────────────────────────────────────────────────

describe("updateCopilotInstructions — create when absent", () => {
  test("returns { created: true } when no .github/copilot-instructions.md exists", () => {
    const projectRoot = makeTempDir();
    const result = updateCopilotInstructions(projectRoot);
    expect(result).toMatchObject({ created: true });
  });

  test("creates .github directory if it does not exist", () => {
    const projectRoot = makeTempDir();
    updateCopilotInstructions(projectRoot);
    expect(existsSync(join(projectRoot, ".github"))).toBe(true);
  });

  test("creates .github/copilot-instructions.md with both markers", () => {
    const projectRoot = makeTempDir();
    updateCopilotInstructions(projectRoot);
    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    expect(existsSync(dest)).toBe(true);
    const content = readFileSync(dest, "utf8");
    expect(content).toContain(START_MARKER);
    expect(content).toContain(END_MARKER);
  });

  test("created file gives native-skill guidance without retired content", () => {
    const projectRoot = makeTempDir();
    updateCopilotInstructions(projectRoot);
    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    const content = readFileSync(dest, "utf8");
    expect(content).toContain("native skill tool");
    expect(content).not.toContain("using-superpowers");
  });
});

// ─── update-when-present ─────────────────────────────────────────────────────

describe("updateCopilotInstructions — update when present (with markers)", () => {
  test("returns { updated: true } when file already exists with markers", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".github"), { recursive: true });
    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    const initial = `# My custom heading\n\nSome intro text.\n\n${START_MARKER}\nold content here\n${END_MARKER}\n\nSome trailing text.`;
    writeFileSync(dest, initial, "utf8");

    const result = updateCopilotInstructions(projectRoot);
    expect(result?.updated).toBe(true);
  });

  test("preserves content before the marker block", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".github"), { recursive: true });
    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    const initial = `# My custom heading\n\nSome intro text.\n\n${START_MARKER}\nold content here\n${END_MARKER}\n\nSome trailing text.`;
    writeFileSync(dest, initial, "utf8");

    updateCopilotInstructions(projectRoot);
    const updated = readFileSync(dest, "utf8");
    expect(updated).toContain("# My custom heading");
    expect(updated).toContain("Some intro text.");
  });

  test("preserves content after the marker block", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".github"), { recursive: true });
    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    const initial = `# My custom heading\n\nSome intro text.\n\n${START_MARKER}\nold content here\n${END_MARKER}\n\nSome trailing text.`;
    writeFileSync(dest, initial, "utf8");

    updateCopilotInstructions(projectRoot);
    const updated = readFileSync(dest, "utf8");
    expect(updated).toContain("Some trailing text.");
  });

  test("replaces old marker block content with new superpowers content", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".github"), { recursive: true });
    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    const initial = `# My custom heading\n\n${START_MARKER}\nTHIS_IS_OLD_CONTENT\n${END_MARKER}\n\nTrailing.`;
    writeFileSync(dest, initial, "utf8");

    updateCopilotInstructions(projectRoot);
    const updated = readFileSync(dest, "utf8");
    expect(updated).not.toContain("THIS_IS_OLD_CONTENT");
    expect(updated).toContain(START_MARKER);
    expect(updated).toContain(END_MARKER);
  });
});

// ─── update-when-present (no markers) ────────────────────────────────────────

describe("updateCopilotInstructions — update when present (no existing markers)", () => {
  test("returns { updated: true } when file exists without markers", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".github"), { recursive: true });
    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    writeFileSync(dest, "# Existing file without markers\n\nSome content.", "utf8");

    const result = updateCopilotInstructions(projectRoot);
    expect(result?.updated).toBe(true);
  });

  test("preserves existing content when no markers are present (appends)", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".github"), { recursive: true });
    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    writeFileSync(dest, "# Existing file without markers\n\nSome content.", "utf8");

    updateCopilotInstructions(projectRoot);
    const updated = readFileSync(dest, "utf8");
    expect(updated).toContain("# Existing file without markers");
    expect(updated).toContain("Some content.");
  });

  test("adds markers to file that previously had none", () => {
    const projectRoot = makeTempDir();
    mkdirSync(join(projectRoot, ".github"), { recursive: true });
    const dest = join(projectRoot, ".github", "copilot-instructions.md");
    writeFileSync(dest, "# Existing file without markers\n\nSome content.", "utf8");

    updateCopilotInstructions(projectRoot);
    const updated = readFileSync(dest, "utf8");
    expect(updated).toContain(START_MARKER);
    expect(updated).toContain(END_MARKER);
  });
});

// ─── idempotency ─────────────────────────────────────────────────────────────

describe("updateCopilotInstructions — idempotency", () => {
  test("running twice produces byte-identical file content (no accumulation)", () => {
    const projectRoot = makeTempDir();
    const dest = join(projectRoot, ".github", "copilot-instructions.md");

    updateCopilotInstructions(projectRoot);
    const afterFirst = readFileSync(dest, "utf8");

    updateCopilotInstructions(projectRoot);
    const afterSecond = readFileSync(dest, "utf8");

    expect(afterSecond).toBe(afterFirst);
  });

  test("does not duplicate marker block on repeated runs", () => {
    const projectRoot = makeTempDir();
    const dest = join(projectRoot, ".github", "copilot-instructions.md");

    updateCopilotInstructions(projectRoot);
    updateCopilotInstructions(projectRoot);
    const content = readFileSync(dest, "utf8");

    const startCount = content.split(START_MARKER).length - 1;
    const endCount = content.split(END_MARKER).length - 1;
    expect(startCount).toBe(1);
    expect(endCount).toBe(1);
  });
});
