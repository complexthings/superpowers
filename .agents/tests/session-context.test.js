/**
 * Behavioral coverage for the public command invoked by session-start hooks.
 */

import { spawnSync } from "child_process";
import { resolve } from "path";
import { describe, test, expect } from "bun:test";

const cli = resolve(import.meta.dir, "../src/cli.js");

const sessionContext = (format) => {
  const result = spawnSync(process.execPath, [cli, "session-context", `--format=${format}`], {
    encoding: "utf8",
  });
  expect(result.status).toBe(0);
  return result.stdout.trim();
};

const expectNudgeOnly = (context) => {
  expect(context).toContain("leveraging-cli-tools");
  expect(context).not.toContain("using-superpowers");
};

describe("session-context command", () => {
  test("prints raw nudge-only context", () => {
    const output = sessionContext("raw");
    expect(output).toContain("<EXTREMELY_IMPORTANT>");
    expect(output).toContain("</EXTREMELY_IMPORTANT>");
    expectNudgeOnly(output);
  });

  test("prints valid Claude hook JSON", () => {
    const output = JSON.parse(sessionContext("claude"));
    expect(output.hookSpecificOutput.hookEventName).toBe("SessionStart");
    expectNudgeOnly(output.hookSpecificOutput.additionalContext);
  });

  test("prints valid Copilot hook JSON", () => {
    const output = JSON.parse(sessionContext("copilot"));
    expectNudgeOnly(output.additionalContext);
  });
});
