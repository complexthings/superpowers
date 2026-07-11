import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const rootDir = join(import.meta.dir, "..", "..");
const skillsDir = join(rootDir, "skills");

const retiredSkills = [
  "architecture/preserving-productive-tensions",
  "collaboration/dispatching-parallel-agents",
  "collaboration/executing-plans",
  "collaboration/finishing-a-development-branch",
  "collaboration/receiving-code-review",
  "collaboration/requesting-code-review",
  "collaboration/subagent-driven-development",
  "collaboration/using-git-worktrees",
  "collaboration/writing-plans",
  "debugging/defense-in-depth",
  "debugging/root-cause-tracing",
  "debugging/systematic-debugging",
  "debugging/verification-before-completion",
  "finding-skills",
  "meta/create-agents-md",
  "meta/creating-prompts",
  "meta/using-superpowers",
  "meta/writing-prompts",
  "problem-solving/collision-zone-thinking",
  "problem-solving/inversion-exercise",
  "problem-solving/meta-pattern-recognition",
  "problem-solving/scale-game",
  "problem-solving/simplification-cascades",
  "problem-solving/when-stuck",
  "research/tracing-knowledge-lineages",
  "testing/condition-based-waiting",
  "testing/test-driven-development",
  "testing/testing-anti-patterns",
  "testing/verification-before-completion",
  "using-a-skill",
];

const retainedSkills = [
  "collaboration/brainstorming",
  "collaboration/leveraging-cli-tools",
  "meta/create-skill-json",
  "setup-skills",
];

describe("bundled skills", () => {
  // Test list: all 30 approved removals are absent; all four unlisted bundles remain.
  test("contains none of the approved retired skill directories", () => {
    const present = retiredSkills.filter((skill) => existsSync(join(skillsDir, skill)));

    expect(present).toEqual([]);
  });

  test("retains every unlisted bundled skill directory", () => {
    const missing = retainedSkills.filter((skill) => !existsSync(join(skillsDir, skill)));

    expect(missing).toEqual([]);
  });

  test("publishes exactly the retained bundles in skill.json", () => {
    const { skills } = JSON.parse(readFileSync(join(rootDir, "skill.json"), "utf8"));

    expect(skills).toEqual(retainedSkills.map((skill) => `skills/${skill}`));
  });
});
