/**
 * Tests for the centralized session-context builder.
 *
 * Covers:
 *   - buildSessionContext includes the using-superpowers content AND the
 *     imperative leveraging-cli-tools directive, wrapped in EXTREMELY_IMPORTANT
 *   - formatSessionContext emits valid JSON for claude/copilot and raw text for raw
 */

import { describe, test, expect } from "bun:test";
import { buildSessionContext, formatSessionContext } from "../src/integrations/session-context.js";

describe("buildSessionContext", () => {
  test("returns a non-empty string", () => {
    const ctx = buildSessionContext();
    expect(typeof ctx).toBe("string");
    expect(ctx.length).toBeGreaterThan(0);
  });

  test("wraps content in EXTREMELY_IMPORTANT", () => {
    const ctx = buildSessionContext();
    expect(ctx).toContain("<EXTREMELY_IMPORTANT>");
    expect(ctx).toContain("</EXTREMELY_IMPORTANT>");
  });

  test("includes the using-superpowers skill content", () => {
    const ctx = buildSessionContext();
    expect(ctx).toContain("Using Superpowers");
  });

  test("includes the imperative leveraging-cli-tools directive", () => {
    const ctx = buildSessionContext();
    expect(ctx).toContain("leveraging-cli-tools");
    expect(ctx).toContain("YOU MUST");
  });
});

describe("formatSessionContext", () => {
  test("claude format is valid JSON with hookSpecificOutput.additionalContext", () => {
    const out = formatSessionContext("claude");
    const parsed = JSON.parse(out);
    expect(parsed.hookSpecificOutput.hookEventName).toBe("SessionStart");
    expect(parsed.hookSpecificOutput.additionalContext).toContain("leveraging-cli-tools");
  });

  test("copilot format is valid JSON with additionalContext", () => {
    const out = formatSessionContext("copilot");
    const parsed = JSON.parse(out);
    expect(parsed.additionalContext).toContain("leveraging-cli-tools");
    expect(parsed.additionalContext).toContain("Using Superpowers");
  });

  test("raw format is the unwrapped text", () => {
    const out = formatSessionContext("raw");
    expect(out).toContain("<EXTREMELY_IMPORTANT>");
    expect(out).toContain("leveraging-cli-tools");
  });

  test("default format is raw", () => {
    expect(formatSessionContext()).toBe(formatSessionContext("raw"));
  });
});
