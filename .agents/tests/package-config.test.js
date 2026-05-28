/**
 * Tests for root package.json configuration invariants.
 *
 * Covers:
 *   - No `postinstall` script (supply-chain safety)
 *   - `bin` entries for `superpowers-agent` and `superpowers` still present
 *
 * These are real regression guards with no mocking — they read the actual
 * root package.json via fs and assert structural properties.
 */

import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

// Root package.json is one level up from .agents/
const rootPkgPath = join(import.meta.dir, "..", "..", "package.json");
const pkg = JSON.parse(readFileSync(rootPkgPath, "utf8"));

describe("root package.json – postinstall removed", () => {
  test("scripts.postinstall is not defined (supply-chain safety)", () => {
    expect(pkg.scripts?.postinstall).toBeUndefined();
  });
});

describe("root package.json – bin entries intact", () => {
  test("bin.superpowers-agent points to the CLI bundle", () => {
    expect(pkg.bin?.["superpowers-agent"]).toBe(".agents/superpowers-agent");
  });

  test("bin.superpowers points to the CLI bundle", () => {
    expect(pkg.bin?.["superpowers"]).toBe(".agents/superpowers-agent");
  });
});
