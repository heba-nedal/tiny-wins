import type { User } from "@supabase/supabase-js";

export const DISPLAY_NAME_MAX = 40;

export function accountDisplayName(user: User): string {
  const value: unknown = user.user_metadata.display_name;
  return typeof value === "string" ? value.trim() : "";
}

export function accountInitials(user: User): string {
  const name = accountDisplayName(user);
  return name
    ? name.split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0] ?? "").join("").toUpperCase()
    : (Array.from(user.email ?? "")[0] ?? "").toUpperCase();
}

export function displayNameUpdate(value: string) {
  const trimmed = value.trim();
  if (trimmed.length > DISPLAY_NAME_MAX) throw new Error("nameTooLong");
  return { data: { display_name: trimmed || null } };
}