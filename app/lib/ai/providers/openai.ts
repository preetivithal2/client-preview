// import OpenAI from "openai";
// import { AiProvider } from "./provider";

// export function createOpenAiProvider(apiKey: string): AiProvider {
//   const client = new OpenAI({ apiKey });

//   return {
//     name: "openai",
//     async chat(messages) {
//       const response = await client.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: messages.map((m) => ({
//           role: m.role as "system" | "user" | "assistant",
//           content: m.content,
//         })),
//         temperature: 0.3,
//         max_tokens: 2048,
//       });

//       return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
//     },
//   };
// }
