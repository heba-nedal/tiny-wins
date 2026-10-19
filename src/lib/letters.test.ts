import { describe, expect, it } from "vitest";
import { countdown, splitLetters, validateLetter, type Letter } from "./letters";

const now = new Date(2026, 9, 19, 12, 0);
const base = { user_id: "u", title: null, message: "hi", timezone: null, email_status: "not_sent", email_sent_at: null, created_at: "" };

describe("letters", () => {
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
