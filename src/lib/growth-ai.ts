import { z } from "zod";

// achievement_date is a calendar DATE, not a timestamp: no timezone conversion.
export function monthBounds(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Choose a valid month.");
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const number = Number(monthText);
  if (year < 1 || year > 9998) throw new Error("Choose a valid year.");
  const next = number === 12
    ? `${String(year + 1).padStart(4, "0")}-01`
    : `${yearText}-${String(number + 1).padStart(2, "0")}`;
  return { start: `${month}-01`, end: `${next}-01` };
}

export function currentMonth(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const aiLanguage = z.enum(["en", "ar"]).optional();
export type AiLanguage = "en" | "ar";
export const monthInput = z.object({ month: z.string(), lang: aiLanguage }).strict().superRefine(({ month }, ctx) => {
  try { monthBounds(month); } catch { ctx.addIssue({ code: "custom", message: "Choose a valid month." }); }
});
export const winInput = z.object({ id: z.string().uuid(), lang: aiLanguage }).strict();

export const monthlySchema = z.strictObject({
  review: z.string(), patterns: z.string(), celebratedWinId: z.string(), celebration: z.string(), nextStep: z.string(),
});
export const growSchema = z.strictObject({
  shows: z.string(), buildOn: z.string(), nextStep: z.string(), why: z.string(),
});
export type MonthlyReflection = z.infer<typeof monthlySchema> & { celebratedTitle: string; month: string; count: number };
export type WinReflection = z.infer<typeof growSchema>;
export type AiResult<T> = { status: "success"; reflection: T } | { status: "empty"; message: string } | { status: "error"; message: string };

export function usableText(value: string) {
  const text = value.trim();
  if (!text) throw new Error("Empty reflection section.");
  return text.slice(0, 1200);
}

export function validateGrow(value: unknown): WinReflection {
  const parsed = growSchema.parse(value);
  return { shows: usableText(parsed.shows), buildOn: usableText(parsed.buildOn), nextStep: usableText(parsed.nextStep), why: usableText(parsed.why) };
}

export function validateMonthly(value: unknown, wins: { id: string; title: string }[], month: string): MonthlyReflection {
  const parsed = monthlySchema.parse(value);
  const celebrated = wins.find((win) => win.id === parsed.celebratedWinId);
  if (!celebrated) throw new Error("The celebrated win was not in this month.");
  return { ...parsed, review: usableText(parsed.review), patterns: usableText(parsed.patterns), celebration: usableText(parsed.celebration), nextStep: usableText(parsed.nextStep), celebratedTitle: celebrated.title, month, count: wins.length };
}