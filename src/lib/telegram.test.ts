import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), maybeSingle: vi.fn(), insert: vi.fn(), single: vi.fn(), delete: vi.fn(), eq: vi.fn(), getUser: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mocks.from, auth: { getUser: mocks.getUser } } }));
import { createTelegramLink, readTelegramLink, unlinkTelegram, telegramSecondsRemaining, telegramCountdown, TELEGRAM_BOT_USERNAME } from "./telegram";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.from.mockReturnValue(mocks);
  mocks.select.mockReturnValue(mocks);
  mocks.insert.mockReturnValue(mocks);
  mocks.delete.mockReturnValue(mocks);
  mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
  mocks.single.mockResolvedValue({ data: { token: "test-token", expires_at: "2026-11-02T22:10:00Z" }, error: null });
  mocks.eq.mockResolvedValue({ error: null });
});

describe("Telegram data boundaries", () => {
  it("reads only linked_at and never chat_id", async () => {
    await readTelegramLink();
    expect(mocks.from).toHaveBeenCalledWith("telegram_links");
    expect(mocks.select).toHaveBeenCalledWith("linked_at");
    expect(mocks.maybeSingle).toHaveBeenCalledOnce();
  });
  it.each([["ar-PS", "ar"], ["en-US", "en"], ["fr", "en"]])("inserts only normalized language for %s", async (language, expected) => {
    await createTelegramLink(language);
    expect(mocks.insert).toHaveBeenCalledWith({ language: expected });
    expect(mocks.select).toHaveBeenCalledWith("token, expires_at");
    expect(TELEGRAM_BOT_USERNAME).toBe("TinyWinsGallery_bot");
  });
  it("unlinks only the current user", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "current-account" } }, error: null });
    await unlinkTelegram();
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "current-account");
  });
  it("does not delete without an account", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(unlinkTelegram()).rejects.toThrow();
    expect(mocks.delete).not.toHaveBeenCalled();
  });
  it("expires at the database expiry and uses Western mm:ss digits", () => {
    const expiry = "2026-11-02T22:10:00Z";
    expect(telegramSecondsRemaining(expiry, Date.parse(expiry))).toBe(0);
    expect(telegramSecondsRemaining(expiry, Date.parse(expiry) + 1000)).toBe(0);
    expect(telegramCountdown(telegramSecondsRemaining(expiry, Date.parse(expiry) - 61000))).toBe("01:01");
  });
});