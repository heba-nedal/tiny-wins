import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const TELEGRAM_BOT_USERNAME = "TinyWinsGallery_bot";
export type TelegramLinkToken = { token: string; expires_at: string };

// These tables already exist; this narrow client type bridges the generated types.
type TelegramDatabase = {
  public: {
    Tables: {
      telegram_links: {
        Row: { user_id: string; linked_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      telegram_link_tokens: {
        Row: TelegramLinkToken & { language: string };
        Insert: { language: "en" | "ar" };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
const client = supabase as unknown as SupabaseClient<TelegramDatabase>;

export async function readTelegramLink() {
  const { data, error } = await client.from("telegram_links").select("linked_at").maybeSingle();
  if (error) throw error;
  return data;
}

export async function createTelegramLink(language: string): Promise<TelegramLinkToken> {
  const { data, error } = await client.from("telegram_link_tokens")
    .insert({ language: language.split("-")[0] === "ar" ? "ar" : "en" })
    .select("token, expires_at").single();
  if (error) throw error;
  if (!data) throw new Error("Missing link");
  return data;
}

export async function unlinkTelegram() {
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!data.user) throw new Error("Missing account");
  const { error } = await client.from("telegram_links").delete().eq("user_id", data.user.id);
  if (error) throw error;
}

export function telegramSecondsRemaining(expiresAt: string, now: number) {
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
}

export function telegramCountdown(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}