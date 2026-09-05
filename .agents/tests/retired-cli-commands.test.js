import { describe, expect, test } from "bun:test";
import { spawnSync } from "child_process";
import { join } from "path";

const cli = join(import.meta.dir, "..", "superpowers-agent");
const run = (...args) => spawnSync(cli, args, { encoding: "utf8" });
const defaultHelp = run();

describe("retired CLI commands", () => {
  // Test list: each retired command falls back to default help; version still dispatches.
  test.each([
    "find-skills", "get-helpers", "use-skill", "execute", "dir", "path",
    // Retired in the CLI-surface trim.
    "setup-skills", "config-get", "config-set", "session-context", "add",
    "add-repository", "list-repositories", "pull", "rm", "install-aliases",
  ])(
    "%s is unavailable",
    (command) => {
      const result = run(command);

      expect(result.status).toBe(0);
      expect(result.stdout).toBe(defaultHelp.stdout);
    },
  );

  test("help no longer advertises the retired commands", () => {
    for (const command of [
      "setup-skills", "config-get", "config-set", "session-context", "add",
      "add-repository", "list-repositories", "pull", "rm", "install-aliases",
    ]) {
      expect(defaultHelp.stdout).not.toContain(`superpowers-agent ${command}`);
    }
  });

  test("every invocation prints the retirement banner", () => {
    expect(run("version").stderr).toContain("https://skills.sh");
    expect(defaultHelp.stderr).toContain("https://skills.sh");
  });

  test("version still dispatches", () => {
    const result = run("version");

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/^\d+\.\d+\.\d+\n$/);
  });
});
