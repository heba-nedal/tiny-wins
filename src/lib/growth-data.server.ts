import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { monthBounds, type AiResult } from "./growth-ai";

export type GrowthRecord = Pick<Database["public"]["Tables"]["achievements"]["Row"], "id" | "title" | "description" | "category" | "achievement_date">;
const FIELDS = "id, title, description, category, achievement_date";
const PAGE_SIZE = 500;

export async function readMonth(db: SupabaseClient<Database>, userId: string, month: string): Promise<GrowthRecord[]> {
  const { start, end } = monthBounds(month);
  const wins: GrowthRecord[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await db.from("achievements").select(FIELDS)
      .eq("user_id", userId).gte("achievement_date", start).lt("achievement_date", end)
      .order("achievement_date", { ascending: true }).order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw new Error("Couldn't retrieve achievements.");
    wins.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE_SIZE) return wins;
  }
}

export async function readWin(db: SupabaseClient<Database>, userId: string, id: string): Promise<GrowthRecord | null> {
  const { data, error } = await db.from("achievements").select(FIELDS).eq("user_id", userId).eq("id", id).maybeSingle();
  if (error) throw new Error("Couldn't retrieve achievement.");
  return data;
}

// Keep the empty/not-owned boundary before the generator so it cannot incur AI usage.
export async function reflectMonth<T>(db: SupabaseClient<Database>, userId: string, month: string, generate: (wins: GrowthRecord[], month: string) => Promise<T>): Promise<AiResult<T>> {
  const wins = await readMonth(db, userId, month);
  if (wins.length === 0) return { status: "empty", message: "No wins recorded for this month yet. Every little win counts whenever you're ready." };
  return { status: "success", reflection: await generate(wins, month) };
}

export async function reflectWin<T>(db: SupabaseClient<Database>, userId: string, id: string, generate: (win: GrowthRecord) => Promise<T>): Promise<AiResult<T>> {
  const win = await readWin(db, userId, id);
  if (!win) return { status: "empty", message: "This win is no longer available. Choose one of your saved wins." };
  return { status: "success", reflection: await generate(win) };
}