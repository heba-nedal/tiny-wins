import { beforeEach, describe, expect, it, vi } from "vitest";
import { assistantInput, localToday } from "./assistant";
import type { GrowthRecord } from "./growth-data.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { LANGUAGE_RULES } from "./growth-ai.server";
const mocks = vi.hoisted(() => ({ stream: vi.fn() }));
vi.mock("@lovable.dev/ai-gateway", () => ({ streamResponse: mocks.stream, GatewayError: class extends Error {} }));
import { ASSISTANT_BASE, answerOwnedWins, assistantData, assistantInstructions, generateAssistant, validateAssistant, assistantError } from "./assistant.server";

const input = { question: "What did I learn?", language: "en" as const, today: "2026-11-03" };
const win = (id: string, date = "2026-11-03"): GrowthRecord => ({ id, title: `Database title ${id}`, description: null, category: "learning", achievement_date: date });
beforeEach(() => vi.clearAllMocks());
describe("assistant input limits", () => {
  it("trims questions and requires 1..500 characters", () => {
    expect(assistantInput.parse({ ...input, question: " hi " }).question).toBe("hi");
    expect(assistantInput.safeParse({ ...input, question: " " }).success).toBe(false);
    expect(assistantInput.safeParse({ ...input, question: "a".repeat(500) }).success).toBe(true);
    expect(assistantInput.safeParse({ ...input, question: "a".repeat(501) }).success).toBe(false);
  });
  it("requires en/ar and calendar-format date; rejects caller ownership and history", () => {
    for (const extra of [{ language: "fr" }, { today: "2026-13-01" }, { today: "03/11/2026" }, { userId: "other" }, { history: [] }]) {
      expect(assistantInput.safeParse({ ...input, ...extra }).success).toBe(false);
    }
  });
  it("sends the browser local date, not a UTC-converted date", () => {
    expect(localToday(new Date(2026, 10, 3, 0, 1))).toBe("2026-11-03");
  });
});
describe("grounded statistics and sources", () => {
  it("computes full totals, category counts, current month, and latest 12 occupied months", () => {
    const wins = Array.from({ length: 13 }, (_, n) => win(String(n), `${n === 12 ? '2025' : '2026'}-${String(n === 12 ? 12 : n + 1).padStart(2, '0')}-01`));
    wins.push({ ...win("extra"), category: "everyday" });
    const data = assistantData(wins, input);
    expect(data.stats).toEqual({ totalWins: 14, byCategory: { learning: 13, everyday: 1 }, thisMonth: 2, byMonth: Object.fromEntries(Array.from({ length: 12 }, (_, n) => [`2026-${String(12 - n).padStart(2, '0')}`, n === 1 ? 2 : 1])) });
  });
  it("sends only the latest 120, truncates descriptions to 300, preserves null", () => {
    const wins = Array.from({ length: 121 }, (_, n) => ({ ...win(String(n), n === 0 ? "2025-01-01" : "2026-11-03"), description: n === 1 ? "a".repeat(301) : null }));
    const data = assistantData(wins, input);
    expect(data.stats.totalWins).toBe(121);
    expect(data.achievements).toHaveLength(120);
    expect(data.achievements.some(w => w.id === "0")).toBe(false);
    expect(data.achievements.find(w => w.id === "1")?.description).toHaveLength(300);
    expect(data.achievements.find(w => w.id === "2")?.description).toBeNull();
  });
  it("filters unknown source IDs, deduplicates, caps at 8 and uses row fields", () => {
    const rows = Array.from({ length: 10 }, (_, n) => win(String(n)));
    const result = validateAssistant({ found: true, answer: " real answer ", usedAchievementIds: ["not-sent", "0", "0", ...rows.map(w => w.id)] }, rows);
    expect(result).toEqual({ status: "ok", found: true, answer: "real answer", sources: rows.slice(0, 8).map(({ description, ...row }) => row) });
  });
  it("discards all model text when not found", () => {
    expect(validateAssistant({ found: false, answer: "invented advice", usedAchievementIds: ["1"] }, [win("1")])).toEqual({ status: "ok", found: false });
  });
  it("rejects empty found answers and caps usable answers at 1200", () => {
    expect(() => validateAssistant({ found: true, answer: " ", usedAchievementIds: [] }, [])).toThrow("invalid_output");
    const result = validateAssistant({ found: true, answer: "a".repeat(1201), usedAchievementIds: [] }, []);
    expect(result.status === "ok" && result.found && result.answer.length).toBe(1200);
  });
});

function database(pages: GrowthRecord[][]) {
  const range = vi.fn(); pages.forEach(data => range.mockResolvedValueOnce({ data, error: null }));
  const chain = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), range };
  chain.select.mockReturnValue(chain); chain.eq.mockReturnValue(chain); chain.order.mockReturnValue(chain);
  const db = { from: vi.fn().mockReturnValue(chain) } as unknown as SupabaseClient<Database>;
  return { db, chain };
}
describe("owned data and gateway boundary", () => {
  it("reads 500 rows per page, owner filtered, then passes all rows", async () => {
    const first = Array.from({ length: 500 }, (_, n) => win(String(n)));
    const { db, chain } = database([first, [win("last")]]);
    const generate = vi.fn().mockResolvedValue({ status: "ok", found: false });
    await answerOwnedWins(db, "signed-in-user", input, generate);
    expect(chain.eq).toHaveBeenCalledWith("user_id", "signed-in-user");
    expect(chain.range.mock.calls).toEqual([[0, 499], [500, 999]]);
    expect(generate).toHaveBeenCalledWith([...first, win("last")], input);
  });
  it("never calls AI without wins", async () => {
    const { db } = database([[]]); const generate = vi.fn();
    expect(await answerOwnedWins(db, "owner", input, generate)).toEqual({ status: "empty_wins" });
    expect(generate).not.toHaveBeenCalled();
  });
  it("reuses exact language rules and gateway settings with single-turn structured input", async () => {
    mocks.stream.mockResolvedValue((async function* () { yield { type: "response.output_text.done", text: JSON.stringify({ found: true, answer: "Recorded progress.", usedAchievementIds: ["1"] }) }; })());
    await generateAssistant([win("1")], input);
    const call = mocks.stream.mock.calls[0];
    if (!call) throw new Error("Expected a gateway request");
    const [payload, options] = call;
    expect(payload.model).toBe("openai/gpt-6-astra");
    expect(payload.max_output_tokens).toBe(4096);
    expect(payload.reasoning).toEqual({ effort: "low", summary: "auto" });
    expect(options).toEqual({ maxRetries: 0 });
    expect(payload.text.format.strict).toBe(true);
    expect(JSON.parse(payload.input[0].content)).toEqual(assistantData([win("1")], input));
    expect(payload.input).toHaveLength(1);
    for (const lang of ["ar", "en"] as const) expect(assistantInstructions(lang)).toBe(`${ASSISTANT_BASE} ${LANGUAGE_RULES[lang]}`);
  });
  it("logs only safe codes, never question or raw error text", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(assistantError(new Error("secret question sk-private"))).toEqual({ status: "error", code: "generic" });
    expect(log).toHaveBeenCalledWith("Wins Assistant failed", "generic", undefined);
    log.mockRestore();
  });
});