import { describe, expect, it } from "vitest";
import { gardenPlants, gardenStats, plantFor, MAX_PLANTS } from "./garden";
import type { Win } from "./wins";

const win = (id: string, category: Win["category"] = "everyday"): Win => ({
  id,
  title: `Win ${id}`,
  description: null,
  category,
  achievement_date: "2026-10-16",
  created_at: "2026-10-16T00:00:00Z",
  user_id: "user-1",
});

describe("plantFor", () => {
  it("maps the same achievement to the same plant after every render", () => {
    const a = win("11111111-1111-1111-1111-111111111111");
    expect(plantFor(a)).toEqual(plantFor({ ...a }));
  });

  it("always returns a known plant variant", () => {
    for (const id of ["a", "b", "c", "d", "e"]) {
      expect(["sprout", "leaf", "flower"]).toContain(plantFor(win(id)).variant);
    }
  });
});

describe("gardenPlants", () => {
  it("caps the visual density while every win stays accounted for", () => {
    const wins = Array.from({ length: MAX_PLANTS + 6 }, (_, i) => win(`id-${i}`));
    expect(gardenPlants(wins)).toHaveLength(MAX_PLANTS);
  });
});

describe("gardenStats", () => {
  it("counts real achievements, distinct categories, and rendered flowers", () => {
    const stats = gardenStats([
      win("1", "learning"),
      win("2", "learning"),
      win("3", "health_habits"),
    ]);
    expect(stats.total).toBe(3);
    expect(stats.categories).toBe(2);
    expect(stats.flowers).toBe(gardenPlants([
      win("1", "learning"),
      win("2", "learning"),
      win("3", "health_habits"),
    ]).filter((p) => p.variant === "flower").length);
    expect(stats.hidden).toBe(0);
  });
});
