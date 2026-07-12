/**
 * Package-manager detection for the `update` command.
 *
 * Test list:
 * - a bun global install path resolves to bun
 * - a pnpm global install path resolves to pnpm
 * - a yarn global install path resolves to yarn
 * - a deno install path resolves to deno
 * - a plain npm global install path resolves to npm
 * - an unrecognized path falls back to npm
 * - every detected manager has an install command
 */

import { describe, test, expect } from "bun:test";
import { detectPackageManager, PM_INSTALL } from "../src/commands/update.js";

describe("detectPackageManager", () => {
  test("bun global install path", () => {
    expect(detectPackageManager("/Users/x/.bun/install/global/node_modules/@complexthings/superpowers-agent")).toBe("bun");
  });

  test("pnpm global install path", () => {
    expect(detectPackageManager("/Users/x/Library/pnpm/global/5/node_modules/@complexthings/superpowers-agent")).toBe("pnpm");
  });

  test("yarn global install path", () => {
    expect(detectPackageManager("/Users/x/.config/yarn/global/node_modules/@complexthings/superpowers-agent")).toBe("yarn");
  });

  test("deno install path", () => {
    expect(detectPackageManager("/Users/x/.deno/bin/superpowers-agent")).toBe("deno");
  });

  test("npm global install path", () => {
    expect(detectPackageManager("/Users/x/.nvm/versions/node/v22.0.0/lib/node_modules/@complexthings/superpowers-agent")).toBe("npm");
  });

  test("unknown path falls back to npm", () => {
    expect(detectPackageManager("/somewhere/odd")).toBe("npm");
  });

  test("every detected manager has an install command", () => {
    for (const pm of ["npm", "pnpm", "yarn", "bun", "deno"]) {
      expect(typeof PM_INSTALL[pm]).toBe("string");
      expect(PM_INSTALL[pm]).toContain("@complexthings/superpowers-agent");
    }
  });
});
