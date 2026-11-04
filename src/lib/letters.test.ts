import { describe, expect, it } from "vitest";
import { countdown, letterEmailState, splitLetters, validateLetter, type Letter } from "./letters";

const now = new Date(2026, 9, 19, 12, 0);
const base = { user_id: "u", title: null, message: "hi", timezone: null, email_status: "not_sent", email_attempts: 0, email_sent_at: null, created_at: "" };

describe("letters", () => {
  it("reports sent regardless of attempt count", () => {
    expect(letterEmailState({ email_status: "sent", email_attempts: 3 })).toBe("sent");
  });
  it.each(["not_sent", "sending"])("reports %s as pending", (email_status) => {
    expect(letterEmailState({ email_status, email_attempts: 3 })).toBe("pending");
  });
  it("reports failed below 3 attempts as pending", () => {
    expect(letterEmailState({ email_status: "failed", email_attempts: 2 })).toBe("pending");
  });
  it.each([3, 4])("reports failed at %i attempts as failed", (email_attempts) => {
    expect(letterEmailState({ email_status: "failed", email_attempts })).toBe("failed");
  });
  it("accepts a valid future letter", () => {
    expect(validateLetter({ title: "", message: "Dear me", deliverLocal: "2026-10-20T09:00" }, now)).toEqual({});
  });
  it("rejects missing message", () => {
    expect(validateLetter({ title: "", message: "  ", deliverLocal: "2026-10-20T09:00" }, now).message).toBeDefined();
  });
  it("rejects past delivery time", () => {
    expect(validateLetter({ title: "", message: "x", deliverLocal: "2026-10-19T11:00" }, now).deliverLocal).toBeDefined();
  });
  it("computes countdown parts", () => {
    const target = new Date(now.getTime() + ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000).toISOString();
    expect(countdown(target, now.getTime())).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5 });
  });
  it("moves a letter to delivered once its time arrives", () => {
    const l: Letter = { ...base, id: "a", deliver_at: new Date(now.getTime() + 1000).toISOString() };
    expect(splitLetters([l], now.getTime()).upcoming).toHaveLength(1);
    expect(splitLetters([l], now.getTime() + 1000).delivered).toHaveLength(1);
  });
});
