import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { accountInitials, displayNameUpdate, DISPLAY_NAME_MAX } from "./account";

export const accountTestUser: User = { id: "account-test", aud: "authenticated", created_at: "2026-11-04T00:00:00Z", app_metadata: {}, user_metadata: { display_name: "Test Account" }, email: "account@example.test" };

describe("display-only account metadata", () => {
  it("uses Unicode initials from at most two name words", () => {
    expect(accountInitials({ ...accountTestUser, user_metadata: { display_name: "محمد إسماعيل ثالث" } })).toBe("مإ");
    expect(accountInitials({ ...accountTestUser, user_metadata: { display_name: "𐐀 name third" } })).toBe("𐐀N");
  });
  it("falls back to the first email character when no name exists", () => {
    expect(accountInitials({ ...accountTestUser, user_metadata: {} })).toBe("A");
  });
  it("trims names and submits only display_name", () => {
    expect(displayNameUpdate("  New Name  ")).toEqual({ data: { display_name: "New Name" } });
  });
  it("clears an empty name with null", () => {
    expect(displayNameUpdate("   ")).toEqual({ data: { display_name: null } });
  });
  it("enforces the specified 40-character maximum", () => {
    expect(DISPLAY_NAME_MAX).toBe(40);
    expect(displayNameUpdate("a".repeat(40)).data.display_name).toHaveLength(40);
    expect(() => displayNameUpdate("a".repeat(41))).toThrow("nameTooLong");
  });
});