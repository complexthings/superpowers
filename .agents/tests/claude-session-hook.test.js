/**
 * Tests for installClaudeSessionHook().
 *
 * Covers:
 *   - create-when-absent: no settings.json → file created with our SessionStart hook
 *   - merge: preserves the user's other settings and other hooks
 *   - idempotency: running twice → exactly one Superpowers entry, byte-identical file
 *   - safety: invalid JSON settings is left untouched (error returned)
 *
 * Uses real temp dirs — no fs mocks, never touches the real ~/.claude.
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { installClaudeSessionHook } from "../src/integrations/claude.js";

const tempDirs = [];
const makeTempDir = () => {
  const d = mkdtempSync(join(tmpdir(), "superpowers-claude-hook-"));
  tempDirs.push(d);
  return d;
};
afterEach(() => {
  while (tempDirs.length) {
    const d = tempDirs.pop();
    try { rmSync(d, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

const MARKER = "superpowers-agent session-context";

describe("installClaudeSessionHook — create when absent", () => {
  test("creates settings.json and returns { created: true }", () => {
    const settingsPath = join(makeTempDir(), "settings.json");
    const result = installClaudeSessionHook(settingsPath);
    expect(result.created).toBe(true);
    expect(existsSync(settingsPath)).toBe(true);
  });

  test("written file is valid JSON with our SessionStart hook", () => {
    const settingsPath = join(makeTempDir(), "settings.json");
    installClaudeSessionHook(settingsPath);
    const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
    const entries = settings.hooks.SessionStart;
    expect(Array.isArray(entries)).toBe(true);
    const ours = entries.find(e => JSON.stringify(e).includes(MARKER));
    expect(ours).toBeDefined();
    expect(ours.matcher).toBe("startup|resume|clear|compact");
    expect(ours.hooks[0].command).toContain("--format=claude");
  });
});

describe("installClaudeSessionHook — merge preserves existing config", () => {
  test("keeps unrelated top-level settings and other hooks", () => {
    const settingsPath = join(makeTempDir(), "settings.json");
    const existing = {
      model: "claude-opus-4-8",
      permissions: { allow: ["Bash(ls:*)"] },
      hooks: {
        PreToolUse: [{ matcher: "Bash", hooks: [{ type: "command", command: "echo hi" }] }],
        SessionStart: [{ matcher: "startup", hooks: [{ type: "command", command: "my-own-hook" }] }],
      },
    };
    writeFileSync(settingsPath, JSON.stringify(existing, null, 2), "utf8");

    const result = installClaudeSessionHook(settingsPath);
    expect(result.updated).toBe(true);

    const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
    // Unrelated settings preserved
    expect(settings.model).toBe("claude-opus-4-8");
    expect(settings.permissions.allow).toContain("Bash(ls:*)");
    // Unrelated hook category preserved
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe("echo hi");
    // User's own SessionStart hook preserved AND ours added
    const cmds = settings.hooks.SessionStart.flatMap(e => e.hooks.map(h => h.command));
    expect(cmds).toContain("my-own-hook");
    expect(cmds.some(c => c.includes(MARKER))).toBe(true);
  });
});

describe("installClaudeSessionHook — idempotency", () => {
  test("running twice yields exactly one Superpowers entry", () => {
    const settingsPath = join(makeTempDir(), "settings.json");
    installClaudeSessionHook(settingsPath);
    installClaudeSessionHook(settingsPath);
    const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
    const ourEntries = settings.hooks.SessionStart.filter(e => JSON.stringify(e).includes(MARKER));
    expect(ourEntries.length).toBe(1);
  });

  test("second run reports existed/updated and produces identical hook entry", () => {
    const settingsPath = join(makeTempDir(), "settings.json");
    installClaudeSessionHook(settingsPath);
    const first = JSON.parse(readFileSync(settingsPath, "utf8")).hooks.SessionStart;
    const result = installClaudeSessionHook(settingsPath);
    expect(result.existed).toBe(true);
    const second = JSON.parse(readFileSync(settingsPath, "utf8")).hooks.SessionStart;
    expect(second).toEqual(first);
  });
});

describe("installClaudeSessionHook — safety", () => {
  test("does not clobber invalid JSON settings", () => {
    const settingsPath = join(makeTempDir(), "settings.json");
    const garbage = "{ this is : not json ";
    writeFileSync(settingsPath, garbage, "utf8");
    const result = installClaudeSessionHook(settingsPath);
    expect(result.error).toBe(true);
    // Original content untouched
    expect(readFileSync(settingsPath, "utf8")).toBe(garbage);
  });
});
