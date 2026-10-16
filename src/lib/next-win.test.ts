import { describe, expect, it } from "vitest";
import { clampText, normalizeSuggestion, suggestionToWin } from "./next-win";

describe("clampText", () => {
  it("leaves short text untouched", () => {
    expect(clampText("Water the plant", 100)).toBe("Water the plant");
  });
  it("trims and caps text at the limit", () => {
    expect(clampText("  " + "a".repeat(150) + "  ", 100)).toHaveLength(100);
  });
});

describe("normalizeSuggestion", () => {
  it("falls back to the everyday category for unknown values", () => {
    expect(normalizeSuggestion({ title: "T", description: null, category: "party_tricks", reason: "r" }).category).toBe("everyday");
  });
  it("keeps a valid category", () => {
    expect(normalizeSuggestion({ title: "T", description: null, category: "learning", reason: "r" }).category).toBe("learning");
  });
  it("treats a missing description as empty", () => {
    expect(normalizeSuggestion({ title: "T", description: null, category: "learning", reason: "r" }).description).toBe("");
  });
});

describe("suggestionToWin", () => {
  it("creates a prefill win without an id so saving inserts a new row", () => {
    const win = suggestionToWin({ title: "Read one page", description: "", category: "learning", reason: "r" }, "2026-10-16");
    expect(win.id).toBe("");
    expect(win.achievement_date).toBe("2026-10-16");
    expect(win.description).toBeNull();
    expect(win.category).toBe("learning");
  });
});
