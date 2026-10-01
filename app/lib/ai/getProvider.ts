import { AiProvider } from "./providers/provider";
import { createDeepSeekProvider } from "./providers/deepseek";

/**
 * Factory — returns the AI provider configured in environment variables.
 * Currently active: deepseek
 * Additions: uncomment openai.ts or anthropic.ts and add cases below.
 *
 * DeepSeek and OpenRouter both use the OpenAI-compatible protocol,
 * so the same deepseek.ts provider works for both — just swap the
 * baseURL and model name.
 */
export function getProvider(): AiProvider {
  const provider = (process.env.AI_PROVIDER || "deepseek").trim().toLowerCase();

  switch (provider) {
    case "deepseek":
    default: {
      const key = process.env.AI_DEEPSEEK_API_KEY;
      if (!key) throw new Error("AI_DEEPSEEK_API_KEY is not set in .env.local");
      return createDeepSeekProvider(key);
    }
    // --- Add new providers below when ready ---
    // case "openai": { ... }
    // case "anthropic": { ... }
    // case "openrouter": { ... }
  }
}
