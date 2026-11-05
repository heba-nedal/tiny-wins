import { describe, expect, it } from "vitest";
import { gardenGrowth } from "./garden";

describe("gardenGrowth", () => {
  it("shows 0 for an account with no wins", () => {
    expect(gardenGrowth(0)).toMatchObject({ total: 0, progress: 0, stage: "start", target: 10 });
  });
  it("uses the stage ranges 1–2, 3–5, 6–9", () => {
    expect(gardenGrowth(2).stage).toBe("beginning");
    expect(gardenGrowth(3).stage).toBe("growing");
    expect(gardenGrowth(5).stage).toBe("growing");
    expect(gardenGrowth(6).stage).toBe("blooming");
    expect(gardenGrowth(9).stage).toBe("blooming");
  });
  it("8 wins → 8/10", () => {
    expect(gardenGrowth(8)).toMatchObject({ progress: 8, target: 10 });
  });
  it("10 wins completes the milestone", () => {
    expect(gardenGrowth(10)).toMatchObject({ progress: 10, stage: "milestone", milestones: 1 });
  });
  it("13 wins → 3/10 toward 20", () => {
    expect(gardenGrowth(13)).toMatchObject({ total: 13, progress: 3, target: 20 });
  });
  it("25 wins → 5/10 toward 30", () => {
    expect(gardenGrowth(25)).toMatchObject({ total: 25, progress: 5, target: 30 });
  });
});
