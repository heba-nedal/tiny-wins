import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText, type ModelMessage } from "ai";
import { z } from "zod";
import { normalizeSuggestion, type Suggestion } from "./next-win";
import { createLovableAiGatewayRunIdFetch } from "./run-id";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `You are the gentle coach inside Tiny Wins, an app where people record and celebrate small everyday achievements. Suggest exactly ONE tiny, concrete win the user could do today. Keep it small enough to finish in under 30 minutes and specific enough to start without extra planning. When recent wins are provided, build gently on their momentum: continue a category they enjoy or balance a neglected one. If they have no wins yet, propose a warm, easy first win. Choose "category" from exactly these values: learning, personal_growth, work_projects, health_habits, everyday. Keep "title" under 100 characters, "description" under 500 characters (one or two sentences of encouragement or detail), and "reason" under 280 characters explaining briefly why this fits them now. Write in a warm, calm, encouraging tone.`;

export type WinSummary = { title: string; category: string; achievement_date: string };

const suggestionSchema = z
  .strictObject({
    suggestion: z.strictObject({
      title: z.string(),
      description: z.string().nullable(),
      category: z.enum(["learning", "personal_growth", "work_projects", "health_habits", "everyday"]),
      reason: z.string(),
    }),
  });

function buildUserMessage(wins: WinSummary[]): string {
  const payload = {
    today: new Date().toISOString().slice(0, 10),
    recent_wins: wins.map((w) => ({ title: w.title, category: w.category, date: w.achievement_date })),
  };
  return JSON.stringify(payload);
}

export async function generateNextWin(wins: WinSummary[]): Promise<Suggestion> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Lovable AI is not configured for this project yet.");

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    messages: [{ role: "user", content: buildUserMessage(wins) }] satisfies ModelMessage[],
    output: Output.object({ schema: suggestionSchema }),
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    const output = await result.output;
    return normalizeSuggestion(output.suggestion);
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("[next-win] structured output did not match the schema:", error.text);
      throw new Error("The suggestion didn't come back in a usable shape. Please try again.");
    }
    throw error;
  }
}
