import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { monthInput, winInput, type AiResult, type MonthlyReflection, type WinReflection } from "./growth-ai";

export const getMonthlyReflection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { month: string; language?: "en" | "ar" }) => monthInput.parse(data))
  .handler(async ({ data, context }): Promise<AiResult<MonthlyReflection>> => {
    const { reflectMonth } = await import("./growth-data.server");
    const { generateMonthly, GrowthAiError } = await import("./growth-ai.server");
    try { return await reflectMonth(context.supabase, context.userId, data.month, (wins, month) => generateMonthly(wins, month, data.language)); }
    catch (error) {
      if (!(error instanceof GrowthAiError)) console.error("Reflection failed", error instanceof Error ? error.message : "unknown");
      return { status: "error", code: error instanceof GrowthAiError ? error.code : "generic" }; }
  });

export const getWinReflection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; language?: "en" | "ar" }) => winInput.parse(data))
  .handler(async ({ data, context }): Promise<AiResult<WinReflection>> => {
    const { reflectWin } = await import("./growth-data.server");
    const { generateGrow, GrowthAiError } = await import("./growth-ai.server");
    try { return await reflectWin(context.supabase, context.userId, data.id, (win) => generateGrow(win, data.language)); }
    catch (error) {
      if (!(error instanceof GrowthAiError)) console.error("Reflection failed", error instanceof Error ? error.message : "unknown");
      return { status: "error", code: error instanceof GrowthAiError ? error.code : "generic" }; }
  });