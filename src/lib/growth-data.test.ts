import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { readMonth, reflectMonth, reflectWin } from "./growth-data.server";

const record = (id: string, date = "2026-10-16", owner = "me") => ({ id, title: `Win ${id}`, description: null, category: "learning", achievement_date: date, user_id: owner });
function database(rows: ReturnType<typeof record>[]) {
  const calls: { key: string; value: string }[] = [];
  const db = { from: vi.fn(() => {
    let filtered = [...rows];
    const query = {
      select: () => query,
      eq: (key: string, value: string) => { calls.push({ key, value }); filtered = filtered.filter((r) => r[key as keyof typeof r] === value); return query; },
      gte: (_: string, value: string) => { filtered = filtered.filter((r) => r.achievement_date >= value); return query; },
      lt: (_: string, value: string) => { filtered = filtered.filter((r) => r.achievement_date < value); return query; },
      order: () => query,
      range: async (start: number, end: number) => ({ data: filtered.slice(start, end + 1), error: null }),
      maybeSingle: async () => ({ data: filtered[0] ?? null, error: null }),
    };
    return query;
  }) };
  return { db: db as unknown as SupabaseClient<Database>, calls };
}

describe("owner-scoped growth data", () => {
  it("includes only owned achievements in the selected calendar month", async () => {
    const { db, calls } = database([record("before", "2026-09-30"), record("first", "2026-10-01"), record("last", "2026-10-31"), record("after", "2026-11-01"), record("foreign", "2026-10-16", "other")]);
    expect((await readMonth(db, "me", "2026-10")).map((w) => w.id)).toEqual(["first", "last"]);
    expect(calls).toContainEqual({ key: "user_id", value: "me" });
  });
  it("retrieves beyond the existing 20-win limit and beyond one page", async () => {
    const { db } = database(Array.from({ length: 521 }, (_, i) => record(String(i))));
    expect(await readMonth(db, "me", "2026-10")).toHaveLength(521);
  });
  it("does not call AI for an empty month", async () => {
    const { db } = database([]); const generate = vi.fn();
    expect((await reflectMonth(db, "me", "2026-10", generate)).status).toBe("empty");
    expect(generate).not.toHaveBeenCalled();
  });
  it("does not generate for another user's achievement or a nonexistent ID", async () => {
    const { db } = database([record("foreign", "2026-10-16", "other")]); const generate = vi.fn();
    expect((await reflectWin(db, "me", "foreign", generate)).status).toBe("empty");
    expect((await reflectWin(db, "me", "missing", generate)).status).toBe("empty");
    expect(generate).not.toHaveBeenCalled();
  });
  it("generates from the selected saved record including a missing description", async () => {
    const { db } = database([record("selected"), record("unrelated")]); const generate = vi.fn().mockResolvedValue({ shows: "Learning" });
    expect((await reflectWin(db, "me", "selected", generate)).status).toBe("success");
    expect(generate).toHaveBeenCalledTimes(1);
    expect(generate.mock.calls[0]?.[0]).toMatchObject({ id: "selected", title: "Win selected", description: null });
  });
});