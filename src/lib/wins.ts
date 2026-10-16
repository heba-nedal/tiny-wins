import { BookOpen, Sprout, Briefcase, HeartPulse, Sun, type LucideIcon } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

export type Category = Database["public"]["Enums"]["win_category"];
export type Win = Database["public"]["Tables"]["achievements"]["Row"];

export const CATEGORIES: { value: Category; label: string; icon: LucideIcon; tone: string }[] = [
  { value: "learning", label: "Learning", icon: BookOpen, tone: "bg-lavender" },
  { value: "personal_growth", label: "Personal Growth", icon: Sprout, tone: "bg-sage" },
  { value: "work_projects", label: "Work & Projects", icon: Briefcase, tone: "bg-sand" },
  { value: "health_habits", label: "Health & Habits", icon: HeartPulse, tone: "bg-sage" },
  { value: "everyday", label: "Everyday Wins", icon: Sun, tone: "bg-lavender" },
];

export const categoryMeta = (c: Category) => CATEGORIES.find((x) => x.value === c) ?? { value: "everyday" as const, label: "Everyday Wins", icon: Sun, tone: "bg-lavender" };

export const TITLE_MAX = 100;
export const DESC_MAX = 500;

export type WinInput = { title: string; description: string; category: Category | ""; achievement_date: string };

export function validateWin(v: WinInput): Partial<Record<keyof WinInput, string>> {
  const e: Partial<Record<keyof WinInput, string>> = {};
  const t = v.title.trim();
  if (!t) e.title = "Please give your win a title.";
  else if (t.length > TITLE_MAX) e.title = `Keep the title under ${TITLE_MAX} characters.`;
  if (v.description.length > DESC_MAX) e.description = `Keep the description under ${DESC_MAX} characters.`;
  if (!v.category) e.category = "Choose a category.";
  if (!v.achievement_date) e.achievement_date = "Pick the date of your win.";
  return e;
}

export function countThisMonth(wins: Pick<Win, "achievement_date">[], now = new Date()) {
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return wins.filter((w) => w.achievement_date.startsWith(prefix)).length;
}

export function progressStory(wins: Pick<Win, "achievement_date" | "category">[], now = new Date()) {
  const dates = wins.map((w) => w.achievement_date).sort();
  const counts = new Map<Category, number>();
  for (const win of wins) counts.set(win.category, (counts.get(win.category) ?? 0) + 1);
  const leading = [...counts].sort((a, b) => b[1] - a[1])[0];
  return {
    total: wins.length,
    thisMonth: countThisMonth(wins, now),
    activeMonths: new Set(dates.map((date) => date.slice(0, 7))).size,
    categories: counts.size,
    firstDate: dates[0] ?? null,
    latestDate: dates.at(-1) ?? null,
    leadingCategory: leading?.[0] ?? null,
  };
}

export const formatDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
