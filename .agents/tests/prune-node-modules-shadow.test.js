/**
 * pruneNodeModulesShadowLinks removes ~/.local/bin symlinks that point into an
 * npm node_modules dir (the stale-shadow trap, issue: nvm cross-version update),
 * and leaves everything else alone. Real temp symlinks, no mocks.
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdtempSync, rmSync, symlinkSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { pruneNodeModulesShadowLinks } from "../src/commands/bootstrap.js";

const tempDirs = [];
const makeTempDir = () => {
  const d = mkdtempSync(join(tmpdir(), "prune-shadow-test-"));
  tempDirs.push(d);
  return d;
};
afterEach(() => {
  while (tempDirs.length) {
    try { rmSync(tempDirs.pop(), { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

describe("pruneNodeModulesShadowLinks", () => {
  test("removes a symlink pointing into node_modules", () => {
    const d = makeTempDir();
    const link = join(d, "superpowers-agent");
    symlinkSync("/Users/x/.nvm/versions/node/v26/lib/node_modules/pkg/.agents/superpowers-agent", link);

    const removed = pruneNodeModulesShadowLinks([link]);
    expect(removed).toEqual([link]);
    expect(existsSync(link)).toBe(false);
  });

  test("keeps a symlink NOT pointing into node_modules (dev/clone install)", () => {
    const d = makeTempDir();
    const target = join(d, "superpowers-agent-bin");
    writeFileSync(target, "#!/bin/sh\n");
    const link = join(d, "superpowers-agent");
    symlinkSync(target, link);

    const removed = pruneNodeModulesShadowLinks([link]);
    expect(removed).toEqual([]);
    expect(existsSync(link)).toBe(true);
  });

  test("leaves a real (non-symlink) file untouched", () => {
    const d = makeTempDir();
    const real = join(d, "superpowers-agent");
    writeFileSync(real, "#!/bin/sh\n");

    const removed = pruneNodeModulesShadowLinks([real]);
    expect(removed).toEqual([]);
    expect(existsSync(real)).toBe(true);
  });

  test("ignores missing paths", () => {
    const d = makeTempDir();
    expect(pruneNodeModulesShadowLinks([join(d, "nope")])).toEqual([]);
  });
});
