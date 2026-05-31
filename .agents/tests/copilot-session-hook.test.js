/**
 * Tests for installCopilotSessionHook().
 *
 * Covers:
 *   - create-when-absent: writes <hooksDir>/superpowers.json, { created: true }
 *   - schema: version 1 + a sessionStart command hook with bash/powershell keys
 *   - idempotency: second run reports { existed: true } and content is byte-identical
 *
 * Uses real temp dirs — never touches the real ~/.copilot.
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { installCopilotSessionHook } from "../src/integrations/copilot.js";

const tempDirs = [];
const makeTempDir = () => {
  const d = mkdtempSync(join(tmpdir(), "superpowers-copilot-hook-"));
  tempDirs.push(d);
  return d;
};
afterEach(() => {
  while (tempDirs.length) {
    const d = tempDirs.pop();
    try { rmSync(d, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

describe("installCopilotSessionHook — create when absent", () => {
  test("creates superpowers.json and returns { created: true }", () => {
    const hooksDir = join(makeTempDir(), "hooks");
    const result = installCopilotSessionHook(hooksDir);
    expect(result.created).toBe(true);
    expect(existsSync(join(hooksDir, "superpowers.json"))).toBe(true);
  });

  test("file matches Copilot CLI hook schema (version 1, sessionStart command hook)", () => {
    const hooksDir = join(makeTempDir(), "hooks");
    installCopilotSessionHook(hooksDir);
    const hook = JSON.parse(readFileSync(join(hooksDir, "superpowers.json"), "utf8"));
    expect(hook.version).toBe(1);
    expect(Array.isArray(hook.hooks.sessionStart)).toBe(true);
    const entry = hook.hooks.sessionStart[0];
    expect(entry.type).toBe("command");
    expect(entry.bash).toContain("session-context --format=copilot");
    expect(entry.powershell).toContain("session-context --format=copilot");
  });
});

describe("installCopilotSessionHook — idempotency", () => {
  test("second run reports { existed: true } and content is byte-identical", () => {
    const hooksDir = join(makeTempDir(), "hooks");
    installCopilotSessionHook(hooksDir);
    const first = readFileSync(join(hooksDir, "superpowers.json"), "utf8");
    const result = installCopilotSessionHook(hooksDir);
    expect(result.existed).toBe(true);
    const second = readFileSync(join(hooksDir, "superpowers.json"), "utf8");
    expect(second).toBe(first);
  });
});
