// OpenRouter via Vercel AI SDK — mirrors the proven setup in social-manager/src/lib/ai.ts.
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "X-Title": "Chorus",
  },
});

// Cheap, fast model for drafts/variants.
export const DRAFT_MODEL = process.env.OPENROUTER_MODEL ?? "anthropic/claude-haiku-4.5";
// Stronger model for the two extraction passes + brain-dump reasoning.
export const EXTRACT_MODEL = process.env.OPENROUTER_EXTRACT_MODEL ?? "anthropic/claude-sonnet-4.6";

export function model(id: string = DRAFT_MODEL) {
  return openrouter.chat(id);
}
