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
  it("assembles BASE + language rule + feature instructions", async () => {
    const { buildInstructions, monthLabel } = await import("./growth-ai.server");
    const ar = buildInstructions("X", "ar");
    const en = buildInstructions("X", "en");
    expect(ar).toContain("Modern Standard Arabic");
    expect(ar.endsWith("'الشهر القادم' for the following month. X")).toBe(true);
    expect(en.endsWith("say 'next month' for the following month. X")).toBe(true);
    expect(en).toContain("Never infer or assume the user's gender, age, religion, nationality or background from their wording.");
    expect(en).not.toContain("language most represented");
    expect(monthLabel("2026-10", "en")).toBe("October 2026");
    expect(monthLabel("2026-10", "ar")).toContain("2026");
  });
  it("accepts only en or ar, defaulting to en", async () => {
    const { monthInput, winInput, aiCodeKey } = await import("./growth-ai");
    expect(monthInput.parse({ month: "2026-10" }).language).toBe("en");
    expect(monthInput.safeParse({ month: "2026-10", language: "fr" }).success).toBe(false);
    expect(winInput.safeParse({ id: "00000000-0000-4000-8000-000000000000", language: "ar" }).success).toBe(true);
    expect(aiCodeKey("rate_limited")).toBe("ai.errors.rateLimited");
    expect(aiCodeKey("weird")).toBe("ai.errors.generic");
  });
});
