import type { Win } from "./wins";

/** Growth repeats in cycles of this many achievements. */
export const GROWTH_CYCLE = 10;

export type GrowthStage = "start" | "beginning" | "growing" | "blooming" | "milestone";

export type GardenGrowth = {
  /** Every achievement passed in (the signed-in user's own records). */
  total: number;
  /** Progress inside the current cycle, 0–10 (10 only right at a milestone). */
  progress: number;
  /** Completed milestones so far (10 → 1, 25 → 2). */
  milestones: number;
  /** The milestone the user is working toward or just reached. */
  target: number;
  stage: GrowthStage;
};

export function gardenGrowth(total: number): GardenGrowth {
  const count = Math.max(0, Math.floor(total));
  const milestones = Math.floor(count / GROWTH_CYCLE);
  const rest = count % GROWTH_CYCLE;
  const atMilestone = count > 0 && rest === 0;
  const progress = atMilestone ? GROWTH_CYCLE : rest;
  const target = atMilestone ? count : (milestones + 1) * GROWTH_CYCLE;
  const stage: GrowthStage = atMilestone
    ? "milestone"
    : rest === 0
      ? "start"
      : rest <= 2
        ? "beginning"
        : rest <= 5
          ? "growing"
          : "blooming";
  return { total: count, progress, milestones, target, stage };
}

export function gardenStats(wins: Win[]) {
  return gardenGrowth(wins.length);
}
