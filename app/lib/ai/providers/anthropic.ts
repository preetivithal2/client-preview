// import Anthropic from "@anthropic-ai/sdk";
// import { AiProvider } from "./provider";

// export function createAnthropicProvider(apiKey: string): AiProvider {
//   const client = new Anthropic({ apiKey });

//   return {
//     name: "anthropic",
//     async chat(messages) {
//       // Convert system message to Anthropic's separate system param
//       const systemMsg = messages.find((m) => m.role === "system");
//       const conversationMessages = messages
//         .filter((m) => m.role !== "system")
//         .map((m) => ({
//           role: m.role as "user" | "assistant",
//           content: m.content,
//         }));

//       const response = await client.messages.create({
//         model: "claude-sonnet-5-20250620",
//         max_tokens: 2048,
//         temperature: 0.3,
//         system: systemMsg?.content || "",
//         messages: conversationMessages.length > 0 ? conversationMessages : [{ role: "user", content: "Hello" }],
//       });

//       const textBlock = response.content.find((block) => block.type === "text");
//       return textBlock?.text || "I'm sorry, I couldn't generate a response.";
//     },
//   };
// }
