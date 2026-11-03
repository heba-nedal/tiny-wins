import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assistantInput, type AssistantInput, type AssistantResult } from "./assistant";

export const askWins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: AssistantInput) => assistantInput.parse(data))
  .handler(async ({ data, context }): Promise<AssistantResult> => {
    const { answerOwnedWins, assistantError } = await import("./assistant.server");
    try { return await answerOwnedWins(context.supabase, context.userId, data); }
    catch (error) { return assistantError(error); }
  });