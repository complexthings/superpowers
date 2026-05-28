/**
 * Smoke test — proves bun test discovers and runs this file.
 *
 * Test layout convention (all slices follow this):
 *   .agents/tests/<feature>.test.js
 *
 * Tests assert EXTERNAL behavior through real code paths.
 * Use real temp-directory fixtures (created/torn down per test) rather than
 * mocking fs — see later slices for examples of that pattern.
 */

import { describe, test, expect } from "bun:test";

describe("smoke", () => {
  test("bun test runner is wired up and working", () => {
    expect(true).toBe(true);
  });

  test("basic arithmetic works", () => {
    expect(1 + 1).toBe(2);
  });
});
