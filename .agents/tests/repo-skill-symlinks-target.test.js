/**
 * syncRepoSkillSymlinks must honor a custom target directory so bootstrap can
 * mirror repo skills into ~/.claude/skills (which Claude reads instead of
 * ~/.agents/skills).
 *
 * Test list:
 * - per-skill symlinks are created in the given target dir, pointing at sources
 * - a pre-existing non-symlink entry in the target is left untouched (not clobbered)
 */

import { describe, test, expect, afterEach, beforeEach } from "bun:test";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readlinkSync,
  rmSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { syncRepoSkillSymlinks } from "../src/utils/symlinks.js";
import { paths } from "../src/core/paths.js";

let tmpRoots = [];
let savedRepo;

const makeTmp = () => {
  const dir = mkdtempSync(join(tmpdir(), "superpowers-target-test-"));
  tmpRoots.push(dir);
  return dir;
};

const isSymlink = (path) => {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
};

// Build a fake bundled skills tree and point paths.superpowersRepo at it.
const stubBundledSkills = (names) => {
  const repo = makeTmp();
  const skillsDir = join(repo, "skills");
  for (const name of names) {
    const dir = join(skillsDir, "category", name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), `---\nname: ${name}\n---\n`);
  }
  // homeSuperpowersSkills is derived from superpowersRepo
  Object.defineProperty(paths, "superpowersRepo", { value: repo, configurable: true });
  return skillsDir;
};

beforeEach(() => {
  savedRepo = Object.getOwnPropertyDescriptor(paths, "superpowersRepo");
});

afterEach(() => {
  if (savedRepo) Object.defineProperty(paths, "superpowersRepo", savedRepo);
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
  tmpRoots = [];
});

describe("syncRepoSkillSymlinks(targetDir)", () => {
  test("creates per-skill symlinks in the given target dir", () => {
    const skillsDir = stubBundledSkills(["alpha", "beta"]);
    const target = join(makeTmp(), "skills");

    const result = syncRepoSkillSymlinks(target);

    expect(result.created).toBe(2);
    expect(isSymlink(join(target, "alpha"))).toBe(true);
    expect(isSymlink(join(target, "beta"))).toBe(true);
    expect(readlinkSync(join(target, "alpha"))).toBe(join(skillsDir, "category", "alpha"));
  });

  test("does not clobber a pre-existing non-symlink entry", () => {
    stubBundledSkills(["alpha"]);
    const target = join(makeTmp(), "skills");
    mkdirSync(target, { recursive: true });
    const usersOwn = join(target, "alpha");
    mkdirSync(usersOwn);
    writeFileSync(join(usersOwn, "SKILL.md"), "user's own skill");

    const result = syncRepoSkillSymlinks(target);

    expect(isSymlink(usersOwn)).toBe(false);
    expect(existsSync(join(usersOwn, "SKILL.md"))).toBe(true);
    expect(result.errors.length).toBe(1);
  });
});
