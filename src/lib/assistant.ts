import { z } from "zod";
import type { AiCode } from "./growth-ai";
import type { Category } from "./wins";

export const assistantInput = z.object({
  question: z.string().trim().min(1).max(500),
  language: z.enum(["en", "ar"]),
  today: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/),
}).strict();
export type AssistantInput = z.infer<typeof assistantInput>;
export type AssistantSource = { id: string; title: string; achievement_date: string; category: Category };
export type AssistantResult =
  | { status: "empty_wins" }
  | { status: "ok"; found: false }
  | { status: "ok"; found: true; answer: string; sources: AssistantSource[] }
  | { status: "error"; code: AiCode };

export function localToday(now = new Date()) {
  return `${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}