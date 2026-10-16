import { describe, expect, it } from "vitest";
import { validateWin, countThisMonth, progressStory } from "./wins";

const ok = { title: "Ran 5k", description: "", category: "health_habits" as const, achievement_date: "2026-10-01" };

describe("validateWin", () => {
  it("requires a title", () => expect(validateWin({ ...ok, title: "  " }).title).toBeDefined());
  it("rejects titles over 100 chars", () => expect(validateWin({ ...ok, title: "a".repeat(101) }).title).toBeDefined());
  it("accepts 100-char titles", () => expect(validateWin({ ...ok, title: "a".repeat(100) }).title).toBeUndefined());
  it("rejects descriptions over 500 chars", () => expect(validateWin({ ...ok, description: "a".repeat(501) }).description).toBeDefined());
  it("requires category and date", () => {
    const e = validateWin({ ...ok, category: "", achievement_date: "" });
    expect(e.category).toBeDefined();
    expect(e.achievement_date).toBeDefined();
  });
});

describe("countThisMonth", () => {
  it("counts only wins dated in the current month", () => {
    const wins = [{ achievement_date: "2026-10-02" }, { achievement_date: "2026-09-30" }, { achievement_date: "2026-10-16" }];
    expect(countThisMonth(wins, new Date(2026, 9, 16))).toBe(2);
  });
});

describe("progressStory", () => {
  const wins = [
    { achievement_date: "2026-10-16", category: "learning" as const },
    { achievement_date: "2026-08-20", category: "everyday" as const },
    { achievement_date: "2026-10-02", category: "learning" as const },
  ];
  it("calculates the summary from supplied achievement records", () => {
    expect(progressStory(wins, new Date(2026, 9, 16))).toEqual({ total: 3, thisMonth: 2, activeMonths: 2, categories: 2, firstDate: "2026-08-20", latestDate: "2026-10-16", leadingCategory: "learning" });
  });
  it("does not invent progress for empty records", () => {
    expect(progressStory([], new Date(2026, 9, 16))).toEqual({ total: 0, thisMonth: 0, activeMonths: 0, categories: 0, firstDate: null, latestDate: null, leadingCategory: null });
  });
});
