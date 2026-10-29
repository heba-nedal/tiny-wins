import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { monthInput, winInput, type AiResult, type MonthlyReflection, type WinReflection } from "./growth-ai";

export const getMonthlyReflection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { month: string }) => monthInput.parse(data))
  .handler(async ({ data, context }): Promise<AiResult<MonthlyReflection>> => {
    const { reflectMonth } = await import("./growth-data.server");
    const { generateMonthly, GrowthAiError } = await import("./growth-ai.server");
    try { return await reflectMonth(context.supabase, context.userId, data.month, (wins, month) => generateMonthly(wins, month, data.lang)); }
    catch (error) { return { status: "error", message: error instanceof GrowthAiError ? error.message : "We couldn't read your wins right now. Please try again." }; }
  });

export const getWinReflection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => winInput.parse(data))
  .handler(async ({ data, context }): Promise<AiResult<WinReflection>> => {
    const { reflectWin } = await import("./growth-data.server");
    const { generateGrow, GrowthAiError } = await import("./growth-ai.server");
    try { return await reflectWin(context.supabase, context.userId, data.id, (win) => generateGrow(win, data.lang)); }
    catch (error) { return { status: "error", message: error instanceof GrowthAiError ? error.message : "We couldn't read this win right now. Please try again." }; }
  });