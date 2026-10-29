import { describe, expect, it, vi } from "vitest";
import { authErrorKey } from "./auth-errors";

describe("authErrorKey", () => {
  it("maps codes", () => {
    expect(authErrorKey({ code: "invalid_credentials" })).toBe("errors.auth.invalidCredentials");
    expect(authErrorKey({ code: "weak_password" })).toBe("auth.passwordShort");
    expect(authErrorKey({ code: "over_request_rate_limit" })).toBe("errors.auth.rateLimit");
  });
  it("falls back to message text", () => {
    expect(authErrorKey({ message: "Email not confirmed" })).toBe("errors.auth.emailNotConfirmed");
    expect(authErrorKey({ message: "User already registered" })).toBe("errors.auth.alreadyRegistered");
  });
  it("uses generic for unknown errors", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(authErrorKey({ message: "boom" })).toBe("errors.generic");
  });
});
