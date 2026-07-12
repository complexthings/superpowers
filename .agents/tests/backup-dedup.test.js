/**
 * Tests for backup deduplication (ticket #31)
 *
 * Re-running `superpowers-agent setup-skills` must keep exactly ONE
 * `<file>.backup-<date>` per instruction file instead of accumulating a
 * new backup on every run.
 *
 * Covers the shared `backupFileDeduped()` helper directly (the cleanest
 * seam — `runSetupSkills()` reads `process.cwd()` so it's awkward to
 * exercise from a tmpdir), plus the two exported functions that call it
 * (`updatePlatformFile` for CLAUDE.md, `updateCopilotInstructions` for
 * .github/copilot-instructions.md) to prove real call sites are wired up.
 *
 * Uses real temp directories (created/torn down per test) — no fs mocks.
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { backupFileDeduped, updatePlatformFile, updateCopilotInstructions } from "../src/commands/bootstrap.js";

const tempDirs = [];

const makeTempDir = () => {
  const d = mkdtempSync(join(tmpdir(), "superpowers-backup-test-"));
  tempDirs.push(d);
  return d;
};

afterEach(() => {
  while (tempDirs.length) {
    const d = tempDirs.pop();
    try { rmSync(d, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

const backupsFor = (dir, basename) =>
  readdirSync(dir).filter((entry) => entry.startsWith(`${basename}.backup`));

// ─── backupFileDeduped — direct ──────────────────────────────────────────────

describe.each(["AGENTS.md", "CLAUDE.md", "copilot-instructions.md"])(
  "backupFileDeduped — %s",
  (basename) => {
    test("leaves exactly one backup after a single run", () => {
      const dir = makeTempDir();
      const filePath = join(dir, basename);
      writeFileSync(filePath, "original content", "utf8");

      const backupPath = backupFileDeduped(filePath);

      expect(existsSync(backupPath)).toBe(true);
      expect(readFileSync(backupPath, "utf8")).toBe("original content");
      expect(backupsFor(dir, basename)).toHaveLength(1);
    });

    test("removes a stale backup and leaves exactly one after re-running", () => {
      const dir = makeTempDir();
      const filePath = join(dir, basename);
      writeFileSync(filePath, "second run content", "utf8");
      const stalePath = `${filePath}.backup-OLD`;
      writeFileSync(stalePath, "stale backup content", "utf8");

      backupFileDeduped(filePath);

      expect(existsSync(stalePath)).toBe(false);
      expect(backupsFor(dir, basename)).toHaveLength(1);
    });

    test("does not touch an unrelated similarly-named file", () => {
      const dir = makeTempDir();
      const filePath = join(dir, basename);
      writeFileSync(filePath, "content", "utf8");
      const unrelatedPath = join(dir, `${basename}.other`);
      writeFileSync(unrelatedPath, "unrelated content", "utf8");

      backupFileDeduped(filePath);

      expect(existsSync(unrelatedPath)).toBe(true);
      expect(readFileSync(unrelatedPath, "utf8")).toBe("unrelated content");
    });
  }
);

// ─── updatePlatformFile (CLAUDE.md) — integration ────────────────────────────

describe("updatePlatformFile — backup dedup (CLAUDE.md)", () => {
  test("running twice leaves exactly one backup, not two", () => {
    const dir = makeTempDir();
    const claudeMdPath = join(dir, "CLAUDE.md");
    writeFileSync(claudeMdPath, "# CLAUDE.md\n\noriginal content", "utf8");
    const template = "template body {{DATE}} {{SUPERPOWERS_PATH}}";

    updatePlatformFile(claudeMdPath, template, ["claude-code"], false);
    updatePlatformFile(claudeMdPath, template, ["claude-code"], false);

    expect(backupsFor(dir, "CLAUDE.md")).toHaveLength(1);
  });
});

// ─── updateCopilotInstructions — integration ─────────────────────────────────

describe("updateCopilotInstructions — backup dedup", () => {
  test("running twice against a pre-existing file leaves exactly one backup, not two", () => {
    const projectRoot = makeTempDir();
    const githubDir = join(projectRoot, ".github");
    mkdirSync(githubDir, { recursive: true });
    const dest = join(githubDir, "copilot-instructions.md");
    writeFileSync(dest, "# Existing file\n\nSome content.", "utf8");

    updateCopilotInstructions(projectRoot);
    updateCopilotInstructions(projectRoot);

    expect(backupsFor(githubDir, "copilot-instructions.md")).toHaveLength(1);
  });
});
