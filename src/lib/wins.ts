import { BookOpen, Sprout, Briefcase, HeartPulse, Sun, type LucideIcon } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import i18n from "@/i18n";
import { formatDate as formatLocaleDate } from "@/lib/format-date";

export type Category = Database["public"]["Enums"]["win_category"];
export type Win = Database["public"]["Tables"]["achievements"]["Row"];

export const CATEGORIES: { value: Category; label: string; icon: LucideIcon; tone: string }[] = [
  { value: "learning", label: "Learning", icon: BookOpen, tone: "bg-lavender" },
  { value: "personal_growth", label: "Personal Growth", icon: Sprout, tone: "bg-sage" },
  { value: "work_projects", label: "Work & Projects", icon: Briefcase, tone: "bg-sand" },
  { value: "health_habits", label: "Health & Habits", icon: HeartPulse, tone: "bg-sage" },
  { value: "everyday", label: "Everyday Wins", icon: Sun, tone: "bg-lavender" },
];

/** Display-only label; the stored category value never changes. */
export const categoryLabel = (c: Category) => i18n.t(`categories.${c}`, { defaultValue: categoryMetaRaw(c).label });

const categoryMetaRaw = (c: Category) => CATEGORIES.find((x) => x.value === c) ?? { value: "everyday" as const, label: "Everyday Wins", icon: Sun, tone: "bg-lavender" };

export const categoryMeta = (c: Category) => {
  const m = categoryMetaRaw(c);
  return { ...m, label: categoryLabel(m.value) };
};

export const TITLE_MAX = 100;
export const DESC_MAX = 500;

export type WinInput = { title: string; description: string; category: Category | ""; achievement_date: string };

export function validateWin(v: WinInput): Partial<Record<keyof WinInput, string>> {
  const e: Partial<Record<keyof WinInput, string>> = {};
  const t = v.title.trim();
  if (!t) e.title = i18n.t("wins.validation.titleRequired");
  else if (t.length > TITLE_MAX) e.title = i18n.t("wins.validation.titleMax", { max: TITLE_MAX });
  if (v.description.length > DESC_MAX) e.description = i18n.t("wins.validation.descriptionMax", { max: DESC_MAX });
  if (!v.category) e.category = i18n.t("wins.validation.category");
  if (!v.achievement_date) e.achievement_date = i18n.t("wins.validation.date");
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

export type WinMonthGroup = { key: string; label: string; wins: Win[] };

const monthLabel = (key: string) =>
  formatLocaleDate(`${key}-01T00:00:00`, { year: "numeric", month: "long" });

export function groupWinsByMonth(wins: Win[]): WinMonthGroup[] {
  const sorted = [...wins].sort(
    (a, b) => b.achievement_date.localeCompare(a.achievement_date) || b.created_at.localeCompare(a.created_at),
  );
  const groups = new Map<string, WinMonthGroup>();
  for (const win of sorted) {
    const key = win.achievement_date.slice(0, 7);
    const group = groups.get(key) ?? { key, label: monthLabel(key), wins: [] };
    group.wins.push(win);
    groups.set(key, group);
  }
  return [...groups.values()];
}

export const formatDate = (d: string) =>
  formatLocaleDate(d + "T00:00:00", { year: "numeric", month: "long", day: "numeric" });
