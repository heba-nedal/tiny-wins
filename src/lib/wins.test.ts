import { describe, expect, it } from "vitest";
import { validateWin, countThisMonth, progressStory, groupWinsByMonth, type Win } from "./wins";

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

describe("groupWinsByMonth", () => {
  const w = (achievement_date: string, created_at: string, title = "t"): Win =>
    ({ id: title, title, description: null, category: "everyday", achievement_date, created_at, user_id: "u" });

  it("groups newest month first and sorts wins inside each month", () => {
    const groups = groupWinsByMonth([
      w("2026-08-20", "2026-08-20T10:00:00Z", "aug"),
      w("2026-10-02", "2026-10-02T10:00:00Z", "early"),
      w("2026-10-16", "2026-10-16T10:00:00Z", "late"),
    ]);
    expect(groups.map((g) => g.label)).toEqual(["October 2026", "August 2026"]);
    expect(groups[0]?.wins.map((x) => x.title)).toEqual(["late", "early"]);
  });

  it("keeps multiple wins sharing the same date without duplication", () => {
    const groups = groupWinsByMonth([
      w("2026-10-16", "2026-10-16T09:00:00Z", "a"),
      w("2026-10-16", "2026-10-16T08:00:00Z", "b"),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.wins).toHaveLength(2);
  });
});
