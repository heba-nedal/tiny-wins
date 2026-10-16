import { categoryMeta, type Win } from "./wins";

/**
 * Visual density cap: the garden renders the newest MAX_PLANTS plants.
 * The full count stays accurate in the stats; every win remains in the timeline and gallery.
 */
export const MAX_PLANTS = 24;

export type PlantVariant = "sprout" | "leaf" | "flower";

export type Plant = {
  win: Win;
  variant: PlantVariant;
  /** 0.85–1.15 deterministic size variation. */
  scale: number;
  /** Seconds of sway-animation delay, deterministic per win. */
  delay: number;
  /** Deterministic vertical lift off the ground line (px in the SVG viewBox). */
  jitter: number;
};

/** FNV-1a over the achievement ID: the same win always maps to the same plant. */
function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function plantFor(win: Win): Plant {
  const h = hashId(win.id);
  const variants: readonly PlantVariant[] = ["sprout", "leaf", "flower"];
  const variant = variants[h % 3] ?? "sprout";
  const scale = 0.85 + ((h >> 3) % 7) * 0.05;
  const delay = ((h >> 6) % 40) / 10;
  const jitter = ((h >> 10) % 5) * 3;
  return { win, variant, scale, delay, jitter };
}

export function gardenPlants(wins: Win[]): Plant[] {
  return wins.slice(0, MAX_PLANTS).map(plantFor);
}

export function gardenStats(wins: Win[]) {
  const plants = gardenPlants(wins);
  return {
    total: wins.length,
    categories: new Set(wins.map((w) => w.category)).size,
    flowers: plants.filter((p) => p.variant === "flower").length,
    hidden: Math.max(0, wins.length - MAX_PLANTS),
  };
}

/** SVG fill class matching the existing category tones (bg-* → fill-*). */
export const categoryFill = (category: Win["category"]) =>
  categoryMeta(category).tone.replace("bg-", "fill-");
