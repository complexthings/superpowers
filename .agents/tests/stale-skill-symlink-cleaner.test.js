/**
 * Tests for the stale-skill-symlink cleaner (issue #7, Part B).
 *
 * Uses REAL temp directories created/torn down per test.
 * No fs mocks — all filesystem operations are real.
 *
 * Behaviors covered:
 *   1. Platform symlink whose target dir has skill.json → REMOVED
 *   2. Platform symlink whose target dir has only SKILL.md (no skill.json) → LEFT
 *   3. Symlink pointing OUTSIDE the managed roots → LEFT
 *   4. Non-symlink entry (regular file/dir) in a platform dir → untouched
 *   5. Deprecated dirs (.cursor/skills, .gemini/skills, .codex/skills) are scanned and scrubbed
 *   6. Global AND project-level dirs both handled
 *   7. No-op when the platform dir doesn't exist (no throw)
 *   8. No-op when the platform dir exists but contains no symlinks (no throw)
 *   9. A persona symlink in an agents dir NOT in the scan list is never removed
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  existsSync,
  lstatSync,
} from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { rmSync } from "fs";

import {
  cleanStaleSkillSymlinks,
} from "../src/utils/stale-skill-symlink-cleaner.js";

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Create a temp directory and return its path.
 * Caller is responsible for cleanup via teardown.
 */
const makeTmp = () =>
  mkdtempSync(join(tmpdir(), "superpowers-cleaner-test-"));

/**
 * Make a skill dir with skill.json inside a parent dir.
 * Returns the skill dir path.
 */
const makeSkillWithJson = (parent, name) => {
  const dir = join(parent, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "skill.json"), JSON.stringify({ name }));
  return dir;
};

/**
 * Make a skill dir with only SKILL.md (no skill.json) inside a parent dir.
 * Returns the skill dir path.
 */
const makeSkillMdOnly = (parent, name) => {
  const dir = join(parent, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "SKILL.md"), `# ${name}`);
  return dir;
};

/**
 * Create a symlink in a platform skills dir pointing to target.
 */
const makeSymlink = (platformDir, linkName, target) => {
  const linkPath = join(platformDir, linkName);
  symlinkSync(target, linkPath, "dir");
  return linkPath;
};

/**
 * Check if path is a symlink (without throwing).
 */
const isSymlink = (p) => {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
};

// ─── fixture setup ────────────────────────────────────────────────────────────

let tmpRoots = [];

const makeTmpTracked = () => {
  const dir = makeTmp();
  tmpRoots.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of tmpRoots) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {}
  }
  tmpRoots = [];
});

// ─── Behavior 1: skill.json-gated removal ───────────────────────────────────

describe("cleanStaleSkillSymlinks — skill.json gate", () => {
  test("removes platform symlink whose target dir has skill.json", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();

    const skillDir = makeSkillWithJson(managedRoot, "my-skill");
    const linkPath = makeSymlink(platformDir, "my-skill", skillDir);

    const result = cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRoot],
    });

    expect(existsSync(linkPath)).toBe(false);
    expect(isSymlink(linkPath)).toBe(false);
    expect(result.removed).toContain(linkPath);
  });

  test("result.removed count matches number of removed symlinks", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();

    makeSkillWithJson(managedRoot, "skill-a");
    makeSkillWithJson(managedRoot, "skill-b");
    makeSymlink(platformDir, "skill-a", join(managedRoot, "skill-a"));
    makeSymlink(platformDir, "skill-b", join(managedRoot, "skill-b"));

    const result = cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRoot],
    });

    expect(result.removed.length).toBe(2);
  });
});

// ─── Behavior 2: SKILL.md-only left untouched ───────────────────────────────

describe("cleanStaleSkillSymlinks — SKILL.md-only gate", () => {
  test("leaves platform symlink whose target dir has only SKILL.md (no skill.json)", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();

    const skillDir = makeSkillMdOnly(managedRoot, "md-only-skill");
    const linkPath = makeSymlink(platformDir, "md-only-skill", skillDir);

    const result = cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRoot],
    });

    expect(isSymlink(linkPath)).toBe(true);
    expect(result.removed).not.toContain(linkPath);
  });

  test("leaves symlink even when target has both SKILL.md and no skill.json", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();

    const skillDir = join(managedRoot, "no-json-skill");
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, "SKILL.md"), "# Skill");
    writeFileSync(join(skillDir, "README.md"), "docs");

    const linkPath = makeSymlink(platformDir, "no-json-skill", skillDir);

    cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRoot],
    });

    expect(isSymlink(linkPath)).toBe(true);
  });
});

// ─── Behavior 3: Symlink pointing OUTSIDE managed roots → LEFT ──────────────

describe("cleanStaleSkillSymlinks — outside managed roots", () => {
  test("leaves symlink whose target is outside any managed skills root", () => {
    const managedRoot = makeTmpTracked();
    const outsideDir = makeTmpTracked();
    const platformDir = makeTmpTracked();

    // Create a skill dir with skill.json but NOT in the managed root
    const outsideSkill = makeSkillWithJson(outsideDir, "outside-skill");
    const linkPath = makeSymlink(platformDir, "outside-skill", outsideSkill);

    const result = cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRoot], // outsideDir is NOT in this list
    });

    expect(isSymlink(linkPath)).toBe(true);
    expect(result.removed).not.toContain(linkPath);
  });
});

// ─── Behavior 4: Non-symlink entries untouched ──────────────────────────────

describe("cleanStaleSkillSymlinks — non-symlink entries", () => {
  test("does not touch a regular file in the platform skills dir", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();

    const regularFile = join(platformDir, "regular.md");
    writeFileSync(regularFile, "just a file");

    cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRoot],
    });

    expect(existsSync(regularFile)).toBe(true);
  });

  test("does not touch a regular directory in the platform skills dir", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();

    const regularDir = join(platformDir, "regular-dir");
    mkdirSync(regularDir);
    writeFileSync(join(regularDir, "skill.json"), "{}");

    cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRoot],
    });

    expect(existsSync(regularDir)).toBe(true);
  });
});

// ─── Behavior 5: Deprecated dirs scrubbed ───────────────────────────────────

describe("cleanStaleSkillSymlinks — deprecated platform dirs (.cursor, .gemini, .codex)", () => {
  test("scrubs symlinks from .cursor/skills dir when target has skill.json", () => {
    const managedRoot = makeTmpTracked();
    const fakeHome = makeTmpTracked();
    const cursorSkillsDir = join(fakeHome, ".cursor", "skills");
    mkdirSync(cursorSkillsDir, { recursive: true });

    const skillDir = makeSkillWithJson(managedRoot, "cursor-skill");
    const linkPath = makeSymlink(cursorSkillsDir, "cursor-skill", skillDir);

    cleanStaleSkillSymlinks({
      platformDirs: [cursorSkillsDir],
      managedSkillRoots: [managedRoot],
    });

    expect(isSymlink(linkPath)).toBe(false);
  });

  test("scrubs symlinks from .gemini/skills dir when target has skill.json", () => {
    const managedRoot = makeTmpTracked();
    const fakeHome = makeTmpTracked();
    const geminiSkillsDir = join(fakeHome, ".gemini", "skills");
    mkdirSync(geminiSkillsDir, { recursive: true });

    const skillDir = makeSkillWithJson(managedRoot, "gemini-skill");
    const linkPath = makeSymlink(geminiSkillsDir, "gemini-skill", skillDir);

    cleanStaleSkillSymlinks({
      platformDirs: [geminiSkillsDir],
      managedSkillRoots: [managedRoot],
    });

    expect(isSymlink(linkPath)).toBe(false);
  });

  test("scrubs symlinks from .codex/skills dir when target has skill.json", () => {
    const managedRoot = makeTmpTracked();
    const fakeHome = makeTmpTracked();
    const codexSkillsDir = join(fakeHome, ".codex", "skills");
    mkdirSync(codexSkillsDir, { recursive: true });

    const skillDir = makeSkillWithJson(managedRoot, "codex-skill");
    const linkPath = makeSymlink(codexSkillsDir, "codex-skill", skillDir);

    cleanStaleSkillSymlinks({
      platformDirs: [codexSkillsDir],
      managedSkillRoots: [managedRoot],
    });

    expect(isSymlink(linkPath)).toBe(false);
  });
});

// ─── Behavior 6: Global AND project-level dirs handled ──────────────────────

describe("cleanStaleSkillSymlinks — global + project dirs", () => {
  test("handles multiple platform dirs in one call", () => {
    const managedRoot = makeTmpTracked();
    const globalPlatformDir = makeTmpTracked();
    const projectPlatformDir = makeTmpTracked();

    const skillA = makeSkillWithJson(managedRoot, "skill-a");
    const skillB = makeSkillWithJson(managedRoot, "skill-b");

    const globalLink = makeSymlink(globalPlatformDir, "skill-a", skillA);
    const projectLink = makeSymlink(projectPlatformDir, "skill-b", skillB);

    const result = cleanStaleSkillSymlinks({
      platformDirs: [globalPlatformDir, projectPlatformDir],
      managedSkillRoots: [managedRoot],
    });

    expect(isSymlink(globalLink)).toBe(false);
    expect(isSymlink(projectLink)).toBe(false);
    expect(result.removed.length).toBe(2);
  });

  test("handles multiple managed skill roots", () => {
    const managedRootA = makeTmpTracked();
    const managedRootB = makeTmpTracked();
    const platformDir = makeTmpTracked();

    const skillA = makeSkillWithJson(managedRootA, "skill-from-a");
    const skillB = makeSkillWithJson(managedRootB, "skill-from-b");

    const linkA = makeSymlink(platformDir, "skill-from-a", skillA);
    const linkB = makeSymlink(platformDir, "skill-from-b", skillB);

    const result = cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRootA, managedRootB],
    });

    expect(isSymlink(linkA)).toBe(false);
    expect(isSymlink(linkB)).toBe(false);
    expect(result.removed.length).toBe(2);
  });
});

// ─── Behavior 7: No-op when platform dir doesn't exist ──────────────────────

describe("cleanStaleSkillSymlinks — no-op behaviors", () => {
  test("does not throw when a platform dir does not exist", () => {
    const managedRoot = makeTmpTracked();
    const nonExistentDir = join(makeTmpTracked(), "does-not-exist");

    expect(() => {
      cleanStaleSkillSymlinks({
        platformDirs: [nonExistentDir],
        managedSkillRoots: [managedRoot],
      });
    }).not.toThrow();
  });

  test("returns empty removed array when platform dir does not exist", () => {
    const managedRoot = makeTmpTracked();
    const nonExistentDir = join(makeTmpTracked(), "does-not-exist");

    const result = cleanStaleSkillSymlinks({
      platformDirs: [nonExistentDir],
      managedSkillRoots: [managedRoot],
    });

    expect(result.removed).toEqual([]);
  });

  // ─── Behavior 8: No-op when platform dir has no symlinks ─────────────────

  test("does not throw when platform dir exists but has no symlinks", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();

    // Only a regular file — no symlinks
    writeFileSync(join(platformDir, "some-file.md"), "content");

    expect(() => {
      cleanStaleSkillSymlinks({
        platformDirs: [platformDir],
        managedSkillRoots: [managedRoot],
      });
    }).not.toThrow();
  });

  test("returns empty removed array when platform dir has no symlinks", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();
    writeFileSync(join(platformDir, "some-file.md"), "content");

    const result = cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRoot],
    });

    expect(result.removed).toEqual([]);
  });

  test("tolerates a broken/dangling symlink without throwing", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();

    // Create a symlink to a path that doesn't exist
    const linkPath = join(platformDir, "dangling-link");
    symlinkSync("/tmp/does-not-exist-ever-12345", linkPath, "dir");

    expect(() => {
      cleanStaleSkillSymlinks({
        platformDirs: [platformDir],
        managedSkillRoots: [managedRoot],
      });
    }).not.toThrow();
  });
});

// ─── Behavior 9: Persona symlinks in agents dirs are never touched ───────────

describe("cleanStaleSkillSymlinks — persona symlinks spared", () => {
  test("persona symlink in a separate agents dir is NOT removed (cleaner never receives agents dirs)", () => {
    const managedRoot = makeTmpTracked();
    const skillsPlatformDir = makeTmpTracked();
    const agentsDir = makeTmpTracked(); // separate dir NOT in platformDirs

    // Skills dir has a skill.json skill → should be removed
    const skillDir = makeSkillWithJson(managedRoot, "regular-skill");
    const skillLink = makeSymlink(skillsPlatformDir, "regular-skill", skillDir);

    // Agents dir has a persona symlink pointing into managedRoot
    // (same managed root — but cleaner is never given this dir)
    const personaDir = makeSkillWithJson(managedRoot, "some-persona");
    const personaLink = makeSymlink(agentsDir, "some-persona", personaDir);

    cleanStaleSkillSymlinks({
      platformDirs: [skillsPlatformDir], // agentsDir intentionally NOT passed
      managedSkillRoots: [managedRoot],
    });

    // skill link in skills dir → removed
    expect(isSymlink(skillLink)).toBe(false);
    // persona link in agents dir → untouched (we never passed agentsDir)
    expect(isSymlink(personaLink)).toBe(true);
  });
});

// ─── result shape ─────────────────────────────────────────────────────────────

describe("cleanStaleSkillSymlinks — result object shape", () => {
  test("always returns an object with a removed array", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();

    const result = cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRoot],
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result.removed)).toBe(true);
  });

  test("returns skipped count for symlinks that were examined but not removed", () => {
    const managedRoot = makeTmpTracked();
    const platformDir = makeTmpTracked();

    const skillDir = makeSkillMdOnly(managedRoot, "md-only");
    makeSymlink(platformDir, "md-only", skillDir);

    const result = cleanStaleSkillSymlinks({
      platformDirs: [platformDir],
      managedSkillRoots: [managedRoot],
    });

    expect(typeof result.skipped).toBe("number");
    expect(result.skipped).toBeGreaterThanOrEqual(1);
  });
});
