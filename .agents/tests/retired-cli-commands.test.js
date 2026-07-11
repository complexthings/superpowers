import { describe, expect, test } from "bun:test";
import { spawnSync } from "child_process";
import { join } from "path";

const cli = join(import.meta.dir, "..", "superpowers-agent");
const run = (...args) => spawnSync(cli, args, { encoding: "utf8" });
const defaultHelp = run();

describe("retired CLI commands", () => {
  // Test list: each retired command falls back to default help; version still dispatches.
  test.each(["find-skills", "get-helpers", "use-skill", "execute", "dir", "path"])(
    "%s is unavailable",
    (command) => {
      const result = run(command);

      expect(result.status).toBe(0);
      expect(result.stdout).toBe(defaultHelp.stdout);
    },
  );

  test("version still dispatches", () => {
    const result = run("version");

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/^\d+\.\d+\.\d+\n$/);
  });
});
