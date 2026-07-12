/**
 * Real-filesystem coverage for syncProjectSkillSymlinks().
 *
 * Mirrors .agents/references/scripts/setup-skill-symlinks.sh:
 * - links .claude/skills, .github/skills, .opencode/skill back to
 *   ../.agents/skills, but only when the parent dot-folder already exists
 * - never clobbers a pre-existing real (non-symlink) file/dir at the target
 * - no symlink for pi/codex, even if .pi/ or .codex/ exist
 * - idempotent across repeated runs
 */

import { describe, test, expect, afterEach } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  lstatSync,
  readlinkSync,
  existsSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { syncProjectSkillSymlinks } from "../src/utils/symlinks.js";

let tmpRoots = [];

const makeProjectRoot = () => {
  const dir = mkdtempSync(join(tmpdir(), "superpowers-project-skill-symlinks-test-"));
  tmpRoots.push(dir);
  mkdirSync(join(dir, ".agents", "skills"), { recursive: true });
  return dir;
};

const isSymlink = (path) => {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
};

afterEach(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
  tmpRoots = [];
});

describe("syncProjectSkillSymlinks — all parents present", () => {
  test("creates all three symlinks pointing to ../.agents/skills", () => {
    const projectRoot = makeProjectRoot();
    mkdirSync(join(projectRoot, ".claude"));
    mkdirSync(join(projectRoot, ".opencode"));
    mkdirSync(join(projectRoot, ".github"));

    const result = syncProjectSkillSymlinks(projectRoot);

    expect(result.created).toBe(3);

    const links = [
      join(projectRoot, ".claude", "skills"),
      join(projectRoot, ".github", "skills"),
      join(projectRoot, ".opencode", "skill"),
    ];
    for (const link of links) {
      expect(isSymlink(link)).toBe(true);
      expect(readlinkSync(link)).toBe("../.agents/skills");
    }
  });
});

describe("syncProjectSkillSymlinks — missing parent dot-folder", () => {
  test("does not create a symlink when the parent dot-folder is absent", () => {
    const projectRoot = makeProjectRoot();
    // No .claude/, .github/, or .opencode/ created.

    syncProjectSkillSymlinks(projectRoot);

    expect(existsSync(join(projectRoot, ".claude"))).toBe(false);
    expect(existsSync(join(projectRoot, ".github"))).toBe(false);
    expect(existsSync(join(projectRoot, ".opencode"))).toBe(false);
  });

  test("creates only the symlinks whose parent exists", () => {
    const projectRoot = makeProjectRoot();
    mkdirSync(join(projectRoot, ".claude"));

    const result = syncProjectSkillSymlinks(projectRoot);

    expect(result.created).toBe(1);
    expect(isSymlink(join(projectRoot, ".claude", "skills"))).toBe(true);
    expect(existsSync(join(projectRoot, ".github", "skills"))).toBe(false);
    expect(existsSync(join(projectRoot, ".opencode", "skill"))).toBe(false);
  });
});

describe("syncProjectSkillSymlinks — pre-existing real file/dir", () => {
  test("leaves a real (non-symlink) directory at the target untouched", () => {
    const projectRoot = makeProjectRoot();
    mkdirSync(join(projectRoot, ".claude", "skills"), { recursive: true });
    writeFileSync(join(projectRoot, ".claude", "skills", "keep-me.txt"), "user data");

    const result = syncProjectSkillSymlinks(projectRoot);

    const target = join(projectRoot, ".claude", "skills");
    expect(isSymlink(target)).toBe(false);
    expect(existsSync(join(target, "keep-me.txt"))).toBe(true);
    expect(result.skipped).toBeGreaterThanOrEqual(1);
  });

  test("does not throw when the real target is a file, not a directory", () => {
    const projectRoot = makeProjectRoot();
    mkdirSync(join(projectRoot, ".opencode"));
    writeFileSync(join(projectRoot, ".opencode", "skill"), "not a directory");

    expect(() => syncProjectSkillSymlinks(projectRoot)).not.toThrow();
    expect(isSymlink(join(projectRoot, ".opencode", "skill"))).toBe(false);
  });
});

describe("syncProjectSkillSymlinks — pi/codex excluded", () => {
  test("creates no skill symlink under .pi/ or .codex/ even when those folders exist", () => {
    const projectRoot = makeProjectRoot();
    mkdirSync(join(projectRoot, ".pi"));
    mkdirSync(join(projectRoot, ".codex"));

    syncProjectSkillSymlinks(projectRoot);

    expect(existsSync(join(projectRoot, ".pi", "skills"))).toBe(false);
    expect(existsSync(join(projectRoot, ".pi", "skill"))).toBe(false);
    expect(existsSync(join(projectRoot, ".codex", "skills"))).toBe(false);
    expect(existsSync(join(projectRoot, ".codex", "skill"))).toBe(false);
  });
});

describe("syncProjectSkillSymlinks — idempotent", () => {
  test("running twice does not throw or duplicate", () => {
    const projectRoot = makeProjectRoot();
    mkdirSync(join(projectRoot, ".claude"));
    mkdirSync(join(projectRoot, ".opencode"));
    mkdirSync(join(projectRoot, ".github"));

    expect(() => syncProjectSkillSymlinks(projectRoot)).not.toThrow();
    expect(() => syncProjectSkillSymlinks(projectRoot)).not.toThrow();

    const link = join(projectRoot, ".claude", "skills");
    expect(isSymlink(link)).toBe(true);
    expect(readlinkSync(link)).toBe("../.agents/skills");
  });
});
