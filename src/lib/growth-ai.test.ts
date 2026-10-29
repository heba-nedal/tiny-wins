import { describe, expect, it } from "vitest";
import { monthBounds, monthInput, validateGrow, validateMonthly, winInput } from "./growth-ai";

describe("calendar month rules", () => {
  it("selects October by achievement DATE without timezone shifts", () => {
    expect(monthBounds("2026-10")).toEqual({ start: "2026-10-01", end: "2026-11-01" });
  });
  it("handles December across years", () => {
    expect(monthBounds("2026-12")).toEqual({ start: "2026-12-01", end: "2027-01-01" });
  });
  it("handles leap February", () => {
    expect(monthBounds("2024-02")).toEqual({ start: "2024-02-01", end: "2024-03-01" });
  });
  it("rejects invalid month inputs on the server", () => {
    for (const month of ["2026-00", "2026-13", "2026-2", "0000-01", "2026-10-01"]) expect(monthInput.safeParse({ month }).success).toBe(false);
  });
  it("does not accept user IDs or authoritative achievement content", () => {
    expect(winInput.safeParse({ id: "12345678-1234-4234-8234-123456789012", title: "Invented" }).success).toBe(false);
    expect(monthInput.safeParse({ month: "2026-10", userId: "someone-else" }).success).toBe(false);
  });
});

describe("reflection validation", () => {
  it("requires all usable sections", () => {
    expect(() => validateGrow({ shows: " ", buildOn: "Apply it", nextStep: "Practice", why: "Same topic" })).toThrow();
    expect(() => validateGrow({ shows: "Done" })).toThrow();
  });
  it("preserves Arabic text", () => {
    expect(validateGrow({ shows: " تعلمت شيئاً جديداً ", buildOn: "طبّق الفكرة", nextStep: "جرّب مثالاً", why: "يرتبط بما تعلمته" }).shows).toBe("تعلمت شيئاً جديداً");
  });
  it("only celebrates an actual win from the selected month", () => {
    const output = { review: "Finished a module", patterns: "One win is too little for a pattern", celebratedWinId: "owned", celebration: "Completed learning", nextStep: "Apply one concept" };
    expect(validateMonthly(output, [{ id: "owned", title: "Module completed" }], "2026-10").celebratedTitle).toBe("Module completed");
    expect(() => validateMonthly({ ...output, celebratedWinId: "other" }, [{ id: "owned", title: "Module completed" }], "2026-10")).toThrow();
  });
});
describe("AI output language", () => {
  it("adds the Arabic rules only for Arabic and keeps English prompt unchanged", async () => {
    const { buildInstructions, arabicMonthLabel } = await import("./growth-ai.server");
    const ar = buildInstructions("X", "ar");
    expect(ar).toContain("Modern Standard Arabic");
    expect(ar).toContain("الشهر القادم");
    expect(ar).not.toContain("language most represented");
    expect(buildInstructions("X", "en")).toContain("Write in the language most represented in the achievement titles (Arabic for predominantly Arabic titles, otherwise English). Keep each");
    expect(arabicMonthLabel("2026-10")).toMatch(/2026/);
  });
});
