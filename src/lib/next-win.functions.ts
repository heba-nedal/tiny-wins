import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const suggestNextWin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("achievements")
      .select("title, category, achievement_date")
      .eq("user_id", userId)
      .order("achievement_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(`Couldn't read your wins: ${error.message}`);
    const { generateNextWin } = await import("./next-win.server");
    return generateNextWin(data ?? []);
  });
