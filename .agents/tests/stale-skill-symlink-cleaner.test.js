/**
 * Real-filesystem coverage for retired repo-managed skill reconciliation.
 *
 * Test list:
 * - a retired package-owned link is removed, even when dangling
 * - a relative raw target is normalized from the link parent
 * - outside, unallowlisted, regular, and unproven dangling entries remain
 */

import { describe, test, expect, afterEach } from "bun:test";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "fs";
import { join, relative } from "path";
import { tmpdir } from "os";
import { reconcileRetiredSkillSymlinks } from "../src/utils/stale-skill-symlink-cleaner.js";

let tmpRoots = [];

const makeTmp = () => {
  const dir = mkdtempSync(join(tmpdir(), "superpowers-reconcile-test-"));
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

const reconcile = (skillDir, bundledSkillsDir) =>
  reconcileRetiredSkillSymlinks({ skillDir, bundledSkillsDir });

afterEach(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
  tmpRoots = [];
});

describe("reconcileRetiredSkillSymlinks", () => {
  test("removes a package-owned retired symlink whose target no longer exists", () => {
    const skillDir = makeTmp();
    const bundledSkillsDir = join(makeTmp(), "skills");
    const linkPath = join(skillDir, "test-driven-development");
    symlinkSync(join(bundledSkillsDir, "test-driven-development"), linkPath, "dir");

    const result = reconcile(skillDir, bundledSkillsDir);

    expect(existsSync(linkPath)).toBe(false);
    expect(isSymlink(linkPath)).toBe(false);
    expect(result.removed).toEqual([linkPath]);
  });

  test("normalizes a relative raw target against the link parent", () => {
    const skillDir = join(makeTmp(), "managed-links");
    const bundledSkillsDir = join(makeTmp(), "package", "skills");
    const target = join(bundledSkillsDir, "writing-plans");
    mkdirSync(target, { recursive: true });
    mkdirSync(skillDir, { recursive: true });
    const linkPath = join(skillDir, "writing-plans");
    symlinkSync(relative(skillDir, target), linkPath, "dir");

    reconcile(skillDir, bundledSkillsDir);

    expect(isSymlink(linkPath)).toBe(false);
  });

  test("leaves a symlink outside the bundled skills tree", () => {
    const skillDir = makeTmp();
    const bundledSkillsDir = join(makeTmp(), "skills");
    const outsideTarget = join(makeTmp(), "test-driven-development");
    mkdirSync(outsideTarget);
    const linkPath = join(skillDir, "test-driven-development");
    symlinkSync(outsideTarget, linkPath, "dir");

    reconcile(skillDir, bundledSkillsDir);

    expect(isSymlink(linkPath)).toBe(true);
  });

  test("leaves an unallowlisted leaf inside the bundled skills tree", () => {
    const skillDir = makeTmp();
    const bundledSkillsDir = join(makeTmp(), "skills");
    const target = join(bundledSkillsDir, "retained-skill");
    mkdirSync(target, { recursive: true });
    const linkPath = join(skillDir, "retained-skill");
    symlinkSync(target, linkPath, "dir");

    reconcile(skillDir, bundledSkillsDir);

    expect(isSymlink(linkPath)).toBe(true);
  });

  test("leaves regular entries and dangling links with unproven ownership", () => {
    const skillDir = makeTmp();
    const bundledSkillsDir = join(makeTmp(), "skills");
    const regularFile = join(skillDir, "writing-plans");
    const danglingLink = join(skillDir, "test-driven-development");
    writeFileSync(regularFile, "user-managed");
    symlinkSync(join(makeTmp(), "missing", "test-driven-development"), danglingLink, "dir");

    reconcile(skillDir, bundledSkillsDir);

    expect(existsSync(regularFile)).toBe(true);
    expect(isSymlink(danglingLink)).toBe(true);
  });
});
