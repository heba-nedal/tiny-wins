import type { Category, Win } from "./wins";

export type Suggestion = { title: string; description: string; category: Category; reason: string };

const CATEGORY_VALUES = new Set<string>(["learning", "personal_growth", "work_projects", "health_habits", "everyday"]);

export const clampText = (text: string, max: number) => {
  const trimmed = text.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
};

export function normalizeSuggestion(input: { title: string; description: string | null; category: string; reason: string }): Suggestion {
  return {
    title: clampText(input.title, 100),
    description: clampText(input.description ?? "", 500),
    category: CATEGORY_VALUES.has(input.category) ? (input.category as Category) : "everyday",
    reason: clampText(input.reason, 280),
  };
}

export function suggestionToWin(s: Suggestion, date = new Date().toLocaleDateString("en-CA")): Win {
  return {
    id: "",
    user_id: "",
    created_at: "",
    achievement_date: date,
    title: s.title,
    description: s.description || null,
    category: s.category,
  };
}
