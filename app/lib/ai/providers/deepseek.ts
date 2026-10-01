import OpenAI from "openai";
import { AiProvider, ToolCallResult } from "./provider";

export function createDeepSeekProvider(apiKey: string): AiProvider {
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com/v1",
  });

  return {
    name: "deepseek",
    async chat(messages) {
      const response = await client.chat.completions.create({
        model: "deepseek-v4-flash",
        messages: messages.map((m) => ({
          role: m.role as "system" | "user" | "assistant",
          content: m.content,
        })),
        temperature: 0.3,
        max_tokens: 4096,
      });

      return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    },

    async *chatStream(messages) {
      const stream = await client.chat.completions.create({
        model: "deepseek-v4-flash",
        messages: messages.map((m) => ({
          role: m.role as "system" | "user" | "assistant",
          content: m.content,
        })),
        temperature: 0.3,
        max_tokens: 4096,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) yield content;
      }
    },

    async chatWithTools(messages: any[], tools): Promise<ToolCallResult> {
      const response = await client.chat.completions.create({
        model: "deepseek-v4-flash",
        // Pass messages through as-is — they already have role/content/tool_calls/tool_call_id
        messages: messages as any,
        temperature: 0.3,
        max_tokens: 4096,
        tools: tools,
        tool_choice: "auto",
      });

      const message = response.choices[0]?.message;
      if (!message) return { content: "I'm sorry, I couldn't generate a response.", toolCalls: null, rawMessage: undefined };

      if (message.tool_calls && message.tool_calls.length > 0) {
        return {
          content: null,
          toolCalls: message.tool_calls.map((tc: any) => ({
            id: tc.id,
            name: tc.function?.name || "",
            args: (() => {
              try { return JSON.parse(tc.function?.arguments || "{}"); }
              catch { return {}; }
            })(),
          })),
          // Return the FULL raw assistant message — includes reasoning_content for thinking mode
          rawMessage: message,
        };
      }

      return { content: message.content || "", toolCalls: null, rawMessage: message };
    },
  };
}
