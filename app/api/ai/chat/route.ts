import { NextRequest } from "next/server";
import { getProvider } from "../../../lib/ai/getProvider";
import { TOOL_SCHEMAS, executeTool } from "../../../lib/ai/tools";
import { PLATFORM_KNOWLEDGE } from "../../../lib/ai/platform-knowledge";
import type { ChatMessage, ToolCallResult } from "../../../lib/ai/providers/provider";

function sendSSE(stream: WritableStreamDefaultWriter, event: string, data: any) {
  const encoder = new TextEncoder();
  return stream.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

// ──────────────────────────────────────────────
// Simple in-memory rate limiter (per IP)
// Prevents AI token budget abuse
// ──────────────────────────────────────────────
const RATE_LIMIT = { windowMs: 60_000, max: 20 }; // 20 requests per minute per IP
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT.max;
}

const TOOL_SCHEMA_TOKENS_ESTIMATE = 1200;

const SYSTEM_PROMPT = `You are Michail, the AI Assistant for the SM Engineer Portal. You help marine engineers with their daily work.

PLATFORM KNOWLEDGE (you know this without searching):
${PLATFORM_KNOWLEDGE}

CRITICAL RULES:
1. You have READ-ONLY access to the portal database. You can NEVER create, edit, update, or delete any record — even if the user asks.
2. To answer questions about data, you MUST use the available tools to search the database. Do not guess or invent data.
3. NEVER invent counts, records, statistics, or dates. Only report what the tools return.
4. If a tool returns "No X found", tell the user honestly — do not make anything up.
5. Use the appropriate tool for the question:
   - Questions about jobs/repairs/records → search_work_logs or count_records
   - Questions about equipment → search_equipment
   - Questions about regulations → list_regulations
   - Questions about environmental logs → list_environmental_logs
   - Questions about dropdowns/configurations → get_dropdown
   - Questions about crew members / who is on board / ranks → list_crew
   - Questions about Chief Engineer Orders, duties, assigned tasks, daily orders → list_engine_room_duties
   - Questions about crew performance, rating, completion rate, excused/unexcused entries → get_crew_performance
   - "how many X" → count_records
6. If you don't have enough information after calling tools, say so honestly.
7. Keep answers clear and useful. Use bullet points when helpful.
8. You also understand maritime terminology (MARPOL, PSC, ECA, ROB, 15ppm, bilge, incinerator, changeover).`;

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a minute." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { message, sessionId, history: clientHistory } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const response = new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    (async () => {
      try {
        // 1. Session tracking
        const chatId = sessionId || "session-" + Date.now();
        await sendSSE(writer, "session", { sessionId: chatId });

        await sendSSE(writer, "step", { text: "Analyzing your question..." });

        const provider = getProvider();
        if (!provider.chatWithTools) {
          throw new Error("AI provider does not support tool calling.");
        }

        // 2. Build the full message history with tools
        const aiMessages: ChatMessage[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...(Array.isArray(clientHistory) ? clientHistory.slice(-30) : []),
          { role: "user", content: message.trim() },
        ];

        // 3. Agent loop — call tools until the AI has enough data to answer
        const MAX_TOOL_ROUNDS = 6;
        // Store each round: raw assistant message + its executed tool results (interleaved correctly)
        let rounds: { rawMessage: any; toolResults: { toolCallId: string; result: string }[] }[] = [];
        let finalContent: string | null = null;

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          // Build the message array: base history, then each round interleaved (assistant msg → its tool results)
          const messagesForCall: any[] = aiMessages.map((m) => ({ role: m.role, content: m.content }));

          for (const r of rounds) {
            messagesForCall.push(r.rawMessage);
            for (const tr of r.toolResults) {
              messagesForCall.push({
                role: "tool",
                tool_call_id: tr.toolCallId,
                content: tr.result,
              });
            }
          }

          const result: ToolCallResult = await provider.chatWithTools(messagesForCall, TOOL_SCHEMAS);

          if (result.toolCalls && result.toolCalls.length > 0) {
            // Execute each tool call for this round
            const currentRound: { rawMessage: any; toolResults: { toolCallId: string; result: string }[] } = {
              rawMessage: result.rawMessage,
              toolResults: [],
            };
            for (const tc of result.toolCalls) {
              await sendSSE(writer, "step", { text: `Searching ${tc.name.replace(/_/g, " ")}...` });
              const toolResult = await executeTool(tc.name, tc.args);
              currentRound.toolResults.push({ toolCallId: tc.id, result: toolResult });
            }
            rounds.push(currentRound);
            continue; // go to next round with the interleaved results appended
          }

          // No more tool calls — this is the final answer
          finalContent = result.content;
          break;
        }

        if (finalContent === null) {
          finalContent = "I'm sorry, I couldn't complete that request. Please try again.";
        }

        await sendSSE(writer, "step", { text: "Generating response..." });

        // 4. Estimate token usage (includes system prompt + history + tool schemas + tool results)
        const inputText = [
          SYSTEM_PROMPT,
          ...aiMessages.slice(1).map((m) => m.content || ""),
          ...rounds.flatMap((r) => r.toolResults.map((t) => t.result)),
        ].join(" ");
        const promptTokens = Math.round(inputText.length / 4) + TOOL_SCHEMA_TOKENS_ESTIMATE;
        const completionTokens = Math.round(finalContent.length / 4);
        await sendSSE(writer, "usage", { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens });

        // 5. Stream the final answer
        await sendSSE(writer, "token", { text: finalContent });
        await sendSSE(writer, "done", {});
      } catch (err: any) {
        console.error("AI Chat error:", err);
        await sendSSE(writer, "error", { message: err.message || "Internal error" });
      } finally {
        await writer.close();
      }
    })();

    return response;
  } catch (error: any) {
    console.error("AI Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
